# SafeShoulder

An AI-powered emotional support platform for teens and young adults dealing with school/college stress, relationships, family issues, financial concerns, and workplace challenges. Built with a fully decoupled provider architecture — swap LLM, database, auth, and payment providers via environment variables without touching application code.

---

## Table of Contents

- [Product Overview](#product-overview)
- [Supported Domains](#supported-domains)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Request Workflow](#request-workflow)
- [Billing Model](#billing-model)
- [Provider Options](#provider-options)
- [Local Setup](#local-setup)
- [Deployment Guide](#deployment-guide)
- [Design & Roadmap](#design--roadmap)
- [Disclaimer](#disclaimer)

---

## Product Overview

SafeShoulder is a **teen-focused chat-based AI support companion** powered by **Aisha** (AI Safe Shoulder Assistant). It is **not** a licensed therapy service — it is a safe space to talk, reflect, and be heard. Every screen carries a clear disclaimer, and crisis keywords trigger immediate redirection to professional helplines.

### Core Features
- 💙 **Aisha AI Companion**: Warm, empathetic support with transparent AI identity
- 🎨 **Teen-Optimized UI**: Dark theme designed for accessibility and engagement (purple #7C3AED, cyan #06B6D4, navy #0F172A)
- 🏠 **Teen Portal** (`/teen`): Landing page with 8 feature cards highlighting support options
- 👥 **Peer Support Circles**: Safe communities with trained student ambassadors (6+ circles)
- 📚 **Resource Library**: Coping strategies, understanding bullying, communication tips, school policies, crisis hotlines
- 📖 **My Story**: Private journal for tracking experiences and growth (categorize as Growth, Win, or Bullying)
- 🆘 **Crisis Support**: India-specific helplines (iCall, AASRA, Vandrevala, SABERA) with one-click access
- 🧠 **Domain-Specific Routing**: Intelligent keyword detection for auto-routing conversations

---

## Supported Domains

| Domain | What it covers |
|---|---|
| School & College | Bullying, peer pressure, exam stress, performance anxiety, academic challenges |
| Relationships | Breakups, rejection, communication, loneliness |
| Family Conflict | Difficult home environments, family relationships |
| Financial | Money anxiety, debt, job concerns |
| Workplace | Burnout, toxic environments, career worries |

---

## Architecture

### Frontend (Teen-Focused)

```
┌────────────────────────────────────────────────────────────┐
│              Next.js Frontend (Dark Theme)                │
│                                                            │
│  ┌──────────────────────────────────────────────────┐     │
│  │   Unified Teen-Focused Experience                │     │
│  ├──────────────────────────────────────────────────┤     │
│  │ /                 → Landing page + domain info   │     │
│  │ /teen             → Teen portal (hero + cards)   │     │
│  │ /teen/support     → Chat with Aisha              │     │
│  │ /teen/circles     → Peer support communities     │     │
│  │ /teen/resources   → Strategy library + helplines │     │
│  │ /teen/story       → Private journal              │     │
│  │ /profile          → User profile & preferences   │     │
│  │ /onboarding       → First-time setup flow        │     │
│  │                                                  │     │
│  │ Design System:                                   │     │
│  │ • Dark mode (Navy #0F172A, Purple #7C3AED)       │     │
│  │ • CSS variables for consistency                  │     │
│  │ • Responsive mobile-first                        │     │
│  │ • Emoji-driven navigation                        │     │
│  └──────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
                              │ HTTPS / SSE stream
                              │ JWT authentication
                              │ Domain routing (keywords)
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
│   │   ├── layout.tsx                 # Root layout with ThemeProvider
│   │   ├── page.tsx                   # Landing page (guides to /teen or /login)
│   │   ├── teen/
│   │   │   ├── page.tsx               # Teen portal home (hero + 8 feature cards)
│   │   │   ├── support/
│   │   │   │   └── page.tsx           # Chat interface with Aisha
│   │   │   ├── circles/
│   │   │   │   └── page.tsx           # Peer support communities
│   │   │   ├── resources/
│   │   │   │   └── page.tsx           # Resource library + crisis helplines
│   │   │   └── story/
│   │   │       └── page.tsx           # My Story private journal
│   │   ├── profile/
│   │   │   └── page.tsx               # User profile & preferences
│   │   ├── onboarding/
│   │   │   └── page.tsx               # First-time setup flow
│   │   ├── login/
│   │   ├── auth/
│   │   ├── billing/
│   │   ├── admin/
│   │   └── globals.css
│   ├── components/
│   │   ├── Navigation/
│   │   │   ├── NavWrapper.tsx         # Navigation wrapper
│   │   │   └── TeenNav.tsx            # Main navigation (emoji-driven)
│   │   ├── Navbar.tsx                 # Top navbar
│   │   └── [other components]
│   ├── lib/
│   │   ├── themeConfig.ts             # Theme configuration
│   │   ├── ThemeContext.tsx           # React Context (single 'teen' theme)
│   │   └── supabase.ts                # Supabase client
│   ├── styles/
│   │   └── themes.css                 # CSS variables (teen theme)
│   ├── .env.local.example
│   └── package.json
│
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql     # Tables, RLS policies, RPCs
```

---

## Core Features

### 1. Chat with Aisha (AI Safe Shoulder Assistant)
- **Real-time streaming** conversations via Server-Sent Events (SSE)
- **Domain-aware prompts**: Different system prompts for school, relationships, family, finance, workplace
- **Keyword auto-detection**: Conversations are routed to the appropriate domain automatically
- **Crisis keywords trigger helplines**: If user mentions self-harm, suicide, or abuse, Aisha immediately responds with crisis hotline numbers
- **Multi-provider LLM support**: Works with Anthropic, OpenAI, Google, or self-hosted Ollama

### 2. Peer Support Circles
Six pre-configured communities:
- Social Anxiety Support Squad
- Bullying Survivors' Circle
- New at School Support
- LGBTQ+ Peer Support
- Academic Stress & Community
- Self-Esteem & Body Community

Each circle is led by trained student ambassadors and provides a judgment-free space.

### 3. Resource Library
Eight resource categories:
- **Coping Strategies**: Practical techniques for stress management
- **Understanding Bullying**: Why bullying happens, its psychology
- **Communication Tips**: How to talk to parents, friends, teachers
- **Rights & Policies**: Know Your School's Anti-Bullying Policy
- **Support Networks**: Building Your Support Network
- **Self-Care**: Self-Care When You're Under Stress
- **Crisis Support**: Crisis Helplines & Emergency Support (India-specific)
- **Mental Health**: Mental Health Basics

### 4. My Story (Private Journal)
- Write personal entries to track growth and experiences
- Categorize entries: Growth, Win, or Bullying
- Private and encrypted (only you can see)
- Search and filter past entries

### 5. India-Specific Crisis Support
Four emergency helplines built-in:
- **iCall**: 9152987821 (24/7 emotional support)
- **AASRA**: 9820466726 (Befrienders, crisis counseling)
- **Vandrevala Foundation**: 9999 77 8888 (Mental health support)
- **SABERA**: 1800 223 8014 (Women's helpline, toll-free)

One-click calling and message templates for crisis situations.

### 6. Smart Domain Routing
Conversations are automatically routed based on keywords:
- **School/College**: JEE, NEET, board exam, bullying, peer pressure, exam stress
- **Relationships**: breakup, heartbreak, boyfriend, girlfriend, crush, rejection
- **Family**: parent, mom, dad, family, home, conflict, divorce
- **Financial**: money, debt, job, salary, bills, broke
- **Workplace**: boss, coworker, manager, office, work stress, burnout

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

### Backend — Railway (free tier)

1. Log in to [railway.app](https://railway.app) (sign up if needed).
2. **Downgrade to Free plan** (if on paid tier) — includes $1 monthly usage credits, 1 vCPU, 0.5 GB RAM.
3. Create **New Project → Deploy from GitHub repo**.
4. Select the `safeshoulder` repo and set **Root Directory** to `backend`.
5. Add all environment variables from `.env.example` under **Variables**.
6. Railway auto-detects Python and runs `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
7. Note the generated URL (e.g. `https://safeshoulder-api.up.railway.app`).

**Free tier is perfect for hobby/learning projects.** For production with guaranteed uptime, upgrade to paid plan.

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
