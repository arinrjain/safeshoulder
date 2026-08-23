import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);

    if (session) {
      const email = session.user.email?.toLowerCase();

      // Check if email is blocked
      if (email) {
        const { data: blocked } = await supabase
          .from("blocked_emails")
          .select("id")
          .eq("email", email)
          .single();

        if (blocked) {
          // Sign out the user and redirect with error
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL("/login?error=blocked", request.url));
        }
      }

      const { data: profile } = await supabase
        .from("users")
        .select("domain")
        .eq("id", session.user.id)
        .single();

      if (!profile?.domain) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }
  }

  return NextResponse.redirect(new URL("/teen/support", request.url));
}
