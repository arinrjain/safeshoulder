"""
Conversation template banks for implicit profiling.
These guide natural dialogue exploration without feeling like a questionnaire.
AI uses these to:
1. Ask ONE clarifying question that's contextually relevant
2. Extract answers from user's natural language
3. Build a profile over multiple sessions
"""

ACADEMIC_STRESS_BANK = {
    "intensity": {
        "template": "How heavily is the academic environment weighing on you right now?",
        "scale": "1-5 (Least to Most)",
        "extraction_keywords": [
            "stressed", "pressure", "exam", "test", "grades", "marks",
            "overwhelmed", "anxious", "worried", "scared", "nervous"
        ],
        "follow_up": "On a scale of 1-5, how much is it affecting you?"
    },
    "stressors": {
        "template": "What causes you the MOST academic stress?",
        "options": [
            "Exams/tests",
            "JEE/NEET preparation",
            "Fear of low grades",
            "Parental expectations",
            "Comparison with peers",
            "School workload",
            "Time management",
            "Career uncertainty",
            "Coaching classes",
            "Pressure to always perform well"
        ],
        "extraction_keywords": {
            "JEE/NEET": ["JEE", "NEET", "entrance exam", "medical entrance", "engineering entrance", "iit"],
            "Exams": ["exam", "test", "marks", "board exam", "score", "results"],
            "Grades": ["grades", "low marks", "percentage", "fail", "fear of"],
            "Parental": ["parents", "mom", "dad", "family", "expects", "pressure from home"],
            "Peers": ["friends", "classmates", "others", "compare", "better than me"],
            "Workload": ["homework", "assignments", "projects", "too much", "overload"],
            "Time": ["time", "manage", "busy", "no time", "schedule"],
            "Career": ["future", "career", "what next", "after boards", "college"],
            "Coaching": ["coaching", "tuition", "academy", "classes", "extra hours"],
            "Performance": ["perfect", "always", "best", "excel", "top"]
        }
    },
    "pressure_level": {
        "template": "How pressured do you feel to succeed academically?",
        "scale": "1-5 (Least to Most)",
        "extraction_keywords": [
            "pressure", "expected", "have to", "must", "should", "need to"
        ]
    },
    "mental_impact": {
        "template": "Has academic pressure negatively affected your mental well-being?",
        "options": ["Frequently", "Sometimes", "Rarely", "Never"],
        "extraction_keywords": {
            "Frequently": ["always", "every day", "every single day", "all the time", "constantly", "dread"],
            "Sometimes": ["sometimes", "often", "a lot", "regularly"],
            "Rarely": ["rarely", "once in a while", "not much"],
            "Never": ["never", "no impact", "doesn't bother me"]
        }
    },
    "burnout": {
        "template": "How often do you feel emotionally exhausted or burned out?",
        "options": ["Everyday", "Few times a week", "Occasionally", "Rarely", "Never"],
        "extraction_keywords": {
            "Everyday": ["every day", "every single day", "all the time", "constantly", "always tired", "weeks"],
            "Few times a week": ["few times", "multiple times", "often", "regularly"],
            "Occasionally": ["sometimes", "once in a while", "not often"],
            "Rarely": ["rarely", "hardly ever"],
            "Never": ["never", "feeling fine", "energetic"]
        }
    },
    "sleep": {
        "template": "How many hours of sleep do you usually get during school/exam periods?",
        "options": ["Less than 4 hours", "5-6 hours", "7-9 hours", "More than 9 hours"],
        "extraction_keywords": {
            "Less than 4": [
                "4 hours", "3 hours", "2 hours", "1 hour", "barely sleep", "no sleep",
                "haven't slept", "can't sleep", "staying up till", "staying up until",
                "up all night", "up till 2", "up till 3", "up till 4", "till 2am", "till 3am",
                "till 4am", "no time to sleep", "not sleeping", "sleep deprived",
            ],
            "5-6 hours": ["5 hours", "6 hours", "5-6"],
            "7-9 hours": ["7 hours", "8 hours", "9 hours", "enough sleep"],
            "More than 9": ["sleep a lot", "10 hours", "11 hours"]
        }
    }
}

