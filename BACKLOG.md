# SafeShoulder Feature Backlog

## Development Standards

### Commit Convention
**All commits follow this format — NO co-author lines:**
```
feat: description of change

Optional detailed explanation of why/what changed.
```

**Examples:**
```
feat: add continuous voice conversation mode

Implemented auto-mic opening after responses with 10-second thinking window.
```

```
fix: resolve voice playback speed issue

Removed unsupported speed parameter from Deepgram API.
```

**All commits are authored by you only — no co-author lines.**

---

## High Priority

### 1. Hindi Language Support (हिंदी भाषा समर्थन)
**Status:** Backlog (Not Started)  
**Date Added:** 2026-06-07  
**Priority:** High  

**Description:**
Full Hindi language support for SafeShoulder to serve Indian users. This includes UI translation, system prompts in Hindi, knowledge base translation, and optional voice support in Hindi.

**Scope Options:**

**Option A: Hindi-Only (Recommended - Start Here)**
- All UI in Hindi
- All responses in Hindi  
- No language switcher (streamlined for Hindi users)
- Simpler implementation

**Option B: Bilingual (English + Hindi)**
- Language picker in settings
- All content in both languages
- More complex, ~50% more work

**Phase 1: UI Translation + Hindi System Prompts (2 weeks)**

Frontend:
- Replace all English text with Hindi translations using `next-i18n-router`
- Domain names: "School & Bullying" → "स्कूल और बुलिंग"
- Sidebar: "Past sessions" → "पिछले सत्र"
- Buttons: "New chat" → "नई बातचीत"
- All placeholders, error messages in Hindi

Backend:
- Translate BASE_PERSONA to Hindi
- Translate DOMAIN_CONTEXT for all 6 domains to Hindi
- AI responses in Hindi
- Error messages in Hindi

Files to Create/Modify:
- `frontend/lib/i18n/hi.json` - Hindi translations
- `backend/app/services/prompts.py` - Hindi system prompts
- `frontend/app/chat/page.tsx` - Language switcher (if bilingual)

**Phase 2: Knowledge Base Translation (1-2 weeks)**

- Translate all 27 documents (~50,000 words) to Hindi
- Therapeutic frameworks: CBT, DBT, NVC in Hindi
- Crisis resources in Hindi
- Approach: Claude-assisted translation + native speaker review

Files to Create:
- `/knowledge-base-hindi/` folder (mirror structure)
- Update GitHub Action to support Hindi KB uploads

**Phase 3: Hindi Voice Support (1-2 weeks) - Optional**

STT (Speech-to-Text):
- Deepgram API supports Hindi
- Update `/voice/transcribe` endpoint with language parameter

TTS (Text-to-Speech):
- Switch to Google Cloud TTS (supports Hindi with quality voices)
- Update `/voice/speak` endpoint
- Test Hindi voice quality (calm, empathic tone)
- Cost: ~$15-20/month additional

Backend Changes:
- `backend/app/routers/voice.py` - Hindi language support
- `backend/app/config.py` - Google Cloud TTS config

**Phase 4: Bilingual Toggle (Optional - Only if Option B)**

UI Changes:
- Language switcher in profile settings
- Persistent language preference
- Real-time language switching

Backend:
- Add `language` field to sessions/users tables
- System prompts change based on language

---

**Implementation Priority:**

1. ✅ Phase 1 (UI + System Prompts): 2 weeks, $0 cost
2. ✅ Phase 2 (Knowledge Base): 1-2 weeks, $0 cost
3. ⏸️ Phase 3 (Voice): Optional, later if users request
4. ⏸️ Phase 4 (Bilingual): Only if market demands

**Recommended Launch:**
Start with Phase 1 + 2 (UI + KB) for pure Hindi experience. Add voice later if feedback supports it.

**Market Opportunity:**
- 300M+ Hindi speakers in India
- Growing mental health awareness
- Potential for regional expansion (Tamil, Telugu, Bengali)

---

### 2. Real Human Therapist Integration
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

### 3. Continuous Voice Conversation Mode
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

### 4. Domain-Specific Response Customization
**Status:** Backlog  
**Description:** Tailor response tone/length by domain (e.g., shorter/punchier for workplace, longer for heartbreak)

### 5. Conversation Analytics Dashboard
**Status:** Backlog  
**Description:** Show users conversation history, progress, insights (domains used, response patterns, etc.)

---

## Low Priority

### 6. Voice Bookmarks/Favorites
**Status:** Backlog  
**Description:** Users can save helpful AI responses to revisit later

### 7. Advanced Silence Detection
**Status:** Backlog  
**Description:** Different silence thresholds per domain or user preference

---

---

### 8. Email from Portal - Story Sharing
**Status:** Backlog (Not Started)  
**Date Added:** 2026-08-30  
**Priority:** Medium  

