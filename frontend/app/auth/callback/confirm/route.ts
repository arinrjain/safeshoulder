import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      console.error("No code in callback confirm");
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
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !data?.session) {
      console.error("Exchange failed:", exchangeError);
      return new NextResponse(
        `<h1>OAuth Error</h1><p>Exchange failed: ${exchangeError?.message || 'Unknown error'}</p><p><a href="/login">Back to login</a></p>`,
        { status: 400, headers: { 'content-type': 'text/html' } }
      );
    }

    const session = data.session;
    const email = session.user.email?.toLowerCase();

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
        console.log("Blocked check skipped");
      }
    }

    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
    <title>Redirecting to SafeShoulder...</title>
</head>
<body>
    <script>
        const sessionData = {
            access_token: '${session.access_token}',
            refresh_token: '${session.refresh_token}',
            expires_at: ${session.expires_at},
            user: ${JSON.stringify(session.user)}
        };
        localStorage.setItem('sb-aovdmocxjglpiokiximn-auth-token', JSON.stringify(sessionData));
        window.location.href = '/teen/story';
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
    console.error("Callback confirm error:", err);
    return NextResponse.redirect(new URL("/login?error=unknown", request.url));
  }
}
