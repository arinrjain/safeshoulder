import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ detail: 'No authorization token' }, { status: 401 });
    }

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.safeshoulder.com';
    const response = await fetch(`${backendUrl}/story/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(responseData, { status: response.status });
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error('Share error:', error);
    return NextResponse.json(
      { detail: error.message || 'Failed to share story' },
      { status: 500 }
    );
  }
}
