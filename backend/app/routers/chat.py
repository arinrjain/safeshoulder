import uuid
import time
import threading
import logging
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from app.middleware.auth import get_current_user
from app.models.schemas import ChatMessage, Domain
from app.services import moderation
from app.services.prompts import build_system_prompt, get_summary_prompt, get_validation_message, detect_domain_from_text
from app.services.rag import retrieve as rag_retrieve
from app.services.profile_extraction import ProfileExtractor
from app.providers.llm.factory import get_llm_provider
from app.config import settings
from supabase import create_client
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)

# Thread pool for parallel DB calls — scale with CPU cores, with a floor
# since os.cpu_count() reports 1-2 on small Railway containers, which was
# capping this at 4-8 workers shared across every concurrent chat request
# (RAG lookups here plus other blocking calls elsewhere) and causing
# "[Errno 11] Resource temporarily unavailable" under even light load.
_executor = ThreadPoolExecutor(max_workers=max(16, min(32, (os.cpu_count() or 1) * 4)))


def _fetch_user_data(user_id: str) -> dict:
    """Single DB call — fetch everything about the user."""
    row = supabase.table("users").select(
        "free_queries_used,message_credits,subscription_id,name,age_range,gender,education_status,previous_therapy,current_support"
    ).eq("id", user_id).execute()
    return row.data[0] if row.data else {}


def _fetch_domain_profile(user_id: str, domain: str) -> dict:
    """Single DB call — fetch domain-specific profile."""
    row = supabase.table("user_domain_profiles").select(
        "situation,duration,severity,impact,support_type,goals"
    ).eq("user_id", user_id).eq("domain", domain).execute()
    return row.data[0] if row.data else {}


def _fetch_session_and_history(user_id: str, session_id: str | None, domain: str) -> tuple[str, list, str | None, dict]:
    """Fetch or create session + message history + extraction profile."""
    if session_id:
        result = supabase.table("sessions").select("id,summary,extraction_profile").eq("id", session_id).eq("user_id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Session not found")
        session = result.data[0]
    else:
        session_id = str(uuid.uuid4())
        supabase.table("sessions").insert({
            "id": session_id,
            "user_id": user_id,
            "domain": domain,
        }).execute()
        session = {"id": session_id, "summary": None, "extraction_profile": {}}

    # Fetch last 50 messages instead of 100 (cost optimization)
    # LLM only uses 50 anyway, so no need to fetch more
    msgs = supabase.table("messages").select("role,content").eq(
        "session_id", session_id
    ).order("created_at", desc=True).limit(50).execute()

    # Reverse to chronological order for display
    msgs.data = list(reversed(msgs.data)) if msgs.data else []

    extraction_profile = session.get("extraction_profile", {}) or {}
    return session_id, msgs.data or [], session.get("summary"), extraction_profile


def _check_quota(user_data: dict) -> dict:
    """Check and return quota info from already-fetched user data."""
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    free_used = user_data.get("free_queries_used", 0)
    credits = user_data.get("message_credits", 0)
    has_subscription = bool(user_data.get("subscription_id"))
    free_remaining = max(0, settings.free_message_quota - free_used)

    if free_remaining > 0:
        return {"source": "free", "free_remaining": free_remaining - 1, "credits": credits}
    if has_subscription:
        return {"source": "subscription", "free_remaining": 0, "credits": credits}
    if credits > 0:
        return {"source": "credits", "free_remaining": 0, "credits": credits - 1}

    raise HTTPException(
        status_code=402,
        detail="No free messages remaining. Purchase credits or subscribe to continue.",
    )


def _auto_summarize(session_id: str, msgs: list) -> None:
    """Auto-summarize using Haiku (cheaper model) for cost optimization"""
    try:
        # Use Haiku for summarization - 80% cheaper than full Claude
        from anthropic import Anthropic
        client = Anthropic()
        prompt = get_summary_prompt(msgs)
        response = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}]
        )
        summary = response.content[0].text.strip()
        supabase.table("sessions").update({"summary": summary}).eq("id", session_id).execute()
        logger.info(f"Auto-summarized session {session_id} using Haiku (cost-optimized)")
    except Exception as e:
        logger.error(f"Auto-summarize failed: {e}")


def _commit_usage(user_id: str, source: str) -> None:
    if source == "free":
        supabase.rpc("increment_free_used", {"uid": user_id}).execute()
    elif source == "credits":
        supabase.rpc("decrement_credits", {"uid": user_id, "amount": 1}).execute()


