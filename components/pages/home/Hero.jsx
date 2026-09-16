import React from "react";
import { Search, ShieldCheck, Star, Zap } from "lucide-react";

export default function Hero() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center pt-32 pb-20 px-4 relative overflow-hidden transition-colors duration-300">
      {/* Background ambient glow */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Headline */}
      <h1 className="text-5xl sm:text-6xl md:text-[5.5rem] font-bold text-foreground text-center tracking-tight leading-[1.05] max-w-4xl mb-6 relative z-10">
        Connect, chat, and hire <br className="hidden sm:block" />
        <span className="text-primary">verified professionals</span>.
      </h1>

      {/* Subtitle */}
      <p className="text-muted-foreground text-lg sm:text-xl text-center max-w-3xl mb-12 leading-relaxed relative z-10">
        Skilly is the premier platform to showcase your professional profile,
        connect seamlessly via in-app chat, and hire exactly who you need for
        your next project.
      </p>

      {/* Search Bar */}
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl p-2 pl-6 flex items-center gap-3 shadow-2xl relative z-10 transition-all duration-300 focus-within:border-primary focus-within:shadow-[0_0_15px_var(--color-primary)]">
        <Search className="text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Search for professionals, roles, or skills..."
          className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base sm:text-lg"
        />
        <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
          Search
        </button>
      </div>

      {/* Popular Skills */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 text-sm flex-wrap justify-center relative z-10">
        <span className="text-muted-foreground mr-2">Popular:</span>
        {[
          "System Design",
          "Brand Strategy",
          "Growth Marketing",
          "Fundraising",
        ].map((skill) => (
          <button
            key={skill}
            className="bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors px-4 py-1.5 rounded-full"
          >
            {skill}
          </button>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-sm text-muted-foreground relative z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary w-5 h-5" />
          <span>100% ID Verified Professionals</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="text-primary w-5 h-5" />
          <span>4.9 average session rating</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="text-primary w-5 h-5" />
          <span>Book in under 60 seconds</span>
        </div>
      </div>
    </main>
  );
}
