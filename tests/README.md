# SafeShoulder Tests

This directory contains functional tests for SafeShoulder. These tests should be run after every deployment to ensure the system is working correctly.

## Onboarding Functional Test

### Purpose
Tests the complete onboarding flow:
1. ✅ Creates a test user
2. ✅ Calls the onboarding endpoint
3. ✅ Verifies data is saved to database
4. ✅ Verifies user can access chat

### Requirements
- Backend API running
- Supabase credentials configured in `.env`
- Python 3.8+
- Dependencies: `requests`, `python-jose`, `python-dotenv`, `supabase`

### Installation
```bash
cd backend
pip install requests python-jose python-dotenv supabase
```

### Running the Test

**From backend directory:**
```bash
python ../tests/test_onboarding.py
```

**Or from project root:**
```bash
cd backend && python ../tests/test_onboarding.py
```

### Expected Output
```
[10:30:45] ℹ️ ============================================================
[10:30:45] ℹ️ SafeShoulder Onboarding Functional Test
[10:30:45] ℹ️ API: http://localhost:8000
[10:30:45] ℹ️ Test Email: test-onboarding-1716523845@safeshoulder.local
[10:30:45] ℹ️ ============================================================

[10:30:45] ℹ️ Step 1: Creating test user...
[10:30:46] ✅ Test user created: test-onboarding-1716523845@safeshoulder.local

[10:30:46] ℹ️ Step 2: Calling onboarding endpoint...
[10:30:46] ✅ Onboarding endpoint returned 200
[10:30:46] ✅ Domain saved: workplace

[10:30:46] ℹ️ Step 3: Verifying data in database...
[10:30:46] ✅ User exists in database
[10:30:46] ✅ Domain correctly saved: workplace
[10:30:46] ✅ Name correctly saved: Test User
[10:30:46] ✅ Profession correctly saved: QA Engineer
[10:30:46] ✅ Domain profile exists in database
[10:30:46] ✅ Support type saved: advice

[10:30:46] ℹ️ Step 4: Verifying chat page access...
[10:30:46] ✅ Chat accessible (status: 405)

[10:30:47] ✅ Cleaned up test user: cd687393-7b27-42de-8aeb-dc223791ab43

[10:30:47] ℹ️ ============================================================
[10:30:47] ℹ️ Test Summary
[10:30:47] ✅ Passed: 10
[10:30:47] ❌ Failed: 0
[10:30:47] ============================================================
```

### Exit Codes
- `0` - All tests passed ✅
- `1` - One or more tests failed ❌

### CI/CD Integration

**GitHub Actions Example:**
```yaml
name: Functional Tests

on: deployment

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Run onboarding test
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          NEXT_PUBLIC_API_URL: https://api.safeshoulder.com
        run: python tests/test_onboarding.py
```

### Troubleshooting

**"Missing required environment variables"**
- Ensure `.env` file is configured in backend directory
- Required vars: `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`

**"Onboarding endpoint returned 401"**
- JWT_SECRET might not match between frontend and backend
- Check that JWT_SECRET in .env is correct

**"User exists in database but domain is NULL"**
- Onboarding endpoint didn't save the domain
- Check backend logs for errors

**"Connection refused"**
- Backend API is not running
- Start it with: `cd backend && python -m uvicorn app.main:app --reload`

### Notes
- Each test run creates a temporary test user and cleans up automatically
- Test users are prefixed with `test-onboarding-` for easy identification
- If cleanup fails, you can manually delete test users from Supabase dashboard