**Description:**
Send incident reports via email directly from the platform when students share with teachers.

**Current State:**
- Story/Journal feature allows PDF generation and download
- Students can generate shareable tokens for teachers
- Teachers access reports via token-based links

**Enhancement:**
- SMTP integration to send PDF via email to teacher
- Email notifications when story is shared
- Email templates with SafeShoulder branding
- Delivery tracking and retry logic

**Implementation:**
- Configure SMTP settings: `SMTP_SERVER`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`
- Update `backend/app/routers/story.py` to support email sending
- Add email UI option to share modal
- Teacher receives email with report attached or link

**Files to Modify:**
- `backend/app/routers/story.py` - Add email sending function
- `backend/app/config.py` - SMTP configuration (already added)
- `frontend/app/teen/story/page.tsx` - Add email option to share UI

**Estimated Effort:** 4-6 hours  
**Dependencies:** None (SMTP config already in place)  

---

### 9. Adult Theme Portal
**Status:** Backlog (Not Started)  
**Date Added:** 2026-08-30  
**Priority:** High  

**Description:**
Build a complete SafeShoulder portal for adults/professionals including parents, counselors, teachers, and administrators.

**Scope:**
- User authentication (Google OAuth + email)
- Role-based access control (Parent, Teacher, Counselor, Admin)
- Dashboard with client/student management
- Chat interface (similar to teen version, potentially with more advanced features)
- Student progress tracking and analytics
- Report generation (PDF export)
- Billing/subscription management
- Integration with teen platform for authorized access
- Admin controls for system management

**Features by Role:**

**Parents:**
- View child's progress (with permission)
- Chat with support team
- Access resources
- Monitor well-being trends

**Teachers:**
- Receive incident reports from students
- View class-level statistics
- Provide feedback and recommendations
- Track student engagement

**Counselors:**
- Full access to student conversations (with consent)
- Case management tools
- Referral tracking
- Notes and progress documentation

**Admins:**
- Full system control
- User management
- Analytics and reporting
- School/organization configuration

**Technical Stack:**
- Frontend: React/Next.js 15 (reuse existing)
- Backend: FastAPI (extend existing)
- Database: Supabase (extend schema)
- Deployment: Vercel + Railway (existing)
- Authentication: Supabase Auth with role management

**Database Additions:**
- Users table: Add `role`, `organization_id` fields
- Organizations table: School/organization info
- Permissions table: Fine-grained access control
- Student-Teacher relationships

**Estimated Effort:** 3-4 weeks  
**Dependencies:** Core teen platform completion  
**Blocked By:** None  

---

## Completed Features ✅

- ✅ Story/Journal feature with PDF generation (Aug 30, 2026)
- ✅ Voice mode with auto-send on silence (2-3 sec)
- ✅ Domain-specific emotional support (6 domains)
- ✅ Knowledge base RAG (35 documents)
- ✅ Domain suggestion logic
- ✅ Slow, calm voice playback (0.75x speed)
- ✅ GitHub auto-sync for knowledge base
- ✅ Prometheus monitoring
- ✅ Razorpay billing integration
- ✅ Enhanced user profiling (7 context fields)

---

## Tech Debt 🔧

### 1. Knowledge Base Sync Token Rotation
**Status:** Active Tech Debt  
**Date Added:** 2026-06-07  
**Priority:** High (Security)  

**Description:**
KB_AUTH_TOKEN GitHub Secret expires September 5, 2026 (90-day rotation). Needs automated renewal or manual rotation before expiry.

**What to do:**
- Set calendar reminder for August 5, 2026 to rotate token
- OR implement automated token rotation CI/CD step
- Current token created: June 7, 2026
- Current token expires: September 5, 2026

**Why it matters:**
- Security best practice for API tokens
- Prevents service disruption if token is compromised
- Limits damage window of leaked credentials

**Who owns it:** DevOps/Infrastructure team

---

### 2. OpenAI API Quota Management
**Status:** Active Issue (Out of Quota)  
**Date Added:** 2026-06-07  

**Description:**
OpenAI account hit usage quota mid-KB-sync, preventing document embeddings. Need quota increase or account upgrade.

**Action:**
- Upgrade OpenAI account to pay-as-you-go or higher tier
- Request quota increase
- Monitor usage regularly

---

### 3. Profile Field Database Migration
**Status:** Complete (but monitor)  
**Date Added:** 2026-06-07  

**Description:**
Added 7 new fields to user profiles (profession, city, interests, spirituality, relationship_status, has_kids, family_info). Ensure all new users have these fields captured.

**Monitoring:**
- Check user_domain_profiles table for NULL values in new fields
- Update prompts.py if new fields added in future

---
