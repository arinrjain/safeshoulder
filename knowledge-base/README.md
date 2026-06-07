# SafeShoulder Knowledge Base

Welcome to the SafeShoulder knowledge base—a comprehensive collection of evidence-based guides for emotional support across five major life domains.

**These documents power SafeShoulder's AI through RAG (Retrieval Augmented Generation), ensuring personalized, framework-driven responses.**

---

## 📚 Complete Knowledge Base (27 Documents)

### 🚨 Crisis & Foundational (All Domains)

Essential guides for immediate support and ongoing healing.

- **[Self-Harm and Suicidal Thoughts](crisis/self-harm-suicidal-thoughts.md)** - Crisis support, alternatives to self-harm, safety planning, resources
- **[Anxiety Management Techniques](crisis/anxiety-management-techniques.md)** - Immediate coping skills (4-7-8 breathing, grounding, CBT), long-term strategies
- **[CBT Thought Records](crisis/cbt-thought-records.md)** - Cognitive behavioral therapy worksheets, challenging unhelpful thoughts
- **[DBT Distress Tolerance](crisis/dbt-distress-tolerance.md)** - Crisis survival skills (TIPP, DISTRESS), managing emotional pain
- **[Starting Therapy Guide](crisis/starting-therapy-guide.md)** - Finding a therapist, first appointment, therapy modalities, getting the most from therapy

### 💔 Heartbreak & Relationships (5 Documents)

Navigate breakups, rejection, and relationship health.

- **[Breaking Up: First Steps](heartbreak/breaking-up-first-steps.md)** - First 24 hours after breakup, managing urges to contact, survival mode to recovery
- **[Grief Stages and Heartbreak](heartbreak/grief-stages-heartbreak.md)** - Understanding emotional stages (denial, anger, bargaining, depression, acceptance), timeline expectations
- **[Handling Rejection](heartbreak/handling-rejection.md)** - Romantic, social, and professional rejection, processing loss, resilience building
- **[Infidelity and Betrayal Recovery](heartbreak/infidelity-betrayal-recovery.md)** - Coping with betrayal, deciding stay/leave, rebuilding trust, healing timeline
- **[Healthy Relationships](heartbreak/healthy-relationships.md)** - Green flags vs. red flags, recognizing abuse patterns, boundary-setting scripts

### 🏫 School & Bullying (3 Documents)

Support for school challenges, peer issues, and identity.

- **[Bullying Response Guide](school/bullying-response-guide.md)** - Recognizing bullying, immediate responses, reporting to school, reporting to authorities, recovery
- **[Peer Pressure Strategies](school/peer-pressure-strategies.md)** - Recognizing pressure, resistance techniques, decision-making, saying no, building healthy friendships
- **[LGBTQ+ Bullying and Identity](school/lgbtq-bullying-identity.md)** - Coming out safety, handling discrimination, finding community, transition support, resources

### 🏠 Family Conflict (3 Documents)

Navigate family dynamics, boundaries, and toxic relationships.

- **[Nonviolent Communication (NVC)](family/nonviolent-communication.md)** - Four-step communication framework (observation, feeling, need, request), difficult conversations, receiving feedback
- **[Setting Boundaries with Family](family/setting-boundaries-family.md)** - Identifying toxic patterns (enmeshment, control, criticism), boundary-setting scripts, estrangement, healing
- **[Narcissistic Parent](family/narcissistic-parent.md)** - Recognizing narcissistic patterns, survival strategies while living with them, healing from narcissistic abuse, rebuilding identity

### 💸 Financial Stress (4 Documents)

Manage financial anxiety, debt, job loss, and money trauma.

- **[Financial Anxiety Management](financial/financial-anxiety-management.md)** - Understanding financial anxiety, reframing thoughts, grounding techniques, building support, action steps
- **[Handling Job Loss](financial/handling-job-loss.md)** - Emotional stages, financial triage, job search strategy, managing stress, deciding next steps
- **[Personal Financial Planning](financial/personal-financial-planning.md)** - Net worth calculation, budgeting, debt payoff strategies, emergency fund building, investment basics
- **[Financial Abuse: Recognition and Escape](financial/financial-abuse-recognition-escape.md)** - Identifying financial abuse, secret preparation, safe exit planning, rebuilding independence, resources

