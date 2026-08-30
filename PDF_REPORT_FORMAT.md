# SafeShoulder PDF Report Format Documentation

**Version**: 1.0  
**Last Updated**: 2026-08-30  
**Status**: Production Ready

---

## Overview

The SafeShoulder PDF Report is a professional incident report format that enables students to share selected journal entries with teachers. The report is generated on-demand when a student selects entries and initiates sharing.

### Key Features
- **Professional formatting** with clear hierarchy
- **All entry categories** supported (Bullying, Growth & Learning, Win & Celebration)
- **Timestamped entries** for chronological reference
- **Statistical summary** showing entry distribution
- **Confidentiality notice** for legal/privacy compliance
- **Print-optimized** for school distribution

---

## PDF Structure

### 1. Header Section
```
═══════════════════════════════════════════════════════════════
                  INCIDENT REPORT FROM SAFESHOULDER
═══════════════════════════════════════════════════════════════
```

**Details:**
- Large bold title in purple (#7C3AED)
- Centered alignment
- Professional serif/sans-serif font (Helvetica)
- Font size: 18pt

### 2. Report Metadata

#### Student Information
```
Student:          John Smith
Shared with:      Ms. Martinez (English Teacher)
Date Generated:   August 30, 2026 at 2:45 PM
```

**Fields:**
- **Student**: Name from authenticated user profile
- **Shared with**: Teacher name provided by student
- **Date Generated**: Current date/time in US format (Month DD, YYYY at HH:MM AM/PM)

### 3. Report Summary

```
─────────────────────────────────────────────────────────────
REPORT SUMMARY
─────────────────────────────────────────────────────────────
Total Entries:          4
├─ Bullying Incidents:  1
├─ Growth & Learning:   2
└─ Wins & Celebrations: 1

Time Span: August 15, 2026 → August 30, 2026 (15 days)
```

**Statistics Included:**
- Total number of entries in report
- Breakdown by category:
  - 😢 Bullying Experience count
  - 🌱 Growth & Learning count
  - 🌟 Win & Celebration count
- Date range (earliest to latest entry)

### 4. Entry Details

Each entry is formatted as follows:

```
─────────────────────────────────────────────────────────────
[TITLE] - Category Label
Date: Month DD, YYYY at HH:MM AM/PM
─────────────────────────────────────────────────────────────

Entry content displayed here in full. Multiple paragraphs
and formatting are preserved exactly as written by the student.
Long content wraps naturally and maintains readability.

```

**For Each Entry:**
- **Title**: From student's entry (may include [SAMPLE] prefix if reference)
- **Category Label**: 
  - 😢 Bullying Experience
  - 🌱 Growth & Learning
  - 🌟 Win & Celebration
- **Date**: Full timestamp when entry was created
- **Content**: Full text of entry as written by student

### 5. Footer / Confidentiality Notice

```
─────────────────────────────────────────────────────────────

This is a confidential document shared by a student via
SafeShoulder. Please handle it according to your school's
protocols and policies.

Report Generated: SafeShoulder Student Support Platform
Timestamp: 2026-08-30T14:45:32Z
─────────────────────────────────────────────────────────────
```

---

## Category Types & Formatting

### 1. Bullying Experience (😢)
**Purpose**: Document difficult social situations, conflicts, bullying incidents

**Example**:
```
[Someone said mean things at lunch] - Bullying Experience
Date: August 28, 2026 at 12:15 PM

Two classmates made fun of my lunch. I felt embarrassed but
talked to a counselor who was very supportive. They're helping
me develop a plan to handle similar situations.
```

**When Used**: When student needs to document and process difficult peer interactions with teacher support

### 2. Growth & Learning (🌱)
**Purpose**: Capture personal development, skill building, overcoming challenges

**Example**:
```
[Overcame My Fear of Public Speaking] - Growth & Learning
Date: August 29, 2026 at 2:30 PM

Today I presented my project in front of the class even though
I was nervous. My presentation went well and I got positive
feedback. I'm realizing that practice and preparation help me
overcome my fears.
```

**When Used**: When student wants to document progress and self-improvement

### 3. Win & Celebration (🌟)
**Purpose**: Celebrate achievements, successes, positive moments

**Example**:
```
[Got an A on My Math Test] - Win & Celebration
Date: August 27, 2026 at 3:45 PM

All my studying paid off! I understood the concepts and felt
confident during the test. My teacher even said I showed great
improvement. This is the highest grade I've gotten so far!
```

**When Used**: When student wants to celebrate and commemorate achievements

---

## Report Statistics

The report includes a summary box showing:

### Calculation Methods

**Total Entries**
```
Total = Bullying Count + Growth Count + Win Count
```

**Category Distribution**
- Bullying: `entries.filter(e => e.category === 'bullying').length`
- Growth: `entries.filter(e => e.category === 'growth').length`
- Win: `entries.filter(e => e.category === 'win').length`

**Time Span**
```
Earliest Date: MIN(all entries.created_at)
Latest Date: MAX(all entries.created_at)
Span: Latest - Earliest
```

### Display Example
```
Total Entries:          5
├─ Bullying Incidents:  1
├─ Growth & Learning:   3
└─ Wins & Celebrations: 1

Time Span: July 15, 2026 → August 30, 2026 (46 days)
```

---

## Technical Specifications

### PDF Generation
- **Library**: fpdf2 (Python)
- **Format**: PDF/A compatible
- **Page Size**: A4 (210 × 297 mm)
- **Margins**: 0.5" top/bottom, 0.75" left/right
- **Line Height**: 1.2x (readability optimized)

### Font Configuration
```
Default Font:    Helvetica
Title Font:      Helvetica Bold 18pt
Section Header:  Helvetica Bold 11pt
Body Text:       Helvetica Regular 10pt
Entry Date:      Helvetica Italic 9pt
Footer:          Helvetica Italic 8pt
```

### Color Scheme
```
Primary Purple:   #7C3AED (Headings, accents)
Secondary Gray:   #646464 (Entry dates)
Light Gray:       #969696 (Footer text)
Black:            #000000 (Body text)
White:            #FFFFFF (Background)
```

### Text Encoding
- **Character Encoding**: UTF-8 with Latin-1 fallback
- **Line Wrapping**: Automatic text wrapping at page width
- **Smart Quotes**: Preserved from student input
- **Special Characters**: Full Unicode support

---

## Data Included in PDF

### Student Data
- **Name**: From users table (name field)
- **Email**: Associated with account (not displayed on PDF)
- **User ID**: Not visible on PDF

### Entry Data
- **ID**: UUID (not displayed on PDF)
- **Title**: Exactly as student wrote it
- **Content**: Full text (multi-line preserved)
- **Category**: One of: bullying | growth | win
- **Created At**: Timestamp from database

### Report Data
- **Teacher Name**: Provided by student in share form
- **Access Token**: Generated for download link (not on PDF)
- **Report Type**: "incident_report" (internal, not displayed)
- **Generated At**: Current server timestamp

### Data NOT Included
- Student email address
- Student ID
- Supabase internal fields
- Authentication tokens
- System metadata

---

## Use Cases & Examples

### Use Case 1: Teacher Support for Bullying Incident
**Scenario**: Student experienced bullying and wants counselor/teacher to review

**PDF Content**:
- 1 Bullying Experience entry describing the incident
- Entry dated same day as incident
- Full context and student's feelings
- Timestamps show when student documented it

**Teacher Action**: Reviews entry, provides support resources, meets with student

---

### Use Case 2: Growth Portfolio for Parent Conference
**Scenario**: Student wants to show parents progress over time

**PDF Content**:
- 3-5 Growth & Learning entries
- Chronological progression showing increasing confidence
- Evidence of skill development
- Student's own reflections on growth

**Parent Viewing**: Parents see concrete evidence of development, celebrate progress

---

### Use Case 3: Positive Achievements Documentation
**Scenario**: Student wants to document and celebrate academic/social wins

**PDF Content**:
- Multiple Win & Celebration entries
- Mix of academic, social, and personal achievements
- Dates showing frequency of success
- Student's positive reflections

**School Use**: Can be added to student portfolio, used in award considerations

---

## Sharing & Access

### Sharing Flow
1. Student selects entries on Story page
2. Student provides teacher name
3. System generates PDF
4. System creates access token
5. Student downloads PDF
6. Student manually shares with teacher (email, print, etc.)

### Access Token
- **Format**: `share_` prefix + 32 random characters
- **Length**: ~37 characters total
- **Encoding**: URL-safe base64
- **Usage**: One-time download link
- **Expiration**: No automatic expiration (manual management)
- **Security**: Token stored in database, only valid if exists

### Access Log
- **Tracked**: When report is downloaded via token
- **Recorded**: `read_at` timestamp updated in database
- **Use**: Teachers can see when report was accessed
- **Privacy**: No tracking across multiple reads

---

## Quality Checklist

✅ **Content Quality**
- All student entries included
- Exact text preserved (no edits)
- Timestamps accurate
- Categories correctly displayed
- Statistics accurate

✅ **Format Quality**
- Professional appearance
- Readable font sizes
- Proper spacing/margins
- Print-optimized
- Page breaks handled correctly

✅ **Security**
- Student email not displayed
- Sensitive IDs hidden
- Confidentiality notice included
- Access token required for download
- RLS policies enforced

✅ **Usability**
- Clear structure
- Easy to scan
- Information hierarchy
- Print-friendly
- Mobile-friendly (when printed)

---

## Troubleshooting

### Issue: PDF not downloading
**Solution**: Check browser console for errors, verify access token exists in database

### Issue: Entries missing from PDF
**Solution**: Verify entries selected, check that entries belong to user, verify database access

### Issue: Formatting issues when printed
**Solution**: Use PDF viewer's print settings, ensure margins are set to "None"

### Issue: Special characters not displaying
**Solution**: Verify UTF-8 encoding in database, check PDF viewer settings

---

## Future Enhancements

- [ ] Email delivery directly to teacher
- [ ] Password-protected PDF option
- [ ] Digital signature support
- [ ] Multi-language report generation
- [ ] Custom header/footer (school branding)
- [ ] Charts/graphs of entry statistics
- [ ] Export to other formats (DOCX, HTML)
- [ ] Report expiration/deletion scheduling
- [ ] Teacher comments/annotations
- [ ] Parent-teacher integration

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-30 | Initial production release |

---

## Support

For issues or feedback about the PDF report format:
1. Contact: SafeShoulder Support Team
2. Email: support@safeshoulder.app
3. GitHub: Report in issue tracker

---

*PDF Report Format - SafeShoulder Student Support Platform*
