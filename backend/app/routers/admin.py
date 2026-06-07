from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth import get_current_user
from app.config import settings
from supabase import create_client
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/admin", tags=["admin"])
supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)

ADMIN_EMAILS = {"arinrjain@gmail.com", "rinishjain@yahoo.com"}


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("email") not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/stats")
def get_stats(user: dict = Depends(require_admin)):
    now = datetime.now(timezone.utc)
    today = (now - timedelta(days=1)).isoformat()
    this_week = (now - timedelta(days=7)).isoformat()
    this_month = (now - timedelta(days=30)).isoformat()

    # Total users
    total_users = supabase.table("users").select("id", count="exact").execute()

    # New users today
    new_today = supabase.table("users").select("id", count="exact").gte("created_at", today).execute()

    # New users this week
    new_week = supabase.table("users").select("id", count="exact").gte("created_at", this_week).execute()

    # New users this month
    new_month = supabase.table("users").select("id", count="exact").gte("created_at", this_month).execute()

    # Total sessions
    total_sessions = supabase.table("sessions").select("id", count="exact").execute()

    # Sessions by domain
    sessions_data = supabase.table("sessions").select("domain").execute()
    domain_counts: dict = {}
    for s in (sessions_data.data or []):
        d = s.get("domain", "unknown")
        domain_counts[d] = domain_counts.get(d, 0) + 1

    # Total messages
    total_messages = supabase.table("messages").select("id", count="exact").execute()

    # Messages today
    messages_today = supabase.table("messages").select("id", count="exact").gte("created_at", today).execute()

    # Messages this week
    messages_week = supabase.table("messages").select("id", count="exact").gte("created_at", this_week).execute()

    # Credit orders (revenue)
    orders = supabase.table("credit_orders").select("amount,currency,pack,status,created_at").eq("status", "credited").execute()
    total_revenue_inr = sum(o["amount"] for o in (orders.data or [])) // 100  # paise to rupees
    revenue_today = sum(o["amount"] for o in (orders.data or []) if o["created_at"] >= today) // 100
    revenue_week = sum(o["amount"] for o in (orders.data or []) if o["created_at"] >= this_week) // 100

    # Pack breakdown
    pack_counts: dict = {}
    for o in (orders.data or []):
        p = o.get("pack", "unknown")
        pack_counts[p] = pack_counts.get(p, 0) + 1

    # Subscribed users
    subscribed = supabase.table("users").select("id", count="exact").not_.is_("subscription_id", "null").execute()

    # Free quota users (used all free messages)
    free_exhausted = supabase.table("users").select("id", count="exact").gte("free_queries_used", settings.free_message_quota).execute()

    # Recent signups
    recent_users = supabase.table("users").select(
        "email,name,domain,free_queries_used,message_credits,created_at"
    ).order("created_at", desc=True).limit(20).execute()

    return {
        "users": {
            "total": total_users.count or 0,
            "new_today": new_today.count or 0,
            "new_week": new_week.count or 0,
            "new_month": new_month.count or 0,
            "subscribed": subscribed.count or 0,
            "free_exhausted": free_exhausted.count or 0,
        },
        "messages": {
            "total": total_messages.count or 0,
            "today": messages_today.count or 0,
            "week": messages_week.count or 0,
        },
        "sessions": {
            "total": total_sessions.count or 0,
            "by_domain": domain_counts,
        },
        "revenue": {
            "total_inr": total_revenue_inr,
            "today_inr": revenue_today,
            "week_inr": revenue_week,
            "orders_total": len(orders.data or []),
            "by_pack": pack_counts,
        },
        "recent_users": recent_users.data or [],
    }


@router.get("/users")
def get_all_users(user: dict = Depends(require_admin)):
    """Get all users for management."""
    users = supabase.table("users").select(
        "id,email,name,domain,created_at,free_queries_used,message_credits"
    ).order("created_at", desc=True).execute()

    return {
        "users": users.data or [],
    }


@router.post("/users/{user_id}/block")
def block_user(user_id: str, user: dict = Depends(require_admin)):
    """
    Block a user: prevents login and prevents re-registration with same email.
    User data remains intact but inaccessible.
    """
    try:
        # Get user email first
        user_result = supabase.table("users").select("email").eq("id", user_id).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")

        email = user_result.data[0]["email"]

        # Add email to blocked list
        supabase.table("blocked_emails").insert({
            "email": email,
            "reason": "Admin blocked",
            "blocked_at": datetime.now(timezone.utc).isoformat(),
        }).execute()

        # Disable the auth user account (prevents login)
        supabase.auth.admin.update_user_by_id(user_id, {"ban_duration": "none"})

        return {
            "message": "User blocked successfully - cannot login or re-register",
            "user_id": user_id,
            "email": email,
        }
    except Exception as e:
        if "blocked_emails" in str(e) and "already exists" in str(e):
            return {
                "message": "User email already blocked",
                "user_id": user_id,
            }
        raise HTTPException(status_code=400, detail=f"Failed to block user: {str(e)}")


@router.post("/users/{user_id}/unblock")
def unblock_user(user_id: str, user: dict = Depends(require_admin)):
    """Unblock a previously blocked user - allows re-registration."""
    try:
        # Get user email first
        user_result = supabase.table("users").select("email").eq("id", user_id).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")

        email = user_result.data[0]["email"]

        # Remove from blocked list
        supabase.table("blocked_emails").delete().eq("email", email).execute()

        # Re-enable the auth user account
        supabase.auth.admin.update_user_by_id(user_id, {"ban_duration": ""})

        return {
            "message": "User unblocked successfully",
            "user_id": user_id,
            "email": email,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to unblock user: {str(e)}")


@router.delete("/users/{user_id}")
def delete_user(user_id: str, user: dict = Depends(require_admin)):
    """
    Completely delete a user and all their data.
    User can re-register with the same email immediately.
    """
    try:
        # Get email before deletion (for logging)
        user_result = supabase.table("users").select("email").eq("id", user_id).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")

        email = user_result.data[0]["email"]

        # Delete user data in correct order (respecting foreign keys)
        # 1. Sessions and related data
        supabase.table("sessions").delete().eq("user_id", user_id).execute()

        # 2. Domain profiles
        supabase.table("user_domain_profiles").delete().eq("user_id", user_id).execute()

        # 3. Credit orders
        supabase.table("credit_orders").delete().eq("user_id", user_id).execute()

        # 4. User profile
        supabase.table("users").delete().eq("id", user_id).execute()

        # 5. Delete auth user (allows same email to register again)
        supabase.auth.admin.delete_user(user_id)

        return {
            "message": "User completely deleted - they can re-register",
            "user_id": user_id,
            "email": email,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete user: {str(e)}")
