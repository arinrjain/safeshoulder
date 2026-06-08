# Production Deployment Steps - SafeShoulder Engagement Update

**Date:** June 8, 2026  
**Version:** 1.0  
**Estimated Time:** 20-30 minutes

---

## STEP 1: Verify Changes Locally (5 minutes)

### 1.1 Check what changed
```bash
cd /Users/rinish/projects/arin/safeshoulder
git status
```

**Expected output:**
```
 M backend/app/routers/chat.py
 M backend/app/services/prompts.py
 M frontend/app/chat/page.tsx
```

### 1.2 Review the changes
```bash
git diff backend/app/services/prompts.py
git diff backend/app/routers/chat.py
git diff frontend/app/chat/page.tsx
```

### 1.3 Test locally (optional but recommended)
```bash
# Backend: Verify code compiles
python -m py_compile backend/app/main.py backend/app/routers/chat.py backend/app/services/prompts.py

# Frontend: Build locally
cd frontend
npm run build
cd ..
```

---

## STEP 2: Commit Changes to Git (3 minutes)

### 2.1 Stage the changes
```bash
git add backend/app/routers/chat.py backend/app/services/prompts.py frontend/app/chat/page.tsx
```

### 2.2 Create a commit
```bash
git commit -m "Improve engagement: shorter responses, emoji personality, structured formatting, validation messages"
```

### 2.3 Verify commit
```bash
git log --oneline -5
```

**You should see your new commit at the top**

---

## STEP 3: Push to Remote Repository (2 minutes)

### 3.1 Push to your main branch
```bash
git push origin main
```

**Or if you use a different branch:**
```bash
git push origin [your-branch-name]
```

### 3.2 Verify push
Go to GitHub/GitLab and confirm the 3 files are updated:
- ✅ backend/app/routers/chat.py
- ✅ backend/app/services/prompts.py  
- ✅ frontend/app/chat/page.tsx

---

## STEP 4: Deploy Backend (5-10 minutes)

### Option A: If using Docker

**4.1 Pull latest code**
```bash
cd /path/to/safeshoulder
git pull origin main
```

**4.2 Rebuild and restart**
```bash
docker-compose down
docker-compose up -d
```

**4.3 Verify backend is running**
```bash
curl http://localhost:8000/health
```
Should return: `{"status":"ok"}`

### Option B: If running directly on server

**4.1 SSH into your server**
```bash
ssh your-server-address
cd /path/to/safeshoulder/backend
```

**4.2 Pull latest code**
```bash
git pull origin main
```

**4.3 Install any dependencies (if needed)**
```bash
pip install -r requirements.txt
```

**4.4 Restart the backend service**
```bash
# If using systemctl:
sudo systemctl restart safeshoulder-backend

# If using supervisor:
sudo supervisorctl restart safeshoulder

# If running manually in screen/tmux:
# Kill the current process and restart
```

**4.5 Verify it's running**
```bash
curl http://localhost:8000/health
```

---

## STEP 5: Deploy Frontend (5-10 minutes)

### Option A: If using Vercel/Netlify

**5.1 Trigger deployment**
- Go to your Vercel/Netlify dashboard
- Your deployment should auto-trigger when you pushed to main
- Wait for build to complete (usually 2-5 minutes)
- Verify deployment shows the latest commit

**5.2 Verify frontend is live**
- Visit your production URL
- Open browser DevTools (F12)
- Check Network tab - ensure latest files are loaded
- Optionally: Clear cache (Ctrl+Shift+Delete) and refresh

### Option B: If deploying manually

**5.1 SSH into your server**
```bash
ssh your-server-address
cd /path/to/safeshoulder/frontend
```

**5.2 Pull latest code**
```bash
git pull origin main
```

**5.3 Build the frontend**
```bash
npm install
npm run build
```

**5.4 Deploy the build**
```bash
# If using PM2:
pm2 restart safeshoulder-frontend

# If using systemctl:
sudo systemctl restart safeshoulder-frontend

# If using nginx/apache:
# Copy build files to web root
cp -r .next/* /var/www/safeshoulder/
sudo systemctl restart nginx
```

**5.5 Verify it's live**
```bash
curl https://your-production-url.com
```

---

## STEP 6: Production Verification (5 minutes)

### 6.1 Open SafeShoulder in browser
Go to: `https://your-production-url.com`

### 6.2 Send a test message
- Complete onboarding if needed
- Select any domain (e.g., "Workplace")
- Send message: **"I'm struggling at work"**

