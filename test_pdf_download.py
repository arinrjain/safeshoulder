#!/usr/bin/env python3
"""Test PDF generation and download endpoint"""

import sys
sys.path.insert(0, '/Users/rinish/projects/arin/safeshoulder/backend')

from app.routers.story import generate_pdf_report
import os

# Test data
test_entries = [
    {
        'id': '1',
        'title': 'Bullying Incident',
        'content': 'Someone was mean to me at school',
        'category': 'bullying',
        'created_at': '2026-08-30T10:00:00'
    },
    {
        'id': '2',
        'title': 'Good Day',
        'content': 'I had a great time with friends',
        'category': 'win',
        'created_at': '2026-08-30T11:00:00'
    }
]

print("Testing PDF generation...")
print(f"Entries: {len(test_entries)}")

try:
    pdf_bytes = generate_pdf_report(test_entries, "Test Student", "Test Teacher")

    print(f"\n✓ PDF Generated!")
    print(f"  Type: {type(pdf_bytes)}")
    print(f"  Size: {len(pdf_bytes)} bytes")
    print(f"  First 20 bytes: {pdf_bytes[:20]}")

    # Check if it's a valid PDF
    is_valid_pdf = pdf_bytes.startswith(b'%PDF')
    print(f"  Valid PDF header: {is_valid_pdf}")

    # Save to file for inspection
    output_file = '/tmp/test_pdf_output.pdf'
    with open(output_file, 'wb') as f:
        f.write(pdf_bytes)

    print(f"  Saved to: {output_file}")
    print(f"  File size: {os.path.getsize(output_file)} bytes")

except Exception as e:
    print(f"\n✗ Error generating PDF:")
    print(f"  {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
