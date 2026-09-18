"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Plus,
  MapPin,
  Clock,
  Trash2,
  ExternalLink,
  Loader2,
  Pencil,
  Users,
} from "lucide-react";
import { createClient } from "../../../../lib/client";
import { toast } from "sonner";
import Link from "next/link";

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

const currencySymbol = { BDT: "৳", USD: "$", EUR: "€", GBP: "£" };

export default function DashboardJobsTab({ userId }) {
  const [view, setView] = useState("posted"); // 'posted' or 'applied'
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyJobs = async () => {
    if (!userId) return;
    setLoading(true);
    const supabase = createClient();

    if (view === "posted") {
      const { data } = await supabase
        .from("jobs")
        .select(
          "*, categories(name), subcategories(name), job_applications(id)",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (data) setJobs(data);
    } else {
      const { data } = await supabase
        .from("job_applications")
        .select(
          "id, status, created_at, cover_letter, jobs(*, categories(name), subcategories(name))",
        )
        .eq("applicant_id", userId)
        .order("created_at", { ascending: false });

      if (data) {
        // Flatten so it resembles a job object but with application details
        const flattened = data
          .map((app) => {
            // Handle cases where job might be deleted
            if (!app.jobs) return null;
            return {
              ...app.jobs,
              application_id: app.id,
              application_status: app.status,
              applied_at: app.created_at,
            };
          })
          .filter(Boolean);
        setJobs(flattened);
      } else {
        setJobs([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMyJobs();
  }, [userId, view]);

  const handleDelete = async (jobId, jobTitle) => {
    if (!confirm(`Are you sure you want to delete "${jobTitle}"?`)) return;

    const supabase = createClient();
    const { error } = await supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      toast.error("Failed to delete job");
    } else {
      toast.success("Job deleted successfully");
      setJobs(jobs.filter((j) => j.id !== jobId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (jobs.length === 0 && view === "posted") {
    return (
      <div className="space-y-4">
        {/* View Toggle */}
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit">
          <button
            onClick={() => setView("posted")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              view === "posted"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Posted Jobs
          </button>
          <button
            onClick={() => setView("applied")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              view === "applied"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Applied Jobs
          </button>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground space-y-3">
          <Briefcase className="w-8 h-8 text-primary mx-auto" />
          <h3 className="text-foreground font-semibold">No Jobs Posted Yet</h3>
          <p className="text-xs max-w-md mx-auto">
            Post your first job to start receiving applications from talented
            professionals.
          </p>
          <Link href="/jobs/create">
            <Button className="mt-2 text-xs font-bold rounded-xl">
              <Plus className="w-4 h-4 mr-1" />
              Post a Job
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit">
          <button
            onClick={() => setView("posted")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              view === "posted"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Posted Jobs
          </button>
          <button
            onClick={() => setView("applied")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              view === "applied"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Applied Jobs
          </button>
        </div>

        {view === "posted" && (
          <Link href="/jobs/create">
            <Button size="sm" className="h-8 rounded-lg text-xs font-semibold">
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Job
            </Button>
          </Link>
        )}
      </div>

      {jobs.length === 0 && view === "applied" && (
        <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground space-y-3">
          <Briefcase className="w-8 h-8 text-primary mx-auto" />
          <h3 className="text-foreground font-semibold">No Applications Yet</h3>
          <p className="text-xs max-w-md mx-auto">
            You haven't applied to any jobs yet. Browse available jobs and
            submit your proposals.
          </p>
          <Link href="/jobs">
            <Button className="mt-2 text-xs font-bold rounded-xl">
              <ExternalLink className="w-4 h-4 mr-1" />
              Browse Jobs
            </Button>
          </Link>
        </div>
      )}

      {/* Header */}
      {jobs.length > 0 && (
        <h3 className="text-sm font-bold text-foreground">
          {view === "posted"
            ? `Your Jobs (${jobs.length})`
            : `Your Applications (${jobs.length})`}
        </h3>
      )}

      {/* Job Cards */}
      {jobs.map((job) => {
        const sym = currencySymbol[job.salary_currency] || "";
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
          job.state,
          job.country,
        ].filter(Boolean);
        const locationStr =
          locationParts.length > 0
            ? locationParts.join(", ")
            : job.location_type || "Remote";

        const st = statusConfig[job.status] || statusConfig.running;

        const timeAgo = getTimeAgo(job.created_at);

        return (
          <div
            key={job.id}
            className="bg-card border border-border rounded-xl p-4 md:p-5 hover:border-primary/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
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
                  <span className="text-[11px] text-muted-foreground">
                    {timeAgo}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-foreground truncate">
                  {job.title}
                </h4>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {locationStr}
                  </span>
                  <span className="font-semibold text-foreground">
                    {salaryStr}
                  </span>
                  {job.categories?.name && (
                    <span className="text-primary font-medium">
                      {job.categories.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0 mt-3 sm:mt-0">
                {view === "posted" ? (
                  <>
                    <Link href={`/jobs/${job.id}/applicants`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg text-[11px] font-semibold gap-1 bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
                      >
                        <Users className="w-3 h-3" />
                        Applicants ({job.job_applications?.length || 0})
                      </Button>
                    </Link>
                    <Link href={`/jobs/${job.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg text-[11px] font-semibold gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/jobs/${job.id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg text-[11px] font-semibold gap-1 text-primary hover:text-primary hover:bg-primary/10 border-primary/30"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(job.id, job.title)}
                      className="h-8 rounded-lg text-[11px] font-semibold gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge className="bg-muted text-foreground border-border text-[10px] font-bold px-2.5 py-1">
                      Status: {job.application_status}
                    </Badge>
                    <Link href={`/jobs/${job.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg text-[11px] font-semibold gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Job
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
