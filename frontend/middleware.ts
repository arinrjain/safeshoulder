import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for callback - it needs to set the session
  if (pathname.includes('/auth/callback')) {
    return NextResponse.next();
  }

  // Protect /teen/* routes
  if (pathname.startsWith('/teen')) {
    // Check if user is authenticated by looking for Supabase auth cookie
    const hasAuthCookie = request.cookies.has('sb-aovdmocxjglpiokiximn-auth-token');

    if (!hasAuthCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/teen/:path*', '/auth/callback'],
};
