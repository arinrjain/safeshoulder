import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /teen/* routes
  if (pathname.startsWith('/teen')) {
    // Supabase cookie format: sb-{projectid}-auth-token
    const sessionToken = request.cookies.get('sb-aovdmocxjglpiokiximn-auth-token');

    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/teen/:path*'],
};
