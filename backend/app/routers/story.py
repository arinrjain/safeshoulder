import uuid
import secrets
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from app.middleware.auth import get_current_user
from app.config import settings
from supabase import create_client
from datetime import datetime
import io
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/story", tags=["story"])

supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)


def generate_pdf_report(entries: list, student_name: str, teacher_name: str, access_token: str = None) -> bytes:
    """Generate PDF report from entries using ReportLab."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#7C3AED'),
        spaceAfter=12,
        alignment=TA_CENTER,
    )

    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#7C3AED'),
        spaceAfter=12,
        spaceBefore=12,
    )

    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        alignment=TA_JUSTIFY,
    )

    # Title
    story.append(Paragraph("📋 Incident Report from SafeShoulder", title_style))
    story.append(Spacer(1, 0.2*inch))

    # Header info
    info_data = [
        ['Student:', student_name],
        ['Shared with:', teacher_name],
        ['Date:', datetime.now().strftime('%B %d, %Y at %I:%M %p')],
    ]

    info_table = Table(info_data, colWidths=[1.5*inch, 3.5*inch])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#7C3AED')),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.3*inch))

    # Summary stats
    bullying_entries = [e for e in entries if e['category'] == 'bullying']
    growth_count = len([e for e in entries if e['category'] == 'growth'])
    win_count = len([e for e in entries if e['category'] == 'win'])

    story.append(Paragraph("<b>Report Summary:</b>", heading_style))
    summary_data = [
        ['Total Entries:', str(len(entries))],
        ['Bullying Incidents:', str(len(bullying_entries))],
        ['Growth & Learning:', str(growth_count)],
        ['Wins & Celebrations:', str(win_count)],
    ]

    summary_table = Table(summary_data, colWidths=[2*inch, 2.5*inch])
    summary_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#7C3AED')),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F3F4F6')),
        ('PADDINGTOP', (0, 0), (-1, -1), 8),
        ('PADDINGBOTTOM', (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 0.25*inch))

    # Bullying incidents section
    if bullying_entries:
        story.append(Paragraph("😢 Bullying Incidents", heading_style))
        for i, entry in enumerate(bullying_entries):
            date_str = datetime.fromisoformat(entry['created_at']).strftime('%B %d, %Y')
            story.append(Paragraph(f"<b>{entry['title']}</b>", styles['Heading3']))
            story.append(Paragraph(f"<i>{date_str}</i>", styles['Normal']))
            story.append(Paragraph(entry['content'], normal_style))
            if i < len(bullying_entries) - 1:
                story.append(Spacer(1, 0.15*inch))
        story.append(Spacer(1, 0.2*inch))

    # Other entries
    other_entries = [e for e in entries if e['category'] != 'bullying']
    if other_entries:
        story.append(Paragraph("📚 Other Entries", heading_style))
        for i, entry in enumerate(other_entries):
            date_str = datetime.fromisoformat(entry['created_at']).strftime('%B %d, %Y')
            category_label = {
                'growth': '🌱 Growth & Learning',
                'win': '🌟 Win & Celebration'
            }.get(entry['category'], entry['category'])

            story.append(Paragraph(f"<b>{entry['title']}</b> ({category_label})", styles['Heading3']))
            story.append(Paragraph(f"<i>{date_str}</i>", styles['Normal']))
            story.append(Paragraph(entry['content'], normal_style))
            if i < len(other_entries) - 1:
                story.append(Spacer(1, 0.15*inch))

    story.append(Spacer(1, 0.3*inch))

    # Footer
    footer_text = "This is a confidential document shared by a student via SafeShoulder. Please handle it according to your school's protocols and policies."
    story.append(Paragraph(footer_text, styles['Normal']))

    # Generate PDF
    doc.build(story)
    return buffer.getvalue()




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


@router.get("/download/{access_token}")
def download_report(access_token: str, request: Request):
    """Download PDF report using access token."""
    try:
        # Fetch share record
        share_result = supabase.table("story_shares").select("*").eq("access_token", access_token).execute()

        if not share_result.data:
            raise HTTPException(status_code=404, detail="Report not found or expired")

        share = share_result.data[0]
        user_id = share["user_id"]
        entry_ids = share["entry_ids"]
        teacher_name = share["teacher_name"]

        # Fetch entries
        entries_result = supabase.table("story_entries").select("*").eq("user_id", user_id).in_("id", entry_ids).execute()

        # Fetch user data
        user_result = supabase.table("users").select("name").eq("id", user_id).execute()
        student_name = user_result.data[0]["name"] if user_result.data else "Student"

        # Generate PDF
        pdf_bytes = generate_pdf_report(entries_result.data, student_name, teacher_name, access_token)

        # Update read timestamp
        supabase.table("story_shares").update({"read_at": datetime.utcnow().isoformat()}).eq("access_token", access_token).execute()

        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=SafeShoulder_Report_{student_name}.pdf"}
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Download error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
