# 🚀 Production Deployment Instructions

**Status**: All tests passing (109/109) ✅  
**Ready to Deploy**: YES ✅

---

## Step 1: Login to Vercel (One-time only)

```bash
vercel login
```

This will:
1. Open browser to Vercel login
2. Authenticate your account
3. Save credentials locally

---

## Step 2: Deploy to Production

### Option A: Deploy Existing Project (Recommended)

If you've already linked this project to Vercel:

```bash
cd frontend
vercel deploy --prod
```

### Option B: Deploy as New Project

If this is first time:

```bash
cd frontend
vercel deploy
# Follow prompts to link project
# Then run: vercel deploy --prod
```

### Option C: Deploy with Environment Variables

If environment variables need to be set:

```bash
cd frontend
vercel deploy --prod --env NEXT_PUBLIC_SUPABASE_URL=your_url --env NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

## Expected Output

When deployment succeeds, you'll see:

```
✓ Production: https://safeshoulder.app [v1234567]
✓ Deployment complete
✓ Ready to go live
```

---

## Step 3: Verify in Production (10 minutes)

Once deployment completes:

### Test 1: Login Flow
1. Go to https://safeshoulder.app
2. Click "Sign in with Google"
3. Login should work → Verify session in browser console:
   ```javascript
   localStorage.getItem('sb-aovdmocxjglpiokiximn-auth-token')
   ```
   Should return session object ✅

### Test 2: Chat Feature
1. Go to `/teen/support`
2. Send a message: "Hello"
3. AI should respond ✅

### Test 3: Story Feature
1. Go to `/teen/story`
2. Click "Write New Entry"
3. Create entry with title and content
4. Click "Save Entry" → Entry should appear ✅

### Test 4: Download PDF
1. Go to `/teen/story`
2. Select an entry (checkbox)
3. Click "Share (1)"
4. Enter teacher name: "Ms. Test"
5. Click "Send Report"
6. PDF should auto-download ✅

### Test 5: Sample Entry
1. Go to `/teen/story`
2. Click "View Sample Entry"
3. Modal should show sample entry ✅

---

## Monitoring After Deployment

### Check Error Logs
```bash
vercel logs production
```

### Monitor Performance
```bash
vercel analytics
```

### View Deployment Status
```bash
vercel deployments
```

---

## Rollback if Issues

If production has issues:

```bash
# View all deployments
vercel ls

# Promote previous working deployment
vercel promote <deployment-url>

# Or redeploy
vercel deploy --prod
```

---

## Environment Variables in Vercel

Make sure these are set in Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://aovdmocxjglpiokiximn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Check Vercel dashboard:
1. Go to vercel.com/dashboard
2. Select project
3. Go to Settings → Environment Variables
4. Verify variables are set ✅

---

## After Production Deployment

### Notify Team
- Story + Chat features now live
- All Phase 1 tests passing
- PDF reports working
- Sample entry available

### Monitor
- Check error logs daily
- Monitor user feedback
- Track performance metrics

### Next Phase
- Create and run Phase 2 tests (Sessions, Resources, Profile)
- Deploy Phase 2 features
- Continue with Phase 3 (Circles, Voice, Knowledge, Billing)

---

## Command Reference

| Command | Purpose |
|---------|---------|
| `vercel login` | Authenticate with Vercel |
| `vercel deploy --prod` | Deploy to production |
| `vercel logs production` | View production logs |
| `vercel env pull` | Pull environment variables |
| `vercel ls` | List all deployments |
| `vercel promote <url>` | Promote deployment to production |

---

## Troubleshooting

### Issue: "No project found"
**Solution**: Make sure you're in the `frontend` directory
```bash
cd frontend
vercel deploy --prod
```

### Issue: "Environment variable not found"
**Solution**: Set in Vercel dashboard or CLI
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Issue: "Build failed"
**Solution**: Check build logs
```bash
vercel logs production
```

### Issue: "Authentication failed in production"
**Solution**: Verify environment variables are set correctly
```bash
vercel env pull
# Check .env.local has correct values
```

---

## Success Indicators

✅ Deployment completes without errors  
✅ Production URL accessible  
✅ Login works (Google OAuth)  
✅ Chat messages send/receive  
✅ Journal entries create & display  
✅ PDF download works  
✅ Sample entry modal displays  
✅ No errors in browser console  
✅ No 403/404 errors in logs  

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Login to Vercel | 2 min | ⏳ Pending |
| Deploy | 5 min | ⏳ Pending |
| Verify Features | 10 min | ⏳ Pending |
| Monitor | Ongoing | ⏳ Pending |
| **Total** | **~20 min** | **Ready** |

---

**Next**: Run commands above and report results 🚀

Status: Ready for production deployment
Test Results: 109/109 PASSING ✅
Feature Status: Story + Chat ready
