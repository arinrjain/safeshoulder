from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.config import settings
from app.routers import chat, sessions, billing, admin, voice, knowledge, onboarding, story, circles
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import Counter, Histogram, Gauge
import time

app = FastAPI(title="SafeShoulder API", version="1.0.0")

# Security: Trusted Host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "localhost",
        "safeshoulder.com",
        "*.safeshoulder.com",
        "safeshoulder-production.up.railway.app",
    ]
)

# CORS configuration - allow frontend origins
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://www.safeshoulder.com",
    "https://safeshoulder.com",
    "https://api.safeshoulder.com",
    "https://safeshoulder-production.up.railway.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["X-Total-Count", "X-RateLimit-Remaining"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    return response

# ── Custom metrics ────────────────────────────────────────────────────────────

# Chat messages sent per domain
chat_messages_total = Counter(
    "safeshoulder_chat_messages_total",
    "Total chat messages sent",
    ["domain", "source"],  # source: free | credits | subscription
)

# LLM stream latency
llm_stream_duration = Histogram(
    "safeshoulder_llm_stream_duration_seconds",
    "Time taken to complete an LLM stream response",
    ["domain"],
    buckets=[0.5, 1, 2, 5, 10, 20, 30],
)

# Active streaming sessions
active_streams = Gauge(
    "safeshoulder_active_streams",
    "Number of currently active LLM streams",
)

# Auth failures
auth_failures_total = Counter(
    "safeshoulder_auth_failures_total",
    "Total number of 401 auth failures",
)

# Crisis triggers
crisis_triggers_total = Counter(
    "safeshoulder_crisis_triggers_total",
    "Number of times crisis keywords were detected",
)

# Credit purchases
credit_purchases_total = Counter(
    "safeshoulder_credit_purchases_total",
    "Total credit pack purchases",
    ["pack"],
)

# Expose metrics to other modules
app.state.metrics = {
    "chat_messages_total": chat_messages_total,
    "llm_stream_duration": llm_stream_duration,
    "active_streams": active_streams,
    "auth_failures_total": auth_failures_total,
    "crisis_triggers_total": crisis_triggers_total,
    "credit_purchases_total": credit_purchases_total,
}

# ── Auto-instrument all HTTP routes ──────────────────────────────────────────
Instrumentator(
    should_group_status_codes=True,
    should_ignore_untemplated=True,
    should_respect_env_var=False,
    should_instrument_requests_inprogress=True,
    excluded_handlers=["/metrics", "/health"],
    inprogress_labels=True,
).instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(chat.router)
app.include_router(sessions.router)
app.include_router(billing.router)
app.include_router(admin.router)
app.include_router(voice.router)
app.include_router(knowledge.router)
app.include_router(onboarding.router)
app.include_router(story.router)
app.include_router(circles.router)


@app.get("/health")
def health():
    return {"status": "ok"}
