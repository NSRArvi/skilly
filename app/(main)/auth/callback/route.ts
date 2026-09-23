import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

  // When behind a reverse proxy like Nginx (Plesk), request.url might resolve to localhost.
  // We check for the X-Forwarded-Host header to get the real domain.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isHttps = request.headers.get("x-forwarded-proto") === "https";
  const realOrigin = forwardedHost
    ? `${isHttps ? "https" : "http"}://${forwardedHost}`
    : origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${realOrigin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${realOrigin}/login?error=true`);
}
