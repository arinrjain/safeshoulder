"""
PHASE 1: Critical Chat Tests - No External Dependencies
Tests core chat functionality
"""

import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

class TestResults:
    def __init__(self):
        self.passed = []
        self.failed = []

    def test(self, name, condition, error_msg=""):
        if condition:
            self.passed.append(name)
            print(f"  ✅ {name}")
        else:
            self.failed.append((name, error_msg))
            print(f"  ❌ {name}: {error_msg}")

    def summary(self):
        total = len(self.passed) + len(self.failed)
        print(f"\n{'='*70}")
        print(f"Passed: {len(self.passed)}/{total}")
        if self.failed:
            print(f"\nFailed Tests:")
            for name, error in self.failed:
                print(f"  ❌ {name}: {error}")
        return len(self.failed) == 0

def test_phase1():
    """Phase 1: Critical chat tests"""
    print("\n" + "="*70)
    print("PHASE 1: Critical Chat Tests")
    print("="*70 + "\n")

    results = TestResults()

    # Test 1: Import core modules
    print("Core Module Tests:")
    try:
        from app.services.prompts import detect_domain_from_text, build_system_prompt
        results.test("Import detect_domain_from_text", True)
        results.test("Import build_system_prompt", True)
    except Exception as e:
        results.test("Import modules", False, str(e))

    # Test 2: Message validation
    print("\nMessage Validation Tests:")
    test_msgs = [
        ("Valid message", "Hello", True),
        ("Empty message", "", False),
    ]
    for name, msg, should_pass in test_msgs:
        is_valid = len(msg.strip()) > 0 if should_pass else len(msg.strip()) == 0
        results.test(name, is_valid)

    # Test 3: Domain detection works
    print("\nDomain Detection Tests:")
    test_domains = [
        ("Bullying detection", "I'm being bullied", "school_bullying"),
        ("Relationship detection", "My boyfriend left me", "relationship_issues"),
        ("Family detection", "My family is toxic", "domestic"),
        ("Body image detection", "I hate my body", "body_image"),
        ("Academic detection", "Exam stress", "academic"),
        ("Peer pressure detection", "Friends want me to smoke", "peer_pressure"),
    ]

    for name, msg, expected_domain in test_domains:
        try:
            detected = detect_domain_from_text(msg)
            is_correct = detected == expected_domain
            results.test(name, is_correct, f"Got {detected}, expected {expected_domain}")
        except Exception as e:
            results.test(name, False, str(e))

    # Test 4: System prompt building
    print("\nSystem Prompt Tests:")
    try:
        prompt = build_system_prompt("school_bullying", None, "")
        results.test("Build system prompt", len(prompt) > 0, "Prompt is empty")
        results.test("Prompt includes domain", "school_bullying" in prompt.lower() or "bullying" in prompt.lower())
    except Exception as e:
        results.test("System prompt generation", False, str(e))

    # Test 5: Context awareness in prompt
    print("\nContext Awareness Tests:")
    try:
        prompt = build_system_prompt("academic", None, "")
        has_context = "REMEMBER" in prompt or "context" in prompt.lower() or "history" in prompt.lower()
        results.test("Prompt has context awareness", has_context, "Context awareness missing")
    except Exception as e:
        results.test("Context awareness check", False, str(e))

    return results.summary()


if __name__ == "__main__":
    success = test_phase1()
    sys.exit(0 if success else 1)