def _extract_and_update_profile(session_id: str, user_message: str, domain: str, history: list) -> dict:
    """
    Extract profile from user message and update session.
    Returns the extracted profile for use in system prompts.
    """
    try:
        extractor = ProfileExtractor(domain=domain)

        # Extract from this message
        extracted = extractor.extract_from_message(user_message)

        # Fetch current session extraction profile
        result = supabase.table("sessions").select("extraction_profile").eq("id", session_id).execute()
        current_profile = result.data[0].get("extraction_profile", {}) if result.data else {}

        # Merge new extraction with existing
        merged_profile = extractor.merge_profiles(current_profile, extracted)

        # Update session with merged profile
        supabase.table("sessions").update({"extraction_profile": merged_profile}).eq("id", session_id).execute()

        return merged_profile
    except Exception as e:
        logger.warning(f"Profile extraction error: {e}")
        return {}


def _build_extraction_context(extraction_profile: dict) -> str:
    """
    Build concise context from extracted profile for system prompt.
    Intentionally minimal to not interfere with conversation flow.
    """
    try:
        if not extraction_profile or len(extraction_profile) <= 1:  # Only last_updated
            return ""

        lines = []

        # Just the key insights - minimal
        if extraction_profile.get("main_stressors"):
            stressors = extraction_profile["main_stressors"].get("value", [])
            if stressors and isinstance(stressors, list):
                lines.append("Stressors: " + ", ".join(str(s) for s in stressors[:2]))  # Max 2

        if extraction_profile.get("intensity"):
            intensity = extraction_profile["intensity"].get("value", "")
            if intensity:
                lines.append(f"Stress: {intensity}/5")

        if not lines:
            return ""

        # Very concise format
        return "Context from chat: " + " | ".join(lines)
    except Exception as e:
        logger.warning(f"Error building extraction context: {e}")
        return ""


