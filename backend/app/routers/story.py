import uuid
import secrets
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from starlette.responses import Response as StarletteResponse
from app.middleware.auth import get_current_user
from app.config import settings
from supabase import create_client
from datetime import datetime
import io
import tempfile
from fpdf import FPDF

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/story", tags=["story"])

supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)


@router.get("/entries")
def get_entries(user: dict = Depends(get_current_user)):
  """Fetch all story entries for current user."""
  try:
    user_id = user["user_id"]
    result = supabase.table("story_entries").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return {"success": True, "data": result.data or []}
  except Exception as e:
    logger.error(f"Get entries error: {e}")
    raise HTTPException(status_code=500, detail=str(e))


@router.post("/entries")
def create_entry(body: dict, user: dict = Depends(get_current_user)):
  """Create a new story entry."""
  try:
    user_id = user["user_id"]
    title = body.get("title", "").strip()
    content = body.get("content", "").strip()
    category = body.get("category", "growth")

    if not title or not content:
      raise HTTPException(status_code=400, detail="Title and content required")

    result = supabase.table("story_entries").insert({
      "user_id": user_id,
      "title": title,
      "content": content,
      "category": category
    }).execute()

    return {"success": True, "data": result.data[0] if result.data else None}
  except HTTPException:
    raise
  except Exception as e:
    logger.error(f"Create entry error: {e}")
    raise HTTPException(status_code=500, detail=str(e))


