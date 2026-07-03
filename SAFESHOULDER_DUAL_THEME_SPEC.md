# SafeShoulder Dual-Theme Portal Spec

## Overview
Dual-theme portal supporting:
- **Teen Theme** (School Bullying & Peer Issues) - inspired by Project Samanvay
- **Adult Theme** (Relationships, Career, Family, Finance) - current design

Same backend, auth, payments. Different UX, navigation, messaging per theme.

---

## 1. Design System

### Teen Theme Colors
```
Primary:     #7C3AED (Purple)      - Main CTAs, accents
Secondary:   #06B6D4 (Cyan)        - Features, highlights
Background:  #0F172A (Dark Navy)   - Main background
Surface:     #1E293B (Darker)      - Cards, containers
Text:        #F1F5F9 (Light Gray)  - Body text
Accent:      #EC4899 (Pink)        - Important alerts, warnings
```

### Adult Theme Colors
```
Primary:     #4F46E5 (Indigo)      - Current
Secondary:   #06B6D4 (Cyan)        - Current
Background:  #F8FAFC (Light)       - Current
Surface:     #FFFFFF (White)       - Current
Text:        #1E293B (Dark)        - Current
Accent:      #E11D48 (Rose)        - Current
```

### Typography (Both Themes)
- **Font Family**: Inter, system sans-serif
- **Headings**: Bold, Teen=larger/bolder (high contrast for youth)
- **Body**: Regular weight, Teen=slightly larger (readability)
- **Teen headline size**: 2.5rem (vs Adult 1.875rem)

---

## 2. Feature Cards Structure (Teen Theme)

### 8 Feature Cards (Grid Layout)

#### Card 1: Daily Safety Check-Ins
- **Icon**: 📋 (checklist)
- **Title**: Daily Safety Check-Ins
- **Description**: Track how safe, supported, and resilient you feel each day. AI learns your patterns and offers personalized coping strategies.
- **Color Accent**: Cyan

#### Card 2: My Story (Wellness Passport equiv)
- **Icon**: 📖 (book/story)
- **Title**: My Story
- **Description**: Keep a private journal of your experiences, wins, and growth. See patterns in your journey and celebrate progress.
- **Color Accent**: Purple

#### Card 3: Nidhi Companion (24/7 AI)
- **Icon**: 🤗 (support)
- **Title**: Nidhi Companion
- **Description**: 24/7 AI trained to listen, validate, and help you navigate bullying, peer pressure, and social challenges. Always here.
- **Color Accent**: Purple (primary)

#### Card 4: Peer Support Circles
- **Icon**: 👥 (people)
- **Title**: Peer Support Circles
- **Description**: Safe groups with trained student ambassadors. Share experiences, support each other, know you're not alone.
- **Color Accent**: Pink

#### Card 5: Bullying Pattern Detection
- **Icon**: 📊 (analytics)
- **Title**: Pattern Detection
- **Description**: ML model identifies escalation signs early. Get alerts and resources before things get worse.
- **Color Accent**: Cyan

#### Card 6: School Dashboard (for schools/counselors)
- **Icon**: 📈 (dashboard)
- **Title**: School Dashboard
- **Description**: Real-time wellness insights for counselors and administrators. Support more students, catch issues early.
- **Color Accent**: Cyan

#### Card 7: Parent Guide
- **Icon**: 💜 (heart/support)
- **Title**: Parent Guide
- **Description**: Help your parents understand bullying and how to support you. Weekly updates (privacy-protected).
- **Color Accent**: Pink

#### Card 8: Resource Library
- **Icon**: 📚 (library)
- **Title**: Resource Library
- **Description**: Strategies, school policies, hotlines, articles. Everything you need to navigate peer challenges.
- **Color Accent**: Cyan

---

## 3. Navigation Structure

### Teen Theme Navigation
```
Top Nav: SafeShoulder Logo | Features | Support | Resources | Community | School Info | Log In | Get Started

Main Nav (After Login):
- Home (Dashboard)
- My Support (Nidhi chat)
- My Story (Journal/History)
- Safety Circles (Peer groups)
- Resources (Library)
- Profile
```

### Adult Theme Navigation (Current)
```
Top Nav: SafeShoulder Logo | Workplace | Relationships | Family | Finance | Log In

Main Nav (After Login):
- Chat (Domain-based)
- Sessions
- Profile
- Billing
```

---

## 4. Landing Page Structure

### Teen Theme Homepage
```
1. Hero Section
   - Title: "Meet Nidhi — Your 24/7 Bullying Support Companion"
   - Tagline: "Not just a chatbot. Nidhi is trained to listen, validate, and help you navigate peer challenges."
   - CTA: "Get Started" (bright purple button)
   - Visual: Chat demo showing teen scenario (bullying, peer pressure)

2. Features Section
   - 8 feature cards (2x4 grid)
   - Each card: icon + title + description + "Learn More" link

3. Social Proof
   - Stats: "X students supported", "Y peer circles", "Z resources"
   - Student testimonials (anonymized, diverse)

4. Safety First
   - "Your privacy is protected"
   - "Confidential support"
   - "Talk to a real therapist anytime"

5. CTA Section
   - "Ready to get support?"
   - "Get Started" button
```

### Adult Theme Homepage (Current)
- Remains unchanged
- Domain cards: Workplace, Relationships, Family, Finance
- Similar structure but adult-focused messaging

---

## 5. Chat Interface Differences

### Teen Theme Chat
- **Persona**: "Nidhi" (warm, peer-like, supportive)
- **Tone**: Casual, relatable, empowering ("You've got this" not "Let's address this issue")
- **Emojis**: More frequent, age-appropriate (🤗 💪 💜 🌟)
- **Response Length**: SHORT (1-2 sentences max, then action)
- **Action Focus**: "Here's what we can do", "Let's make a plan", "You're safe with me"

