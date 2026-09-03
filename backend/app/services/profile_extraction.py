"""
Service for extracting user stress profile data from conversations.
Used to build profiles implicitly over multiple sessions.
"""

from typing import Optional, Dict, Any
from datetime import datetime
from app.config.conversation_banks import (
    get_bank_for_domain,
    extract_intensity,
    extract_options,
)
from app.models.profile_schemas import get_profile_schema


class ProfileExtractor:
    """Extract stress profile data from conversation."""

    def __init__(self, domain: str):
        self.domain = domain
        self.bank = get_bank_for_domain(domain)
        self.schema = get_profile_schema(domain)

    def extract_from_message(self, message: str) -> Dict[str, Any]:
        """
        Extract profile data from a single user message.
        Returns dict of extracted fields with confidence levels.
        """
        extracted = {}
        message_lower = message.lower()

        # Try to extract intensity from various fields
        for field_name, field_config in self.bank.items():
            if field_name == "intensity":
                intensity = extract_intensity(
                    message,
                    field_config.get("extraction_keywords", [])
                )
                if intensity:
                    extracted["intensity"] = {
                        "value": intensity,
                        "source": "message_analysis",
                        "confidence": "medium"
                    }

            elif field_name == "stressors":
                # Extract specific stressors
                options_map = field_config.get("extraction_keywords", {})
                matched = extract_options(message, options_map)
                if matched:
                    extracted["main_stressors"] = {
                        "value": matched,
                        "source": "keyword_matching",
                        "confidence": "high" if len(matched) == 1 else "medium"
                    }

            elif field_name == "burnout":
                # Extract burnout frequency
                options_map = field_config.get("extraction_keywords", {})
                matched = extract_options(message, options_map)
                if matched:
                    extracted["burnout_frequency"] = {
                        "value": matched[0],
                        "source": "keyword_matching",
                        "confidence": "high"
                    }

            elif field_name == "sleep":
                # Extract sleep hours
                options_map = field_config.get("extraction_keywords", {})
                matched = extract_options(message, options_map)
                if matched:
                    extracted["sleep_hours"] = {
                        "value": matched[0],
                        "source": "keyword_matching",
                        "confidence": "high"
                    }

            # Add more field extractions as needed
            else:
                options_map = field_config.get("extraction_keywords", {})
                if options_map:
                    matched = extract_options(message, options_map)
                    if matched:
                        # Convert field name to snake_case
                        field_key = field_name.replace(" ", "_").lower()
                        extracted[f"{field_key}_value"] = {
                            "value": matched[0] if len(matched) == 1 else matched,
                            "source": "keyword_matching",
                            "confidence": "medium" if len(matched) > 1 else "high"
                        }

        extracted["last_updated"] = datetime.utcnow().isoformat()
        return extracted

    def get_clarifying_question(self, current_profile: Optional[Dict]) -> Optional[str]:
        """
        Suggest ONE clarifying question based on what we already know.
        Returns the template question if we need more info on that dimension.
        """
        if not current_profile:
            # Start with intensity if we know nothing
            return self.bank.get("intensity", {}).get("template")

        # Find the most important missing dimension
        # Priority: intensity > stressors > impact
        for field_name in ["intensity", "stressors", "burnout", "pressure_level"]:
            if field_name in self.bank:
                key = field_name.replace(" ", "_").lower()
                if not current_profile.get(key):
                    return self.bank[field_name].get("template")

        return None

    def should_ask_about_field(self, field_name: str, current_profile: Optional[Dict]) -> bool:
        """
        Determine if we should ask about a specific field.
        Returns False if:
        - We already have the answer
        - It's not relevant to this conversation
        - We've already asked recently
        """
        if not current_profile:
            return True

        key = field_name.replace(" ", "_").lower()
        return not current_profile.get(key)

    def merge_profiles(
        self,
        old_profile: Optional[Dict],
        new_data: Dict,
        override_old: bool = False
    ) -> Dict:
        """
        Merge new extracted data with existing profile.
        Only updates if new data has higher confidence or old was missing.
        """
        if not old_profile:
            return new_data

        merged = old_profile.copy()

        for field, data in new_data.items():
            if field == "last_updated":
                merged[field] = data
                continue

            if field not in merged:
                # New field
                merged[field] = data
            else:
                # Field exists - only update if new has higher confidence
                old_confidence = self._get_confidence_score(merged[field])
                new_confidence = self._get_confidence_score(data)

                if new_confidence > old_confidence or override_old:
                    merged[field] = data

        merged["last_updated"] = datetime.utcnow().isoformat()
        return merged

    @staticmethod
    def _get_confidence_score(data: Dict) -> int:
        """Convert confidence level to numeric score for comparison."""
        confidence_map = {"high": 3, "medium": 2, "low": 1}
        if isinstance(data, dict) and "confidence" in data:
            return confidence_map.get(data["confidence"], 1)
        return 0


class ConversationAnalyzer:
    """
    Analyze full conversations to extract patterns and build profiles.
    Used after multiple messages to identify trends.
    """

    def __init__(self, domain: str):
        self.domain = domain
        self.extractor = ProfileExtractor(domain)

    def analyze_conversation(self, messages: list) -> Dict[str, Any]:
        """
        Analyze a full conversation (message history) for profile data.
        Input: list of {"role": "user"/"assistant", "content": "..."}
        """
        user_messages = [m for m in messages if m.get("role") == "user"]
        profile = {}

        # Extract from each message, merging profiles
        for msg in user_messages:
            extracted = self.extractor.extract_from_message(msg.get("content", ""))
            profile = self.extractor.merge_profiles(profile, extracted)

        return profile

    def get_profile_summary(self, profile: Dict) -> str:
        """
        Create a human-readable summary of the extracted profile.
        Used in system prompts to show AI what we know about the user.
        """
        if not profile:
            return "No profile information extracted yet."

        lines = []

        if profile.get("intensity"):
            intensity = profile["intensity"]["value"]
            lines.append(f"Stress intensity: {intensity}/5")

        if profile.get("main_stressors"):
            stressors = profile["main_stressors"]["value"]
            if isinstance(stressors, list):
                lines.append(f"Key stressors: {', '.join(stressors)}")
            else:
                lines.append(f"Main stressor: {stressors}")

        if profile.get("burnout_frequency"):
            burnout = profile["burnout_frequency"]["value"]
            lines.append(f"Burnout level: {burnout}")

        if profile.get("sleep_hours"):
            sleep = profile["sleep_hours"]["value"]
            lines.append(f"Sleep during stressful periods: {sleep}")

        lines.append(f"Last assessed: {profile.get('last_updated', 'unknown')}")

        return "\n".join(lines)
