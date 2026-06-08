#!/usr/bin/env python3
"""
Functional test for SafeShoulder admin module.
Tests user management: listing, blocking, unblocking, and deleting users.

Usage:
    python tests/test_admin.py
"""

import os
import sys
import json
import time
from datetime import datetime
import requests
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
API_URL = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")

# Admin credentials (must be one of the admin emails)
ADMIN_EMAIL = "arinrjain@gmail.com"
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")  # Set in .env


class AdminTest:
    def __init__(self):
        self.admin_token = None
        self.test_user_id = None
        self.test_user_email = None
        self.passed = 0
        self.failed = 0
        self.errors = []
        self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

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
        """Setup admin user and create test user."""
        self.log("Setting up admin test...", "INFO")

        try:
            # Create test user (non-admin)
            self.test_user_email = f"test-admin-{int(time.time())}@safeshoulder.local"
            result = self.supabase.auth.admin.create_user(
                {
                    "email": self.test_user_email,
                    "password": "Test@123456",
                    "email_confirm": True,
                }
            )
            self.test_user_id = result.user.id

            # Get admin token by signing in
            if not ADMIN_PASSWORD:
                self.log("⚠️ ADMIN_PASSWORD not set, skipping admin tests", "WARN")
                return False

            auth_result = self.supabase.auth.sign_in_with_password({
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD,
            })
            self.admin_token = auth_result.session.access_token

            self.assert_true(
                self.test_user_id and self.admin_token,
                f"✅ Setup complete: admin token + test user",
            )
            return True

        except Exception as e:
            self.assert_true(False, f"Setup failed: {e}")
            return False

    def test_step_1_list_users(self):
        """Step 1: List all users."""
        self.log("Step 1: Listing users...", "INFO")

        try:
            response = requests.get(
                f"{API_URL}/admin/users",
                headers={"Authorization": f"Bearer {self.admin_token}"},
                timeout=10,
            )

            success = response.status_code == 200
            self.assert_true(success, f"List users endpoint returned {response.status_code}")

            if success:
                result = response.json()
                users = result.get("users", [])
                self.assert_true(
                    isinstance(users, list),
                    f"✅ Retrieved {len(users)} users",
                )

                # Find our test user in the list
                test_user = next(
                    (u for u in users if u["id"] == self.test_user_id), None
                )
                self.assert_true(
                    test_user is not None,
                    f"✅ Test user found in list",
                )

                return True

            return False

        except Exception as e:
            self.assert_true(False, f"Failed to list users: {e}")
            return False

    def test_step_2_block_user(self):
        """Step 2: Block a user."""
        self.log("Step 2: Blocking user...", "INFO")

        try:
            response = requests.post(
                f"{API_URL}/admin/users/{self.test_user_id}/block",
                headers={"Authorization": f"Bearer {self.admin_token}"},
                timeout=10,
            )

            success = response.status_code == 200
            self.assert_true(success, f"Block endpoint returned {response.status_code}")

            if success:
                result = response.json()
                self.assert_true(
                    "blocked successfully" in result.get("message", "").lower(),
                    f"✅ User blocked",
                )
                return True

            return False

        except Exception as e:
            self.assert_true(False, f"Failed to block user: {e}")
            return False

    def test_step_3_verify_blocked(self):
        """Step 3: Verify user is blocked in list."""
        self.log("Step 3: Verifying user is blocked...", "INFO")

        try:
            response = requests.get(
                f"{API_URL}/admin/users",
                headers={"Authorization": f"Bearer {self.admin_token}"},
                timeout=10,
            )

            if response.status_code != 200:
                return False

            users = response.json().get("users", [])
            test_user = next((u for u in users if u["id"] == self.test_user_id), None)

            self.assert_true(
                test_user and test_user.get("is_blocked"),
                f"✅ User is_blocked flag = True",
            )

            return True

        except Exception as e:
            self.assert_true(False, f"Failed to verify blocked status: {e}")
            return False

    def test_step_4_unblock_user(self):
        """Step 4: Unblock the user."""
        self.log("Step 4: Unblocking user...", "INFO")

        try:
            response = requests.post(
                f"{API_URL}/admin/users/{self.test_user_id}/unblock",
                headers={"Authorization": f"Bearer {self.admin_token}"},
                timeout=10,
            )

            success = response.status_code == 200
            self.assert_true(success, f"Unblock endpoint returned {response.status_code}")

            if success:
                result = response.json()
                self.assert_true(
                    "unblocked successfully" in result.get("message", "").lower(),
                    f"✅ User unblocked",
                )
                return True

            return False

        except Exception as e:
            self.assert_true(False, f"Failed to unblock user: {e}")
            return False

    def test_step_5_delete_user(self):
        """Step 5: Delete the user."""
        self.log("Step 5: Deleting user...", "INFO")

        try:
            response = requests.delete(
                f"{API_URL}/admin/users/{self.test_user_id}",
                headers={"Authorization": f"Bearer {self.admin_token}"},
                timeout=10,
            )

            success = response.status_code == 200
            self.assert_true(success, f"Delete endpoint returned {response.status_code}")

            if success:
                result = response.json()
                self.assert_true(
                    "deleted successfully" in result.get("message", "").lower(),
                    f"✅ User deleted",
                )
                return True

            return False

        except Exception as e:
            self.assert_true(False, f"Failed to delete user: {e}")
            return False

    def cleanup(self):
        """Clean up test user if not already deleted."""
        try:
            if self.test_user_id:
                self.supabase.table("users").delete().eq("id", self.test_user_id).execute()
                self.supabase.auth.admin.delete_user(self.test_user_id)
                self.log(f"Cleaned up test user", "INFO")
        except:
            pass  # User might already be deleted

    def run(self):
        """Run all tests."""
        self.log("=" * 60, "INFO")
        self.log("SafeShoulder Admin Functional Test", "INFO")
        self.log(f"API: {API_URL}", "INFO")
        self.log(f"Admin: {ADMIN_EMAIL}", "INFO")
        self.log("=" * 60, "INFO")

        try:
            if not self.setup():
                self.log("Setup failed, skipping admin tests", "WARN")
                return False

            if not self.test_step_1_list_users():
                return False

            if not self.test_step_2_block_user():
                return False

            if not self.test_step_3_verify_blocked():
                return False

            if not self.test_step_4_unblock_user():
                return False

            if not self.test_step_5_delete_user():
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

    if not ADMIN_PASSWORD:
        print("⚠️ ADMIN_PASSWORD not set in .env - skipping admin tests")
        print("   To test admin features, set ADMIN_PASSWORD in .env")
        return 0

    test = AdminTest()
    success = test.run()
    test.print_summary()

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
