import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip auth middleware for now - let /teen routes be accessible
  // Client-side will handle auth redirects
  return NextResponse.next();
}

export const config = {
  matcher: [],  // Disable middleware
