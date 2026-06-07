# SafeShoulder Feature Backlog

## High Priority

### 1. Real Human Therapist Integration
**Status:** Backlog (Not Started)  
**Date Added:** 2026-06-07  
**Priority:** Critical  

**Description:**
Connect users with qualified, licensed therapists for real professional support when AI assistance isn't sufficient.

**Features:**
- **Therapist Directory**: Curated list of qualified therapists (licensed, verified credentials)
- **Escalation System**: AI detects when user needs professional help → suggests therapist
- **Booking Integration**: Direct calendar booking for therapy sessions
- **Specialization Matching**: Match therapist specialties to user's domain (family, workplace, heartbreak, etc.)
- **Insurance Integration**: Check insurance coverage & billing
- **Session Recording/Notes**: Store session summaries for continuity of care
- **Transition Smooth**: Pass conversation context to therapist
- **Pricing**: Show therapist rates, insurance options

**Workflow:**
```
User talking to AI
  ↓
AI detects serious issue / user requests real therapist
  ↓
Suggest relevant therapists from directory
  ↓
User selects therapist
  ↓
Book session (calendar integration)
  ↓
AI passes conversation summary to therapist
  ↓
Therapist reviews context before session
  ↓
Real therapy session
  ↓
Option: Continue with AI between sessions
```

**Detection Triggers:**
- Crisis keywords detected (self-harm, suicide, abuse)
- User explicitly asks for real therapist
- Conversation depth/severity assessment
- Domain-specific thresholds (e.g., severe family abuse)

**Technical Implementation:**

**Backend:**
- Therapist database schema (name, credentials, specialties, availability, rates, insurance)
- Verification system (license validation, background checks)
- Booking API integration (Calendly, Google Calendar, custom)
- Insurance eligibility checker (Stripe/payment gateway integration)
- Session tracking & notes storage
- Context passing API (convert conversation to handoff format)

**Frontend:**
- Therapist search/filter UI
- Availability calendar
- Booking confirmation
- Insurance verification flow
- Session history & notes

**Files to Create:**
- `backend/app/routers/therapist.py` - Therapist API endpoints
- `backend/app/models/therapist_schema.py` - DB schemas
- `frontend/components/TherapistDirectory.tsx` - UI for browsing
- `frontend/components/TherapistBooking.tsx` - Booking flow

**Database Schema:**
```sql
-- Therapists
CREATE TABLE therapists (
  id UUID PRIMARY KEY,
  name TEXT,
  license_number TEXT,
  specialties TEXT[] (school, heartbreak, domestic, financial, workplace),
  bio TEXT,
  hourly_rate DECIMAL,
  calendar_url TEXT,
  insurance_accepted TEXT[],
  verified_at TIMESTAMP,
  verified_by TEXT (admin/verification service)
);

-- Bookings
CREATE TABLE therapist_bookings (
  id UUID PRIMARY KEY,
  user_id UUID,
  therapist_id UUID,
  session_date TIMESTAMP,
  duration_minutes INT,
  cost DECIMAL,
  status TEXT (pending, confirmed, completed, cancelled),
  notes TEXT,
  ai_context_summary TEXT
);
```

**Revenue Model Options:**
1. **Commission**: Take 15-20% commission on therapist bookings
2. **Premium**: Users pay for therapist directory access
3. **Both**: Free basic list, premium for verified/vetted therapists

**Regulatory Considerations:**
- Licensed therapist verification
- Privacy/HIPAA compliance
- Payment processing for therapist payments
- Liability insurance
- Terms of service (AI is not replacement for real therapy)

**Phase 1 (MVP):**
- Manual therapist directory (initially add 5-10 vetted therapists per domain)
- Simple booking form → email confirmation
- Conversation summary download/export
- Escalation prompt in AI responses

**Phase 2:**
- Automated calendar booking (Calendly integration)
- Insurance verification
- Payment processing
- Therapist dashboard

**Phase 3:**
- AI-driven matching algorithm
- Session notes synchronization
- Follow-up recommendations
- Therapist ratings/reviews

**Partnerships Needed:**
- Mental health professional directories (Psychology Today, TherapyDen, Zencare)
- Insurance verification service
- Payment processor for therapist payments
- Calendar/booking platform

---

### 2. Continuous Voice Conversation Mode
**Status:** Backlog (Not Started)  
**Date Added:** 2026-06-07  
**Priority:** High  

**Description:**
Auto-start microphone after AI responses for seamless voice conversation flow.

**Flow:**
- AI finishes speaking
- Mic auto-opens automatically
- Shows "Listening... (10s to think)" with countdown
- User can speak anytime within 10 seconds
- Records until 2-3 seconds of silence detected
- Auto-sends and loops

**Benefits:**
- Seamless, hands-free conversation
- Respects thinking time (empathetic)
- Meditative therapy experience
- Reduces friction for emotional support

**Technical Considerations:**
- Add UI toggle for continuous mode (on/off)
- Handle 10-second timeout gracefully
- Allow interrupt (click to stop AI mid-response)
- Require 0.5s+ sound before recording starts
- Show clear listening state indicators
- Privacy: Clear visual feedback when mic active

**Implementation Notes:**
- Phase 1: MVP with toggle + 10s window + current silence detection
- Phase 2: Visual breathing indicator, conversation stats, auto-save summary
- Cost: ~50% increase in STT/TTS costs (still <$0.02 per exchange)

**Files to Modify:**
- `frontend/components/VoiceButton.tsx` - Add continuous mode state
- `frontend/app/chat/page.tsx` - Add toggle and state management
- `frontend/components/ChatInterface.tsx` (or equivalent) - UI feedback

---

## Medium Priority

### 2. Domain-Specific Response Customization
**Status:** Backlog  
**Description:** Tailor response tone/length by domain (e.g., shorter/punchier for workplace, longer for heartbreak)

### 3. Conversation Analytics Dashboard
**Status:** Backlog  
**Description:** Show users conversation history, progress, insights (domains used, response patterns, etc.)

### 4. Multi-Language Support
**Status:** Backlog  
**Description:** Support voice in multiple languages via Deepgram

---

## Low Priority

### 5. Voice Bookmarks/Favorites
**Status:** Backlog  
**Description:** Users can save helpful AI responses to revisit later

### 6. Advanced Silence Detection
**Status:** Backlog  
**Description:** Different silence thresholds per domain or user preference

---

## Completed Features ✅

- ✅ Voice mode with auto-send on silence (2-3 sec)
- ✅ Domain-specific emotional support (6 domains)
- ✅ Knowledge base RAG (27 documents)
- ✅ Domain suggestion logic
- ✅ Slow, calm voice playback (0.75x speed)
- ✅ GitHub auto-sync for knowledge base
- ✅ Prometheus monitoring
- ✅ Razorpay billing integration
