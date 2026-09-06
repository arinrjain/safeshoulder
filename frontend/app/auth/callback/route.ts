import { NextRequest, NextResponse } from "next/server";

// Email clients and security scanners (Gmail, Outlook, corporate link
// scanners) automatically visit links inside emails to check for malware,
// as a plain GET, before the user ever clicks them. With Supabase's PKCE
// flow that silently consumes the one-time code, so the exchange fails
// with "code verifier not found" by the time the real user clicks through.
//
// The fix: this route never performs the exchange itself. It renders a
// page requiring a real user click, which then hits /auth/callback/confirm
// (where the actual exchangeCodeForSession happens). Scanners fetch this
// page but don't execute JS or click buttons, so the code survives until
// the user's own click.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }

  if (!code) {
    console.error("No code in callback");
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  const confirmUrl = new URL(`/auth/callback/confirm?code=${encodeURIComponent(code)}`, request.url);

  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head>
    <title>Sign in to SafeShoulder</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; }
        .card { background: #fff; border-radius: 1rem; padding: 2rem; max-width: 24rem; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        button { background: #4f46e5; color: #fff; border: none; border-radius: 0.5rem; padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; margin-top: 1rem; }
        button:hover { background: #4338ca; }
    </style>
</head>
<body>
    <div class="card">
        <p>Click below to finish signing in to SafeShoulder.</p>
        <button onclick="window.location.href='${confirmUrl.toString()}'">Continue to SafeShoulder</button>
    </div>
</body>
</html>`,
    { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } }
  );
}
