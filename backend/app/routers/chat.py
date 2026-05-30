import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.middleware.auth import get_current_user
from app.models.schemas import ChatMessage, Domain
from app.services import moderation
from app.services.prompts import get_system_prompt, get_summary_prompt
from app.providers.llm.factory import get_llm_provider
from app.config import settings
from supabase import create_client

router = APIRouter(prefix="/chat", tags=["chat"])

supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)


def _check_and_deduct_quota(user_id: str) -> dict:
    """
    Returns status dict with remaining balances.
    Raises 402 if user has no free quota, no credits, and no subscription.
    """
    row = supabase.table("users").select(
        "free_queries_used,message_credits,subscription_id"
    ).eq("id", user_id).execute()

    if not row.data:
        raise HTTPException(status_code=404, detail="User not found")

    data = row.data[0]
    free_used = data.get("free_queries_used", 0)
    credits = data.get("message_credits", 0)
    has_subscription = bool(data.get("subscription_id"))

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


def _commit_usage(user_id: str, source: str) -> None:
    if source == "free":
        supabase.rpc("increment_free_used", {"uid": user_id}).execute()
    elif source == "credits":
        supabase.rpc("decrement_credits", {"uid": user_id, "amount": 1}).execute()


def _get_or_create_session(user_id: str, session_id: str | None, domain: str) -> tuple[str, list, str | None]:
    if session_id:
        result = supabase.table("sessions").select("*").eq("id", session_id).eq("user_id", user_id).execute()
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

    msgs = supabase.table("messages").select("role,content").eq("session_id", session_id).order("created_at").execute()
    return session_id, msgs.data or [], session.get("summary")


@router.post("/stream")
def chat_stream(body: ChatMessage, user: dict = Depends(get_current_user)):
    is_crisis, is_unsafe, _ = moderation.check_input(body.content)

    if is_crisis:
        return StreamingResponse(
            iter([moderation.CRISIS_RESOURCES]),
            media_type="text/event-stream",
        )

    if is_unsafe:
        raise HTTPException(status_code=400, detail="Message contains content that cannot be processed.")

    quota = _check_and_deduct_quota(user["user_id"])

    domain = body.domain.value if body.domain else Domain.workplace.value
    session_id, history, summary = _get_or_create_session(user["user_id"], body.session_id, domain)

    system_prompt = get_system_prompt(domain)

    # Inject previous session summary as opening context
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

    def generate():
        for chunk in llm.stream(messages, system_prompt):
            collected["text"] += chunk
            yield f"data: {chunk}\n\n"

        clean = moderation.check_output(collected["text"])

        supabase.table("messages").insert([
            {"session_id": session_id, "role": "user", "content": body.content},
            {"session_id": session_id, "role": "assistant", "content": clean},
        ]).execute()

        _commit_usage(user["user_id"], quota["source"])

        meta = {
            "free_remaining": quota["free_remaining"],
            "credits": quota["credits"],
            "session_id": session_id,
        }
        import json
        yield f"data: [META]{json.dumps(meta)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"X-Session-Id": session_id},
    )
