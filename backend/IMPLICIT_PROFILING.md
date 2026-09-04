# Implicit Profiling System - Phase 1 Complete ✅

## Overview

Build rich user stress profiles from natural conversations, not forms. This eliminates questionnaire fatigue while collecting the data we need for personalization.

## Phase 1: Foundation (COMPLETE) ✅

### Files Created

**1. `app/config/conversation_banks.py`**
- Question bank templates for 6 domains
- Extraction keywords for each question
- Helper functions: `extract_intensity()`, `extract_options()`
- Domain-to-bank mapping

**Domains covered:**
- Academic/School stress
- Relationship/Heartbreak stress
- Family/Domestic stress
- Financial stress
- Workplace stress
- Body image stress

**Example: Academic Bank**
```python
{
    "intensity": {
        "template": "How heavily is the academic environment weighing on you?",
        "scale": "1-5 (Least to Most)",
        "extraction_keywords": ["stressed", "pressure", "exam", "overwhelmed"]
    },
    "stressors": {
        "options": ["Exams/tests", "JEE/NEET preparation", "Parental expectations", ...],
        "extraction_keywords": {
            "JEE/NEET": ["JEE", "NEET", "entrance exam"],
            "Exams": ["exam", "test", "marks"],
            "Parental": ["parents expect", "mom said"]
        }
    }
}
```

**2. `app/models/profile_schemas.py`**
- Pydantic schemas for storing extracted data
- Domain-specific profile models:
  - `AcademicStressProfile`
  - `RelationshipStressProfile`
  - `FamilyStressProfile`
  - `FinancialStressProfile`
  - `WorkplaceStressProfile`
  - `BodyImageStressProfile`

**3. `app/services/profile_extraction.py`**
- `ProfileExtractor` class - extract data from single messages
- `ConversationAnalyzer` class - analyze full chat histories
- Helper methods:
  - `extract_from_message()` - find profile data in text
  - `get_clarifying_question()` - suggest next question
  - `merge_profiles()` - update profile over time

## How It Works (Flow)

### Current State (Before Phase 2)
```
User Chat → AI responds (with current prompts)
No explicit extraction happening yet
```

### Phase 2+ (After Integration)
```
User message:
  "I'm so stressed about JEE prep and my parents 
   expect me to get 99+ percentile"
         ↓
ProfileExtractor.extract_from_message()
         ↓
Extract:
  - intensity: 4-5 (keywords: "stressed", "expect")
  - stressors: ["JEE/NEET preparation", "Parental expectations"]
         ↓
Merge with existing profile
         ↓
Next message, AI knows:
  "This user is dealing with JEE prep AND parental 
   pressure - acknowledge both"
```

## Data Model (What Gets Stored)

Each user will have a stress_profile in the users table:

```python
{
    "intensity": {
        "value": 4,
        "source": "message_analysis",
        "confidence": "medium"
    },
    "main_stressors": {
        "value": ["JEE/NEET preparation", "Parental expectations"],
        "source": "keyword_matching",
        "confidence": "high"
    },
    "burnout_frequency": {
        "value": "Few times a week",
        "source": "keyword_matching",
        "confidence": "high"
    },
    "sleep_hours": {
        "value": "5-6 hours",
        "source": "keyword_matching",
        "confidence": "high"
    },
    "last_updated": "2026-09-03T15:30:00Z"
}
```

## Usage Examples

### Example 1: Extract from a message
```python
from app.services.profile_extraction import ProfileExtractor

extractor = ProfileExtractor(domain="school_bullying")
message = "I've been staying up until 2am studying for JEE. My parents 
           keep saying I'm not working hard enough. I feel so burnt out."

extracted = extractor.extract_from_message(message)
# Returns:
# {
#     "intensity": {"value": 5, "source": "message_analysis", "confidence": "medium"},
#     "main_stressors": {
#         "value": ["JEE/NEET preparation", "Parental expectations"],
#         "source": "keyword_matching",
#         "confidence": "high"
#     },
#     "sleep_hours": {"value": "<4 hours", "source": "keyword_matching", "confidence": "high"},
#     "burnout_frequency": {"value": "Everyday", "source": "keyword_matching", "confidence": "high"},
#     "last_updated": "2026-09-03T15:30:00Z"
# }
```

### Example 2: Get clarifying question
```python
current_profile = {
    "intensity": {"value": 4},
    "main_stressors": {"value": ["Exams"]},
    # sleep_hours is missing
}

question = extractor.get_clarifying_question(current_profile)
# Returns:
# "How many hours of sleep do you usually get during school/exam periods?"
```

### Example 3: Analyze full conversation
```python
from app.services.profile_extraction import ConversationAnalyzer

analyzer = ConversationAnalyzer(domain="school_bullying")
messages = [
    {"role": "user", "content": "I'm stressed about JEE..."},
    {"role": "assistant", "content": "..."},
    {"role": "user", "content": "My parents keep pushing me hard..."},
    {"role": "assistant", "content": "..."},
    {"role": "user", "content": "I barely sleep these days..."}
]

profile = analyzer.analyze_conversation(messages)
# Extracts and merges data from all user messages

summary = analyzer.get_profile_summary(profile)
# "Stress intensity: 4/5\nKey stressors: JEE/NEET preparation, Parental expectations\n..."
```

## Phase 2: Chat Integration (COMPLETE) ✅

Integrated extraction into the chat endpoint with automatic profile building.

### Implementation Details

**Database:**
- Added `extraction_profile` (jsonb) column to sessions table
- Stores merged extraction data for entire session
- Updated with each user message