RELATIONSHIP_STRESS_BANK = {
    "intensity": {
        "template": "How much is this relationship situation weighing on you?",
        "scale": "1-5 (Least to Most)",
        "extraction_keywords": [
            "heartbroken", "devastated", "miss them", "can't stop thinking",
            "painful", "hurts", "crying", "depressed", "lost"
        ]
    },
    "stressors": {
        "template": "What's the hardest part of what you're going through?",
        "options": [
            "Breakup pain",
            "Rejection",
            "Missing them",
            "Infidelity/betrayal",
            "Communication issues",
            "Loneliness",
            "Moving on",
            "Self-worth impact",
            "Social embarrassment",
            "Still in love but relationship ended"
        ],
        "extraction_keywords": {
            "Breakup": ["broke up", "broken up", "ended", "over", "finished"],
            "Rejection": ["rejected", "said no", "doesn't feel same", "not interested"],
            "Missing": ["miss them", "miss you", "thinking about", "can't stop"],
            "Betrayal": [
                "cheated", "lied", "betrayed", "unfaithful", "untrue",
                "someone else", "another person", "behind my back", "talking to someone",
                "found out he", "found out she", "found out they", "secretly", "affair",
            ],
            "Communication": ["can't talk", "don't understand", "miscommunication"],
            "Loneliness": ["alone", "lonely", "no one", "isolated"],
            "Moving on": ["move on", "get over", "heal", "get better"],
            "Self worth": ["not good enough", "unlovable", "why me", "fault"],
            "Embarrassment": ["friends know", "awkward", "humiliated"],
            "Still love": ["still love", "still care", "feelings not gone"]
        }
    },
    "time_since": {
        "template": "How long ago did this happen?",
        "options": ["Days ago", "Weeks ago", "Months ago", "Years ago"],
        "extraction_keywords": {
            "Days": ["few days", "last week", "days ago"],
            "Weeks": ["few weeks", "last month", "weeks ago"],
            "Months": ["few months", "last year", "months ago"],
            "Years": ["years ago", "long time", "years back"]
        }
    },
    "contact_urge": {
        "template": "How strong is the urge to contact them?",
        "options": ["Very strong", "Strong", "Moderate", "Weak", "None"],
        "extraction_keywords": {
            "Very strong": ["all the time", "can't resist", "dying to", "desperate"],
            "Strong": ["often", "frequently", "a lot"],
            "Moderate": ["sometimes", "occasional"],
            "Weak": ["rarely", "hardly"],
            "None": ["don't want to", "moved on", "no contact"]
        }
    }
}

FAMILY_STRESS_BANK = {
    "intensity": {
        "template": "How heavy is the family situation you're dealing with?",
        "scale": "1-5 (Least to Most)",
        "extraction_keywords": [
            "family conflict", "arguing", "fighting", "tension", "stress at home",
            "difficult", "toxic", "can't stand", "frustrated", "angry",
            "stuck", "on top of", "own responsibilities", "eggshells", "exhausting"
        ]
    },
    "stressors": {
        "template": "What's the main family challenge right now?",
        "options": [
            "Parent conflict/divorce",
            "Strict/controlling parents",
            "Lack of understanding",
            "Financial stress",
            "Domestic help issues",
            "Sibling conflict",
            "Extended family drama",
            "Abuse/mistreatment",
            "Expectations vs. reality",
            "Loss of family member"
        ],
        "extraction_keywords": {
            "Parent conflict": ["parents fighting", "divorce", "separation", "arguing"],
            "Strict": ["strict", "controlling", "overprotective", "no freedom"],
            "Understanding": ["don't understand me", "don't listen", "judge"],
            "Financial": ["money problems", "can't afford", "debt", "struggling"],
            "Help": [
                "helper", "maid", "cook", "unreliable", "issues",
                "quit", "quit without notice", "resigned", "left", "walked out",
                "doesn't help", "don't help", "no help", "managing the whole house",
            ],
            "Siblings": ["brother", "sister", "sibling", "arguing"],
            "Extended": ["grandparents", "aunts", "uncles", "cousins", "drama"],
            "Abuse": ["hit", "hurt", "abuse", "mistreat", "violence"],
            "Expectations": ["want me to", "expect", "should be", "pressure"],
            "Loss": ["died", "passed away", "death", "missing"]
        }
    },
    "relationship_closeness": {
        "template": "How close do you feel to your family?",
        "options": ["Very close", "Close", "Neutral", "Distant", "Estranged"],
        "extraction_keywords": {
            "Very close": ["close", "supportive", "love them", "tight"],
            "Close": ["okay relationship", "generally good"],
            "Neutral": ["not sure", "complicated"],
            "Distant": ["not close", "don't talk much"],
            "Estranged": ["don't speak", "cut off", "no contact"]
        }
    }
}