### Adult Theme Chat (Current)
- **Persona**: "Nidhi" (professional, therapist-like)
- **Tone**: Warm but professional
- **Emojis**: Minimal, purpose-driven
- **Response Length**: Balanced (2-3 sentences + structured advice)
- **Action Focus**: Professional guidance, boundary-setting

---

## 6. Data Model for Teen Domain

### Daily Safety Check-In
```
{
  date: Date,
  safetyScore: 1-10,
  supportScore: 1-10,
  resilienceScore: 1-10,
  mood: string ("anxious", "hopeful", "angry", etc.),
  situation: string (free text),
  coping_used: string[],
}
```

### My Story Entry
```
{
  date: Date,
  title: string,
  entry: string (journal),
  category: "bullying" | "peer_pressure" | "social_anxiety" | "win" | "growth",
  isPrivate: boolean,
  tags: string[],
}
```

### Peer Support Circle
```
{
  name: string,
  description: string,
  focus: "bullying" | "social_anxiety" | "peer_pressure" | "academic",
  members: number,
  ambassadors: User[],
  isActive: boolean,
  nextMeeting: Date,
}
```

### Resource Item
```
{
  title: string,
  type: "article" | "strategy" | "hotline" | "policy",
  category: "bullying" | "coping" | "school_policies" | "hotlines",
  content: string,
  relevance: "immediate" | "ongoing" | "prevention",
  schoolRelevant: boolean,
}
```

---

## 7. Implementation Architecture

### File Structure
```
frontend/
├── app/
│   ├── chat/
│   │   ├── page.tsx (current - adult theme default)
│   │   └── teen/page.tsx (NEW - teen theme)
│   ├── dashboard/
│   │   ├── page.tsx (current - adult)
│   │   └── teen/page.tsx (NEW - teen)
│   └── resources/
│       └── [[slug]]/page.tsx (NEW - shared, but themed)
├── components/
│   ├── theme/
│   │   ├── ThemeProvider.tsx (NEW - context for teen/adult)
│   │   ├── TeenTheme.css (NEW)
│   │   ├── AdultTheme.css (NEW)
│   │   └── useTheme.ts (NEW - hook)
│   ├── Navigation/
│   │   ├── TeenNav.tsx (NEW)
│   │   ├── AdultNav.tsx (NEW)
│   │   └── NavWrapper.tsx (NEW - route-aware)
│   └── ...existing...
├── lib/
│   └── themeConfig.ts (NEW)
└── styles/
    ├── teen-theme.css (NEW - color vars, typography)
    └── adult-theme.css (NEW)
```

### Theme Detection Logic
```typescript
// On app init:
// 1. Check URL path: /teen/* = teen, /chat, /dashboard = adult
// 2. Check localStorage: theme preference
// 3. Check user profile: domain preference
// Priority: URL > localStorage > profile default > adult (fallback)
```

---

## 8. Feature Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Theme provider & context setup
- [ ] CSS theme variables (teen/adult)
- [ ] Navigation component (routing-aware)
- [ ] Teen landing page (/teen)
- [ ] Teen chat route (/teen/support)

### Phase 2: Teen Dashboard (Week 2)
- [ ] Daily Safety Check-Ins component
- [ ] My Story (journal) feature
- [ ] Peer Support Circles directory
- [ ] Resource Library

### Phase 3: Integrations (Week 3)
- [ ] Pattern detection (backend alert logic)
- [ ] School dashboard (admin view)
- [ ] Parent guide (email + portal)
- [ ] Email notifications

### Phase 4: Polish & Launch (Week 4)
- [ ] Design refinements
- [ ] Mobile optimization
- [ ] Performance testing
- [ ] User testing with teens
- [ ] Go live

---

## 9. Sample Content

### Teen Onboarding Flow
```
1. "What's your name?" → Name input
2. "Are you dealing with bullying, peer pressure, or social stress?" → Multiple choice
3. "How safe do you feel at school right now?" → Scale 1-10
4. "Meet Nidhi" → Intro chat
5. "Join a peer circle" → Circle recommendations
6. "Explore resources" → Resource cards
```

### Sample Resources (My First Batch)
```
- "How to Handle Cyberbullying" (article)
- "10 Coping Strategies That Actually Work" (guide)
- "Understanding Why Bullies Bully" (perspective shift)
- "Talking to Your Parents About Bullying" (communication guide)
- "School Bullying Policies 101" (know your rights)
- "Crisis Hotlines & Emergency Support" (resources)
- "Building Your Support Network" (strategy)
- "Self-Care When You're Under Stress" (wellness)
```

### Sample Peer Circles
```
- "Social Anxiety Support Squad" (4 members, 2 ambassadors)
- "Bullying Survivors' Circle" (8 members, 2 ambassadors)
- "New at School Support" (6 members, 1 ambassador)
- "LGBTQ+ Peer Support" (5 members, 2 ambassadors)
```

---

## 10. Success Metrics

### Teen Theme KPIs
- Daily active teens
- Check-in completion rate
- Resource library engagement
- Peer circle participation
- Sentiment improvement (before/after support)
- School admin adoption rate
- Parent guide opens

### Adult Theme KPIs (Unchanged)
- Chat engagement
- Session completion
- Domain satisfaction
- Subscription conversion

---

## 11. Future Enhancements

- Video resources & guided meditations
- Parent-teen communication templates
- School counselor integration
- Peer ambassador training program
- Crisis escalation (manual 1:1 therapist)
- Community moderation tools
- Peer mentor matching
