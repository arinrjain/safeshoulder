import re
from typing import Tuple

CRISIS_PATTERNS = [
    r"\b(kill myself|suicide|suicidal|end my life|want to die|don't want to live)\b",
    r"\b(self.?harm|cut myself|hurt myself)\b",
]

UNSAFE_PATTERNS = [
    r"\b(porn|sex|nude|naked|explicit|adult content)\b",
    r"\b(drug|cocaine|heroin|meth|fentanyl)\b",
    r"\b(bomb|weapon|murder|rape|assault)\b",
]

CRISIS_RESOURCES = (
    "It sounds like you may be going through something very serious. "
    "Please reach out to a crisis helpline right now:\n\n"
    "- **US:** 988 Suicide & Crisis Lifeline — call or text **988**\n"
    "- **International:** findahelpline.com\n\n"
    "You are not alone. A real person is ready to help you right now."
)


def check_input(text: str) -> Tuple[bool, bool, str]:
    """Returns (is_crisis, is_unsafe, reason)."""
    lower = text.lower()

    for pattern in CRISIS_PATTERNS:
        if re.search(pattern, lower):
            return True, False, "crisis"

    for pattern in UNSAFE_PATTERNS:
        if re.search(pattern, lower):
            return False, True, "unsafe_content"

    return False, False, ""


def check_output(text: str) -> str:
    """Strip any accidental PII patterns from AI output."""
    # Remove anything that looks like a phone number or SSN
    text = re.sub(r"\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b", "[REDACTED]", text)
    text = re.sub(r"\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b", "[REDACTED]", text)
    return text
