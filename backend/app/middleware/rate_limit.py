"""
Rate limiting middleware to control API costs
Max 10 messages per student per day to prevent abuse
"""

from datetime import datetime, timedelta
from supabase import create_client
from app.config import settings

supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)

async def check_rate_limit(user_id: str) -> dict:
    """Check if user has exceeded rate limit"""
    today = datetime.utcnow().date().isoformat()
    
    # Count messages sent today
    result = supabase.table("messages").select(
        "id", count="exact"
    ).eq("user_id", user_id).eq("role", "user").gte(
        "created_at", f"{today}T00:00:00Z"
    ).execute()
    
    message_count = result.count or 0
    limit = 10  # Max 10 messages per student per day
    
    return {
        "allowed": message_count < limit,
        "remaining": max(0, limit - message_count),
        "limit": limit,
        "reset_at": f"{today}T23:59:59Z"
    }
