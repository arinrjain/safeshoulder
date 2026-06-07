"""Utilities for managing blocked emails."""
from app.config import settings
from supabase import create_client

supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)


def is_email_blocked(email: str) -> bool:
    """Check if an email is permanently blocked."""
    try:
        result = supabase.table("blocked_emails").select("id").eq("email", email.lower()).execute()
        return len(result.data or []) > 0
    except Exception:
        # If table doesn't exist yet, allow the operation
        return False


def block_email(email: str, reason: str = "Admin action") -> bool:
    """Add an email to the blocked list."""
    try:
        supabase.table("blocked_emails").insert({
            "email": email.lower(),
            "reason": reason,
        }).execute()
        return True
    except Exception as e:
        if "already exists" in str(e):
            return True  # Already blocked
        raise


def unblock_email(email: str) -> bool:
    """Remove an email from the blocked list."""
    try:
        supabase.table("blocked_emails").delete().eq("email", email.lower()).execute()
        return True
    except Exception:
        return False
