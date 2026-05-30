from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth import get_current_user
from app.services import claude_service
from app.config import settings
from supabase import create_client

router = APIRouter(prefix="/sessions", tags=["sessions"])

supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)


@router.get("/")
def list_sessions(user: dict = Depends(get_current_user)):
    result = supabase.table("sessions").select("id,domain,created_at,summary").eq("user_id", user["user_id"]).order("created_at", desc=True).limit(20).execute()
    return result.data


@router.post("/{session_id}/summarize")
def summarize_session(session_id: str, user: dict = Depends(get_current_user)):
    session = supabase.table("sessions").select("*").eq("id", session_id).eq("user_id", user["user_id"]).execute()
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")

    msgs = supabase.table("messages").select("role,content").eq("session_id", session_id).order("created_at").execute()
    if not msgs.data:
        return {"summary": None}

    summary = claude_service.summarize_session(msgs.data)
    supabase.table("sessions").update({"summary": summary}).eq("id", session_id).execute()
    return {"summary": summary}


@router.get("/{session_id}/messages")
def get_messages(session_id: str, user: dict = Depends(get_current_user)):
    session = supabase.table("sessions").select("id").eq("id", session_id).eq("user_id", user["user_id"]).execute()
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")

    msgs = supabase.table("messages").select("role,content,created_at").eq("session_id", session_id).order("created_at").execute()
    return msgs.data
