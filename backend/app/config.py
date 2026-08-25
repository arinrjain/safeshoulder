from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

_ENV_FILE = Path(__file__).parent.parent / ".env"

# Explicitly load .env file (pydantic_settings sometimes misses it)
if _ENV_FILE.exists():
    load_dotenv(_ENV_FILE, override=True)


class Settings(BaseSettings):
    # ── LLM Provider ──────────────────────────────────────────────────────────
    # Supported: "anthropic" | "openai" | "google" | "ollama"
    llm_provider: str = "anthropic"
    llm_model: str = "claude-haiku-4-5-20251001"
    llm_max_tokens: int = 1024
    llm_temperature: float = 0.7

    # Provider API keys (only the one matching llm_provider is required)
    anthropic_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    google_api_key: Optional[str] = None
    ollama_base_url: str = "http://localhost:11434"

    # ── Database Provider ─────────────────────────────────────────────────────
    # Supported: "supabase" | "postgres"
    db_provider: str = "supabase"

    supabase_url: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    database_url: Optional[str] = None  # postgresql+asyncpg://user:pass@host/db

    # ── Auth Provider ─────────────────────────────────────────────────────────
    # Supported: "supabase" | "jwt"
    auth_provider: str = "supabase"
    jwt_secret: Optional[str] = None
    jwks_url: Optional[str] = None          # asymmetric JWT (Cognito, Auth0)
    jwt_audience: str = "authenticated"
    jwt_algorithm: str = "HS256"

    # ── Billing Provider ──────────────────────────────────────────────────────
    # Supported: "razorpay" | "stripe"
    billing_provider: str = "razorpay"

    # Currency — "INR" for India, "USD" for international
    currency: str = "INR"

    # Razorpay (primary — India)
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    razorpay_webhook_secret: Optional[str] = None
    razorpay_subscription_plan_id: Optional[str] = None

    # Voice
    deepgram_api_key: Optional[str] = None

    # Stripe (international / fallback)
    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    # Stripe still uses metered billing; Razorpay uses credit packs (see below)
    stripe_metered_price_id: Optional[str] = None

    # ── Credit Pack Pricing (INR paise: 1 INR = 100 paise) ───────────────────
    # Each pack defines: messages included and price in smallest currency unit
    # INR amounts are in paise; USD amounts are in cents
    credit_pack_small_messages: int = 100
    credit_pack_small_price: int = 9900       # ₹99

    credit_pack_medium_messages: int = 300
    credit_pack_medium_price: int = 24900     # ₹249

    credit_pack_large_messages: int = 800
    credit_pack_large_price: int = 59900      # ₹599

    # Monthly subscription (unlimited messages, subject to fair use)
    subscription_monthly_price: int = 29900   # ₹299/month
    subscription_message_limit: int = 1000    # fair-use cap

    # ── App ───────────────────────────────────────────────────────────────────
    app_env: str = "development"
    free_message_quota: int = 20
    max_messages_per_day: int = 50
    cors_origins: str = "http://localhost:3000,http://localhost:3001,https://www.safeshoulder.com,https://safeshoulder.com"
    app_url: str = "https://safeshoulder.app"

    class Config:
        env_file = str(_ENV_FILE)


settings = Settings()