### 6.3 Verify response has:
- ✅ Emoji at start (e.g., 😤)
- ✅ Short response (2-3 sentences max)
- ✅ Validation message appears (e.g., "— That workplace stress is real.")
- ✅ Validation message disappears after 4 seconds

**Expected response:**
```
😤 That workplace stress is real.

What's the hardest part right now?

[Validation message appears for 4 seconds, then disappears]
```

### 6.4 Test voice mode
- Click the 🎙️ mic button
- Enable voice mode
- Send a message: "I'm feeling burnt out"
- Click mic to record
- Listen to the response

**Verify:**
- ✅ Audio sounds natural (no emoji names)
- ✅ Audio matches the text response
- ✅ No weird emoji sounds

### 6.5 Test structured response
Send a multi-point message:
- Message: "My boss ignores my ideas and I feel invisible. What can I do?"

**Expected structured response:**
```
😤 That invisibility hurts. Here's what helps:

• **Set a clear agenda** — email ideas in advance
• **Document everything** — show your contributions
• **Find allies** — who backs you?

Which feels doable?

[Validation message appears and auto-dismisses]
```

### 6.6 Test all domains
Repeat above tests with:
- **Family:** "My parents control everything"
- **Heartbreak:** "We just broke up"
- **Bullying:** "They exclude me at school"
- **Financial:** "I can't afford my bills"

Each should show:
- ✅ Emoji
- ✅ Short response
- ✅ Structured format (if multiple points)
- ✅ Validation message

---

## STEP 7: Monitor for 24 hours (Ongoing)

### 7.1 Check logs
```bash
# Backend logs
tail -f /path/to/backend/logs/app.log

# Frontend logs (if available)
# Check your hosting platform's logs
```

### 7.2 Monitor for errors
- Check error tracking (Sentry, DataDog, etc.)
- Look for any validation message errors
- Check for emoji handling issues

### 7.3 User feedback
- Ask early users how it feels
- "Are responses clearer?"
- "Do validation messages help?"
- "Does voice mode work?"

---

## ROLLBACK (if something goes wrong)

### 9.1 Identify the issue
```bash
git log --oneline -5
```

### 9.2 Revert the changes
```bash
git revert HEAD
git push origin main
```

### 9.3 Redeploy
Follow STEP 4 and STEP 5 above with the reverted code

---

## TROUBLESHOOTING

### Issue: "Backend returns 400 error on chat"
**Solution:**
```bash
# Backend logs show validation error?
# Check: Did you restart the backend after git pull?
# The new prompts.py code needs to be loaded
sudo systemctl restart safeshoulder-backend
```

### Issue: "Validation messages not appearing"
**Solution:**
```bash
# Frontend shows old code?
# Clear browser cache: Ctrl+Shift+Delete
# Or hard refresh: Ctrl+Shift+R
# Then try again
```

### Issue: "Voice mode has weird emoji sounds"
**Solution:**
```bash
# Check: Did frontend deploy complete?
# Verify frontend is running latest code
# Clear browser cache and refresh
```

### Issue: "Responses still long (not short)"
**Solution:**
```bash
# Check: Did backend restart with new prompts.py?
# Check logs: grep "BASE_PERSONA" /path/to/backend/logs/app.log
# Restart backend: sudo systemctl restart safeshoulder-backend
```

---

## VERIFICATION CHECKLIST

After deployment, verify:

- [ ] Backend is running (`GET /health` returns 200)
- [ ] Frontend is deployed (latest code loaded)
- [ ] Chat works (can send message)
- [ ] Response has emoji
- [ ] Response is short (2-3 sentences)
- [ ] Response is formatted (bullets/bold if needed)
- [ ] Validation message appears
- [ ] Validation message disappears after 4 seconds
- [ ] Voice mode works
- [ ] Voice mode has no emoji sounds
- [ ] All 5 domains tested
- [ ] No errors in logs

---

## SUCCESS CRITERIA

✅ **Deployment is successful when:**
- Users can send messages
- Responses are 2-3 sentences with emoji
- Validation messages appear and dismiss
- Voice mode works smoothly
- No errors in logs

---

## SUPPORT

If you get stuck:
1. Check `DEPLOYMENT.md` for full documentation
2. Check `CHANGES_SUMMARY.md` for technical details
3. Review the git diffs to understand changes
4. Check server logs for specific errors

---

**You've got this! 🚀**

Questions? Need help with any specific step? Let me know!
