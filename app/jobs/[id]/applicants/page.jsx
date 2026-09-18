"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Container from "../../../../components/shared/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users,
  AlertCircle,
  FileText,
  Loader2,
  ExternalLink,
  CheckCircle,
  XCircle,
  MessageSquare,
  MessageCircle,
} from "lucide-react";
import { createClient } from "../../../../lib/client";
import { toast } from "sonner";
import Link from "next/link";

const statusConfig = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  },
  accepted: {
    label: "Accepted",
    className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/15 text-red-600 border-red-500/30",
  },
};

export default function JobApplicantsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch Job to verify ownership
      const { data: jobData } = await supabase
        .from("jobs")
        .select("id, title, user_id")
        .eq("id", id)
        .single();

      if (!jobData || jobData.user_id !== user.id) {
        setLoading(false);
        return; // Either doesn't exist or not the owner
      }

      setJob(jobData);

      // Fetch Applications
      const { data: appsData, error: appsError } = await supabase
        .from("job_applications")
        .select(
          `
          id,
          status,
          cover_letter,
          created_at,
          applicant_id
        `,
        )
        .eq("job_id", id)
        .order("created_at", { ascending: false });

      if (appsData && appsData.length > 0) {
        // Fetch profiles for these applicants
        const applicantIds = appsData.map((a) => a.applicant_id);
        const { data: profiles } = await supabase
          .from("professionals")
          .select("user_id, full_name, avatar_url, profession, is_verified")
          .in("user_id", applicantIds);

        if (profiles) {
          const enriched = appsData.map((app) => {
            const profile = profiles.find(
              (p) => p.user_id === app.applicant_id,
            );
            return {
              ...app,
              profile: profile || { full_name: "Unknown User" },
            };
          });
          setApplications(enriched);
        } else {
          setApplications(appsData);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [id, router]);

  const handleUpdateStatus = async (appId, newStatus) => {
    setProcessingId(appId);
    const supabase = createClient();

    const { error } = await supabase
      .from("job_applications")
      .update({ status: newStatus })
      .eq("id", appId);

    if (error) {
      toast.error(`Failed to mark as ${newStatus}`);
    } else {
      toast.success(`Application marked as ${newStatus}`);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)),
      );
    }
    setProcessingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-10 md:py-14">
        <Container>
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Unauthorized
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              You don't have permission to view applicants for this job.
            </p>
            <Link href="/dashboard">
              <Button className="rounded-xl font-semibold">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 md:py-14">
      <Container>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border hover:bg-muted transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Applicants
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              For:{" "}
              <span className="font-medium text-foreground">{job.title}</span>
            </p>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">
              No Applicants Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
              Nobody has applied to this job yet. Check back later when
              professionals discover your posting!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const st = statusConfig[app.status] || statusConfig.pending;
              const dateStr = new Date(app.created_at).toLocaleDateString();

              return (
                <div
                  key={app.id}
                  className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Profile Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted overflow-hidden flex-shrink-0">
                        {app.profile?.avatar_url ? (
                          <img
                            src={app.profile.avatar_url}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground">
                            {app.profile?.full_name?.charAt(0) || "U"}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          {app.profile?.full_name || "Unknown User"}
                        </h4>
                        {app.profile?.profession && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {app.profile.profession}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${st.className}`}
                          >
                            {st.label}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            Applied {dateStr}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/professionals/${app.applicant_id}`}
                        target="_blank"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg text-xs font-semibold gap-1.5 border-primary/20 hover:bg-primary/5 text-primary"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Profile
                        </Button>
                      </Link>

                      {app.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(app.id, "accepted")
                            }
                            disabled={processingId === app.id}
                            className="h-8 rounded-lg text-xs font-semibold gap-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/30"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(app.id, "rejected")
                            }
                            disabled={processingId === app.id}
                            className="h-8 rounded-lg text-xs font-semibold gap-1.5 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/30"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </Button>
                        </>
                      )}

                      {app.status === "accepted" && (
                        <Link href={`/messages?user_id=${app.applicant_id}`}>
                          <Button
                            size="sm"
                            className="h-8 rounded-lg text-xs font-semibold gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Message
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
                    <h5 className="text-xs font-semibold flex items-center gap-1.5 text-foreground mb-2">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      Cover Letter / Proposal
                    </h5>
                    {app.cover_letter ? (
                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                        {app.cover_letter}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No cover letter provided.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