FINANCIAL_STRESS_BANK = {
    "intensity": {
        "template": "How much is financial stress affecting you?",
        "scale": "1-5 (Least to Most)",
        "extraction_keywords": [
            "money", "afford", "broke", "debt", "worried about", "can't pay",
            "financial stress", "poor", "struggling", "ashamed", "scared about",
            "running out", "savings", "rent", "can't afford"
        ]
    },
    "stressors": {
        "template": "What's your main financial challenge?",
        "options": [
            "Job loss",
            "Debt",
            "Not enough income",
            "Unexpected expenses",
            "Saving for goals",
            "Family financial burden",
            "Paying bills",
            "Career earnings concern",
            "Investment losses",
            "Lack of financial security"
        ],
        "extraction_keywords": {
            "Job loss": ["lost job", "lost my job", "unemployed", "fired", "laid off", "let go", "no longer working"],
            "Debt": ["debt", "credit card", "loan", "owe"],
            "Income": ["not enough", "low salary", "can't earn", "struggling to earn"],
            "Unexpected": ["emergency", "sudden expense", "medical bill", "accident"],
            "Savings": ["save", "goal", "future", "can't save"],
            "Family": ["family", "parents", "dependent", "support"],
            "Bills": ["bills", "rent", "utilities", "expenses"],
            "Career": ["income potential", "earning power", "salary concerns"],
            "Investment": ["stock", "investment", "lost money"],
            "Security": ["financial security", "safety net", "no backup"]
        }
    },
    "support_system": {
        "template": "Do you have financial support or is this solo?",
        "options": ["Have support", "Some support", "No support", "Solo responsibility"],
        "extraction_keywords": {
            "Support": ["family helps", "parents support", "partner helps"],
            "Some": ["sometimes", "occasional help"],
            "No": ["no one", "alone", "on my own"],
            "Solo": ["all on me", "responsibility", "burden"]
        }
    }
}

WORKPLACE_STRESS_BANK = {
    "intensity": {
        "template": "How much is work stress affecting your life?",
        "scale": "1-5 (Least to Most)",
        "extraction_keywords": [
            "burnout", "burn out", "burned out", "overwhelmed", "stressed", "exhausted",
            "hate work", "can't handle", "too much", "pressure", "midnight",
            "impossible", "late nights", "no break"
        ]
    },
    "stressors": {
        "template": "What's the biggest workplace challenge?",
        "options": [
            "Difficult manager",
            "Toxic team",
            "Overwork/long hours",
            "Undervalued",
            "No work-life balance",
            "Job security concern",
            "Career growth stuck",
            "Low pay",
            "Impostor syndrome",
            "Hostile culture"
        ],
        "extraction_keywords": {
            "Manager": ["boss", "manager", "supervisor", "difficult person"],
            "Team": ["colleagues", "coworkers", "team", "toxic"],
            "Overwork": ["long hours", "overtime", "weekends", "no break", "midnight", "late nights", "most nights"],
            "Undervalued": ["not recognized", "underappreciated", "contributions ignored"],
            "Balance": ["work-life", "no time off", "always working"],
            "Security": ["might get fired", "layoffs", "uncertain"],
            "Growth": ["stuck", "no progress", "dead end"],
            "Pay": ["low salary", "underpaid", "money"],
            "Impostor": ["don't deserve", "fraud", "not capable"],
            "Culture": ["hostile", "bullying", "discrimination"]
        }
    },
    "burnout_level": {
        "template": "Are you experiencing burnout?",
        "options": ["Severe", "Moderate", "Mild", "Not yet", "No"],
        "extraction_keywords": {
            "Severe": ["burned out", "can't continue", "need break"],
            "Moderate": ["getting tired", "getting burned out"],
            "Mild": ["bit tired", "occasional fatigue"],
            "Not yet": ["not quite", "almost there"],
            "No": ["fine", "managing"]
        }
    }
}

