# Production Deployment Guide - SafeShoulder Backend to Railway

**Goal**: Deploy backend to Railway so production tests can run against https://safeshoulder-api.up.railway.app

---

## Prerequisites Checklist

- [ ] GitHub account with safeshoulder repo access
- [ ] Railway account (free at railway.app)
- [ ] All environment variables ready (see below)
- [ ] Supabase project created (or use existing credentials)

---

## Step 1: Create/Verify Supabase Project

### Option A: Create New Supabase Project
1. Go to [supabase.com](https://supabase.com) → Sign up
2. Create new project
3. Run migration in SQL Editor: Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Note your credentials:
   - **Project URL**: `https://xxx.supabase.co`
   - **Service Role Key**: Under Settings → API

### Option B: Use Existing Project
Get credentials from your existing Supabase project dashboard

---

## Step 2: Prepare Environment Variables

Gather all required variables (you'll need these for Railway):

```env
# LLM
LLM_PROVIDER=anthropic
LLM_MODEL=claude-haiku-4-5-20251001
ANTHROPIC_API_KEY=sk-ant-...

# Database
DB_PROVIDER=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Auth
AUTH_PROVIDER=supabase
JWT_SECRET=your-jwt-secret
JWT_AUDIENCE=authenticated
JWT_ALGORITHM=HS256

# Billing
BILLING_PROVIDER=razorpay
CURRENCY=INR
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
RAZORPAY_SUBSCRIPTION_PLAN_ID=plan_...

# Voice (Optional)
DEEPGRAM_API_KEY=...

# App
APP_ENV=production
FREE_MESSAGE_QUOTA=20
MAX_MESSAGES_PER_DAY=50
CORS_ORIGINS=https://www.safeshoulder.com,https://safeshoulder.com
APP_URL=https://safeshoulder.com
```

---

## Step 3: Deploy to Railway

### Via Web UI (Easiest)

1. Go to [railway.app/login](https://railway.app/login) → Sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `safeshoulder` repository
4. Set **Root Directory** to `backend`
5. Railway will auto-detect Python
6. Add all environment variables:
   - Settings → Variables → Paste each variable
7. Wait for deployment (5-10 minutes)
8. Note the generated URL (e.g., `https://safeshoulder-production.up.railway.app`)

### Via Railway CLI (Optional)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
cd backend
railway link

# Deploy
railway up

# View logs
railway logs
```

---

## Step 4: Update Production Configuration

Once backend is deployed:

1. **Update Frontend (.env.production on Vercel)**:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url
   ```

2. **Update Tests (.env in project root)**:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url
   ```

3. **DNS/Custom Domain (Optional)**:
   - Add custom domain in Railway settings
   - Point to Railway's domain

---

## Step 5: Test Production Deployment

### Test Backend Health
```bash
curl https://your-railway-url/health
```

### Run E2E Tests Against Production
```bash
cd /Users/rinish/projects/arin/safeshoulder

# Update .env
echo 'NEXT_PUBLIC_API_URL=https://your-railway-url' >> .env

# Run tests
python tests/run_all_tests.py
```

---

## Troubleshooting

### "Application not found" / 404 Errors
- Backend may not be deployed yet
- Check Railway deployment logs
- Verify root directory is set to `backend`

### "ModuleNotFoundError: No module named 'app'"
- Railway may be running from wrong directory
- Verify "Root Directory" is `backend` in Railway settings

### Database Connection Failed
- Check SUPABASE_URL is correct
- Verify SUPABASE_SERVICE_ROLE_KEY is complete (no truncation)
- Check if Supabase project still exists

### Import Errors
- Ensure Python version is 3.11+
- Check requirements.txt has all dependencies

---

## Success Criteria

✅ Backend is deployed and accessible  
✅ Health endpoint returns 200  
✅ E2E tests pass (onboarding, chat, admin)  
✅ Production website can communicate with backend  

---

## Support

If deployment fails:
1. Check Railway deployment logs
2. Verify all environment variables are set
3. Check that Supabase project exists and is accessible
4. See Railway troubleshooting: https://railway.app/docs
