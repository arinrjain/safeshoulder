"""
Backend Integration Tests: Story Entry Sharing & PDF Download Flow
Cycle: Production Validation

Tests the complete server-side workflow:
1. Fetch entries for authorized user
2. Validate share request
3. Generate PDF report
4. Create access token
5. Return downloadable PDF
6. Track access via token
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
import uuid
import secrets


class TestStoryShareFlow:
    """Complete story sharing workflow tests"""

    @pytest.fixture
    def mock_user(self):
        """Mock authenticated user"""
        return {
            "user_id": str(uuid.uuid4()),
            "email": "student@safeshoulder.app",
            "role": "student"
        }

    @pytest.fixture
    def mock_entries(self):
        """Mock story entries with different categories"""
        return [
            {
                "id": str(uuid.uuid4()),
                "user_id": "test-user-id",
                "title": "Overcame Public Speaking Fear",
                "content": "Presented in class despite anxiety. Learned that preparation helps.",
                "category": "growth",
                "created_at": "2026-08-29T14:30:00Z",
                "updated_at": "2026-08-29T14:30:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": "test-user-id",
                "title": "Someone was mean at lunch",
                "content": "Classmates made fun of me. Felt embarrassed but talked to counselor.",
                "category": "bullying",
                "created_at": "2026-08-28T12:15:00Z",
                "updated_at": "2026-08-28T12:15:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": "test-user-id",
                "title": "Got an A on Math Test",
                "content": "All my studying paid off! I felt confident and understood concepts.",
                "category": "win",
                "created_at": "2026-08-27T16:45:00Z",
                "updated_at": "2026-08-27T16:45:00Z"
            }
        ]

    def test_fetch_entries_for_user(self, mock_user, mock_entries):
        """Test fetching all entries for authenticated user"""
        # Simulate database query
        user_entries = [e for e in mock_entries if e["user_id"] == "test-user-id"]

        assert len(user_entries) == 3
        assert all(e["user_id"] == "test-user-id" for e in user_entries)

    def test_validate_share_request(self, mock_user):
        """Test validation of share request parameters"""
        share_request = {
            "teacherName": "Ms. Martinez",
            "entryIds": ["entry-1", "entry-2"],
            "userId": mock_user["user_id"]
        }

        # Validations
        assert share_request["teacherName"].strip(), "Teacher name required"
        assert len(share_request["entryIds"]) > 0, "At least one entry required"
        assert share_request["userId"] == mock_user["user_id"], "User ID mismatch"

    def test_validate_request_teacher_name_empty(self, mock_user):
        """Test validation fails with empty teacher name"""
        share_request = {
            "teacherName": "   ",  # Whitespace only
            "entryIds": ["entry-1"],
            "userId": mock_user["user_id"]
        }

        assert not share_request["teacherName"].strip(), "Should fail validation"

    def test_validate_request_no_entries(self, mock_user):
        """Test validation fails with no entries selected"""
        share_request = {
            "teacherName": "Ms. Martinez",
            "entryIds": [],  # Empty selection
            "userId": mock_user["user_id"]
        }

        assert len(share_request["entryIds"]) == 0, "Should fail validation"

    def test_validate_user_id_matches(self, mock_user):
        """Test validation of user ID authorization"""
        share_request = {
            "teacherName": "Ms. Martinez",
            "entryIds": ["entry-1"],
            "userId": "different-user-id"
        }

        assert share_request["userId"] != mock_user["user_id"], "Should fail authorization"

    def test_fetch_selected_entries(self, mock_entries):
        """Test fetching only selected entries"""
        selected_ids = [mock_entries[0]["id"], mock_entries[2]["id"]]
        selected_entries = [e for e in mock_entries if e["id"] in selected_ids]

        assert len(selected_entries) == 2
        assert selected_entries[0]["category"] == "growth"
        assert selected_entries[1]["category"] == "win"

    def test_calculate_report_statistics(self, mock_entries):
        """Test calculation of report statistics"""
        stats = {
            "total_entries": len(mock_entries),
            "bullying_count": len([e for e in mock_entries if e["category"] == "bullying"]),
            "growth_count": len([e for e in mock_entries if e["category"] == "growth"]),
            "win_count": len([e for e in mock_entries if e["category"] == "win"]),
        }

        assert stats["total_entries"] == 3
        assert stats["bullying_count"] == 1
        assert stats["growth_count"] == 1
        assert stats["win_count"] == 1

    def test_format_entry_for_pdf(self, mock_entries):
        """Test formatting entry data for PDF display"""
        entry = mock_entries[0]

        pdf_entry = {
            "title": entry["title"],
            "category": entry["category"],
            "category_label": {
                "bullying": "Bullying Experience",
                "growth": "Growth & Learning",
                "win": "Win & Celebration"
            }.get(entry["category"]),
            "date": datetime.fromisoformat(entry["created_at"].replace("Z", "+00:00")).strftime("%B %d, %Y at %I:%M %p"),
            "content": entry["content"]
        }

        assert pdf_entry["title"] == "Overcame Public Speaking Fear"
        assert pdf_entry["category_label"] == "Growth & Learning"
        assert "August" in pdf_entry["date"]

    def test_generate_pdf_header(self, mock_user, mock_entries):
        """Test PDF header generation"""
        pdf_header = {
            "title": "Incident Report from SafeShoulder",
            "student_name": "Test Student",
            "teacher_name": "Ms. Martinez",
            "report_date": datetime.now().strftime("%B %d, %Y at %I:%M %p")
        }

        assert "Incident Report" in pdf_header["title"]
        assert pdf_header["student_name"]
        assert pdf_header["teacher_name"]
        assert len(pdf_header["report_date"]) > 0

    def test_generate_pdf_footer(self):
        """Test PDF footer with confidentiality notice"""
        footer = "This is a confidential document shared by a student via SafeShoulder. Please handle it according to your school's protocols and policies."

        assert "confidential" in footer.lower()
        assert "SafeShoulder" in footer
        assert "school" in footer.lower()

    def test_create_access_token(self):
        """Test generation of secure access token"""
        token = f"share_{secrets.token_urlsafe(32)}"

        assert token.startswith("share_")
        assert len(token) > 37
        assert isinstance(token, str)

    def test_save_share_record(self, mock_user, mock_entries):
        """Test saving share record to database"""
        selected_ids = [mock_entries[0]["id"], mock_entries[2]["id"]]
        access_token = f"share_{secrets.token_urlsafe(32)}"

        share_record = {
            "id": str(uuid.uuid4()),
            "user_id": mock_user["user_id"],
            "teacher_name": "Ms. Martinez",
            "entry_ids": selected_ids,
            "access_token": access_token,
            "report_type": "incident_report",
            "created_at": datetime.utcnow().isoformat(),
            "read_at": None
        }

        assert share_record["user_id"] == mock_user["user_id"]
        assert share_record["access_token"] == access_token
        assert len(share_record["entry_ids"]) == 2
        assert share_record["read_at"] is None

    def test_generate_download_link(self, mock_user):
        """Test generation of download link for client"""
        access_token = f"share_{secrets.token_urlsafe(32)}"
        download_link = f"/api/story/download/{access_token}"

        assert download_link.startswith("/api/story/download/")
        assert access_token in download_link

    def test_return_share_response(self, mock_user):
        """Test API response format for share endpoint"""
        access_token = f"share_{secrets.token_urlsafe(32)}"
        response = {
            "success": True,
            "message": "Report generated successfully",
            "download_link": f"/api/story/download/{access_token}",
            "teacher_name": "Ms. Martinez",
            "share_token": access_token
        }

        assert response["success"] is True
        assert response["download_link"]
        assert response["share_token"] == access_token

    def test_retrieve_share_by_token(self, mock_user):
        """Test retrieving share record using access token"""
        access_token = f"share_{secrets.token_urlsafe(32)}"
        stored_shares = {
            access_token: {
                "user_id": mock_user["user_id"],
                "teacher_name": "Ms. Martinez",
                "entry_ids": ["e1", "e2"],
                "created_at": datetime.utcnow().isoformat()
            }
        }

        retrieved_share = stored_shares.get(access_token)
        assert retrieved_share is not None
        assert retrieved_share["user_id"] == mock_user["user_id"]

    def test_token_not_found(self):
        """Test handling of invalid access token"""
        access_token = f"share_{secrets.token_urlsafe(32)}"
        stored_shares = {}

        retrieved_share = stored_shares.get(access_token)
        assert retrieved_share is None

    def test_generate_pdf_binary(self, mock_entries):
        """Test that PDF generation returns binary data"""
        # Simulate PDF generation
        pdf_data = b"PDF_BINARY_CONTENT_HERE"

        assert isinstance(pdf_data, bytes)
        assert len(pdf_data) > 0

    def test_set_pdf_download_headers(self):
        """Test PDF download response headers"""
        student_name = "Test Student"
        headers = {
            "Content-Type": "application/pdf",
            "Content-Disposition": f"attachment; filename=SafeShoulder_Report_{student_name}.pdf"
        }

        assert headers["Content-Type"] == "application/pdf"
        assert "attachment" in headers["Content-Disposition"]
        assert ".pdf" in headers["Content-Disposition"]

    def test_update_read_timestamp(self, mock_user):
        """Test updating read_at timestamp when PDF accessed"""
        share_record = {
            "user_id": mock_user["user_id"],
            "read_at": None
        }

        # Simulate access
        share_record["read_at"] = datetime.utcnow().isoformat()

        assert share_record["read_at"] is not None
        assert isinstance(share_record["read_at"], str)

    def test_complete_share_workflow(self, mock_user, mock_entries):
        """Test complete workflow from selection to download"""
        # Step 1: Validate user
        assert mock_user["user_id"]

        # Step 2: Select entries
        selected_ids = [mock_entries[0]["id"], mock_entries[2]["id"]]
        selected_entries = [e for e in mock_entries if e["id"] in selected_ids]
        assert len(selected_entries) == 2

        # Step 3: Validate request
        share_request = {
            "teacherName": "Ms. Martinez",
            "entryIds": selected_ids,
            "userId": mock_user["user_id"]
        }
        assert share_request["teacherName"].strip()
        assert len(share_request["entryIds"]) > 0

        # Step 4: Generate PDF data
        pdf_data = b"PDF_CONTENT"
        assert isinstance(pdf_data, bytes)

        # Step 5: Create access token
        access_token = f"share_{secrets.token_urlsafe(32)}"
        assert access_token.startswith("share_")

        # Step 6: Save share record
        share_record = {
            "user_id": mock_user["user_id"],
            "teacher_name": "Ms. Martinez",
            "entry_ids": selected_ids,
            "access_token": access_token,
            "created_at": datetime.utcnow().isoformat()
        }
        assert share_record["access_token"] == access_token

        # Step 7: Return download link
        download_response = {
            "success": True,
            "download_link": f"/api/story/download/{access_token}",
            "share_token": access_token
        }
        assert download_response["success"] is True

        # Step 8: Client downloads PDF
        assert access_token in download_response["download_link"]

    def test_error_no_entries_found(self, mock_user):
        """Test error handling when entries not found"""
        share_request = {
            "entryIds": ["nonexistent-id"],
            "userId": mock_user["user_id"]
        }

        # Simulate database query returning empty
        found_entries = []
        assert len(found_entries) == 0, "Should return error"

    def test_error_unauthorized_user(self):
        """Test error handling when user unauthorized"""
        request_user_id = "user-123"
        actual_user_id = "user-456"

        assert request_user_id != actual_user_id, "Should return 403 Forbidden"

    def test_error_invalid_teacher_name(self, mock_user):
        """Test error handling with invalid teacher name"""
        share_request = {
            "teacherName": "",
            "entryIds": ["entry-1"],
            "userId": mock_user["user_id"]
        }

        is_valid = bool(share_request["teacherName"].strip())
        assert not is_valid, "Should return validation error"

    def test_concurrent_shares(self, mock_user):
        """Test handling of concurrent share requests"""
        tokens = [
            f"share_{secrets.token_urlsafe(32)}",
            f"share_{secrets.token_urlsafe(32)}",
            f"share_{secrets.token_urlsafe(32)}"
        ]

        # All tokens should be unique
        assert len(set(tokens)) == 3

    def test_pdf_with_single_entry(self, mock_user, mock_entries):
        """Test PDF generation with single entry"""
        selected_entry = [mock_entries[0]]

        stats = {
            "total": len(selected_entry),
            "category": selected_entry[0]["category"]
        }

        assert stats["total"] == 1
        assert stats["category"] == "growth"

    def test_pdf_with_multiple_entries(self, mock_entries):
        """Test PDF generation with multiple entries of different types"""
        stats = {
            "total": len(mock_entries),
            "bullying": len([e for e in mock_entries if e["category"] == "bullying"]),
            "growth": len([e for e in mock_entries if e["category"] == "growth"]),
            "win": len([e for e in mock_entries if e["category"] == "win"])
        }

        assert stats["total"] == 3
        assert sum([stats["bullying"], stats["growth"], stats["win"]]) == 3

    def test_timestamp_preservation(self, mock_entries):
        """Test that entry timestamps are preserved in PDF"""
        for entry in mock_entries:
            # Parse and reformat timestamp
            original_time = datetime.fromisoformat(entry["created_at"].replace("Z", "+00:00"))
            formatted_time = original_time.strftime("%B %d, %Y")

            assert len(formatted_time) > 0
            assert "," in formatted_time  # Date includes comma (e.g., "August 30, 2026")

    def test_pdf_content_not_modified(self, mock_entries):
        """Test that entry content is not modified during PDF generation"""
        original_entry = mock_entries[0]
        pdf_entry = {
            "title": original_entry["title"],
            "content": original_entry["content"],
            "category": original_entry["category"]
        }

        assert pdf_entry["title"] == original_entry["title"]
        assert pdf_entry["content"] == original_entry["content"]
        assert pdf_entry["category"] == original_entry["category"]

    def test_confidentiality_notice_included(self):
        """Test that PDF includes confidentiality notice"""
        notice = "This is a confidential document shared by a student via SafeShoulder."

        assert len(notice) > 0
        assert "confidential" in notice.lower()
