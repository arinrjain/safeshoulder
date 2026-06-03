from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import chat, sessions, billing, admin
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import Counter, Histogram, Gauge
import time

app = FastAPI(title="SafeShoulder API", version="1.0.0")

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.get("/health")
def health():
    return {"status": "ok"}