def generate_pdf_report(entries: list, student_name: str, teacher_name: str, access_token: str = None):
    """Generate PDF report from entries using FPDF2 - returns bytes."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "", 11)

    # Title
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(124, 58, 237)  # Purple
    pdf.cell(0, 10, "Incident Report from SafeShoulder", ln=True, align="C")
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 10)

    # Header info
    pdf.ln(5)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(124, 58, 237)
    pdf.cell(40, 8, "Student:")
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, student_name, ln=True)

    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(124, 58, 237)
    pdf.cell(40, 8, "Shared with:")
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, teacher_name, ln=True)

    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(124, 58, 237)
    pdf.cell(40, 8, "Date:")
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, datetime.now().strftime('%B %d, %Y at %I:%M %p'), ln=True)

    # Summary stats
    pdf.ln(8)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(124, 58, 237)
    pdf.cell(0, 8, "Report Summary:", ln=True)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 10)

    bullying_entries = [e for e in entries if e['category'] == 'bullying']
    growth_count = len([e for e in entries if e['category'] == 'growth'])
    win_count = len([e for e in entries if e['category'] == 'win'])

    pdf.cell(80, 6, f"Total Entries: {len(entries)}", ln=True)
    pdf.cell(80, 6, f"Bullying Incidents: {len(bullying_entries)}", ln=True)
    pdf.cell(80, 6, f"Growth & Learning: {growth_count}", ln=True)
    pdf.cell(80, 6, f"Wins & Celebrations: {win_count}", ln=True)

    # Bullying incidents section
    if bullying_entries:
        pdf.ln(5)
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_text_color(124, 58, 237)
        pdf.cell(0, 8, "Bullying Incidents", ln=True)
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Helvetica", "", 10)

        for entry in bullying_entries:
            date_str = datetime.fromisoformat(entry['created_at']).strftime('%B %d, %Y')
            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(0, 7, entry['title'], ln=True)
            pdf.set_font("Helvetica", "I", 9)
            pdf.set_text_color(100, 100, 100)
            pdf.cell(0, 5, date_str, ln=True)
            pdf.set_text_color(0, 0, 0)
            pdf.set_font("Helvetica", "", 10)
            pdf.multi_cell(0, 5, entry['content'])
            pdf.ln(3)

    # Other entries
    other_entries = [e for e in entries if e['category'] != 'bullying']
    if other_entries:
        pdf.ln(5)
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_text_color(124, 58, 237)
        pdf.cell(0, 8, "Other Entries", ln=True)
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Helvetica", "", 10)

        for entry in other_entries:
            date_str = datetime.fromisoformat(entry['created_at']).strftime('%B %d, %Y')
            category_label = {
                'growth': 'Growth & Learning',
                'win': 'Win & Celebration'
            }.get(entry['category'], entry['category'])

            pdf.set_font("Helvetica", "B", 11)
            pdf.cell(0, 7, f"{entry['title']} ({category_label})", ln=True)
            pdf.set_font("Helvetica", "I", 9)
            pdf.set_text_color(100, 100, 100)
            pdf.cell(0, 5, date_str, ln=True)
            pdf.set_text_color(0, 0, 0)
            pdf.set_font("Helvetica", "", 10)
            pdf.multi_cell(0, 5, entry['content'])
            pdf.ln(3)

    # Footer
    pdf.ln(10)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(150, 150, 150)
    pdf.multi_cell(0, 4, "This is a confidential document shared by a student via SafeShoulder. Please handle it according to your school's protocols and policies.")

    return pdf.output()




@router.post("/share")
def share_story(body: dict, request: Request, user: dict = Depends(get_current_user)):
    """Generate shareable PDF report from story entries."""
    try:
        user_id = user["user_id"]
        teacher_name = body.get("teacherName", "Teacher").strip()
        entry_ids = body.get("entryIds", [])
        body_user_id = body.get("userId")

        # Verify user ID matches
        if body_user_id != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")

        if not entry_ids or not isinstance(entry_ids, list):
            raise HTTPException(status_code=400, detail="No entries selected")

        # Fetch entries from database
        entries_result = supabase.table("story_entries").select("*").eq("user_id", user_id).in_("id", entry_ids).execute()

        if not entries_result.data:
            raise HTTPException(status_code=404, detail="Entries not found")

        # Fetch user data for report
        user_result = supabase.table("users").select("name,email").eq("id", user_id).execute()
        student_name = user_result.data[0]["name"] if user_result.data else "Student"
        student_email = user_result.data[0]["email"] if user_result.data else ""

        # Generate PDF
        pdf_bytes = generate_pdf_report(entries_result.data, student_name, teacher_name)

        # Save share record with access token
        access_token = secrets.token_urlsafe(32)
        supabase.table("story_shares").insert({
            "user_id": user_id,
            "teacher_email": "",  # Will be filled when teacher accesses via link
            "teacher_name": teacher_name,
            "entry_ids": entry_ids,
            "report_type": "incident_report",
            "access_token": access_token,
        }).execute()

        logger.info(f"Story report generated by {user_id} for {teacher_name}")

        # Return PDF for download with shareable link info
        return JSONResponse({
            "success": True,
            "message": "Report generated successfully",
            "download_link": f"/api/story/download/{access_token}",
            "teacher_name": teacher_name,
            "share_token": access_token,
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Share error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/test-pdf")
def test_pdf():
    """Debug: Test if PDF generation works"""
    test_entries = [{"id": "1", "title": "Test", "content": "Test content", "category": "bullying", "created_at": "2026-08-30T10:00:00"}]
    pdf = generate_pdf_report(test_entries, "TestStudent", "TestTeacher")
    return {"type": str(type(pdf)), "len": len(pdf) if pdf else 0, "first_20": str(pdf[:20]) if pdf else "None"}

@router.get("/download/{access_token}")
def download_report(access_token: str):
    """Download PDF report using access token."""
    share_result = supabase.table("story_shares").select("*").eq("access_token", access_token).execute()
    if not share_result.data:
        raise HTTPException(status_code=404, detail="Not found")

    share = share_result.data[0]
    entries = supabase.table("story_entries").select("*").eq("user_id", share["user_id"]).in_("id", share["entry_ids"]).execute().data
    user = supabase.table("users").select("name").eq("id", share["user_id"]).execute().data[0]
    name = user["name"] if user else "Student"

    pdf = generate_pdf_report(entries, name, share["teacher_name"])

    # Force bytes format
    if isinstance(pdf, str):
        pdf_out = pdf.encode('latin-1')
    elif isinstance(pdf, bytearray):
        pdf_out = bytes(pdf)
    else:
        pdf_out = pdf

    if not pdf_out or len(pdf_out) < 100:
        raise HTTPException(status_code=500, detail="PDF failed")

    supabase.table("story_shares").update({"read_at": datetime.utcnow().isoformat()}).eq("access_token", access_token).execute()

    from starlette.responses import FileResponse, StreamingResponse
    tf = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    tf.write(pdf_out)
    tf.flush()
    tf.close()
    def iter_file():
        with open(tf.name, 'rb') as f:
            while True:
                chunk = f.read(8192)
                if not chunk: break
                yield chunk
    return StreamingResponse(iter_file(), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=SafeShoulder_Report_{name}.pdf"})
