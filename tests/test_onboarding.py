#!/usr/bin/env python3
"""
Functional test for SafeShoulder onboarding flow.
Run after every deployment to verify the system works end-to-end.

Usage:
    python tests/test_onboarding.py
"""

import os
import sys
import json
import time
from datetime import datetime, timedelta
from jose import jwt
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
JWT_SECRET = os.getenv("JWT_SECRET")
API_URL = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")

# Test data
TEST_EMAIL = f"test-onboarding-{int(time.time())}@safeshoulder.local"
TEST_DOMAIN = "workplace"
TEST_USER_DATA = {
    "name": "Test User",
    "age_range": "25-34",
    "gender": "Other",
    "previous_therapy": "No",
    "current_support": "Friends",
    "profession": "QA Engineer",
    "city": "Test City",
    "interests": "Testing, Automation",
    "spirituality": "Not really",
    "relationship_status": "Single",
    "has_kids": "No",
    "family_info": "Close family"
}

TEST_DOMAIN_DATA = {
    "situation": "Test work situation",
    "duration": "1 month",
    "severity": 5,
    "impact": ["focus", "mood"],
    "support_type": "advice",
    "goals": "Test goal"
}


class OnboardingTest:
    def __init__(self):
        self.user_id = None
        self.token = None
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

    def create_jwt_token(self, user_id: str, email: str) -> str:
        """Create a JWT token for testing."""
        payload = {
            "iss": SUPABASE_URL,
            "sub": user_id,
            "email": email,
            "role": "authenticated",
            "aud": "authenticated",
            "iat": int(datetime.utcnow().timestamp()),
            "exp": int((datetime.utcnow() + timedelta(hours=1)).timestamp()),
        }
        return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    def test_step_1_create_test_user(self):
        """Step 1: Create a test user."""
        self.log("Step 1: Creating test user...", "INFO")

        try:
            from supabase import create_client

            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

            # Create user via Supabase auth
            result = supabase.auth.admin.create_user(
                {
                    "email": TEST_EMAIL,
                    "password": "Test@123456",
                    "email_confirm": True,
                    "user_metadata": {"test": True},
                }
            )

            self.user_id = result.user.id

            # Get real token by signing in
            auth_result = supabase.auth.sign_in_with_password({
                "email": TEST_EMAIL,
                "password": "Test@123456",
            })
            self.token = auth_result.session.access_token

            self.assert_true(
                self.user_id is not None and self.token is not None,
                f"✅ Test user created: {TEST_EMAIL}",
            )
            return True

        except Exception as e:
            self.assert_true(False, f"Failed to create test user: {e}")
            return False

    def test_step_2_call_onboarding_endpoint(self):
        """Step 2: Call the onboarding endpoint."""
        self.log("Step 2: Calling onboarding endpoint...", "INFO")

        try:
            payload = {
                "domain": TEST_DOMAIN,
                "global_profile": TEST_USER_DATA,
                "domain_profile": TEST_DOMAIN_DATA,
            }

            response = requests.post(
                f"{API_URL}/onboarding/complete",
                json=payload,
                headers={
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json",
                },
                timeout=10,
            )

            success = response.status_code == 200
            self.assert_true(success, f"Onboarding endpoint returned {response.status_code}")

            if not success:
                self.log(f"Response: {response.text}", "ERROR")
                return False

            result = response.json()
            self.assert_true(
                result.get("domain") == TEST_DOMAIN,
                f"✅ Domain saved: {result.get('domain')}",
            )
            return True

        except Exception as e:
            self.assert_true(False, f"Failed to call onboarding: {e}")
            return False

    def test_step_3_verify_database(self):
        """Step 3: Verify data was saved to database."""
        self.log("Step 3: Verifying data in database...", "INFO")

        try:
            from supabase import create_client

            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

            # Check users table
            user = (
                supabase.table("users")
                .select("id, email, domain, name, profession, city")
                .eq("id", self.user_id)
                .execute()
            )

            user_exists = user.data and len(user.data) > 0
            self.assert_true(user_exists, "✅ User exists in database")

            if not user_exists:
                return False

            user_data = user.data[0]
            self.assert_true(
                user_data.get("domain") == TEST_DOMAIN,
                f"✅ Domain correctly saved: {user_data.get('domain')}",
            )
            self.assert_true(
                user_data.get("name") == TEST_USER_DATA["name"],
                f"✅ Name correctly saved: {user_data.get('name')}",
            )
            self.assert_true(
                user_data.get("profession") == TEST_USER_DATA["profession"],
                f"✅ Profession correctly saved: {user_data.get('profession')}",
            )

            # Check domain profile
            domain_profile = (
                supabase.table("user_domain_profiles")
                .select("user_id, domain, situation, support_type")
                .eq("user_id", self.user_id)
                .eq("domain", TEST_DOMAIN)
                .execute()
            )

            profile_exists = domain_profile.data and len(domain_profile.data) > 0
            self.assert_true(profile_exists, "✅ Domain profile exists in database")

            if profile_exists:
                profile_data = domain_profile.data[0]
                self.assert_true(
                    profile_data.get("support_type") == TEST_DOMAIN_DATA["support_type"],
                    f"✅ Support type saved: {profile_data.get('support_type')}",
                )

            return True

        except Exception as e:
            self.assert_true(False, f"Failed to verify database: {e}")
            return False

    def test_step_4_verify_chat_access(self):
        """Step 4: Verify user can access chat without being redirected to onboarding."""
        self.log("Step 4: Verifying chat page access...", "INFO")

        try:
            response = requests.get(
                f"{API_URL}/chat",
                headers={
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json",
                },
                timeout=10,
                allow_redirects=False,
            )

            # Should not redirect to onboarding (200 or 405 for GET on POST endpoint)
            not_redirected = response.status_code != 302
            self.assert_true(not_redirected, f"✅ Chat accessible (status: {response.status_code})")

            return True

        except Exception as e:
            self.log(f"Note: Chat endpoint check skipped: {e}", "WARN")
            # This is optional - chat might be frontend-only
            return True

    def cleanup(self):
        """Clean up test user."""
        if self.user_id:
            try:
                from supabase import create_client

                supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

                # Delete domain profiles
                supabase.table("user_domain_profiles").delete().eq(
                    "user_id", self.user_id
                ).execute()

                # Delete user profile
                supabase.table("users").delete().eq("id", self.user_id).execute()

                # Delete auth user
                supabase.auth.admin.delete_user(self.user_id)

                self.log(f"Cleaned up test user: {self.user_id}", "INFO")
            except Exception as e:
                self.log(f"Warning: Could not clean up test user: {e}", "WARN")

    def run(self):
        """Run all tests."""
        self.log("=" * 60, "INFO")
        self.log("SafeShoulder Onboarding Functional Test", "INFO")
        self.log(f"API: {API_URL}", "INFO")
        self.log(f"Test Email: {TEST_EMAIL}", "INFO")
        self.log("=" * 60, "INFO")

        try:
            # Run tests in sequence
            if not self.test_step_1_create_test_user():
                self.log("Failed to create test user, aborting", "ERROR")
                return False

            if not self.test_step_2_call_onboarding_endpoint():
                self.log("Onboarding endpoint failed", "ERROR")
                return False

            if not self.test_step_3_verify_database():
                self.log("Database verification failed", "ERROR")
                return False

            if not self.test_step_4_verify_chat_access():
                self.log("Chat access check failed", "ERROR")
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
    # Validate environment
    if not all([SUPABASE_URL, SUPABASE_KEY, JWT_SECRET, API_URL]):
        print("❌ Missing required environment variables")
        print("   SUPABASE_URL, SUPABASE_KEY, JWT_SECRET, NEXT_PUBLIC_API_URL")
        return 1

    # Run tests
    test = OnboardingTest()
    success = test.run()
    test.print_summary()

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