BODY_IMAGE_STRESS_BANK = {
    "intensity": {
        "template": "How much does body image affect your well-being?",
        "scale": "1-5 (Least to Most)",
        "extraction_keywords": [
            "insecure", "hate", "uncomfortable", "embarrassed", "ugly",
            "fat", "skinny", "not good enough", "anxious"
        ]
    },
    "stressors": {
        "template": "What specifically bothers you about your appearance?",
        "options": [
            "Weight",
            "Skin/acne",
            "Height",
            "Body shape",
            "Hair",
            "Facial features",
            "Scars/marks",
            "Comparison to others",
            "Muscle/fitness",
            "Overall appearance"
        ],
        "extraction_keywords": {
            "Weight": ["fat", "weight", "overweight", "thin", "skinny"],
            "Skin": ["acne", "pimples", "skin", "complexion", "marks"],
            "Height": ["height", "tall", "short"],
            "Shape": ["body shape", "curves", "flat", "broad"],
            "Hair": ["hair", "bald", "texture", "color"],
            "Face": ["face", "features", "nose", "eyes", "lips"],
            "Scars": ["scar", "marks", "blemish", "imperfection"],
            "Compare": ["compare", "comparing", "others look", "friends are", "she is", "influencers", "never look good enough"],
            "Fitness": ["muscle", "fit", "unfit", "weak"],
            "Overall": ["ugly", "not pretty", "not handsome"]
        }
    },
    "impact_area": {
        "template": "How does this affect you?",
        "options": [
            "Social interactions",
            "Dating/relationships",
            "Mental health",
            "Daily activities",
            "Eating habits",
            "Self-esteem"
        ],
        "extraction_keywords": {
            "Social": ["friends", "social", "avoid people", "shy"],
            "Dating": ["dating", "relationships", "attract"],
            "Mental": ["depressed", "anxious", "sad"],
            "Activities": ["avoid", "don't go out", "limit"],
            "Eating": ["diet", "eat less", "overeat", "not eat"],
            "Self esteem": ["confidence", "confident", "self worth", "bad about myself"]
        }
    }
}

