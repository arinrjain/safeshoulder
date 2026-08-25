import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
    }

    if (!code) {
      console.error("No code in callback");
      return NextResponse.redirect(new URL("/login?error=no_code", request.url));
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              console.log(`Setting cookie: ${name}`);
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    console.log("Attempting to exchange code for session...");
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    console.log("Exchange result:", { hasData: !!data, hasSession: !!data?.session, error: exchangeError });

    if (exchangeError || !data?.session) {
      console.error("Exchange failed:", exchangeError);
      return new NextResponse(
        `<h1>OAuth Error</h1><p>Exchange failed: ${exchangeError?.message || 'Unknown error'}</p><p><a href="/login">Back to login</a></p>`,
        { status: 400, headers: { 'content-type': 'text/html' } }
      );
    }

    const session = data.session;

    // Manually ensure auth cookie is set
    console.log("Session obtained, setting auth cookie...");
    const authCookie = `sb-aovdmocxjglpiokiximn-auth-token=${encodeURIComponent(JSON.stringify(session))}`;
    console.log("Auth cookie length:", authCookie.length);
    const email = session.user.email?.toLowerCase();

    // Check if email is blocked
    if (email) {
      try {
        const { data: blocked } = await supabase
          .from("blocked_emails")
          .select("id")
          .eq("email", email)
          .single();

        if (blocked) {
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL("/login?error=blocked", request.url));
        }
      } catch (err) {
        // Table might not exist yet, continue
        console.log("Blocked check skipped");
      }
    }

    // Return HTML that stores session in localStorage and redirects to chat
    const sessionJson = JSON.stringify(session);

    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
    <title>Redirecting to SafeShoulder...</title>
</head>
<body>
    <script>
        // Store session in localStorage for Supabase SDK to find
        localStorage.setItem('sb-aovdmocxjglpiokiximn-auth-token', JSON.stringify({
            access_token: '${session.access_token}',
            refresh_token: '${session.refresh_token}',
            expires_at: ${session.expires_at},
            user: ${JSON.stringify(JSON.stringify(session.user))}
        }));

        // Also store in the exact format Supabase expects
        localStorage.setItem('sb-aovdmocxjglpiokiximn-auth-token-code-verifier', '');

        // First go to success page to verify session is stored
        window.location.href = '/auth/success';
    </script>
    <p>Redirecting to SafeShoulder...</p>
</body>
</html>`,
      {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' }
      }
    );
  } catch (err) {
    console.error("Callback error:", err);
    return NextResponse.redirect(new URL("/login?error=unknown", request.url));
  }
}
