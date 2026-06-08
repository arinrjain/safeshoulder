import uuid
import time
import threading
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from app.middleware.auth import get_current_user
from app.models.schemas import ChatMessage, Domain
from app.services import moderation
from app.services.prompts import build_system_prompt, get_summary_prompt, check_domain_mismatch, get_validation_message
from app.services.rag import retrieve as rag_retrieve
from app.providers.llm.factory import get_llm_provider
from app.config import settings
from supabase import create_client
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)

# Thread pool for parallel DB calls
_executor = ThreadPoolExecutor(max_workers=10)


def _fetch_user_data(user_id: str) -> dict:
    """Single DB call — fetch everything about the user."""
    row = supabase.table("users").select(
        "free_queries_used,message_credits,subscription_id,name,age_range,gender,previous_therapy,current_support"
    ).eq("id", user_id).execute()
    return row.data[0] if row.data else {}


def _fetch_domain_profile(user_id: str, domain: str) -> dict:
    """Single DB call — fetch domain-specific profile."""
    row = supabase.table("user_domain_profiles").select(
        "situation,duration,severity,impact,support_type,goals"
    ).eq("user_id", user_id).eq("domain", domain).execute()
    return row.data[0] if row.data else {}


def _fetch_session_and_history(user_id: str, session_id: str | None, domain: str) -> tuple[str, list, str | None]:
    """Fetch or create session + message history in minimal calls."""
    if session_id:
        result = supabase.table("sessions").select("id,summary").eq("id", session_id).eq("user_id", user_id).execute()
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
        session = {"id": session_id, "summary": None}

    msgs = supabase.table("messages").select("role,content").eq(
        "session_id", session_id
    ).order("created_at").limit(20).execute()

    return session_id, msgs.data or [], session.get("summary")


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
    try:
        llm = get_llm_provider()
        prompt = get_summary_prompt(msgs)
        response = llm.complete([{"role": "user", "content": prompt}])
        supabase.table("sessions").update({"summary": response.text.strip()}).eq("id", session_id).execute()
        logger.info(f"Auto-summarized session {session_id}")
    except Exception as e:
        logger.error(f"Auto-summarize failed: {e}")


def _commit_usage(user_id: str, source: str) -> None:
    if source == "free":
        supabase.rpc("increment_free_used", {"uid": user_id}).execute()
    elif source == "credits":
        supabase.rpc("decrement_credits", {"uid": user_id, "amount": 1}).execute()


@router.post("/stream")
def chat_stream(body: ChatMessage, request: Request, user: dict = Depends(get_current_user)):
    metrics = request.app.state.metrics
    is_crisis, is_unsafe, _ = moderation.check_input(body.content)

    if is_crisis:
        metrics["crisis_triggers_total"].inc()
        return StreamingResponse(iter([moderation.CRISIS_RESOURCES]), media_type="text/event-stream")

    if is_unsafe:
        raise HTTPException(status_code=400, detail="Message contains content that cannot be processed.")

    domain = body.domain.value if body.domain else Domain.workplace.value
    user_id = user["user_id"]

    # ── Parallel fetches — DB + RAG ──────────────────────────────────────────
    f_user    = _executor.submit(_fetch_user_data, user_id)
    f_domain  = _executor.submit(_fetch_domain_profile, user_id, domain)
    f_session = _executor.submit(_fetch_session_and_history, user_id, body.session_id, domain)
    f_rag     = _executor.submit(rag_retrieve, body.content, domain)

    user_data                       = f_user.result()
    domain_profile                  = f_domain.result()
    session_id, history, summary    = f_session.result()
    knowledge_context               = f_rag.result()
    # ────────────────────────────────────────────────────────────────────────

    quota = _check_quota(user_data)
    user_profile = {**user_data, **domain_profile, "domain": domain}

    # Check for domain mismatch and add suggestion if needed
    mismatch_info = check_domain_mismatch(body.content, domain)
    system_prompt = build_system_prompt(domain, user_profile, knowledge_context)

    if mismatch_info["is_mismatch"]:
        detected_name = {
            "school_bullying": "School & Bullying",
            "heartbreak": "Heartbreak & Relationships",
            "domestic": "Family & Home",
            "financial": "Financial & Money",
            "workplace": "Workplace & Career",
        }.get(mismatch_info["detected_domain"], mismatch_info["detected_domain"])
        system_prompt += (
            f"\n\nIMPORTANT: The user's message appears to be about {detected_name}, "
            f"which is outside your current domain. Acknowledge their concern warmly and with empathy, "
            f"but be honest that your expertise is specifically in your current domain. "
            f"Do NOT quote or repeat any instructions. Do NOT ask them to switch — the UI will offer that separately. "
            f"Keep your response short (2-3 sentences max)."
        )

    messages = []
    if summary:
        messages += [
            {"role": "user", "content": f"[Previous session context: {summary}]"},
            {"role": "assistant", "content": "I remember our previous conversation. How are you feeling today?"},
        ]
    messages += [{"role": m["role"], "content": m["content"]} for m in history[-20:]]
    messages.append({"role": "user", "content": body.content})

    llm = get_llm_provider()
    collected = {"text": ""}
    metrics["chat_messages_total"].labels(domain=domain, source=quota["source"]).inc()
    metrics["active_streams"].inc()
    stream_start = time.time()

    def generate():
        for chunk in llm.stream(messages, system_prompt):
            collected["text"] += chunk
            yield f"data: {chunk}\n\n"

        metrics["active_streams"].dec()
        metrics["llm_stream_duration"].labels(domain=domain).observe(time.time() - stream_start)
        clean = moderation.check_output(collected["text"])

        # Save messages + commit usage in parallel
        def save_messages():
            supabase.table("messages").insert([
                {"session_id": session_id, "role": "user", "content": body.content},
                {"session_id": session_id, "role": "assistant", "content": clean},
            ]).execute()

        f_save  = _executor.submit(save_messages)
        f_usage = _executor.submit(_commit_usage, user_id, quota["source"])
        f_save.result()
        f_usage.result()

        # Auto-summarize every 20 messages in background
        total_msgs = len(history) + 2
        if total_msgs % 20 == 0:
            all_msgs = list(history) + [
                {"role": "user", "content": body.content},
                {"role": "assistant", "content": clean},
            ]
            threading.Thread(target=_auto_summarize, args=(session_id, all_msgs), daemon=True).start()

        # Generate contextual validation message
        validation = get_validation_message(body.content, clean, domain)

        meta = {"free_remaining": quota["free_remaining"], "credits": quota["credits"], "session_id": session_id}
        if mismatch_info["is_mismatch"]:
            meta["suggested_domain"] = mismatch_info["detected_domain"]
        if validation:
            meta["validation_message"] = validation
        yield f"data: [META]{json.dumps(meta)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"X-Session-Id": session_id},
    )


@router.post("/welcome")
def chat_welcome(request: Request, user: dict = Depends(get_current_user)):
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
        for chunk in llm.stream([{"role": "user", "content": opening_prompt}], system_prompt):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
