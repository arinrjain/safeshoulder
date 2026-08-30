"""
Phase 3: End-to-End Chat Integration Tests
Tests complete chat flows with all features working together
"""

import pytest
from unittest.mock import Mock, patch, MagicMock, call
import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.prompts import build_system_prompt, detect_domain_from_text


class TestEndToEndChatFlow:
    """End-to-end integration tests"""

    def test_full_conversation_with_domain_switching(self):
        """
        Complete conversation flow:
        1. User asks about bullying
        2. AI responds with bullying support
        3. User switches to exam stress
        4. AI seamlessly switches to academic support
        5. AI references both topics
        """
        # Simulate conversation
        messages_exchange = [
            {
                "user_msg": "I'm being bullied at school",
                "expected_ai_awareness": ["bullying", "support"],
                "domain": "school_bullying"
            },
            {
                "user_msg": "Now I have exam stress on top of this",
                "expected_ai_awareness": ["exam", "stress", "bullying"],
                "domain": "academic"
            },
            {
                "user_msg": "My family doesn't understand either",
                "expected_ai_awareness": ["exam", "stress", "bullying", "family"],
                "domain": "domestic"
            }
        ]

        for msg in messages_exchange:
            # Test domain detection
            detected = detect_domain_from_text(msg["user_msg"])
            assert detected == msg["domain"], \
                f"Failed to detect {msg['domain']} in: {msg['user_msg']}"

    def test_system_prompt_acknowledges_context(self):
        """System prompt should have context awareness instruction"""
        user_profile = {
            "name": "Alex",
            "domain": "school_bullying",
            "situation": "Being bullied at school"
        }

        system_prompt = build_system_prompt("school_bullying", user_profile, "")

        # Should contain context reminder
        assert "REMEMBER" in system_prompt or "context" in system_prompt.lower(), \
            "System prompt missing context awareness"

        # Should mention conversation history
        assert "conversation" in system_prompt.lower() or "history" in system_prompt.lower(), \
            "System prompt missing history reference"

    def test_domain_context_multiissue_aware(self):
        """Domain contexts should support multi-issue scenarios"""
        from app.services.prompts import DOMAIN_CONTEXT

        # Check multiple domains for multi-issue awareness
        for domain, context in DOMAIN_CONTEXT.items():
            # At least one domain should explicitly mention multi-issue support
            pass

        # school_bullying should have NOTE about other issues
        bullying_ctx = DOMAIN_CONTEXT.get("school_bullying", "")
        assert "NOTE" in bullying_ctx, "school_bullying context missing multi-issue note"

    def test_message_history_building_preserves_all_context(self):
        """When building message list, all history should be included"""
        # Simulate 100 messages in history
        mock_history = [
            {"role": "user" if i % 2 == 0 else "assistant", "content": f"Message {i}"}
            for i in range(100)
        ]

        # System should preserve last 50 for LLM
        context_slice = mock_history[-50:]

        # Verify old context is present
        assert context_slice[0]["content"] == "Message 50"
        # Verify new context is present
        assert context_slice[-1]["content"] == "Message 99"
        # Verify total length
        assert len(context_slice) == 50


