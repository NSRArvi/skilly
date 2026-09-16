import React from "react";
import { UserSearch, ShieldCheck, CalendarCheck } from "lucide-react";
import Container from "../../shared/Container";

const steps = [
  {
    number: "01",
    title: "Find your expert",
    description:
      "Search by skill and browse mentors filtered by rating, price, and availability. Every profile is transparent.",
    icon: UserSearch,
  },
  {
    number: "02",
    title: "Verified & vetted",
    description:
      "Each mentor passes government ID verification and a professional background review before they can accept a single booking.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Book & meet",
    description:
      "Pick a time, pay securely, and join your 1:1 video session. Not satisfied? Your session is money-back guaranteed.",
    icon: CalendarCheck,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 w-full">
      <Container>
        <div className="max-w-2xl mb-16">
          <h2 className="text-primary font-semibold text-sm mb-3">
            How it works
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
            Verified in 3 steps, booked in minutes
          </h3>
          <p className="text-muted-foreground text-lg">
            Trust is built into every step. Here's how Skilly keeps your
            sessions safe and high-quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-8 relative flex flex-col h-full hover:border-primary/30 transition-colors group"
            >
              <span className="absolute top-8 right-8 text-muted-foreground/40 font-bold text-lg">
                {step.number}
              </span>
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-3">
                {step.title}
              </h4>
              <p className="text-muted-foreground leading-relaxed flex-1">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="bg-primary/5 dark:bg-[#111A13] border border-primary/20 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-lg">
          {/* Subtle glow inside the banner */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 text-center md:text-left">
            <h4 className="text-2xl font-bold text-foreground mb-2">
              Ready to level up your career?
            </h4>
            <p className="text-muted-foreground">
              Join thousands of professionals learning from verified experts.
            </p>
          </div>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity whitespace-nowrap relative z-10">
            Get started free
          </button>
        </div>
      </Container>
    </section>
  );
}
