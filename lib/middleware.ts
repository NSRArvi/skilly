import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let user: any = null;

  if (!url || !key) {
    const hasSession = request.cookies.get("skilly_session")?.value === "active";
    if (hasSession) {
      user = { id: "user-demo-1", email: "alex.sterling@example.com" };
    }
  } else {
    try {
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
    } catch {
      // Gracefully fall back
      const hasSession = request.cookies.get("skilly_session")?.value === "active";
      if (hasSession) {
        user = { id: "user-demo-1", email: "alex.sterling@example.com" };
      }
    }
  }

  // Protect the /dashboard route (unauthenticated users go to /login)
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from /login page
  if (user && request.nextUrl.pathname.startsWith("/login")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/professionals";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