EMOTIONAL_WELLNESS_INDICATORS = {
    "anxiety_stress": {
        "template": "How often have you experienced anxiety or stress over the past month?",
        "scale": "Never, Rarely, Sometimes, Often, Very Often",
        "extraction_keywords": {
            "Never": ["never", "not at all", "no anxiety"],
            "Rarely": ["rarely", "hardly", "almost never"],
            "Sometimes": ["sometimes", "occasionally", "at times"],
            "Often": ["often", "frequently", "a lot"],
            "Very Often": ["very often", "constantly", "all the time", "always"]
        }
    },
    "loneliness": {
        "template": "How often do you feel lonely?",
        "scale": "Never, Rarely, Sometimes, Often, Very Often",
        "extraction_keywords": {
            "Never": ["never lonely", "not lonely"],
            "Rarely": ["rarely lonely", "hardly ever"],
            "Sometimes": ["sometimes lonely", "feel alone"],
            "Often": ["often lonely", "frequently lonely"],
            "Very Often": ["very often lonely", "always lonely", "constantly lonely"]
        }
    },
    "overthinking": {
        "template": "Do you find yourself overthinking things?",
        "scale": "Never, Rarely, Sometimes, Often, Very Often",
        "extraction_keywords": {
            "Never": ["never overthink"],
            "Rarely": ["rarely overthink"],
            "Sometimes": ["sometimes overthink", "overthink occasionally"],
            "Often": ["often overthink", "overthink a lot"],
            "Very Often": ["always overthinking", "constantly overthinking", "can't stop thinking"]
        }
    },
    "emotional_exhaustion": {
        "template": "How often do you feel emotionally drained or exhausted?",
        "scale": "Never, Rarely, Sometimes, Often, Very Often",
        "extraction_keywords": {
            "Never": ["never drained", "not exhausted"],
            "Rarely": ["rarely drained"],
            "Sometimes": ["sometimes exhausted", "occasionally drained"],
            "Often": ["often drained", "frequently exhausted"],
            "Very Often": ["always exhausted", "completely drained", "emotionally empty"]
        }
    },
    "concentration": {
        "template": "Do you have difficulty concentrating or focusing?",
        "scale": "Never, Rarely, Sometimes, Often, Very Often",
        "extraction_keywords": {
            "Never": ["never hard to concentrate"],
            "Rarely": ["rarely distracted"],
            "Sometimes": ["sometimes can't focus"],
            "Often": ["often hard to concentrate", "frequently distracted"],
            "Very Often": ["can't focus", "always distracted", "no concentration"]
        }
    },
    "isolation": {
        "template": "Do you feel isolated or disconnected from others?",
        "scale": "Never, Rarely, Sometimes, Often, Very Often",
        "extraction_keywords": {
            "Never": ["never isolated"],
            "Rarely": ["rarely feel alone"],
            "Sometimes": ["sometimes isolated"],
            "Often": ["often feel isolated", "frequently alone"],
            "Very Often": ["always isolated", "completely disconnected", "alone all the time"]
        }
    },
    "motivation": {
        "template": "How often do you lack motivation or feel unmotivated?",
        "scale": "Never, Rarely, Sometimes, Often, Very Often",
        "extraction_keywords": {
            "Never": ["never unmotivated", "always motivated"],
            "Rarely": ["rarely lose motivation"],
            "Sometimes": ["sometimes unmotivated", "lose motivation"],
            "Often": ["often unmotivated", "frequently lack motivation"],
            "Very Often": ["no motivation", "can't be motivated", "completely unmotivated"]
        }
    },
    "feeling_unheard": {
        "template": "Do you feel unheard or misunderstood by those around you?",
        "scale": "Never, Rarely, Sometimes, Often, Very Often",
        "extraction_keywords": {
            "Never": ["never misunderstood"],
            "Rarely": ["rarely feel unheard"],
            "Sometimes": ["sometimes feel misunderstood"],
            "Often": ["often feel unheard", "frequently misunderstood"],
            "Very Often": ["always misunderstood", "no one understands", "constantly unheard"]
        }
    }
}

