# SafeShoulder

An AI-powered emotional support portal for people dealing with school bullying, heartbreak, domestic conflict, financial stress, and workplace issues. Built with a fully decoupled provider architecture — swap LLM, database, auth, and payment providers via environment variables without touching application code.

---

## Table of Contents

- [Product Overview](#product-overview)
- [Supported Domains](#supported-domains)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Dual-Theme System](#dual-theme-system-phase-1)
- [Request Workflow](#request-workflow)
- [Billing Model](#billing-model)
- [Provider Options](#provider-options)
- [Local Setup](#local-setup)
- [Deployment Guide](#deployment-guide)
- [Design & Roadmap](#design--roadmap)
- [Disclaimer](#disclaimer)

---

## Product Overview

SafeShoulder is a **dual-themed chat-based AI support companion** powered by **Aisha** (AI Safe Shoulder Assistant). It is **not** a licensed therapy service — it is a safe space to talk, reflect, and be heard. Every screen carries a clear disclaimer, and crisis keywords trigger immediate redirection to professional helplines.

### Latest Features (Phase 1)
- 🎨 **Dual-theme system**: Dark theme optimized for teens (school bullying), light theme for adults (relationships, career, family, finance)
- 💙 **Aisha AI Companion**: Warm, empathetic support with transparent AI identity
- 🏠 **Teen Portal** (`/teen`): Landing page with 8 feature cards highlighting support options
- 👥 **Peer Support Circles**: Safe communities with trained student ambassadors
- 📚 **Resource Library**: Strategies, school policies, crisis hotlines
- 📖 **My Story**: Private journal for tracking experiences and growth
- 📊 **Pattern Detection**: Early escalation alerts and personalized insights
- 🎯 **Theme-aware navigation**: Different UX for teen vs. adult users

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

### Frontend Dual-Theme System

```
┌────────────────────────────────────────────────────────────────┐
│                   Next.js Frontend (Theme-Aware)              │
│                                                                │
│  ┌──────────────────────┐      ┌──────────────────────┐       │
│  │   Teen Theme         │      │   Adult Theme        │       │
│  │   (Dark Mode)        │      │   (Light Mode)       │       │
│  ├──────────────────────┤      ├──────────────────────┤       │
│  │ /teen               │      │ /chat                │       │
│  │ /teen/support       │      │ /dashboard           │       │
│  │ /teen/circles       │      │ /sessions            │       │
│  │ /teen/resources     │      │ /profile             │       │
│  │ /teen/story         │      │                      │       │
│  │                      │      │                      │       │
│  │ Aisha (24/7)        │      │ Aisha (24/7)         │       │
│  │ School-focused      │      │ Multi-domain         │       │
│  │ Peer circles        │      │ Workplace/Heartbreak │       │
│  │ Resource library    │      │ Family/Finance       │       │
│  └──────────────────────┘      └──────────────────────┘       │
└────────────────────────────────────────────────────────────────┘
                              │ HTTPS / SSE stream
                              │ Theme context
                              │ Domain routing
```

### Backend Architecture

```
┌──────────────────────────────────────────────────────┐
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
│   │   ├── layout.tsx                 # Wraps app with ThemeProvider
│   │   ├── page.tsx                   # Adult theme landing / domain picker
│   │   ├── chat/
│   │   │   └── page.tsx               # Adult theme chat interface
│   │   ├── teen/
│   │   │   ├── page.tsx               # Teen theme landing page (NEW - Phase 1)
│   │   │   └── support/
│   │   │       └── page.tsx           # Teen theme chat interface (NEW - Phase 1)
│   │   └── globals.css
│   ├── components/
│   │   ├── Navigation/
│   │   │   ├── NavWrapper.tsx         # Route-aware nav wrapper (NEW)
│   │   │   ├── TeenNav.tsx            # Teen-specific navigation (NEW)
│   │   │   └── AdultNav.tsx           # Adult-specific navigation (NEW)
│   │   └── ...existing...
│   ├── lib/
│   │   ├── themeConfig.ts             # Theme configuration & detection (NEW)
│   │   └── ThemeContext.tsx           # React Context for theme management (NEW)
│   ├── styles/
│   │   └── themes.css                 # CSS variables for both themes (NEW)
│   ├── .env.local.example
│   └── package.json
│
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql     # Tables, RLS policies, RPCs
```

---

## Dual-Theme System (Phase 1)

### How It Works

SafeShoulder now supports two distinct themes that serve different user demographics while sharing the same backend infrastructure:

#### Teen Theme (`/teen/*`)
- **Design**: Dark mode (navy #0F172A, purple #7C3AED, cyan #06B6D4)
- **Focus**: School bullying, peer pressure, social anxiety
- **Features**:
  - 8 feature cards: Daily Safety Check-Ins, My Story, Aisha Companion, Peer Support Circles, Pattern Detection, School Dashboard, Parent Guide, Resource Library
  - Warm, empathetic AI persona with emojis and peer-like tone
  - Crisis support hotline prominently displayed
- **Navigation**: TeenNav with emoji-driven design
- **Routes**: `/teen`, `/teen/support`, `/teen/circles`, `/teen/resources`, `/teen/story`

#### Adult Theme (default)
- **Design**: Light mode (lavender, indigo #4F46E5, cyan)
- **Focus**: Heartbreak, relationships, career, finance, family
- **Features**:
  - Multi-domain support with domain picker
  - Professional, therapist-like AI tone
  - Session management and billing
- **Navigation**: AdultNav with traditional layout
- **Routes**: `/`, `/chat`, `/dashboard`, `/profile`

### Theme Detection

Theme is detected based on URL path:
- URL starts with `/teen` → Teen Theme
- All other paths → Adult Theme

Theme is managed via React Context (`ThemeContext`) and applied via CSS variables (`--color-primary`, `--color-text`, etc.) in `frontend/styles/themes.css`.

### AI Companion: Aisha

Both themes use **Aisha** (AI Safe Shoulder Assistant) as the AI companion. The persona is configured in:
- Backend: `backend/app/services/prompts.py` — System prompt with Aisha persona
- Frontend: `frontend/lib/themeConfig.ts` — Persona name and domain mappings

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

### 6. Test Both Themes Locally

Once frontend and backend are running:

**Adult theme (default):**
```
http://localhost:3000/          # Landing page
http://localhost:3000/chat      # Chat interface
```

**Teen theme:**
```
http://localhost:3000/teen      # Teen landing page with 8 feature cards
http://localhost:3000/teen/support  # Teen chat interface (Aisha)
```

Both themes use the same backend at `http://localhost:8000/chat/stream`, sharing conversations and billing across themes.

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
- [ ] Both themes tested in production (`https://safeshoulder.com/` and `https://safeshoulder.com/teen`)
- [ ] Aisha persona verified across both themes

### Manual Deployment (Local VPS)

SafeShoulder can be deployed to a local VPS using the provided script:

```bash
./DEPLOY_NOW.sh
```

This script handles:
- Building the Next.js frontend
- Installing backend dependencies
- Restarting services via systemd
- Deploying to production

**Note**: Ensure your server has systemd configured with SafeShoulder services before running this script.

---

## Safety & Content Moderation

Three layers run on every message:

1. **Input filter** — regex patterns for crisis keywords and unsafe content
2. **LLM built-in safety** — the chosen model's own safety layer
3. **Output filter** — strips accidental PII (phone numbers, ID numbers) from responses

Crisis keywords (suicidal ideation, self-harm) bypass the LLM entirely and return a hardcoded helpline message.

---

## Design & Roadmap

### Design Specification

For detailed design system, component specifications, and feature roadmap, see [SAFESHOULDER_DUAL_THEME_SPEC.md](./SAFESHOULDER_DUAL_THEME_SPEC.md).

### Phase 1: Foundation ✅ COMPLETE
- Dual-theme system (teen dark, adult light)
- Theme detection and routing
- Navigation components (TeenNav, AdultNav)
- Teen landing page with 8 feature cards
- Teen chat interface (Aisha)
- CSS variable system for theming
- Aisha AI persona across both themes

### Phase 2: Teen Dashboard (Planned)
- Daily Safety Check-Ins component
- My Story (journal) feature
- Peer Support Circles directory
- Resource Library improvements

### Phase 3: Integrations (Planned)
- Pattern detection (backend ML alerts)
- School dashboard (admin view)
- Parent guide (email notifications)

### Phase 4: Polish & Launch (Planned)
- Mobile optimization refinements
- Performance testing
- User testing with teens
- Accessibility audit

---

## Disclaimer

SafeShoulder is an AI support tool, not a licensed mental health service. It does not provide medical advice, diagnosis, or treatment. For emergencies, contact a crisis helpline or mental health professional.
