from pydantic import BaseModel
from typing import Optional
from enum import Enum


class Domain(str, Enum):
    school_bullying = "school_bullying"
    heartbreak = "heartbreak"
    domestic = "domestic"
    financial = "financial"
    workplace = "workplace"


class ChatMessage(BaseModel):
    content: str
    session_id: Optional[str] = None
    domain: Optional[Domain] = None


class ChatResponse(BaseModel):
    message: str
    session_id: str
    tokens_used: int
    free_remaining: Optional[int] = None


class SessionSummaryRequest(BaseModel):
    session_id: str


class UsageStats(BaseModel):
    free_used: int
    free_total: int
    free_remaining: int
    is_subscribed: bool
    messages_today: int
