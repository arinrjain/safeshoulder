# SafeShoulder

An AI-powered emotional support portal for people dealing with school bullying, heartbreak, domestic conflict, financial stress, and workplace issues. Built with a fully decoupled provider architecture — swap LLM, database, auth, and payment providers via environment variables without touching application code.

---

## Table of Contents

- [Product Overview](#product-overview)
- [Supported Domains](#supported-domains)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Request Workflow](#request-workflow)
- [Billing Model](#billing-model)
- [Provider Options](#provider-options)
- [Local Setup](#local-setup)
- [Deployment Guide](#deployment-guide)

---

## Product Overview

SafeShoulder is a chat-based AI support companion. It is **not** a licensed therapy service — it is a safe space to talk, reflect, and be heard. Every screen carries a clear disclaimer, and crisis keywords trigger immediate redirection to professional helplines.

---

## Supported Domains

| Domain | What it covers |
|---|---|
| School bullying | Peer pressure, social exclusion, academic stress |
| Heartbreak | Breakups, rejection, loneliness |
| Domestic | Family conflict, difficult home environments |
| Financial | Debt anxiety, job loss, money shame |
| Workplace | Burnout, toxic managers, career anxiety |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Next.js Frontend                  │
│   Landing → Auth → Chat UI → Usage Dashboard        │
└──────────────────────┬───────────────────────────────┘
                       │ HTTPS / SSE stream
┌──────────────────────▼───────────────────────────────┐
│                   FastAPI Backend                    │
│                                                      │
│  /chat/stream  ──►  Moderation  ──►  LLM Provider   │
│  /sessions     ──►  DB Provider                     │
│  /billing      ──►  Billing Provider                │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │            Provider Layer                   │    │
│  │  LLM:      Anthropic | OpenAI | Google |    │    │
│  │            Ollama (self-hosted)             │    │
│  │  Database: Supabase | Postgres              │    │
│  │  Auth:     Supabase JWT | Generic JWT       │    │
│  │  Billing:  Razorpay (INR) | Stripe (USD)   │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐          ┌────────▼────────┐
│  Supabase /    │          │  Razorpay /     │
│  Postgres DB   │          │  Stripe         │
└────────────────┘          └─────────────────┘
```

---

## Project Structure

```
safeshoulder/
├── backend/
│   ├── app/
│   │   ├── config.py                  # All settings — loaded from .env
│   │   ├── main.py                    # FastAPI app, CORS, router registration
│   │   ├── middleware/
│   │   │   └── auth.py                # JWT verification (provider-agnostic)
│   │   ├── models/
│   │   │   └── schemas.py             # Pydantic request/response models
│   │   ├── providers/
│   │   │   ├── llm/
│   │   │   │   ├── base.py            # LLMProvider abstract class
│   │   │   │   ├── factory.py         # Reads LLM_PROVIDER, returns instance
│   │   │   │   ├── anthropic_provider.py
│   │   │   │   ├── openai_provider.py
│   │   │   │   ├── google_provider.py
│   │   │   │   └── ollama_provider.py # Any OpenAI-compatible local endpoint
│   │   │   ├── billing/
│   │   │   │   ├── base.py            # BillingProvider abstract class
│   │   │   │   ├── factory.py         # Reads BILLING_PROVIDER, returns instance
│   │   │   │   ├── razorpay_provider.py  # INR, UPI, cards, netbanking
│   │   │   │   └── stripe_provider.py    # International / fallback
│   │   │   ├── db/                    # (pluggable DB layer — extend here)
│   │   │   └── auth/                  # (pluggable auth layer — extend here)
│   │   ├── routers/
│   │   │   ├── chat.py                # POST /chat/stream  (SSE)
│   │   │   ├── sessions.py            # GET/POST /sessions
│   │   │   └── billing.py             # Credit packs, subscriptions, webhooks
│   │   └── services/
│   │       ├── moderation.py          # 3-layer content filter
│   │       └── prompts.py             # Domain-specific system prompts
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing / domain picker
│   │   └── globals.css
│   ├── .env.local.example
│   └── package.json
│
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql     # Tables, RLS policies, RPCs
```

---

## Request Workflow

### Chat message flow

```
User sends message
      │
      ▼
[1] Input Moderation
    ├── Crisis keywords?  ──►  Return helpline message immediately
    └── Unsafe content?   ──►  Return 400 error
      │
      ▼
[2] Quota check
    ├── Free quota remaining?   ──►  Allow (deduct after response)
    ├── Active subscription?    ──►  Allow
    ├── Purchased credits > 0?  ──►  Allow (deduct after response)
    └── None of the above?      ──►  Return 402, prompt to purchase
      │
      ▼
[3] Session context
    ├── Load last 20 messages from DB
    └── Inject previous session summary (if returning user)
      │
      ▼
[4] LLM call (streaming)
    └── Domain-specific system prompt + conversation history
      │
      ▼
[5] Output moderation
    └── Strip accidental PII (phone numbers, SSNs)
      │
      ▼
[6] Persist + deduct
    ├── Save user + assistant messages to DB
    └── Decrement free quota or credit balance
      │
      ▼
Stream response to frontend (SSE)
```

### Payment flow (Razorpay)

```
User selects credit pack
      │
      ▼
POST /billing/orders  ──►  Razorpay creates Order  ──►  Returns order_id + amount
      │
      ▼
Frontend opens Razorpay Checkout SDK  ──►  User pays (UPI / card / netbanking)
      │
      ▼
POST /billing/verify  ──►  Backend verifies signature  ──►  Credits added to account
```

---

## Billing Model

| Tier | Price | Messages |
|---|---|---|
| Free | ₹0 | First 20 messages |
| Starter pack | ₹99 | 100 messages |
| Value pack | ₹249 | 300 messages |
| Pro pack | ₹599 | 800 messages |
| Monthly subscription | ₹299/month | 1000 messages |

All prices are configurable in `.env` — no code changes needed.

---

## Provider Options

| Concern | Options | Set via |
|---|---|---|
| LLM | `anthropic` · `openai` · `google` · `ollama` | `LLM_PROVIDER` |
| Model | any model name from the chosen provider | `LLM_MODEL` |
| Database | `supabase` · `postgres` | `DB_PROVIDER` |
| Auth | `supabase` · `jwt` (Cognito, Auth0, Firebase) | `AUTH_PROVIDER` |
| Billing | `razorpay` · `stripe` | `BILLING_PROVIDER` |
| Currency | `INR` · `USD` | `CURRENCY` |

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Supabase project (free tier works)
- API key for your chosen LLM provider
- Razorpay test account (for billing)

### 1. Clone the repo

```bash
git clone https://github.com/arinrjain/safeshoulder.git
cd safeshoulder
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your keys (see Provider Options above)

uvicorn app.main:app --reload --port 8000
```

API is now running at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

### 3. Database

Run the migration in your Supabase project:

1. Open your Supabase project → **SQL Editor**
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run**

### 4. Frontend

```bash
cd frontend
npm install

cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, etc.

npm run dev
```

Frontend is now running at `http://localhost:3000`

### 5. Test the API

```bash
# Health check
curl http://localhost:8000/health

# List credit packs
curl http://localhost:8000/billing/packs
```

---

## Deployment Guide

### Backend — Railway (recommended for lowest cost)

1. Push your code to GitHub (already done).
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**.
3. Select the `safeshoulder` repo and set **Root Directory** to `backend`.
4. Add all environment variables from `.env.example` under **Variables**.
5. Railway auto-detects Python and runs `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6. Note the generated URL (e.g. `https://safeshoulder-api.up.railway.app`).

### Frontend — Vercel (recommended)

1. Go to [vercel.com](https://vercel.com) → **Add New Project → Import Git Repository**.
2. Select `safeshoulder`, set **Root Directory** to `frontend`.
3. Add environment variables from `frontend/.env.local.example`.
4. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL.
5. Deploy — Vercel handles builds and CDN automatically.

### Database — Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/001_initial_schema.sql` via the SQL Editor.
3. Copy **Project URL** and **service_role key** into your backend `.env`.
4. Copy **Project URL** and **anon key** into your frontend `.env.local`.

### Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com) and complete KYC.
2. Dashboard → **Settings → API Keys** → generate Key ID and Key Secret.
3. Dashboard → **Subscriptions → Plans** → create a monthly plan at ₹299 → copy the Plan ID.
4. Dashboard → **Webhooks** → add your backend URL `/billing/webhook` and copy the webhook secret.
5. Add all four values to your backend `.env`.

### Environment variables summary

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `SUPABASE_URL` | Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings → API |
| `RAZORPAY_KEY_ID` | Razorpay dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay dashboard → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay dashboard → Webhooks |
| `RAZORPAY_SUBSCRIPTION_PLAN_ID` | Razorpay dashboard → Subscriptions → Plans |

### Production checklist

- [ ] `APP_ENV=production` in backend `.env`
- [ ] `CORS_ORIGINS` set to your Vercel frontend URL only
- [ ] Razorpay switched from test keys to live keys
- [ ] Supabase RLS policies verified (run `supabase/migrations/001_initial_schema.sql`)
- [ ] `FREE_MESSAGE_QUOTA` and pricing reviewed
- [ ] Crisis helpline numbers verified for target geography
- [ ] "Not a licensed therapist" disclaimer visible on every screen

---

## Safety & Content Moderation

Three layers run on every message:

1. **Input filter** — regex patterns for crisis keywords and unsafe content
2. **LLM built-in safety** — the chosen model's own safety layer
3. **Output filter** — strips accidental PII (phone numbers, ID numbers) from responses

Crisis keywords (suicidal ideation, self-harm) bypass the LLM entirely and return a hardcoded helpline message.

---

## Disclaimer

SafeShoulder is an AI support tool, not a licensed mental health service. It does not provide medical advice, diagnosis, or treatment. For emergencies, contact a crisis helpline or mental health professional.
