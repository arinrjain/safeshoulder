import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: 'No access token provided' }, { status: 400 });
    }

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.safeshoulder.com';
    const response = await fetch(`${backendUrl}/story/download/${token}`);

    console.log(`[Download] Token: ${token}, Status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Download] Error response:`, errorText);
      return NextResponse.json(
        { error: `Failed to download report: ${errorText}` },
        { status: response.status }
      );
    }

    // Get the PDF bytes from backend
    const pdfBuffer = await response.arrayBuffer();
    console.log(`[Download] Received ${pdfBuffer.byteLength} bytes`);

    // Return PDF with proper headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment; filename="SafeShoulder_Report.pdf"',
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download report' },
      { status: 500 }
    );
  }
}
