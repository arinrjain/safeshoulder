"""Circles and community support endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth import get_current_user
from supabase import create_client
from app.config import settings

router = APIRouter(prefix="/circles", tags=["circles"])
supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)


@router.get("/")
def list_circles():
    """Get all available circles."""
    try:
        result = supabase.table("circles").select("*").execute()
        return {"circles": result.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching circles: {str(e)}")


@router.get("/{circle_id}")
def get_circle(circle_id: int):
    """Get circle details."""
    try:
        result = supabase.table("circles").select("*").eq("id", circle_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Circle not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching circle: {str(e)}")


@router.post("/{circle_id}/join")
def join_circle(circle_id: int, user: dict = Depends(get_current_user)):
    """Join a circle."""
    try:
        user_id = user.get("user_id") if isinstance(user, dict) else str(user)

        if not user_id:
            raise HTTPException(status_code=401, detail="Could not extract user_id from auth token")

        # Check if already a member
        existing = supabase.table("circle_members").select("*").eq("circle_id", circle_id).eq("user_id", user_id).execute()
        if existing.data:
            return {"message": "Already a member of this circle", "user_id": str(user_id)}

        # Add member
        result = supabase.table("circle_members").insert({
            "circle_id": circle_id,
            "user_id": user_id,
            "role": "member"
        }).execute()

        return {"message": "Successfully joined circle", "user_id": str(user_id), "result": result.data}
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logging.error(f"Error joining circle {circle_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error joining circle: {str(e)}")


@router.get("/{circle_id}/messages")
def get_circle_messages(circle_id: int, user: dict = Depends(get_current_user)):
    """Get messages in a circle (only for members)."""
    try:
        user_id = user["user_id"]

        # Check if user is a member
        member = supabase.table("circle_members").select("*").eq("circle_id", circle_id).eq("user_id", user_id).execute()
        if not member.data:
            raise HTTPException(status_code=403, detail="Not a member of this circle")

        # Fetch messages
        messages = supabase.table("circle_messages").select(
            "*"
        ).eq("circle_id", circle_id).order("created_at", desc=False).execute()

        return {"messages": messages.data or []}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching messages: {str(e)}")


@router.post("/{circle_id}/messages")
def send_circle_message(circle_id: int, body: dict, user: dict = Depends(get_current_user)):
    """Send a message to a circle (only for members)."""
    try:
        user_id = user["user_id"]
        content = body.get("content", "").strip()

        if not content:
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        # Check if user is a member
        member = supabase.table("circle_members").select("*").eq("circle_id", circle_id).eq("user_id", user_id).execute()
        if not member.data:
            raise HTTPException(status_code=403, detail="Not a member of this circle")

        # Save message
        result = supabase.table("circle_messages").insert({
            "circle_id": circle_id,
            "user_id": user_id,
            "content": content
        }).execute()

        return {"message": result.data[0] if result.data else {}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")


@router.get("/{circle_id}/members")
def get_circle_members(circle_id: int, user: dict = Depends(get_current_user)):
    """Get members of a circle."""
    try:
        user_id = user["user_id"]

        # Check if user is a member
        member = supabase.table("circle_members").select("*").eq("circle_id", circle_id).eq("user_id", user_id).execute()
        if not member.data:
            raise HTTPException(status_code=403, detail="Not a member of this circle")

        # Fetch members
        members = supabase.table("circle_members").select(
            "*, users(name, email)"
        ).eq("circle_id", circle_id).execute()

        return {"members": members.data or []}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching members: {str(e)}")
