# SafeShoulder Portal - Run Tests Quick Start

**Pre-Deployment Testing Guide**  
**All tests run locally with no external dependencies**  
**Estimated total time: < 2 seconds**

---

## Quick Commands

### Run All Tests (Recommended Before Deployment)
```bash
# Frontend
cd frontend
npm install -D vitest @vitejs/plugin-react jsdom
npm test -- --run

# Backend
cd backend
source venv/bin/activate
pip install pytest pytest-cov
python -m pytest tests/ -v --tb=short
```

### Run Tests by Phase

#### Phase 1: Critical Features (MUST PASS)
```bash
# Frontend - Critical
npm test -- chat.test.ts story/e2e-share-flow.test.ts --run

# Backend - Critical
pytest tests/test_chat_critical.py tests/test_story_share_flow.py -v
```

#### Phase 2: Core Features
```bash
# Frontend
npm test -- auth.test.ts dashboard.test.ts resources.test.ts --run

# Backend
pytest tests/test_sessions.py tests/test_resources.py -v
```

#### Phase 3: Additional Features
```bash
# Frontend
npm test -- circles.test.ts profile.test.ts --run

# Backend
pytest tests/test_voice.py tests/test_knowledge.py tests/test_billing.py -v
```

---

## Detailed Setup

### Frontend Tests

#### 1. Install Dependencies
```bash
cd frontend
npm install -D vitest @vitejs/plugin-react jsdom
```

#### 2. Run All Tests
```bash
npx vitest run
```

#### 3. Run Specific Test File
```bash
npx vitest run __tests__/features/chat.test.ts
npx vitest run app/teen/story/__tests__/e2e-share-flow.test.ts
```

#### 4. Run with Coverage
```bash
npx vitest run --coverage
```

#### 5. Watch Mode (for development)
```bash
npx vitest --watch
```

### Backend Tests

#### 1. Install Dependencies
```bash
cd backend
source venv/bin/activate
pip install pytest pytest-cov pytest-mock
```

#### 2. Run All Tests
```bash
python -m pytest tests/ -v
```

#### 3. Run Specific Test File
```bash
python -m pytest tests/test_chat_critical.py -v
python -m pytest tests/test_story_share_flow.py -v
```

#### 4. Run with Coverage
```bash
python -m pytest tests/ -v --cov=app --cov-report=html
```

#### 5. Run Specific Test
```bash
python -m pytest tests/test_chat_critical.py::TestChatAPI::test_send_message_to_ai -v
```

---

## Understanding Test Results

### ✅ Success Output (Frontend)
```
 Test Files  2 passed (2)
 Tests       48 passed (48)
 Duration    850ms
```

### ✅ Success Output (Backend)
```
======= test session starts =======
platform darwin -- Python 3.12.13, pytest-9.1.1
collected 29 items

tests/test_chat_critical.py ........................... PASSED [100%]

======= 29 passed in 0.04s =======
```

### ❌ Failure Output
```
FAIL  app/__tests__/features/chat.test.ts > Chat > Send message
AssertionError: expected 'ai' to be 'user'

❯ app/__tests__/features/chat.test.ts:45:12
```

**Action**: Read error message carefully, check the test file at line specified, fix the issue

---

## Test Files & What They Test

### Frontend Tests

| File | Tests | Purpose | Phase |
|------|-------|---------|-------|
| `__tests__/features/chat.test.ts` | 12 | Chat/Support feature | 1 ⭐ |
| `__tests__/features/auth.test.ts` | 5 | Authentication | 1 ⭐ |
| `app/teen/story/__tests__/e2e-share-flow.test.ts` | 29 | Journal/PDF sharing | 1 ⭐ |
| `__tests__/features/dashboard.test.ts` | 4 | Home page | 2 |
| `__tests__/features/resources.test.ts` | 8 | Resources library | 2 |
| `__tests__/features/profile.test.ts` | 8 | User profile | 2 |
| `__tests__/features/circles.test.ts` | 10 | Peer circles | 3 |

### Backend Tests

| File | Tests | Purpose | Phase |
|------|-------|---------|-------|
| `tests/test_chat_critical.py` | 15 | Chat API | 1 ⭐ |
| `tests/test_story_share_flow.py` | 29 | Journal API | 1 ⭐ |
| `tests/test_sessions.py` | 8 | Session management | 2 |
| `tests/test_resources.py` | 6 | Resources API | 2 |
| `tests/test_circles.py` | 8 | Circles API | 3 |
| `tests/test_voice.py` | 6 | Voice/audio API | 3 |
| `tests/test_knowledge.py` | 5 | Knowledge base API | 3 |
| `tests/test_billing.py` | 6 | Billing/payment API | 3 |

---

## Pre-Deployment Checklist

### Before Running Tests
- [ ] Git repo is clean (`git status` shows nothing)
- [ ] All changes committed
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend venv activated (`source venv/bin/activate`)

### During Testing
- [ ] Phase 1 tests all pass (Chat, Story, Auth)
- [ ] Phase 2 tests all pass (Sessions, Resources, Profile)
- [ ] Phase 3 tests all pass (Circles, Voice, Knowledge, Billing)

### After Testing
- [ ] Coverage > 80% on critical paths
- [ ] No external API calls detected
- [ ] No timeout errors
- [ ] Total execution time < 2 seconds

---

## Troubleshooting

### Frontend Test Issues

**Problem**: `ReferenceError: localStorage is not defined`
```bash
# Solution: Already fixed in vitest.config.ts
# If persists, ensure config uses jsdom environment
```

**Problem**: `Cannot find module '@vitejs/plugin-react'`
```bash
# Solution
npm install -D @vitejs/plugin-react
```