@router.post("/stream")
def chat_stream(body: ChatMessage, request: Request):
    metrics = request.app.state.metrics
    is_crisis, is_unsafe, _ = moderation.check_input(body.content)

    if is_crisis:
        metrics["crisis_triggers_total"].inc()

        def generate_crisis_response():
            yield f"data: {json.dumps(moderation.CRISIS_RESOURCES)}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(generate_crisis_response(), media_type="text/event-stream")

    if is_unsafe:
        raise HTTPException(status_code=400, detail="Message contains content that cannot be processed.")

    # ── Verify authentication (REQUIRED for production) ────────────────────
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required. Please log in with Google.")

    token = auth_header[7:]
    try:
        from fastapi.security import HTTPAuthorizationCredentials
        mock_creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        auth_result = get_current_user(mock_creds)
        user_id = auth_result["user_id"]
        user_email = auth_result["email"]
        auth_source = "authenticated"
        logger.info(f"Authenticated user: {user_email}")
    except Exception as auth_error:
        logger.error(f"Authentication failed: {auth_error}")
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token. Please log in again.")

    domain = body.domain.value if body.domain else Domain.workplace.value

    # ── Fetch user data and session history (authenticated mode only) ────────
    try:
        user_data_result = supabase.table("users").select(
            "free_queries_used,message_credits,subscription_id,name,age_range,gender,education_status,previous_therapy,current_support"
        ).eq("id", user_id).execute()
        user_data = user_data_result.data[0] if user_data_result.data else None

        # If user doesn't exist, create them
        if not user_data:
            logger.info(f"Creating new user: {user_id}")
            supabase.table("users").insert({
                "id": user_id,
                "email": user_email,
                "name": user_email.split("@")[0],  # Use email prefix as default name
                "free_queries_used": 0,
                "message_credits": 0,
                "subscription_id": None,
            }).execute()
            user_data = {
                "free_queries_used": 0,
                "message_credits": 0,
                "subscription_id": None,
                "name": user_email.split("@")[0],
            }

        domain_profile_result = supabase.table("user_domain_profiles").select(
            "situation,duration,severity,impact,support_type,goals"
        ).eq("user_id", user_id).eq("domain", domain).execute()
        domain_profile = domain_profile_result.data[0] if domain_profile_result.data else {}

        session_id, history, summary, extraction_profile = _fetch_session_and_history(user_id, body.session_id, domain)
        quota = _check_quota(user_data)

    except HTTPException:
        raise
    except Exception as db_error:
        logger.error(f"Database error: {db_error}")
        raise HTTPException(status_code=500, detail="Database error")

    # Detect if this message touches a different life area than the session's
    # nominal domain — used only to widen knowledge retrieval, never to gate
    # or redirect the conversation. People's struggles cross categories
    # (family stress shows up as school problems, money worry strains
    # relationships, etc.), so we search whichever area is actually relevant.
    detected_domain = detect_domain_from_text(body.content)
    rag_domain = detected_domain or domain

    # RAG is optional — timeout gracefully
    try:
        f_rag = _executor.submit(rag_retrieve, body.content, rag_domain)
        knowledge_context = f_rag.result(timeout=2)
    except Exception as e:
        logger.warning(f"RAG timeout/error for domain={rag_domain}: {e}")
        knowledge_context = ""

    user_profile = {**user_data, **domain_profile, "domain": domain}

    # Build extraction context from what we've learned in this session
    extraction_context = _build_extraction_context(extraction_profile)

    system_prompt = build_system_prompt(domain, user_profile, knowledge_context)

    # Add extraction context to system prompt if we have learned something
    # Kept minimal to avoid interfering with LLM response generation
    if extraction_context:
        system_prompt += f"\n(Context from earlier in chat: {extraction_context})"

    messages = []
    if summary:
        messages += [
            {"role": "user", "content": f"[Previous session context: {summary}]"},
            {"role": "assistant", "content": "I remember our previous conversation. How are you feeling today?"},
        ]
    messages += [{"role": m["role"], "content": m["content"]} for m in history[-50:]]
    messages.append({"role": "user", "content": body.content})

    logger.debug(f"Chat context: {len(messages)} total messages, last message from {messages[-2]['role'] if len(messages) > 1 else 'N/A'}")

    llm = get_llm_provider()
    collected = {"text": ""}
    metrics["chat_messages_total"].labels(domain=domain, source=quota["source"]).inc()
    metrics["active_streams"].inc()
    stream_start = time.time()

    def generate():
        try:
            try:
                logger.debug(f"Chat stream started: messages={len(messages)}, prompt_len={len(system_prompt)}, domain={domain}")

                for chunk in llm.stream(messages, system_prompt):
                    collected["text"] += chunk
                    # JSON-encode chunk so embedded newlines never break SSE frame parsing
                    # (raw chunks containing \n\n would otherwise be split as separate frames)
                    yield f"data: {json.dumps(chunk)}\n\n"

                logger.debug(f"Chat stream completed for domain={domain}")

            except Exception as llm_error:
                logger.error(f"LLM stream failed: {llm_error}", exc_info=True)

                # Fallback response if LLM fails
                fallback = "I'm here to listen to you. Something went wrong with my response system, but I want you to know your feelings matter. Can you tell me more about what you're experiencing?"
                collected["text"] = fallback
                for chunk in fallback:
                    yield f"data: {json.dumps(chunk)}\n\n"

            metrics["active_streams"].dec()
            metrics["llm_stream_duration"].labels(domain=domain).observe(time.time() - stream_start)

            clean = moderation.check_output(collected["text"])

            # Save messages + commit usage + extract profile.
            # These used to be submitted to the shared _executor and immediately
            # awaited with .result() - since we block on every result right away
            # anyway, the parallelism bought nothing, but it cost 3 extra OS
            # threads per chat message. Under concurrent chat traffic that
            # exhausted the small thread pool and crashed streams mid-response
            # with "[Errno 11] Resource temporarily unavailable". Calling them
            # directly removes that pressure with no behavior change.
            supabase.table("messages").insert([
                {"session_id": session_id, "role": "user", "content": body.content},
                {"session_id": session_id, "role": "assistant", "content": clean},
            ]).execute()
            _commit_usage(user_id, quota["source"])
            try:
                _extract_and_update_profile(session_id, body.content, domain, history)
            except Exception as e:
                logger.warning(f"Profile extraction failed: {e}")

            # Auto-summarize every 20 messages in background
            total_msgs = len(history) + 2
            if total_msgs % 20 == 0:
                all_msgs = list(history) + [
                    {"role": "user", "content": body.content},
                    {"role": "assistant", "content": clean},
                ]
                threading.Thread(target=_auto_summarize, args=(session_id, all_msgs), daemon=True).start()

            # Generate contextual validation message
            validation = None
            try:
                validation = get_validation_message(body.content, clean, domain)
            except Exception as e:
                logger.error(f"Validation message error: {e}")

            meta = {"free_remaining": quota["free_remaining"], "credits": quota["credits"], "session_id": session_id}
            if validation:
                meta["validation_message"] = validation

            yield f"data: [META]{json.dumps(meta)}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error(f"Chat stream error: {e}", exc_info=True)
            # Still try to send metadata with error flag
            try:
                yield f"data: [META]{json.dumps({'error': str(e)})}\n\n"
                yield "data: [DONE]\n\n"
            except:
                pass

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"X-Session-Id": session_id},
    )