### 💼 Workplace (5 Documents)

Address work stress, difficult managers, discrimination, and career transitions.

- **[Burnout Recovery](workplace/burnout-recovery.md)** - Recognizing burnout, immediate relief, boundary-setting, emotional management, deciding stay/leave
- **[Difficult Boss/Manager](workplace/difficult-boss-manager.md)** - Identifying toxic boss patterns, boundary strategies, documentation, when to escalate to HR, when to leave
- **[Imposter Syndrome](workplace/imposter-syndrome-workplace.md)** - Recognizing imposter thoughts, self-talk scripts, taking credit, asking for raises, overcoming self-doubt
- **[Workplace Discrimination and Harassment](workplace/workplace-discrimination-harassment.md)** - Recognizing discrimination, documentation, reporting to HR/EEOC, legal options, retaliation protection
- **[Career Change Guide](workplace/career-change-guide.md)** - Deciding on a change, exploration phase, financial preparation, learning strategies, job search tips, managing imposter syndrome

---

## 🎯 How This Knowledge Base Works

### For SafeShoulder Users

When you chat with SafeShoulder, the AI retrieves relevant content from this knowledge base and:
- ✅ Suggests evidence-based frameworks and techniques
- ✅ Provides specific next steps and coping strategies
- ✅ Connects your situation to proven therapeutic approaches
- ✅ Offers actionable guidance grounded in research

### For Developers

The knowledge base integrates with SafeShoulder's RAG (Retrieval Augmented Generation) pipeline:

1. **User message** → Embedded by OpenAI
2. **Similarity search** → Retrieves top 3 relevant document chunks
3. **Context injection** → Chunks added to Claude's system prompt
4. **Personalized response** → Claude responds with knowledge-informed guidance

**Benefits:**
- Responses are specific, not generic
- References proven frameworks (CBT, DBT, NVC, etc.)
- Adapts to user's domain and situation
- Continuously improves as knowledge base expands

### For Contributors

Want to improve SafeShoulder's knowledge base?

1. **Fork this repo**
2. **Edit or create .md files** in the appropriate domain folder
3. **Submit a PR** with your improvements
4. **After merge:** Changes automatically sync to SafeShoulder's knowledge base

---

## 📖 Document Guidelines

### If You're Writing a New Document

1. **Structure:**
   - Start with a clear definition or hook
   - Use headers for readability
   - Include practical, actionable steps
   - End with key takeaways and resources

2. **Tone:**
   - Warm and conversational (not clinical)
   - Validate emotions first, then suggest solutions
   - Use "you" language
   - Avoid judgment

3. **Content:**
   - Evidence-based (grounded in psychology research)
   - Include specific frameworks (CBT, DBT, NVC, etc.)
   - Provide scripts and examples
   - Reference crisis resources where appropriate

4. **Length:**
   - 2,000-4,000 words for comprehensive guides
   - Well-structured with clear sections
   - Skimmable with bolded key points

### Naming Convention

- Use lowercase with hyphens: `handling-job-loss.md`
- Be descriptive: `narcissistic-parent.md` not `family-issues.md`
- Place in appropriate domain folder

---

## 🔄 Updating the Knowledge Base

### For Developers

To sync updates to the SafeShoulder database:

```bash
python3 /tmp/upload_knowledge_base.py
```