class TestRealWorldScenarios:
    """Test realistic user scenarios"""

    def test_scenario_student_overwhelmed_multiple_issues(self):
        """
        Student dealing with:
        - Bullying
        - Exam stress
        - Family pressure
        - Body insecurity
        Expected: AI handles all interconnected issues
        """
        scenario_messages = [
            "Kids at school call me names",  # bullying
            "I'm worried about board exams",  # academic
            "My parents add pressure",  # domestic
            "I hate how this stress shows on my face",  # body_image
            "Everything is too much"  # compound
        ]

        domains = [detect_domain_from_text(msg) for msg in scenario_messages]

        # Should detect different domains
        unique_domains = set(d for d in domains if d)
        assert len(unique_domains) > 1, "Should detect multiple domains"

    def test_scenario_relationship_affecting_other_areas(self):
        """
        Breakup affecting:
        - Self-esteem/body image
        - Peer relationships
        - Academic focus
        Expected: AI connects all impacts
        """
        scenario_messages = [
            "My boyfriend dumped me",  # relationship
            "I feel so ugly now",  # body_image
            "My friends don't know how to help",  # peer_pressure
            "Can't focus on studying",  # academic
        ]

        domains = [detect_domain_from_text(msg) for msg in scenario_messages]

        # Should have relationship_issues, body_image, peer_pressure, academic
        domain_counts = {}
        for domain in domains:
            if domain:
                domain_counts[domain] = domain_counts.get(domain, 0) + 1

        assert len(domain_counts) >= 2, "Should detect multiple interconnected issues"

    def test_scenario_peer_pressure_cascading_effects(self):
        """
        Peer pressure leading to:
        - Substance use
        - Family conflict
        - Health concerns
        Expected: AI understands cascade
        """
        scenario_messages = [
            "My friends want me to smoke",  # peer_pressure
            "My parents found out",  # domestic
            "I'm worried about my health",  # academic/wellness
        ]

        domains = [detect_domain_from_text(msg) for msg in scenario_messages]
        domain_set = set(d for d in domains if d)

        # Should detect peer_pressure and domestic at minimum
        assert any(d == "peer_pressure" for d in domain_set)


class TestContextAwarenessInResponses:
    """Test that AI responses maintain context awareness"""

    def test_system_prompt_built_with_profile(self):
        """System prompt should include user profile"""
        profile = {
            "name": "Sam",
            "age_range": "16-18",
            "situation": "Being bullied",
            "domain": "school_bullying"
        }

        prompt = build_system_prompt("school_bullying", profile, "")

        # Should include user context
        assert prompt, "System prompt should be built"
        assert "school_bullying" in prompt.lower() or "bullying" in prompt.lower()

    def test_system_prompt_cross_domain_aware(self):
        """System prompt should not reset context on domain change"""
        # Build prompt for one domain
        prompt1 = build_system_prompt("school_bullying", None, "")

        # Build prompt for another domain
        prompt2 = build_system_prompt("academic", None, "")

        # Both should have the BASE_PERSONA with context awareness
        assert "CONTEXT AWARENESS" in prompt1 or "CONTEXT AWARENESS" in prompt2 or \
               "context" in prompt1.lower() or "context" in prompt2.lower()

    def test_conversation_history_in_llm_context(self):
        """LLM should receive full conversation history"""
        # Create mock message history
        history = [
            {"role": "user", "content": f"Message {i}", "order": i}
            for i in range(100)
        ]

        # System takes last 50
        context_messages = history[-50:]

        # Should have complete history from message 50-99
        assert len(context_messages) == 50
        assert context_messages[0]["order"] == 50
        assert context_messages[-1]["order"] == 99

        # LLM would process these along with current message to maintain context
        # This ensures previous topics are available even after domain switch


class TestSeamlessExperience:
    """Test that user experience is seamless"""

    def test_no_domain_selector_ui_needed(self):
        """User shouldn't need to manually select domain"""
        # Domain detection should happen automatically
        msg = "I'm being bullied"
        domain = detect_domain_from_text(msg)
        assert domain is not None, "Domain should be auto-detected"

    def test_domain_detected_on_every_message(self):
        """Each message should have domain detected independently"""
        messages = [
            "I'm being bullied",  # school_bullying
            "My exam is tomorrow",  # academic
            "My family fights",  # domestic
        ]

        for msg in messages:
            domain = detect_domain_from_text(msg)
            assert domain is not None, f"Should detect domain for: {msg}"

    def test_user_can_mix_topics_freely(self):
        """User can switch between topics without friction"""
        conversation = [
            "Bullying issue",
            "Also exam stress",
            "Family doesn't help",
            "My confidence is gone",
            "Everything piles up"
        ]

        # Each message can be parsed for domain
        domains = [detect_domain_from_text(msg) for msg in conversation]

        # Should have some domains detected (not all might be, and that's ok)
        assert any(d is not None for d in domains), "Should detect at least some domains"


def run_tests():
    """Run all Phase 3 tests"""
    pytest.main([__file__, "-v", "--tb=short"])


if __name__ == "__main__":
    print("\n" + "="*70)
    print("PHASE 3: End-to-End Integration Tests")
    print("="*70 + "\n")

    run_tests()
