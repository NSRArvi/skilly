"use client";

import React, { useState } from "react";
import Container from "../../components/shared/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  CheckCircle2,
  ArrowRight,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

const mockJobs = [
  {
    id: "job-1",
    title: "Senior Design Systems Architect",
    company: "FinFlow Labs",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80",
    isVerified: true,
    location: "Remote (Global)",
    type: "Full-Time Contract",
    rate: "$85 - $110 / hr",
    posted: "2 hours ago",
    description:
      "Looking for an experienced systems architect to overhaul our multi-brand token system across React, Figma, and mobile platforms.",
    skills: ["Figma Tokens", "React", "Design Systems", "Tailwind CSS"],
  },
  {
    id: "job-2",
    title: "Lead Frontend Engineer (Next.js)",
    company: "Aether AI",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80",
    isVerified: true,
    location: "London, UK (Hybrid)",
    type: "Full-Time",
    rate: "£90k - £120k / yr",
    posted: "5 hours ago",
    description:
      "Lead our core dashboard pod delivering low-latency generative AI tools with high-fidelity animations and server actions.",
    skills: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
  },
  {
    id: "job-3",
    title: "Product Designer (Fintech & Crypto)",
    company: "Starlight Pay",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80",
    isVerified: true,
    location: "New York, USA (Remote)",
    type: "Part-Time Contract",
    rate: "$65 - $80 / hr",
    posted: "1 day ago",
    description:
      "Design zero-friction checkout and escrow workflows with institutional typography and strict accessibility governance.",
    skills: ["UI/UX Design", "Fintech", "User Research", "WCAG 2.2"],
  },
  {
    id: "job-4",
    title: "Senior Full-Stack Developer",
    company: "Nexus Cloud",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80",
    isVerified: false,
    location: "Remote (Europe)",
    type: "Contract",
    rate: "$70 - $95 / hr",
    posted: "2 days ago",
    description:
      "Build scalable serverless APIs, Postgres database triggers, and client dashboard widgets for our cloud infrastructure platform.",
    skills: ["PostgreSQL", "Node.js", "React", "Docker"],
  },
];

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Design", "Engineering", "Fintech", "Product"];

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    if (selectedCategory === "All") return matchesSearch;
    return (
      matchesSearch &&
      job.skills.some((s) =>
        s.toLowerCase().includes(selectedCategory.toLowerCase()),
      )
    );
  });

  return (
    <div className="min-h-screen bg-background py-10 md:py-14">
      <Container>
        {/* Page Header */}
        <div className="max-w-3xl mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Briefcase className="w-3.5 h-3.5" />
            Public Opportunities
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Jobs & Projects
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Discover verified contracts, high-impact freelance projects, and
            full-time roles from innovative startups and global companies.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 md:p-5 mb-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search job title, skills, or company..."
                className="pl-9 bg-background/50 border-border text-foreground h-11 rounded-xl text-sm"
              />
            </div>
            <Button
              onClick={() => toast.success("Job posting modal opened!")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-11 px-6 rounded-xl text-sm flex items-center gap-2 shadow-sm shadow-primary/20"
            >
              Post a Job
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
            <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </span>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "bg-background/60 border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-card border border-border hover:border-primary/50 transition-all rounded-2xl p-5 md:p-6 shadow-sm group relative"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-xs text-primary flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {job.company}
                    </span>
                    {job.isVerified && (
                      <Badge className="bg-primary/15 text-primary border-none text-[10px] px-2 py-0.5 gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Employer
                      </Badge>
                    )}
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {job.posted}
                    </span>
                  </div>

                  <h2 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {job.title}
                  </h2>

                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 max-w-3xl leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-background/70 border border-border text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right side rate & apply */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border/60">
                  <div className="text-left md:text-right">
                    <p className="text-base md:text-lg font-bold text-foreground">
                      {job.rate}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center md:justify-end gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </p>
                  </div>

                  <Button
                    onClick={() =>
                      toast.success(`Application submitted for ${job.title}!`)
                    }
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-5 h-9 rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-primary/20"
                  >
                    Apply Now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="text-center py-16 bg-card border border-border rounded-2xl p-8 space-y-3">
              <p className="text-base font-semibold text-foreground">
                No jobs found matching your criteria
              </p>
              <p className="text-xs text-muted-foreground">
                Try searching for a different skill or reset your filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="mt-2 rounded-xl"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
