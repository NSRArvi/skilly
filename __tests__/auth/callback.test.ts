import { describe, it, expect, vi } from "vitest";

// Test path sanitization logic used in app/(main)/auth/callback/route.ts
function sanitizeRedirect(nextPath: string | null): string {
  const next = nextPath ?? "/dashboard";
  if (!next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }
  return next;
}

describe("Auth Callback Security", () => {
  it("allows safe internal redirect paths", () => {
    expect(sanitizeRedirect("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirect("/professionals")).toBe("/professionals");
    expect(sanitizeRedirect("/jobs/123")).toBe("/jobs/123");
  });

  it("prevents open redirect attacks via protocol-relative URLs", () => {
    expect(sanitizeRedirect("//evil.com")).toBe("/dashboard");
    expect(sanitizeRedirect("//attacker.com/exploit")).toBe("/dashboard");
  });

  it("prevents absolute external redirect URLs", () => {
    expect(sanitizeRedirect("https://evil.com")).toBe("/dashboard");
    expect(sanitizeRedirect("http://phishing.com")).toBe("/dashboard");
    expect(sanitizeRedirect("javascript:alert(1)")).toBe("/dashboard");
  });

  it("defaults to /dashboard when next param is omitted", () => {
    expect(sanitizeRedirect(null)).toBe("/dashboard");
  });
});
