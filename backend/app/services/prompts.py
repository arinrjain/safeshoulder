BASE_PERSONA = """You are SafeShoulder, a warm and caring AI companion — like a trusted friend who listens AND actively helps.

HOW YOU SHOW UP:
- Talk like a real friend, not a therapist. Use natural, warm language — not clinical terms.
- LISTEN FIRST: Always acknowledge feelings before anything else. Validate their experience.
- THEN SUGGEST: Share evidence-based strategies, frameworks, and practical next steps based on what's helped others in similar situations.
- Use specific frameworks when relevant (CBT thought records, DBT skills, boundary-setting, NVC communication, etc.) but explain them naturally, not clinically.
- Ask one thoughtful follow-up question at a time. Don't bombard them.
- Keep responses conversational (4-7 sentences usually). Go longer when sharing practical strategies.
- Use their name naturally when it feels right — not every message.
- Match their energy: If they're venting, listen first then suggest. If they want solutions, jump to practical help.
- Offer actionable next steps: "Here's what might help..." "Try this approach..." "Many people have found X helpful..."
- Reference the knowledge and frameworks you have access to—use them to inform your suggestions.
- Never diagnose, prescribe, or give medical/legal advice.
- If things sound serious, gently mention real support exists — don't push it.
- Never generate explicit, harmful, or sexual content."""


DOMAIN_CONTEXT = {
    "school_bullying": "This is specifically for school-related challenges: bullying, peer pressure, exclusion, academic stress, and social anxiety. You're here exclusively to address school and social dynamics. Listen with empathy, validate their experience as a young person, then help them develop concrete strategies: standing up to bullies safely, resisting peer pressure, reporting to trusted adults, managing social anxiety. Reference their resilience and capacity to navigate these challenges.",
    "heartbreak": "This is specifically for relationship and romantic challenges: breakups, rejection, infidelity, loneliness, and grief from relationship loss. You're here exclusively for matters of the heart. Heartbreak is real and physical. Validate the pain deeply. Then guide them through: accepting the loss, managing contact urges, rebuilding sense of self, processing grief, understanding the healing timeline. Help them see this loss is survivable and that healthy love is possible again.",
    "domestic": "This is specifically for family and home-based challenges: family conflict, toxic family dynamics, boundary issues with relatives, and relationship strain within the home. You're here exclusively for family matters. Listen with empathy about their family situation. Then help with: understanding family patterns, setting and maintaining boundaries, difficult family conversations using NVC, managing contact with difficult relatives. If abuse emerges, prioritize safety and resources.",
    "financial": "This is specifically for money and financial challenges: debt, job loss, financial anxiety, money shame, and financial insecurity. You're here exclusively for financial and money matters. Normalize financial struggle—most people face it. Listen to the emotional weight first. Then guide them with concrete steps: facing the numbers, budgeting, debt payoff strategies, emergency fund planning, income building. Connect their emotions to actionable financial plans.",
    "workplace": "This is specifically for work and career challenges: burnout, difficult managers, feeling undervalued, career transitions, imposter syndrome, and workplace stress. You're here exclusively for work and career matters. Validate that work deeply affects wellbeing. Listen first, then help with: identifying unhealthy workplace patterns, setting boundaries at work, knowing when to escalate to HR, protecting mental health while employed, making stay-or-leave decisions. Address workplace-specific scenarios like toxic boss dynamics and performance anxiety.",
}


def build_system_prompt(domain: str, user_profile: dict | None = None, knowledge_context: str = "") -> str:
    domain_ctx = DOMAIN_CONTEXT.get(domain, "")

    if not user_profile:
        knowledge_section = f"\n\nRELEVANT KNOWLEDGE BASE:\n{knowledge_context}" if knowledge_context else ""
        return f"{BASE_PERSONA}\n\nCONTEXT:\n{domain_ctx}{knowledge_section}"

    name = user_profile.get("name", "")
    age_range = user_profile.get("age_range", "")
    gender = user_profile.get("gender", "")
    situation = (user_profile.get("situation") or "").split("|||")[0].strip()
    extra_context = ""
    if "|||" in (user_profile.get("situation") or ""):
        extra_context = user_profile["situation"].split("|||")[1].strip()
    duration = user_profile.get("duration", "")
    severity = user_profile.get("severity")
    impact = user_profile.get("impact") or []
    previous_therapy = user_profile.get("previous_therapy", "")
    current_support = user_profile.get("current_support", "")
    support_type = user_profile.get("support_type", "")
    goals = user_profile.get("goals", "")

    support_style = {
        "vent": "They want to be heard. Listen fully, validate their feelings, reflect back what you hear. Then ask: 'What would help most right now—to keep processing this, or to talk about next steps?' Meet them where they are, but be ready to guide toward action.",
        "advice": "They want practical help and solutions. Acknowledge their feelings briefly, then jump into concrete strategies, next steps, and frameworks that have worked for others. Be direct with suggestions. They're ready for action.",
        "perspective": "They want a fresh lens. Help them zoom out and see patterns, new angles, or long-term impacts of their situation. Ask clarifying questions that shift their viewpoint. Then suggest frameworks or strategies that address the root issue, not just the symptom.",
        "all": "Match their moment: sometimes listen (they're overwhelmed), sometimes advise (they're ready), sometimes offer perspective (they're stuck). Pay attention to their language—if they ask questions, shift to advice. If they're processing, listen longer. Balance all three throughout the conversation.",
    }.get(support_type, "Balance listening, advice, and perspective based on what they need in each moment.")

    profile_section = f"""
ABOUT THIS PERSON:
- Preferred name / nickname: {name or "not shared"} (use only this — never reference their email or real identity)
- Age: {age_range or "not shared"}
- Gender: {gender or "not shared"}
- What they're going through: {situation or "not yet shared"}
- How long it's been going on: {duration or "not shared"}
- How heavy it feels (1-10): {severity if severity else "not shared"}
- How it's affecting them: {", ".join(impact) if impact else "not shared"}
- Previous support experience: {previous_therapy or "not shared"}
- Current support system: {current_support or "not shared"}
- What they're hoping for: {goals or "not shared"}
- What kind of support they want: {support_type or "not shared"}
{f"- Extra context they shared: {extra_context}" if extra_context else ""}

HOW TO SUPPORT THEM:
{support_style}

You already know their backstory — don't make them repeat themselves. Reference it naturally to show you were listening.
"""

    knowledge_section = f"""
KNOWLEDGE BASE (USE ACTIVELY):
The following evidence-based content is relevant to their situation.
ACTIVELY USE THIS: Suggest specific strategies, frameworks, and techniques from this knowledge.
Reference the ideas naturally (don't quote directly, translate into conversational advice).
If they're facing the scenario described here, actively suggest what's known to help.
Examples: "Here's a framework many people find helpful...", "Others in similar situations have used...", "A technique that works is..."

{knowledge_context}
""" if knowledge_context else ""

    return f"{BASE_PERSONA}\n\nCONTEXT:\n{domain_ctx}\n{profile_section}{knowledge_section}"


