# SafeShoulder Feature Backlog

## High Priority

### 1. Continuous Voice Conversation Mode
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