**Chat Router Changes:**
1. **Profile Extraction** - After each user message:
   - `_extract_and_update_profile()` extracts data from message
   - Merges with existing session extraction profile
   - Stores in database for persistence

2. **System Prompt Enhancement** - Before generating response:
   - `_build_extraction_context()` creates human-readable summary
   - Includes intensity, stressors, burnout, sleep data
   - Appended to system prompt so AI knows what we've learned

3. **Background Processing**:
   - Extraction runs in thread pool (non-blocking)
   - Doesn't delay response to user
   - Graceful degradation if extraction fails

**Example Flow:**
```
User: "I've been studying for JEE nonstop. Haven't slept in 30 hours."
         ↓
Extract: intensity=5, stressors=["JEE prep"], sleep_hours="<4 hours"
         ↓
Update session.extraction_profile
         ↓
Next response: AI knows intensity is high + sleep deprived
         ↓
System prompt includes: "[Profile insights: Stress level: 5/5; 
                         Key stressors: JEE prep; Sleep: <4 hours]"
```

### Files Modified

**`app/routers/chat.py`**
- Added imports: `ProfileExtractor`, `ConversationAnalyzer`
- Added `_extract_and_update_profile()` - Extract from message + merge + store
- Added `_build_extraction_context()` - Create system prompt context
- Updated `_fetch_session_and_history()` - Return extraction_profile
- Updated `chat_stream()` - Call extraction in thread pool, include context in prompt

**`supabase/migrations/006_add_extraction_profile_to_sessions.sql`**
- Add `extraction_profile` jsonb column
- Add GIN index for efficient queries

## Phase 3: Clarifying Questions (Planned)

Use extracted profile to suggest naturally conversational clarifying questions:

1. **Smart Question Suggestion**
   - Analyze what dimensions are missing from profile
   - Use `get_clarifying_question()` to suggest relevant areas
   - Ask naturally, not like a survey

2. **Integration Points**
   - Suggest questions before key moments (major stressor mentioned)
   - Include in system prompt to influence AI responses
   - Track which questions were asked to avoid repetition

3. **Example**
   - User mentions JEE stress without mentioning sleep
   - System: "You mentioned you're concerned about your studies. How is your sleep being affected?"
   - This feels like natural conversation, not extraction

## Phase 4: Use in Personalization (Future)

1. **Response Personalization**
   - Tailor validation messages to extracted profile
   - "With JEE prep, coaching, AND parental pressure, that's a lot..."
   - Reference specific stressors mentioned

2. **Resource Recommendations**
   - Surface knowledge base content matching their stressors
   - "Others dealing with JEE + family pressure have found..."
   - Suggest interventions based on intensity + stressors

3. **Advanced Insights**
   - Detect patterns: "You mention sleep less when JEE prep intensifies"
   - Flag concerning combinations: high intensity + low sleep + high burnout
   - Suggest professional support when risk indicators hit thresholds

## Phase 5: Analytics & Insights (Future)

1. **Aggregated Patterns** (anonymized)
   - "Academic stress cohort: 70% experience sleep disruption"
   - "JEE prep is #1 stressor for users in school_bullying domain"

2. **User Insights**
   - Show user their own pattern over time
   - "You've mentioned burnout in 60% of sessions"

3. **Intervention Opportunities**
   - Flag high-risk patterns (sleep + burnout + high intensity)
   - Suggest professional support when needed

## Extension Points

### Adding New Domains
1. Add to `DOMAIN_BANKS` in `conversation_banks.py`
2. Create profile schema in `profile_schemas.py`
3. Add to `DOMAIN_PROFILE_SCHEMAS` mapping

### Improving Extraction
- Add NLP sentiment analysis
- Use question-answering models for complex extraction
- Learn from corrections (when AI guesses wrong, user corrects)

### Advanced Personalization
- Predict which stressors are highest priority NOW
- Suggest interventions based on profile trajectory
- Detect when situation is improving/worsening

## Testing

Test extraction with real-world messages:
```python
test_messages = [
    "I'm literally dying studying for JEE. 2 hours sleep, mom keeps yelling",
    "School's overwhelming but I'm managing",
    "My family has been super supportive actually, it's my own pressure"
]

for msg in test_messages:
    profile = extractor.extract_from_message(msg)
    print(f"Message: {msg[:50]}...")
    print(f"Extracted: {profile}")
```

## Benefits

✅ **No questionnaire fatigue** - Data collected naturally from conversation
✅ **Rich personalization** - AI knows specific stressors, intensity, impact
✅ **Conversation context** - Profile builds over time, shows progression
✅ **Privacy-preserving** - Data extracted locally, never exposed to user
✅ **Extensible** - Easy to add new domains and questions
✅ **Scalable** - Works across all domains and user profiles

## Next Steps

1. ✅ Phase 1: Create conversation banks and extraction service
2. ✅ Phase 2: Integrate extraction into Chat router + store profiles
3. → Phase 3: Add smart clarifying questions based on extracted profile
4. → Phase 4: Personalize responses based on extracted data
5. → Phase 5: Analytics dashboard and risk detection

---

## Commits

**Phase 1 Commit:** `6bc07db` - "Add education status to user profile"  
**Phase 1 Files:**
- `app/config/conversation_banks.py` (Question bank templates + extraction helpers)
- `app/models/profile_schemas.py` (Pydantic schemas for profiles)
- `app/services/profile_extraction.py` (Extraction logic)
- `backend/IMPLICIT_PROFILING.md` (Phase 1 documentation)

**Phase 2 Commit:** In progress
**Phase 2 Files:**
- `app/routers/chat.py` (Extraction integration + context building)
- `supabase/migrations/006_add_extraction_profile_to_sessions.sql` (Database schema)
