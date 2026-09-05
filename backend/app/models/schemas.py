from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Domain(str, Enum):
    school_bullying = "school_bullying"
    heartbreak = "heartbreak"
    relationship_issues = "relationship_issues"
    domestic = "domestic"
    financial = "financial"
    workplace = "workplace"
    body_image = "body_image"
    academic = "academic"
    peer_pressure = "peer_pressure"


class ChatMessage(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000, description="Message content (1-2000 characters)")
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