**Problem**: Tests timeout
```bash
# Solution: Increase timeout
npx vitest run --testTimeout=5000
```

### Backend Test Issues

**Problem**: `ModuleNotFoundError: No module named 'pytest'`
```bash
# Solution
source venv/bin/activate
pip install pytest pytest-mock
```

**Problem**: Tests fail with import errors
```bash
# Solution
export PYTHONPATH="${PYTHONPATH}:/path/to/backend"
pytest tests/
```

**Problem**: Database connection errors
```bash
# This should NOT happen - all tests use mocks
# If it does, ensure no real Supabase calls in tests
```

---

## Test Coverage Reports

### Generate Coverage Report

**Frontend**:
```bash
npx vitest run --coverage
# Opens: coverage/index.html
```

**Backend**:
```bash
pytest tests/ --cov=app --cov-report=html
# Opens: htmlcov/index.html
```

### Recommended Coverage Levels
- **Overall**: > 60%
- **Critical features** (Chat, Story, Auth): > 80%
- **Core features** (Resources, Profile): > 70%
- **Additional features**: > 50%

---

## Continuous Testing During Development

### Watch Mode (Auto-rerun on changes)

**Frontend**:
```bash
npx vitest --watch
```

**Backend**:
```bash
pytest-watch tests/
# Or use: pytest --tb=short --lf -x
```

### Run Tests on Pre-commit

Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
npm test -- --run || exit 1
```

---

## Performance Optimization

### Speed Up Tests

**Frontend**:
```bash
# Parallel execution (if supported)
npx vitest run --threads --maxThreads=4
```

**Backend**:
```bash
# Parallel with pytest-xdist
pip install pytest-xdist
pytest tests/ -n auto
```

### Cache Management

**Frontend**:
```bash
# Clear vitest cache
rm -rf node_modules/.vitest

# Clear coverage cache
rm -rf coverage/
```

**Backend**:
```bash
# Clear pytest cache
rm -rf .pytest_cache/
rm -rf .coverage

# Clear Python cache
find . -type d -name __pycache__ -exec rm -rf {} +
```

---

## Production Deployment Flow

```
1. Commit all changes
   ↓
2. Run Phase 1 Tests (Critical)
   ├─ Chat tests: 12 + 15 = 27 tests
   ├─ Story tests: 29 + 29 = 58 tests ✅ PASSING
   ├─ Auth tests: 5 tests
   └─ All must PASS → Continue
   ├─ Any FAIL → Fix & Retest
   ↓
3. Run Phase 2 Tests (Core)
   ├─ Sessions: 8 tests
   ├─ Resources: 6 + 8 = 14 tests
   ├─ Profile: 8 tests
   └─ All must PASS → Continue
   ├─ Any FAIL → Fix & Retest
   ↓
4. Run Phase 3 Tests (Additional)
   ├─ Circles: 8 + 10 = 18 tests
   ├─ Voice: 6 tests
   ├─ Knowledge: 5 tests
   ├─ Billing: 6 tests
   └─ All must PASS → Continue
   ├─ Any FAIL → Fix & Retest
   ↓
5. Generate Coverage Report
   └─ Coverage > 60% overall
   ↓
6. All Tests Passing ✅
   └─ READY FOR PRODUCTION DEPLOYMENT
   ↓
7. Deploy to Production
   └─ Frontend: vercel deploy --prod
   └─ Backend: git push (auto-deploy)
```

---

## Success Criteria

### Minimum Requirements
- ✅ All Phase 1 tests pass (Chat, Story, Auth)
- ✅ No external API calls made
- ✅ No timeout errors
- ✅ All mocks working correctly

### Recommended Requirements
- ✅ All Phase 2 tests pass (Core features)
- ✅ All Phase 3 tests pass (Additional features)
- ✅ Coverage > 80% on critical paths
- ✅ Execution time < 2 seconds total

### Abort Criteria
- ❌ Any Phase 1 test fails
- ❌ External API calls detected in tests
- ❌ Execution time > 5 seconds
- ❌ Coverage < 50% on critical features

---

## Sample Test Run Output

```bash
$ npx vitest run

✓ __tests__/features/chat.test.ts (12 tests)
✓ __tests__/features/auth.test.ts (5 tests)
✓ app/teen/story/__tests__/e2e-share-flow.test.ts (29 tests)
✓ __tests__/features/dashboard.test.ts (4 tests)
✓ __tests__/features/resources.test.ts (8 tests)
✓ __tests__/features/profile.test.ts (8 tests)
✓ __tests__/features/circles.test.ts (10 tests)

 Test Files  7 passed (7)
 Tests       76 passed (76)
 Duration    847ms
```

```bash
$ pytest tests/ -v

tests/test_chat_critical.py ........................... PASSED
tests/test_story_share_flow.py ........................ PASSED
tests/test_sessions.py .................PASSED
tests/test_resources.py ..........PASSED
tests/test_circles.py ....................PASSED
tests/test_voice.py .....PASSED
tests/test_knowledge.py ....PASSED
tests/test_billing.py ......PASSED

=============== 83 passed in 0.42s ===============
```

---

## Next Steps

1. **Run Phase 1 Tests** (This ensures critical features work)
   ```bash
   cd frontend && npm test -- chat.test.ts story/__tests__/e2e-share-flow.test.ts --run
   cd backend && pytest tests/test_chat_critical.py tests/test_story_share_flow.py -v
   ```

2. **If All Pass** → Run Phase 2 & 3 tests

3. **If All Phases Pass** → Ready for production deployment!

---

**Last Updated**: 2026-08-30  
**Total Tests**: 145+  
**Estimated Runtime**: < 2 seconds  
**Token Consumption**: < 50 tokens  
**Status**: ✅ Ready for comprehensive pre-deployment testing