SCHOOL_ENVIRONMENT_SAFETY = {
    "emotional_safety": {
        "template": "Do you feel emotionally safe and accepted in your school/college?",
        "scale": "1-5 (Very Unsafe to Very Safe)",
        "extraction_keywords": {
            "Very Unsafe": ["very unsafe", "not safe", "unsafe", "hostile"],
            "Unsafe": ["unsafe", "don't feel safe", "uncomfortable"],
            "Neutral": ["neutral", "okay", "sometimes safe"],
            "Safe": ["mostly safe", "feel okay", "generally safe"],
            "Very Safe": ["very safe", "completely safe", "feel accepted", "feel belong"]
        }
    },
    "bullying_harassment": {
        "template": "Have you experienced or witnessed bullying, harassment, or exclusion?",
        "options": ["Bullying", "Verbal harassment", "Academic humiliation",
                   "Social exclusion", "Cyberbullying", "Peer pressure",
                   "Teacher favoritism", "None of the above"],
        "extraction_keywords": {
            "Bullying": ["bullied", "bullying", "physical harassment"],
            "Verbal harassment": ["verbally harassed", "called names", "mean comments"],
            "Academic humiliation": ["called out in class", "embarrassed academically", "humiliated"],
            "Social exclusion": ["left out", "excluded", "not invited"],
            "Cyberbullying": ["online harassment", "cyberbullying", "mean texts", "social media"],
            "Peer pressure": ["peer pressure", "pressured", "forced to"],
            "Teacher favoritism": ["teacher favorite", "teacher bias", "unfair treatment"]
        }
    },
    "teacher_support": {
        "template": "Do you feel teachers/professors are supportive of mental health struggles?",
        "scale": "1-5 (Strongly Disagree to Completely Agree)",
        "extraction_keywords": {
            "Disagree": ["not supportive", "unsupportive", "don't care"],
            "Neutral": ["sometimes supportive", "neutral"],
            "Agree": ["somewhat supportive", "generally supportive"],
            "Strongly Agree": ["very supportive", "understanding", "care about wellbeing"]
        }
    },
    "counseling_accessibility": {
        "template": "How accessible does counseling support feel at your school?",
        "options": ["Very accessible", "Somewhat accessible", "Difficult to access",
                   "Don't know if available", "No support system"],
        "extraction_keywords": {
            "Very accessible": ["easy to access", "very accessible", "no problem getting help"],
            "Somewhat accessible": ["somewhat accessible", "can access if needed"],
            "Difficult": ["hard to access", "difficult", "barriers"],
            "Don't know": ["don't know", "not sure", "not aware"],
            "None": ["no counselor", "no support", "no system"]
        }
    },
    "counselor_stigma": {
        "template": "Would you worry about judgment or rumors if you visited the school counselor?",
        "scale": "Yes to No (with shades)",
        "extraction_keywords": {
            "Yes, worried": ["worry", "judgment", "rumors", "afraid", "scared"],
            "Somewhat worried": ["bit worried", "some concern"],
            "Not worried": ["not worried", "comfortable", "confidential"]
        }
    }
}

SUPPORT_SYSTEM_PREFERENCES = {
    "mental_health_comfort": {
        "template": "How comfortable do you feel talking about mental health with people around you?",
        "options": ["Very comfortable", "Somewhat comfortable", "Rarely comfortable", "Not comfortable"],
        "extraction_keywords": {
            "Very comfortable": ["very comfortable", "talk openly", "no problem sharing"],
            "Somewhat": ["somewhat comfortable", "can talk"],
            "Rarely": ["rarely comfortable", "hesitant", "uncomfortable"],
            "Not": ["not comfortable", "don't talk", "keep it private"]
        }
    },
    "support_sources": {
        "template": "Who do you usually turn to when you're stressed?",
        "options": ["Friends", "Parents/family", "Teachers", "School counselor",
                   "Online communities", "Nobody", "Handle alone", "Other"],
        "extraction_keywords": {
            "Friends": ["friends", "best friend", "classmates", "peers"],
            "Parents": ["parents", "mom", "dad", "family", "grandparents"],
            "Teachers": ["teacher", "professor", "mentor"],
            "Counselor": ["counselor", "school counselor", "therapist"],
            "Online": ["online", "forums", "internet", "community", "helpline"],
            "Nobody": ["nobody", "don't tell anyone", "alone"],
            "Myself": ["handle it myself", "myself", "alone"]
        }
    },
    "support_preferences": {
        "template": "What type of mental health support would you prefer?",
        "options": ["Professional therapist", "Close friend/peer support", "Anonymous chat",
                   "Parents/family", "School counselor", "Deal alone"],
        "extraction_keywords": {
            "Professional": ["therapist", "psychologist", "professional", "expert"],
            "Peer support": ["friends", "peer", "support group", "people like me"],
            "Anonymous": ["anonymous", "private", "no names"],
            "Family": ["parents", "family", "mom", "dad"],
            "Counselor": ["school counselor", "counselor at school"],
            "Alone": ["myself", "alone", "no one"]
        }
    },
    "support_features": {
        "template": "Which support features would you most use?",
        "options": ["Anonymous chat", "Licensed therapist", "Peer groups", "Student ambassadors",
                   "Wellness workshops", "Wellness tracking", "Mental health resources",
                   "Emergency support", "Burnout help", "Discussion spaces"],
        "extraction_keywords": {
            "Anonymous chat": ["anonymous chat", "chat", "messaging"],
            "Therapist": ["therapist", "professional help", "licensed"],
            "Peer groups": ["peer group", "group support", "community"],
            "Ambassadors": ["ambassadors", "student leaders", "peer helpers"],
            "Workshops": ["workshop", "training", "learning"],
            "Tracking": ["tracking", "journaling", "monitoring"],
            "Resources": ["resources", "information", "articles"],
            "Emergency": ["emergency", "crisis", "immediate help"],
            "Burnout": ["burnout", "exhaustion"],
            "Discussion": ["discussion", "talk", "share"]
        }
    },
    "workshops_interest": {
        "template": "Would you attend mental wellness workshops at school?",
        "options": ["Definitely", "Maybe", "Probably not", "No"],
        "extraction_keywords": {
            "Definitely": ["definitely", "yes", "would attend", "want to"],
            "Maybe": ["maybe", "might", "could"],
            "Probably not": ["probably not", "unlikely"],
            "No": ["no", "won't attend"]
        }
    }
}

