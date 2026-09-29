"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // TODO: Log the error to an error reporting service like Sentry
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ display: "flex", height: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f9fa", padding: "1rem" }}>
          <div style={{ maxWidth: "28rem", textAlign: "center" }}>
            <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>
              Critical System Error
            </h2>
            <p style={{ marginBottom: "1.5rem", color: "#4b5563", lineHeight: "1.5" }}>
              A fatal error occurred. We have been notified and are looking into it. Please try reloading the page.
            </p>
            <button
              onClick={() => retry()}
              style={{ padding: "0.5rem 1rem", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "0.375rem", fontWeight: "500", cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