(Uploads all markdown files to SafeShoulder's Supabase knowledge_chunks table)

### For Contributors

1. Make changes to .md files in this repo
2. Submit PR with clear description
3. Once merged, notify team to run sync script
4. Changes live in SafeShoulder within minutes

---

## 📊 Knowledge Base Statistics

| Domain | Documents | Topics |
|--------|-----------|--------|
| Crisis & Foundational | 5 | Self-harm, anxiety, CBT, DBT, therapy |
| Heartbreak & Relationships | 5 | Breakups, rejection, grief, infidelity, health |
| School & Bullying | 3 | Bullying, peer pressure, LGBTQ+ identity |
| Family Conflict | 3 | Boundaries, NVC, narcissistic parents |
| Financial Stress | 4 | Anxiety, job loss, planning, abuse |
| Workplace | 5 | Burnout, difficult boss, discrimination, imposter syndrome, career change |
| **Total** | **27** | **50+ specific topics** |

---

## 🎓 Frameworks Included

SafeShoulder teaches evidence-based frameworks:

- **CBT** (Cognitive Behavioral Therapy) - Thought records, challenging unhelpful thoughts
- **DBT** (Dialectical Behavior Therapy) - Distress tolerance, emotion regulation, mindfulness
- **NVC** (Nonviolent Communication) - 4-step communication model
- **Boundary-Setting** - Scripts and strategies for family/relationships/work
- **Trauma-Informed** - Crisis support, safety planning, grounding techniques
- **Grief Processing** - Understanding emotional stages, timeline expectations

---

## 🚨 Crisis Resources

**If you're in crisis, reach out immediately:**

- **988 Suicide & Crisis Lifeline** - Call or text 988 (24/7)
- **Crisis Text Line** - Text HOME to 741741
- **The Trevor Project** (LGBTQ+ specific) - 1-866-488-7386
- **National Domestic Violence Hotline** - 1-800-799-7233
- **SAMHSA National Helpline** - 1-800-662-4357

---

## 📝 License

These documents are part of SafeShoulder's open-source emotional support platform. 

**Usage:**
- ✅ Use in SafeShoulder (primary purpose)
- ✅ Share and adapt (with attribution)
- ✅ Include in educational contexts
- ❌ Do not use for medical diagnosis or treatment (see disclaimers in individual docs)

---

## 🤝 Contributing

Want to improve SafeShoulder's knowledge base?

1. **Read the guidelines above**
2. **Edit or create documents** in the appropriate domain folder
3. **Submit a PR** with a clear title and description
4. **We'll review and merge** improvements
5. **Your changes help millions** access better emotional support

---

## 📚 Document Index (Quick Links)

### Crisis & All Domains
- [Self-Harm and Suicidal Thoughts](crisis/self-harm-suicidal-thoughts.md)
- [Anxiety Management](crisis/anxiety-management-techniques.md)
- [CBT Thought Records](crisis/cbt-thought-records.md)
- [DBT Distress Tolerance](crisis/dbt-distress-tolerance.md)
- [Starting Therapy](crisis/starting-therapy-guide.md)

### Heartbreak
- [Breaking Up: First Steps](heartbreak/breaking-up-first-steps.md)
- [Grief Stages](heartbreak/grief-stages-heartbreak.md)
- [Handling Rejection](heartbreak/handling-rejection.md)
- [Infidelity Recovery](heartbreak/infidelity-betrayal-recovery.md)
- [Healthy Relationships](heartbreak/healthy-relationships.md)

### School
- [Bullying Response](school/bullying-response-guide.md)
- [Peer Pressure](school/peer-pressure-strategies.md)
- [LGBTQ+ Bullying](school/lgbtq-bullying-identity.md)

### Family
- [Nonviolent Communication](family/nonviolent-communication.md)
- [Setting Boundaries](family/setting-boundaries-family.md)
- [Narcissistic Parents](family/narcissistic-parent.md)

### Financial
- [Financial Anxiety](financial/financial-anxiety-management.md)
- [Handling Job Loss](financial/handling-job-loss.md)
- [Financial Planning](financial/personal-financial-planning.md)
- [Financial Abuse](financial/financial-abuse-recognition-escape.md)

### Workplace
- [Burnout Recovery](workplace/burnout-recovery.md)
- [Difficult Boss](workplace/difficult-boss-manager.md)
- [Imposter Syndrome](workplace/imposter-syndrome-workplace.md)
- [Discrimination](workplace/workplace-discrimination-harassment.md)
- [Career Change](workplace/career-change-guide.md)

---

## ❓ Questions?

- **For SafeShoulder users:** Start chatting—the AI will reference these guides
- **For developers:** See `/backend/app/services/rag.py` for RAG implementation
- **For contributors:** Open an issue or submit a PR

---

**SafeShoulder Knowledge Base** | Building emotional support infrastructure, one guide at a time.

*Last updated: June 2026* | *27 documents covering 50+ topics*
