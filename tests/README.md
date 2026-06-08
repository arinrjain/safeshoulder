# SafeShoulder Tests

This directory contains functional tests for SafeShoulder. These tests should be run:
- ✅ After every deployment
- ✅ After changes to onboarding, chat, or admin modules
- ✅ Before code review / PR approval

## Available Test Suites

- **`test_onboarding.py`** - User registration and profile setup
- **`test_chat.py`** - Message sending, sessions, and responses
- **`test_admin.py`** - User management (block, unblock, delete)

## Running Tests

### Run All Tests
```bash
python tests/run_all_tests.py
```

### Run Specific Test Suite
```bash
python tests/run_all_tests.py --suite onboarding
python tests/run_all_tests.py --suite chat
python tests/run_all_tests.py --suite admin
```

---

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

---

## Chat Functional Test

### Purpose
Tests the chat module:
1. ✅ Get user sessions
2. ✅ Send a message and get AI response
3. ✅ Retrieve chat history
4. ✅ Create sessions in different domains

### Running the Test
```bash
python tests/test_chat.py
```

### What It Tests
- Message sending to chat endpoint
- AI response generation
- Session creation and management
- Multi-domain sessions
- Chat history retrieval

### Expected Results
- User can send messages
- AI provides responses
- Sessions are properly stored
- Multiple domains maintain separate sessions

---

## Admin Functional Test

### Purpose
Tests the admin module:
1. ✅ List all users
2. ✅ Block a user
3. ✅ Verify user is blocked
4. ✅ Unblock a user
5. ✅ Delete a user

### Setup Required
Set `ADMIN_PASSWORD` in `.env` to run admin tests:
```bash
# .env
ADMIN_PASSWORD=your_admin_password_here
```

### Running the Test
```bash
python tests/test_admin.py
```

### What It Tests
- Admin can list all users
- Block functionality prevents login
- Block status is persisted
- Unblock restores access
- Delete removes user completely

### Notes
- Requires admin credentials in .env
- Tests use the first configured admin email (arinrjain@gmail.com)
- Auto-cleans up test users after running
- Skips gracefully if ADMIN_PASSWORD is not set

---

## CI/CD Integration

### GitHub Actions Example

Add to your `.github/workflows/deploy.yml`:

```yaml
name: Deploy and Test

on: push

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.10'
      
      - name: Install test dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install requests
      
      - name: Run functional tests
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          NEXT_PUBLIC_API_URL: https://api.safeshoulder.com
          ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
        run: |
          cd backend
          python ../tests/run_all_tests.py
```

### Local Pre-commit Testing
Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
cd backend
python ../tests/run_all_tests.py || exit 1
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## Test Output Format

### Success
```
[10:30:45] ✅ Test user created: test-onboarding-1716523845@safeshoulder.local
[10:30:46] ✅ Onboarding endpoint returned 200
[10:30:46] ✅ Domain correctly saved: workplace

Test Summary
Passed: 10
Failed: 0
```

### Failure
```
[10:30:45] ❌ Failed to create test user: Connection refused
[10:30:45] ❌ Onboarding endpoint returned 401

Test Summary
Passed: 0
Failed: 2

Errors:
  - Failed to create test user: Connection refused
  - Onboarding endpoint returned 401
```

---

## Exit Codes
- `0` - All tests passed ✅
- `1` - One or more tests failed ❌

---

## Troubleshooting Tests

**Tests can't connect to API**
- Ensure backend is running: `python -m uvicorn app.main:app --reload`
- Check `NEXT_PUBLIC_API_URL` in `.env`

**Admin tests are skipped**
- Set `ADMIN_PASSWORD` in `.env`
- Ensure it matches your admin account password

**Tests timeout**
- Backend might be under load
- Increase timeout by modifying `timeout=30` in test files

**Test user cleanup fails**
- Manual cleanup in Supabase dashboard: filter for `test-` prefix
