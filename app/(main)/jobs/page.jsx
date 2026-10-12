"use client";

import React, { useEffect, useState } from "react";
import Container from "@/components/shared/Container";
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
import CommonTaxonomyLocationFilter from "@/components/shared/CommonTaxonomyLocationFilter";
import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  Building2,
  ArrowRight,
  SlidersHorizontal,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { createClient } from "@/lib/client";
import Link from "next/link";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

export default function JobsPage() {
  const { requireAuth } = useAuthModal();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedVerified, setSelectedVerified] = useState("all");

  // Fetch taxonomy
  useEffect(() => {
    const fetchTaxonomy = async () => {
      const supabase = createClient();
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (catData) setCategories(catData);
      const { data: subData } = await supabase
        .from("subcategories")
        .select("*")
        .order("name");
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
      if (selectedVerified !== "all") {
        query = query.eq("is_verified", selectedVerified === "true");
      }
      if (searchTerm.trim()) {
        query = query.ilike("title", `%${searchTerm.trim()}%`);
      }

      const { data } = await query;
      if (data) setJobs(data);
      setLoading(false);
    };

    fetchJobs();
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedStatus,
    selectedType,
    selectedVerified,
    searchTerm,
  ]);

  const currencySymbol = { BDT: "৳", USD: "$", EUR: "€", GBP: "£" };

  const statusConfig = {
    opening_soon: {
      label: "Opening Soon",
      className: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    },
    running: {
      label: "Running",
      className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    },
    over: {
      label: "Over",
      className: "bg-red-500/15 text-red-600 border-red-500/30",
    },
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
              {!loading &&
                `${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <Link href="/jobs/create" onClick={(e) => requireAuth(e, undefined)}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-10 px-5 rounded-xl text-sm flex items-center gap-2 shadow-sm shadow-primary/20">
              <Plus className="w-4 h-4" />
              Post a Job
            </Button>
          </Link>
        </div>

        {/* Unified Minimal & Professional Filter Section */}
        {(() => {
          const activeFilterCount = [
            selectedCategory !== "all",
            selectedSubcategory !== "all",
            selectedStatus !== "all",
            selectedType !== "all",
            selectedVerified !== "all",
          ].filter(Boolean).length;

          const clearAllFilters = () => {
            setSelectedCategory("all");
            setSelectedSubcategory("all");
            setSelectedStatus("all");
            setSelectedType("all");
            setSelectedVerified("all");
            setSearchTerm("");
          };

          return (
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 mb-8 shadow-sm space-y-4">
              {/* Row 1: Search + Quick Filters */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Search Bar */}
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by job title, skills or keywords..."
                    className="w-full h-10 pl-10 pr-9 rounded-xl bg-background/60 hover:bg-background border border-border text-foreground text-xs md:text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="md:col-span-2">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="h-10 rounded-xl bg-background/60 hover:bg-background border-border text-xs md:text-sm font-medium">
                      <div className="flex items-center gap-2 truncate">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <SelectValue placeholder="Status">
                          {selectedStatus === "all"
                            ? "All Status"
                            : statusConfig[selectedStatus]?.label}
                        </SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="opening_soon">Opening Soon</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="over">Over</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Type Filter */}
                <div className="md:col-span-3">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="h-10 rounded-xl bg-background/60 hover:bg-background border-border text-xs md:text-sm font-medium">
                      <div className="flex items-center gap-2 truncate">
                        <Briefcase className="w-3.5 h-3.5 text-primary shrink-0" />
                        <SelectValue placeholder="Job Type">
                          {selectedType === "all"
                            ? "All Types"
                            : selectedType.replace("-", " ")}
                        </SelectValue>
                      </div>
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

                {/* Verification Filter */}
                <div className="md:col-span-2">
                  <Select value={selectedVerified} onValueChange={setSelectedVerified}>
                    <SelectTrigger className="h-10 rounded-xl bg-background/60 hover:bg-background border-border text-xs md:text-sm font-medium">
                      <div className="flex items-center gap-2 truncate">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                        <SelectValue placeholder="Verification">
                          {selectedVerified === "all"
                            ? "All Jobs"
                            : selectedVerified === "true"
                            ? "Verified Only"
                            : "Unverified"}
                        </SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="all">All Jobs</SelectItem>
                      <SelectItem value="true">Verified Only</SelectItem>
                      <SelectItem value="false">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Refine Header Row */}
              <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                <div className="flex items-center gap-2 font-medium text-muted-foreground">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                  <span>Filter by Category & Specialization</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20">
                      {activeFilterCount} active
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Reset all filters
                  </button>
                )}
              </div>

              {/* Common Category & Subcategory Filter */}
              <CommonTaxonomyLocationFilter
                categories={categories}
                subcategories={subcategories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedSubcategory={selectedSubcategory}
                onSubcategoryChange={setSelectedSubcategory}
                showLocation={false}
              />
            </div>
          );
        })()}

        {/* Job Listings */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-6 animate-pulse"
              >
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
              const sym =
                currencySymbol[job.salary_currency] ||
                job.salary_currency ||
                "";
              const salaryStr =
                job.salary_min && job.salary_max
                  ? `${sym}${job.salary_min.toLocaleString()} - ${sym}${job.salary_max.toLocaleString()}`
                  : job.salary_min
                    ? `From ${sym}${job.salary_min.toLocaleString()}`
                    : job.salary_max
                      ? `Up to ${sym}${job.salary_max.toLocaleString()}`
                      : "Negotiable";

              const locationParts = [
                job.full_address,
                job.city,
                job.state && job.state !== job.city ? job.state : null,
                job.country || "Bangladesh",
              ].filter(Boolean);
              const locationStr =
                locationParts.length > 0
                  ? locationParts.join(", ")
                  : job.location_type;

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
                          {job.is_verified && (
                            <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </Badge>
                          )}
                          <Badge
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${st.className}`}
                          >
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
                            <span
                              key={skill}
                              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-background/70 border border-border text-foreground"
                            >
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
                          <p className="text-base md:text-lg font-bold text-foreground">
                            {salaryStr}
                          </p>
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
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No jobs found
            </h3>
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