OPEN_ENDED_INSIGHTS = {
    "biggest_stressor": {
        "prompt": "In your opinion, what is the single biggest factor that stresses out students your age today?",
        "note": "Open-ended - extract keywords: academics, peers, family, future, expectations, etc."
    },
    "school_failure": {
        "prompt": "What is one crucial thing that schools and parents fail to understand about student mental health?",
        "note": "Open-ended - extract patterns: lack of listening, expectations, support, understanding"
    },
    "one_word_description": {
        "prompt": "If you had to describe your current school/college life in ONE word, what would it be?",
        "note": "Open-ended - single word captures emotional state: stressed, overwhelming, good, fun, etc."
    }
}

def get_bank_for_domain(domain: str) -> dict:
    """Get the question bank for a specific domain."""
    return DOMAIN_BANKS.get(domain, ACADEMIC_STRESS_BANK)

def extract_intensity(user_message: str, keywords: list) -> int | None:
    """
    Extract intensity score (1-5) from user message.
    Returns None if unclear.
    """
    message_lower = user_message.lower()

    # Look for explicit scale mentions
    for i in range(5, 0, -1):
        if f"{i}/5" in message_lower or f"{i} out of 5" in message_lower:
            return i

    # Look for keyword intensity indicators
    very_high = ["extremely", "unbearable", "worst", "devastating", "constant"]
    high = ["very", "a lot", "lots of", "really", "quite"]
    medium = ["some", "moderate", "fair amount", "decent"]
    low = ["little", "bit", "slight", "minor"]

    if any(word in message_lower for word in very_high):
        return 5
    elif any(word in message_lower for word in high):
        return 4
    elif any(word in message_lower for word in medium):
        return 3
    elif any(word in message_lower for word in low):
        return 2

    # Check for relevant keywords presence
    if any(kw.lower() in message_lower for kw in keywords):
        return 3  # Default to moderate if keywords present

    return None

def extract_options(user_message: str, options_map: dict) -> list:
    """
    Extract selected options from user message.
    Returns list of matched options.
    """
    message_lower = user_message.lower()
    matched = []

    for option, keywords in options_map.items():
        if any(kw.lower() in message_lower for kw in keywords):
            matched.append(option)

    return matched


# Map domains to their question banks
DOMAIN_BANKS = {
    "school_bullying": ACADEMIC_STRESS_BANK,
    "academic": ACADEMIC_STRESS_BANK,
    "heartbreak": RELATIONSHIP_STRESS_BANK,
    "relationship_issues": RELATIONSHIP_STRESS_BANK,
    "domestic": FAMILY_STRESS_BANK,
    "financial": FINANCIAL_STRESS_BANK,
    "workplace": WORKPLACE_STRESS_BANK,
    "body_image": BODY_IMAGE_STRESS_BANK,
}

# Cross-cutting banks that apply to all domains
UNIVERSAL_BANKS = {
    "emotional_wellness": EMOTIONAL_WELLNESS_INDICATORS,
    "school_environment": SCHOOL_ENVIRONMENT_SAFETY,
    "support_system": SUPPORT_SYSTEM_PREFERENCES,
    "insights": OPEN_ENDED_INSIGHTS,
}
