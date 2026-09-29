import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isHttps = request.headers.get("x-forwarded-proto") === "https";
  const realOrigin = forwardedHost
    ? `${isHttps ? "https" : "http"}://${forwardedHost}`
    : origin;

  // Validate next parameter - must start with / and not start with //
  let redirectPath = next;
  if (!redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
    redirectPath = "/dashboard";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${realOrigin}${redirectPath}`);
    }
  }
  return NextResponse.redirect(`${realOrigin}/login?error=true`);
}