@router.post("/welcome")
def chat_welcome(request: Request, user: dict = Depends(get_current_user)):
    try:
        user_id = user["user_id"]

        # Parallel fetch user + domain profile
        f_user   = _executor.submit(_fetch_user_data, user_id)
        f_domain = _executor.submit(lambda: supabase.table("users").select("domain").eq("id", user_id).execute())

        user_data   = f_user.result()
        domain_resp = f_domain.result()
        domain = (domain_resp.data[0].get("domain") if domain_resp.data else None) or "workplace"

        domain_profile = _fetch_domain_profile(user_id, domain)
        user_profile = {**user_data, **domain_profile, "domain": domain}

        name = user_profile.get("name", "")
        situation = (user_profile.get("situation") or "").split("|||")[0].strip()
        support_type = user_profile.get("support_type", "")
        duration = user_profile.get("duration", "")
        severity = user_profile.get("severity")

        system_prompt = build_system_prompt(domain, user_profile)

        support_hint = {
            "vent": "They want to be heard — just listen and reflect.",
            "advice": "After acknowledging, offer concrete thoughts.",
            "perspective": "Help them see things differently.",
            "all": "Follow their lead.",
        }.get(support_type, "Follow their lead.")

        opening_prompt = f"""Write a warm, personal opening message to start this support conversation.

What you know:
- Name: {name or "not shared"}
- What they're dealing with: {situation or "something on their mind"}
- How long: {duration or "not shared"}
- How heavy (1-10): {severity or "not shared"}
- What they need: {support_hint}

Instructions:
- Address them by name if you have it
- Briefly acknowledge what they've shared so they feel heard immediately
- Ask ONE gentle opening question
- Keep it to 3-4 sentences max — warm, not clinical
- Do NOT use greetings like "Hello" or "Hi there" — just dive in naturally"""

        llm = get_llm_provider()

        def generate():
            try:
                for chunk in llm.stream([{"role": "user", "content": opening_prompt}], system_prompt):
                    yield f"data: {json.dumps(chunk)}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                logger.error(f"Welcome stream error: {e}", exc_info=True)
                # Fallback welcome message if LLM fails
                fallback = f"Hey {name or 'there'}! I'm here to listen. What's been going on?"
                yield f"data: {json.dumps(fallback)}\n\n"
                yield "data: [DONE]\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")
    except Exception as e:
        logger.error(f"Welcome endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Welcome error: {str(e)}")

@router.post("/detect-domain")
def detect_domain(body: dict):
    """Detect domain from user message."""
    try:
        message = body.get("message", "")
        if not message:
            return {"domain": "school_bullying", "confidence": 0}
        
        detected = detect_domain_from_text(message)
        return {"domain": detected or "school_bullying", "confidence": 1 if detected else 0}
    except Exception as e:
        logger.error(f"Domain detection error: {e}")
        return {"domain": "school_bullying", "confidence": 0}

@router.post("/cleanup-old-messages")
def cleanup_old_messages():
    """Delete messages older than 90 days to optimize storage costs"""
    try:
        from datetime import datetime, timedelta
        cutoff_date = (datetime.utcnow() - timedelta(days=90)).isoformat()
        
        # Delete old messages
        result = supabase.table("messages").delete().lt("created_at", cutoff_date).execute()
        deleted_count = len(result.data) if result.data else 0
        
        logger.info(f"Cleaned up {deleted_count} old messages (90+ days)")
        return {"deleted": deleted_count, "status": "success"}
    except Exception as e:
        logger.error(f"Cleanup error: {e}")
        return {"error": str(e), "status": "failed"}
