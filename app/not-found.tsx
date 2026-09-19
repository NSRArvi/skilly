"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-md mx-auto">
        <div className="w-24 h-24 bg-muted/50 rounded-3xl mx-auto flex items-center justify-center border border-border/60 shadow-sm rotate-3">
          <Compass className="w-12 h-12 text-primary/80" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base px-4 leading-relaxed">
            Oops! The page you're looking for doesn't exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold h-11 px-6 shadow-sm shadow-primary/20 gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto rounded-xl font-semibold h-11 px-6 border-border hover:bg-muted/50 gap-2"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
