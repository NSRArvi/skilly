"use client";

import React, { useEffect, useState } from "react";
import Container from "../../components/shared/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
  Plus,
  Timer,
  Loader2,
} from "lucide-react";
import { createClient } from "../../lib/client";
import { toast } from "sonner";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Fetch taxonomy
  useEffect(() => {
    const fetchTaxonomy = async () => {
      const supabase = createClient();
      const { data: catData } = await supabase.from("categories").select("*").order("name");
      if (catData) setCategories(catData);
      const { data: subData } = await supabase.from("subcategories").select("*").order("name");
      if (subData) setSubcategories(subData);
    };
    fetchTaxonomy();
  }, []);

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("jobs")
        .select("*, categories(name), subcategories(name)")
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }
      if (selectedSubcategory !== "all") {
        query = query.eq("subcategory_id", selectedSubcategory);
      }
      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
      } else {
        query = query.neq("status", "over");
      }
      if (selectedType !== "all") {
        query = query.eq("job_type", selectedType);
      }
      if (searchTerm.trim()) {
        query = query.ilike("title", `%${searchTerm.trim()}%`);
      }

      const { data } = await query;
      if (data) setJobs(data);
      setLoading(false);
    };

    fetchJobs();
  }, [selectedCategory, selectedSubcategory, selectedStatus, selectedType, searchTerm]);

  const currencySymbol = { BDT: "৳", USD: "$", EUR: "€", GBP: "£" };

  const statusConfig = {
    opening_soon: { label: "Opening Soon", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
    running: { label: "Running", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
    over: { label: "Over", className: "bg-red-500/15 text-red-600 border-red-500/30" },
  };

  return (
    <div className="min-h-screen bg-background py-10 md:py-14">
      <Container>
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Jobs & Projects
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {!loading && `${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <Link href="/jobs/create">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-10 px-5 rounded-xl text-sm flex items-center gap-2 shadow-sm shadow-primary/20">
              <Plus className="w-4 h-4" />
              Post a Job
            </Button>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 md:p-5 mb-8 shadow-sm space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search job title..."
              className="pl-9 bg-background/50 border-border text-foreground h-10 rounded-xl text-sm"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-8 w-[140px] rounded-lg bg-background/60 border-border/60 text-[11px] font-semibold">
                <SelectValue placeholder="Status">
                  {selectedStatus === "all" ? "All Status" : statusConfig[selectedStatus]?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="opening_soon">Opening Soon</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="over">Over</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-8 w-[140px] rounded-lg bg-background/60 border-border/60 text-[11px] font-semibold">
                <SelectValue placeholder="Job Type">
                  {selectedType === "all" ? "All Types" : selectedType.replace("-", " ")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-Time</SelectItem>
                <SelectItem value="part-time">Part-Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
            <button
              onClick={() => { setSelectedCategory("all"); setSelectedSubcategory("all"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 border border-border/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory("all"); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 border border-border/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Subcategory pills */}
          {selectedCategory !== "all" && (
            <div className="flex flex-wrap items-center gap-1.5 pl-4 border-l-2 border-primary/30">
              <button
                onClick={() => setSelectedSubcategory("all")}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                  selectedSubcategory === "all"
                    ? "bg-foreground text-background"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/40"
                }`}
              >
                All in {categories.find(c => c.id === selectedCategory)?.name}
              </button>
              {subcategories.filter(s => s.category_id === selectedCategory).map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                    selectedSubcategory === sub.id
                      ? "bg-foreground text-background"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/40"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-1/4 bg-muted rounded" />
                    <div className="h-6 w-3/4 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-muted rounded-full" />
                      <div className="h-6 w-20 bg-muted rounded-full" />
                    </div>
                  </div>
                  <div className="w-32 space-y-3">
                    <div className="h-6 w-full bg-muted rounded" />
                    <div className="h-9 w-full bg-muted rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => {
              const sym = currencySymbol[job.salary_currency] || job.salary_currency || "";
              const salaryStr = job.salary_min && job.salary_max
                ? `${sym}${job.salary_min.toLocaleString()} - ${sym}${job.salary_max.toLocaleString()}`
                : job.salary_min ? `From ${sym}${job.salary_min.toLocaleString()}`
                : job.salary_max ? `Up to ${sym}${job.salary_max.toLocaleString()}`
                : "Negotiable";

              const locationParts = [job.full_address, job.city, job.state, job.country].filter(Boolean);
              const locationStr = locationParts.length > 0 ? locationParts.join(", ") : job.location_type;

              const st = statusConfig[job.status] || statusConfig.running;
              const timeAgo = getTimeAgo(job.created_at);

              return (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                  <div className="bg-card border border-border hover:border-primary/50 transition-all rounded-2xl p-5 md:p-6 shadow-sm group cursor-pointer">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {job.company_name && (
                            <span className="font-semibold text-xs text-primary flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {job.company_name}
                            </span>
                          )}
                          <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${st.className}`}>
                            {st.label}
                          </Badge>
                          {job.priority === "urgent" && (
                            <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md border">
                              🔥 Urgent
                            </Badge>
                          )}
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo}
                          </span>
                        </div>

                        <h2 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {job.title}
                        </h2>

                        {job.description && (
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 max-w-3xl leading-relaxed">
                            {job.description}
                          </p>
                        )}

                        {/* Category & Skills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.categories?.name && (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                              {job.categories.name}
                            </span>
                          )}
                          {job.skills?.slice(0, 3).map((skill) => (
                            <span key={skill} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-background/70 border border-border text-foreground">
                              {skill}
                            </span>
                          ))}
                          {job.skills?.length > 3 && (
                            <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-muted text-muted-foreground">
                              +{job.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border/60 flex-shrink-0">
                        <div className="text-left md:text-right">
                          <p className="text-base md:text-lg font-bold text-foreground">{salaryStr}</p>
                          <p className="text-xs text-muted-foreground flex items-center md:justify-end gap-1 capitalize">
                            <MapPin className="w-3 h-3" />
                            {locationStr}
                          </p>
                        </div>
                        <div className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5">
                          View Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-card border border-border rounded-3xl">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No jobs found</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Try adjusting your filters or be the first to post a job!
            </p>
            <Link href="/jobs/create">
              <Button className="rounded-xl font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Post a Job
              </Button>
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}

// Helper
function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
