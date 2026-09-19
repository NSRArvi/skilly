"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/client";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setError("");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-xl border-border p-8 rounded-3xl shadow-2xl overflow-hidden" showCloseButton>
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none z-[-1]" />

        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-3xl font-bold text-foreground text-center">
            Welcome back
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm text-center">
            Sign in to your Skilly account
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-background border border-border text-foreground py-3.5 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-muted/50 transition-colors shadow-sm"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.73 17.57V20.34H19.29C21.37 18.42 22.56 15.6 22.56 12.25Z"
              fill="#4285F4"
            />
            <path
              d="M12 23C14.97 23 17.46 22.02 19.29 20.34L15.73 17.57C14.74 18.23 13.48 18.64 12 18.64C9.14 18.64 6.7 16.71 5.83 14.12H2.15V16.97C3.96 20.57 7.7 23 12 23Z"
              fill="#34A853"
            />
            <path
              d="M5.83 14.12C5.61 13.46 5.48 12.75 5.48 12C5.48 11.25 5.61 10.54 5.83 9.88V7.03H2.15C1.41 8.52 1 10.21 1 12C1 13.79 1.41 15.48 2.15 16.97L5.83 14.12Z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.36C13.62 5.36 15.07 5.92 16.21 7.01L19.37 3.85C17.46 2.07 14.97 1 12 1C7.7 1 3.96 3.43 2.15 7.03L5.83 9.88C6.7 7.29 9.14 5.36 12 5.36Z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <p className="text-muted-foreground text-sm mt-8 text-center">
          By continuing, you agree to Skilly's{" "}
          <Link href="#" className="underline hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}
