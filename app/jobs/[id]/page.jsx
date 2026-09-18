"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Container from "../../../components/shared/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  CheckCircle2,
  Calendar,
  Share2,
  Users,
  AlertCircle,
  Timer,
  Copy,
} from "lucide-react";
import { createClient } from "../../../lib/client";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("jobs")
        .select("*, categories(name), subcategories(name)")
        .eq("id", id)
        .single();

      if (data) {
        setJob(data);

        // Fetch poster info
        const { data: profData } = await supabase
          .from("professionals")
          .select("full_name, avatar_url, is_verified, profession")
          .eq("user_id", data.user_id)
          .single();

        if (profData) setPoster(profData);

        if (user) {
          const { data: applyData } = await supabase
            .from("job_applications")
            .select("id")
            .eq("job_id", id)
            .eq("applicant_id", user.id)
            .maybeSingle();

          if (applyData) setHasApplied(true);
        }
      }
      setLoading(false);
    };

    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!currentUserId) {
      toast.error("Please login to apply.");
      return;
    }

    setIsApplying(true);
    const supabase = createClient();

    const { error } = await supabase.from("job_applications").insert({
      job_id: id,
      applicant_id: currentUserId,
      cover_letter: coverLetter.trim() || null,
      status: "pending",
    });

    setIsApplying(false);

    if (error) {
      toast.error("Failed to submit application. Please try again.");
    } else {
      toast.success("Application submitted successfully!");
      setHasApplied(true);
      setApplyModalOpen(false);
      setCoverLetter("");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Job link copied to clipboard!");
    }
  };

  const currencySymbol = {
    BDT: "৳",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

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

  const priorityConfig = {
    urgent: {
      label: "Urgent",
      className: "bg-red-500/15 text-red-600 border-red-500/30",
    },
    regular: {
      label: "Regular",
      className: "bg-muted text-muted-foreground border-border/50",
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-10 md:py-14">
        <Container>
          <div className="space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-muted rounded-xl" />
            <div className="bg-card border border-border rounded-2xl p-8 space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
              <div className="h-24 w-full bg-muted rounded" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background py-10 md:py-14">
        <Container>
          <div className="text-center py-24 bg-card border border-border rounded-3xl">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Job not found
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              This job may have been removed or doesn&apos;t exist.
            </p>
            <Link href="/jobs">
              <Button className="rounded-xl font-semibold">
                Browse All Jobs
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const sym = currencySymbol[job.salary_currency] || job.salary_currency;
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
    locationParts.length > 0 ? locationParts.join(", ") : null;

  const postedDate = new Date(job.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const deadlineStr = job.application_deadline
    ? new Date(job.application_deadline).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const st = statusConfig[job.status] || statusConfig.running;
  const pr = priorityConfig[job.priority] || priorityConfig.regular;

  return (
    <div className="min-h-screen bg-background py-10 md:py-14">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/jobs"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border hover:bg-muted transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </Link>
          <Button
            onClick={handleShare}
            variant="outline"
            className="rounded-xl h-10 px-4 text-xs font-semibold flex items-center gap-2"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${st.className}`}
                >
                  {st.label}
                </Badge>
                {job.priority === "urgent" && (
                  <Badge
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${pr.className}`}
                  >
                    🔥 Urgent
                  </Badge>
                )}
                <Badge className="bg-muted text-muted-foreground border-border/50 text-[10px] font-semibold px-2.5 py-1 rounded-lg capitalize">
                  {job.job_type?.replace("-", " ")}
                </Badge>
                <Badge className="bg-muted text-muted-foreground border-border/50 text-[10px] font-semibold px-2.5 py-1 rounded-lg capitalize">
                  {job.location_type}
                </Badge>
              </div>

              {/* Title & Company */}
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                  {job.title}
                </h1>
                {job.company_name && (
                  <p className="text-sm font-semibold text-primary mt-1 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {job.company_name}
                  </p>
                )}
              </div>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                {locationStr && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {locationStr}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Posted {postedDate}
                </span>
                {deadlineStr && (
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <Timer className="w-3.5 h-3.5" />
                    Deadline: {deadlineStr}
                  </span>
                )}
              </div>

              {/* Category */}
              {(job.categories?.name || job.subcategories?.name) && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Category:</span>
                  {job.categories?.name && (
                    <span className="font-semibold text-primary">
                      {job.categories.name}
                    </span>
                  )}
                  {job.categories?.name && job.subcategories?.name && (
                    <span className="text-muted-foreground">•</span>
                  )}
                  {job.subcategories?.name && (
                    <span className="font-medium text-foreground">
                      {job.subcategories.name}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {job.description && (
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-3">
                <h2 className="text-base font-bold text-foreground">
                  Job Description
                </h2>
                <div className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-3">
                <h2 className="text-base font-bold text-foreground">
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-muted/60 border border-border/60 rounded-lg text-xs font-medium text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Salary Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Compensation
              </h3>
              <div>
                <p className="text-2xl font-extrabold text-foreground">
                  {salaryStr}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                  {job.salary_currency} / {job.salary_period}
                </p>
              </div>
            </div>

            {/* Schedule Card */}
            {(job.office_days || job.work_hours_per_week || job.start_time) && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Schedule
                </h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  {job.office_days && (
                    <div className="flex justify-between">
                      <span>Office Days</span>
                      <span className="text-foreground font-medium">
                        {job.office_days}
                      </span>
                    </div>
                  )}
                  {job.work_hours_per_week && (
                    <div className="flex justify-between">
                      <span>Hours / Week</span>
                      <span className="text-foreground font-medium">
                        {job.work_hours_per_week}h
                      </span>
                    </div>
                  )}
                  {job.start_time && job.close_time && (
                    <div className="flex justify-between">
                      <span>Working Hours</span>
                      <span className="text-foreground font-medium">
                        {job.start_time} - {job.close_time}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Posted By */}
            {poster && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Posted By
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                    {poster.avatar_url ? (
                      <img
                        src={poster.avatar_url}
                        alt={poster.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {poster.full_name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      {poster.full_name}
                      {poster.is_verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {poster.profession || "Professional"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {currentUserId === job.user_id ? (
                <Link href={`/jobs/${job.id}/edit`}>
                  <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm shadow-md shadow-primary/20 mb-3">
                    Edit Job
                  </Button>
                </Link>
              ) : job.status === "over" ? (
                <Button
                  disabled
                  className="w-full h-12 rounded-xl bg-muted text-muted-foreground font-bold text-sm shadow-sm mb-3 cursor-not-allowed"
                >
                  Applications Closed
                </Button>
              ) : hasApplied ? (
                <Button
                  disabled
                  className="w-full h-12 rounded-xl bg-muted text-muted-foreground font-bold text-sm shadow-sm mb-3 cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Applied
                </Button>
              ) : (
                <Button
                  onClick={() => setApplyModalOpen(true)}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm shadow-md shadow-primary/20 mb-3"
                >
                  Apply Now
                </Button>
              )}
              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full h-10 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Job Link
              </Button>
            </div>
          </div>
        </div>
      </Container>

      {/* Apply Modal */}
      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
            <DialogDescription>
              Write a short cover letter or proposal explaining why you are a
              good fit for this job.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Your cover letter or proposal..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[150px] resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApplyModalOpen(false)}
              disabled={isApplying}
            >
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={isApplying}>
              {isApplying ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