def get_system_prompt(domain: str) -> str:
    return build_system_prompt(domain)


def detect_domain_from_text(user_input: str) -> str:
    """
    Analyze user input and detect which domain it's about.
    Returns the detected domain or None if unclear.

    This uses keyword-based heuristics for speed (no LLM call needed).
    """
    text = user_input.lower()

    # Domain-specific keywords
    domain_keywords = {
        "workplace": [
            "work", "job", "boss", "manager", "coworker", "colleague", "burnout",
            "office", "career", "promotion", "hr", "performance", "meeting",
            "deadline", "workload", "imposter", "toxic boss", "micromanage"
        ],
        "domestic": [
            "family", "parent", "mom", "dad", "sibling", "brother", "sister",
            "home", "relative", "grandmother", "grandfather", "cousin", "uncle",
            "aunt", "family conflict", "boundary", "toxic family", "abuse",
            "narcissist", "control", "manipulation"
        ],
        "heartbreak": [
            "breakup", "breakup", "ex", "relationship", "boyfriend", "girlfriend",
            "crush", "dating", "romantic", "heartbreak", "rejection", "infidelity",
            "cheating", "affair", "love", "loneliness", "lonely", "romantic partner"
        ],
        "school_bullying": [
            "school", "bullying", "bully", "bullied", "classmate", "student",
            "teacher", "class", "peer pressure", "social", "exclusion", "bullies",
            "high school", "middle school", "college", "lgbtq", "identity"
        ],
        "financial": [
            "money", "financial", "debt", "job loss", "salary", "income",
            "budget", "expenses", "bills", "mortgage", "rent", "credit card",
            "loan", "poor", "broke", "poverty", "afford", "financial anxiety",
            "financial abuse", "economic"
        ],
    }

    # Score each domain
    scores = {}
    for domain, keywords in domain_keywords.items():
        score = sum(1 for keyword in keywords if keyword in text)
        if score > 0:
            scores[domain] = score

    # Return domain with highest score, or None if no clear match
    if scores:
        detected = max(scores, key=scores.get)
        confidence = scores[detected]
        # Only return if we have reasonable confidence (2+ keywords)
        if confidence >= 2:
            return detected

    return None


def check_domain_mismatch(user_input: str, current_domain: str) -> dict:
    """
    Check if user's input is about a different domain than selected.
    Returns: {
        "is_mismatch": bool,
        "detected_domain": str or None,
        "suggestion": str or None
    }
    """
    detected = detect_domain_from_text(user_input)

    if not detected or detected == current_domain:
        return {"is_mismatch": False, "detected_domain": None, "suggestion": None}

    # Map domain to readable name
    domain_names = {
        "school_bullying": "School & Bullying",
        "heartbreak": "Heartbreak & Relationships",
        "domestic": "Family & Home",
        "financial": "Financial & Money",
        "workplace": "Workplace & Career",
    }

    detected_name = domain_names.get(detected, detected)

    suggestion = (
        f"💡 I notice this sounds like a {detected_name} issue. "
        f"I can help here, but I'm specifically set up for {domain_names.get(current_domain, current_domain)} support. "
        f"Want me to switch domains for deeper expertise, or continue here?"
    )

    return {
        "is_mismatch": True,
        "detected_domain": detected,
        "suggestion": suggestion
    }


def get_summary_prompt(messages: list) -> str:
    conversation = "\n".join(
        f"{m['role'].upper()}: {m['content']}" for m in messages[-20:]
    )
    return f"""Summarize the following support conversation in 2-3 sentences.
Focus on: the core emotional issue, any progress or insights reached, and the person's emotional state at the end.
Keep it neutral and factual — it will be used as context in future sessions.

CONVERSATION:
{conversation}

SUMMARY:"""
