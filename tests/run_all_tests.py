#!/usr/bin/env python3
"""
Run all SafeShoulder functional tests.
Execute after every deployment or code change.

Usage:
    python tests/run_all_tests.py
    python tests/run_all_tests.py --suite onboarding    # Run specific suite
    python tests/run_all_tests.py --suite chat
    python tests/run_all_tests.py --suite admin
"""

import os
import sys
import subprocess
from datetime import datetime

# Test suites
SUITES = ["onboarding", "chat", "admin"]


def log(message, level="INFO"):
    """Log output."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    prefix = {
        "INFO": "ℹ️",
        "SUCCESS": "✅",
        "ERROR": "❌",
        "WARN": "⚠️",
    }.get(level, "•")
    print(f"[{timestamp}] {prefix} {message}")


def run_test_suite(suite_name):
    """Run a single test suite."""
    log(f"Running {suite_name.upper()} tests...", "INFO")

    test_file = f"test_{suite_name}.py"
    result = subprocess.run([sys.executable, test_file], cwd=os.path.dirname(__file__))

    return result.returncode == 0


def main():
    """Run all test suites."""
    log("=" * 70, "INFO")
    log("SafeShoulder Functional Test Suite", "INFO")
    log(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", "INFO")
    log("=" * 70, "INFO")

    # Parse arguments
    suite_filter = None
    if len(sys.argv) > 1:
        if sys.argv[1] == "--suite" and len(sys.argv) > 2:
            suite_filter = sys.argv[2].lower()
            if suite_filter not in SUITES:
                log(f"Unknown suite: {suite_filter}", "ERROR")
                log(f"Available suites: {', '.join(SUITES)}", "INFO")
                return 1

    # Run tests
    results = {}
    suites_to_run = [suite_filter] if suite_filter else SUITES

    for suite in suites_to_run:
        log("", "INFO")
        success = run_test_suite(suite)
        results[suite] = success
        log("", "INFO")

    # Summary
    log("=" * 70, "INFO")
    log("Overall Summary", "INFO")
    log("=" * 70, "INFO")

    passed = sum(1 for v in results.values() if v)
    failed = sum(1 for v in results.values() if not v)

    for suite, success in results.items():
        status = "✅ PASSED" if success else "❌ FAILED"
        log(f"  {suite.upper():15} {status}", "SUCCESS" if success else "ERROR")

    log("", "INFO")
    log(f"Total: {passed} passed, {failed} failed", "SUCCESS" if failed == 0 else "ERROR")
    log("=" * 70, "INFO")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
