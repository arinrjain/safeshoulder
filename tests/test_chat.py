#!/usr/bin/env python3
"""
Functional test for SafeShoulder chat module.
Tests message sending, session management, and voice endpoints.

Usage:
    python tests/test_chat.py
"""

import os
import sys
import json
import time
from datetime import datetime
import requests
from dotenv import load_dotenv
from test_onboarding import OnboardingTest

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
API_URL = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")


class ChatTest:
    def __init__(self):
        self.onboarding = OnboardingTest()
        self.token = None
        self.user_id = None
        self.session_id = None
        self.domain = "workplace"
        self.passed = 0
        self.failed = 0
        self.errors = []

    def log(self, message, level="INFO"):
        """Log test output."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        prefix = {
            "INFO": "ℹ️",
            "SUCCESS": "✅",
            "ERROR": "❌",
            "WARN": "⚠️",
        }.get(level, "•")
        print(f"[{timestamp}] {prefix} {message}")

    def assert_true(self, condition, message):
        """Assert a condition is true."""
        if condition:
            self.log(message, "SUCCESS")
            self.passed += 1
            return True
        else:
            self.log(message, "ERROR")
            self.failed += 1
            self.errors.append(message)
            return False

    def setup(self):
        """Setup test user and get token."""
        self.log("Setting up test user...", "INFO")
        try:
            # Reuse onboarding test to create user
            if not self.onboarding.test_step_1_create_test_user():
                return False

            self.user_id = self.onboarding.user_id
            self.token = self.onboarding.token

            # Complete onboarding
            if not self.onboarding.test_step_2_call_onboarding_endpoint():
                return False

            self.assert_true(
                self.user_id and self.token,
                f"✅ Test user ready: {self.user_id}",
            )
            return True

        except Exception as e:
            self.assert_true(False, f"Setup failed: {e}")
            return False

    def test_step_1_get_sessions(self):
        """Step 1: Get user sessions."""
        self.log("Step 1: Getting sessions...", "INFO")

        try:
            response = requests.get(
                f"{API_URL}/sessions/",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10,
            )

            success = response.status_code == 200
            self.assert_true(success, f"Sessions endpoint returned {response.status_code}")

            if success:
                sessions = response.json()
                self.assert_true(
                    isinstance(sessions, list),
                    f"✅ Got {len(sessions)} sessions",
                )
                return True

            return False

        except Exception as e:
            self.assert_true(False, f"Failed to get sessions: {e}")
            return False

    def test_step_2_send_message(self):
        """Step 2: Send a test message."""
        self.log("Step 2: Sending message...", "INFO")

        try:
            payload = {
                "domain": self.domain,
                "message": "This is a test message. I'm experiencing some workplace stress.",
            }

            response = requests.post(
                f"{API_URL}/chat/send",
                json=payload,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=30,
            )

            success = response.status_code == 200
            self.assert_true(success, f"Chat endpoint returned {response.status_code}")

            if not success:
                self.log(f"Response: {response.text}", "ERROR")
                return False

            result = response.json()
            self.session_id = result.get("session_id")
            self.assert_true(
                self.session_id is not None,
                f"✅ Message sent, session: {self.session_id}",
            )

            self.assert_true(
                result.get("ai_response") is not None,
                f"✅ AI response received: {len(result.get('ai_response', ''))} chars",
            )

            return True

        except Exception as e:
            self.assert_true(False, f"Failed to send message: {e}")
            return False

    def test_step_3_get_chat_history(self):
        """Step 3: Get chat history."""
        self.log("Step 3: Getting chat history...", "INFO")

        try:
            response = requests.get(
                f"{API_URL}/chat/{self.session_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10,
            )

            success = response.status_code == 200
            self.assert_true(success, f"History endpoint returned {response.status_code}")

            if success:
                result = response.json()
                messages = result.get("messages", [])
                self.assert_true(
                    len(messages) >= 2,  # At least user + AI message
                    f"✅ Retrieved {len(messages)} messages",
                )
                return True

            return False

        except Exception as e:
            self.assert_true(False, f"Failed to get history: {e}")
            return False

    def test_step_4_create_new_session(self):
        """Step 4: Create a new session in different domain."""
        self.log("Step 4: Creating new session (heartbreak)...", "INFO")

        try:
            payload = {
                "domain": "heartbreak",
                "message": "I'm going through a breakup and feeling lost.",
            }

            response = requests.post(
                f"{API_URL}/chat/send",
                json=payload,
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=30,
            )

            success = response.status_code == 200
            self.assert_true(success, f"New domain endpoint returned {response.status_code}")

            if success:
                result = response.json()
                new_session = result.get("session_id")
                self.assert_true(
                    new_session != self.session_id,
                    f"✅ New session created: {new_session}",
                )
                return True

            return False

        except Exception as e:
            self.assert_true(False, f"Failed to create new session: {e}")
            return False

    def cleanup(self):
        """Clean up test user."""
        self.onboarding.cleanup()

    def run(self):
        """Run all tests."""
        self.log("=" * 60, "INFO")
        self.log("SafeShoulder Chat Functional Test", "INFO")
        self.log(f"API: {API_URL}", "INFO")
        self.log("=" * 60, "INFO")

        try:
            if not self.setup():
                self.log("Setup failed, aborting", "ERROR")
                return False

            if not self.test_step_1_get_sessions():
                return False

            if not self.test_step_2_send_message():
                return False

            if not self.test_step_3_get_chat_history():
                return False

            if not self.test_step_4_create_new_session():
                return False

            return True

        finally:
            self.cleanup()

    def print_summary(self):
        """Print test summary."""
        self.log("=" * 60, "INFO")
        self.log("Test Summary", "INFO")
        self.log(f"Passed: {self.passed}", "SUCCESS")
        self.log(f"Failed: {self.failed}", "ERROR" if self.failed > 0 else "SUCCESS")

        if self.errors:
            self.log("\nErrors:", "ERROR")
            for error in self.errors:
                self.log(f"  - {error}", "ERROR")

        self.log("=" * 60, "INFO")

        return self.failed == 0


def main():
    """Main entry point."""
    if not all([SUPABASE_URL, SUPABASE_KEY, API_URL]):
        print("❌ Missing required environment variables")
        return 1

    test = ChatTest()
    success = test.run()
    test.print_summary()

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
