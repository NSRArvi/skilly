"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../lib/client";
import Container from "../../../components/shared/Container";
import {
  Loader2,
  ArrowLeft,
  Star,
  CheckCircle2,
  MapPin,
  Globe,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Share2,
  GraduationCap,
  BookOpen,
  ExternalLink,
  Pencil,
} from "lucide-react";
import {
  FaFacebook,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaWhatsapp,
  FaDiscord,
  FaGlobe,
} from "react-icons/fa";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";

export default function ProfessionalDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      const supabase = createClient();

      // Check current auth user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      // Fetch by either row id or user_id for maximum resilience
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .or(`id.eq.${id},user_id.eq.${id}`)
        .limit(1);

      if (data && data.length > 0) {
        const prof = data[0];
        setProfile(prof);
        if (currentUser && (currentUser.id === prof.user_id || currentUser.id === prof.id)) {
          setIsOwner(true);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied to clipboard!");
    }
  };

  const getValidUrl = (url) => {
    if (!url) return "#";
    const cleanUrl = url.trim();
    if (/^https?:\/\//i.test(cleanUrl)) {
      return cleanUrl;
    }
    return `https://${cleanUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Cover Skeleton */}
        <div className="h-64 w-full bg-muted/60 animate-pulse" />
        <Container className="relative">
          <div className="bg-card border border-border rounded-2xl -mt-16 p-8 mb-8 relative z-10 animate-pulse space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-muted -mt-20 border-4 border-card" />
              <div className="flex-1 space-y-3">
                <div className="h-7 bg-muted rounded-lg w-1/3" />
                <div className="h-4 bg-muted rounded-lg w-1/4" />
                <div className="h-4 bg-muted rounded-lg w-1/2 mt-3" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-48 bg-card border border-border rounded-2xl animate-pulse" />
              <div className="h-64 bg-card border border-border rounded-2xl animate-pulse" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="h-64 bg-card border border-border rounded-2xl animate-pulse" />
              <div className="h-48 bg-card border border-border rounded-2xl animate-pulse" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center text-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
          <Briefcase className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Professional Not Found
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm text-sm">
          The professional profile you are looking for does not exist or may have been removed.
        </p>
        <Button
          onClick={() => router.push("/professionals")}
          className="rounded-xl font-bold text-xs"
        >
          Explore All Professionals
        </Button>
      </div>
    );
  }

  // Format joined date
  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  // Location string
  const locationStr =
    profile.present_address?.city && profile.present_address?.country
      ? `${profile.present_address.city}, ${profile.present_address.country}`
      : profile.present_address?.country ||
        profile.permanent_address?.country ||
        "Location not set";

  // Verification status strictly from db
  const isVerified = Boolean(profile.is_verified ?? profile.is_verify);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Cover Image Banner */}
      <div className="h-64 md:h-72 w-full bg-muted relative overflow-hidden">
        <img
          src={
            profile.cover_image_url ||
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070"
          }
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

        {/* Top Floating Action Header */}
        <div className="absolute top-6 inset-x-0 px-6 max-w-7xl mx-auto flex items-center justify-between z-10">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 text-xs gap-1.5 shadow-lg"
            onClick={() => router.push("/professionals")}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Professionals
          </Button>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 text-xs gap-1.5 shadow-lg"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Profile
            </Button>

            {isOwner ? (
              <Button
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs gap-1.5 shadow-lg shadow-primary/20"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Profile
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  if (profile.present_address?.whatsapp) {
                    window.open(
                      `https://wa.me/${profile.present_address.whatsapp.replace(/[^0-9]/g, "")}`,
                      "_blank"
                    );
                  } else if (profile.email) {
                    window.location.href = `mailto:${profile.email}?subject=Collaboration Inquiry`;
                  } else {
                    toast.info("Inquiry sent to professional!");
                  }
                }}
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs shadow-lg shadow-primary/20 px-4"
              >
                Hire Me
              </Button>
            )}
          </div>
        </div>
      </div>

      <Container className="relative">
        {/* Profile Identity Hero Card (matching exact UI design) */}
        <div className="bg-card border border-border rounded-2xl -mt-16 md:-mt-20 p-6 md:p-8 mb-6 relative z-10 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Avatar with Verification / Status Indicator */}
              <div className="relative -mt-16 sm:-mt-20 flex-shrink-0">
                <Avatar
                  className={`w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-4 border-card shadow-2xl bg-muted transition-all ${
                    isVerified
                      ? "ring-2 ring-primary shadow-primary/20"
                      : "ring-1 ring-border/60"
                  }`}
                >
                  <AvatarImage
                    src={profile.avatar_url}
                    alt={profile.full_name || "Professional"}
                  />
                  <AvatarFallback className="bg-primary/20 text-primary text-3xl font-bold">
                    {profile.full_name?.charAt(0) || "P"}
                  </AvatarFallback>
                </Avatar>

                {/* Verification badge / status dot on avatar */}
                {isVerified ? (
                  <div
                    title="100% ID Verified Professional"
                    className="absolute bottom-2 right-2 bg-primary rounded-full p-1 border-2 border-card shadow-md flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4 text-black stroke-[3]" />
                  </div>
                ) : (
                  <div
                    title="Verification Pending"
                    className="absolute bottom-2 right-2 w-4 h-4 bg-muted-foreground/40 rounded-full border-2 border-card ring-1 ring-border"
                  />
                )}
              </div>

              {/* Identity & Headline */}
              <div className="space-y-1.5 pb-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                    {profile.full_name || "Professional"}
                  </h1>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Pro • ID Authenticated
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                      <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                      Verification Pending
                    </span>
                  )}
                </div>

                <p className="text-sm md:text-base font-semibold text-muted-foreground">
                  {profile.profession || "Independent Specialist"}
                </p>

                {/* Bio Tagline beneath headline */}
                {profile.rating_message && (
                  <p className="text-xs md:text-sm text-primary/90 font-medium italic">
                    "{profile.rating_message}"
                  </p>
                )}

                {/* Meta details row: Rating, Location, Join Date */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1 text-foreground font-semibold">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    {profile.ratings_count > 0 ? "5.0" : "New"}
                    <span className="text-muted-foreground font-normal">
                      ({profile.ratings_count || 0} reviews)
                    </span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    {locationStr}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    Joined {joinedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side Followers & Rates */}
            <div className="flex flex-wrap items-center sm:items-end justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-foreground text-lg md:text-xl">
                  {profile.followers_count || 0}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Followers
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-foreground text-lg md:text-xl">
                  {profile.following_count || 0}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Following
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Header Badges Bar */}
        <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-6 overflow-x-auto scrollbar-hide text-xs">
          <div className="flex items-center gap-2 flex-nowrap">
            <span className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm flex items-center gap-1.5">
              Profile & Details
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-card border border-border text-muted-foreground flex items-center gap-1.5">
              Completed Jobs:{" "}
              <span className="text-foreground font-semibold">
                {profile.orders_count || 0}
              </span>
            </span>
            {profile.hourly_rate && (
              <span className="px-3.5 py-1.5 rounded-xl bg-card border border-border text-muted-foreground flex items-center gap-1.5">
                Rate:{" "}
                <span className="text-primary font-bold">
                  ${profile.hourly_rate}/hr
                </span>
              </span>
            )}
            {profile.daily_rate && (
              <span className="px-3.5 py-1.5 rounded-xl bg-card border border-border text-muted-foreground flex items-center gap-1.5">
                Daily:{" "}
                <span className="text-primary font-bold">
                  ${profile.daily_rate}/day
                </span>
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-semibold pl-4">
            <span
              className={`w-2 h-2 rounded-full ${
                isVerified ? "bg-primary animate-pulse" : "bg-muted-foreground/60"
              }`}
            />
            <span>
              Trust Level:{" "}
              <span
                className={
                  isVerified
                    ? "text-primary font-bold"
                    : "text-muted-foreground font-medium"
                }
              >
                {isVerified ? "100% ID Verified" : "Verification Pending"}
              </span>
            </span>
          </div>
        </div>

        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: About & Experience (Markdown Bio) */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                    About & Experience
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    Highlighting background, philosophy, and proven deliverables
                  </p>
                </div>
                {isVerified ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono tracking-widest font-semibold border border-primary/40 text-primary bg-primary/5 uppercase">
                    Verified Bio
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono tracking-widest font-medium border border-border text-muted-foreground bg-muted/40 uppercase">
                    Bio
                  </span>
                )}
              </div>

              <div className="text-xs md:text-sm text-foreground/90 leading-relaxed whitespace-pre-line pt-1 font-sans">
                {profile.bio || (
                  <p className="text-muted-foreground italic">
                    This professional hasn't written a biography yet.
                  </p>
                )}
              </div>
            </div>

            {/* Card 2: Core Skills & Target Roles */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                  Core Skill Sets & Specializations
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  High-value technical competencies and matched roles
                </p>
              </div>

              {/* Core Skills */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Core Skills
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {profile.skills?.length || 0} skills
                  </span>
                </div>

                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/30 shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No core skills specified yet.
                  </p>
                )}
              </div>

              {/* Target Roles / Categories */}
              {profile.skills_for && profile.skills_for.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      Target Roles & Categories
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {profile.skills_for.length} roles
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {profile.skills_for.map((role, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-background/80 border border-border text-foreground"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: Work Experience Timeline */}
            {profile.experience && profile.experience.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Work Experience & Career History
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    Demonstrated track record of real-world industry delivery
                  </p>
                </div>

                <div className="relative border-l-2 border-primary/30 pl-5 space-y-6 ml-2">
                  {profile.experience.map((exp, index) => (
                    <div key={exp.id || index} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-card ring-2 ring-primary/30" />
                      <div className="space-y-1">
                        <h3 className="text-sm md:text-base font-bold text-foreground">
                          {exp.title}
                        </h3>
                        <p className="text-xs font-semibold text-primary">
                          {exp.company}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {exp.startDate || "Past"} — {exp.endDate || "Present"}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-muted-foreground pt-1 leading-relaxed whitespace-pre-line">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 4: Education & Degrees */}
            {profile.education && profile.education.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Education & Degrees
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    Academic qualifications and verified educational institutions
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.education.map((edu, index) => (
                    <div
                      key={edu.id || index}
                      className="p-4 rounded-xl bg-background/50 border border-border space-y-1"
                    >
                      <h4 className="text-xs md:text-sm font-bold text-foreground">
                        {edu.degree}
                      </h4>
                      <p className="text-xs text-primary font-medium">
                        {edu.institution}
                      </p>
                      {edu.year && (
                        <p className="text-[11px] text-muted-foreground">
                          Graduated {edu.year}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 5: Courses & Certifications */}
            {profile.courses && profile.courses.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Courses & Certifications
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    Specialized training programs and industry accreditations
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.courses.map((course, index) => (
                    <div
                      key={course.id || index}
                      className="p-4 rounded-xl bg-background/50 border border-border space-y-1"
                    >
                      <h4 className="text-xs md:text-sm font-bold text-foreground">
                        {course.title}
                      </h4>
                      <p className="text-xs text-primary font-medium">
                        {course.provider}
                      </p>
                      {course.year && (
                        <p className="text-[11px] text-muted-foreground">
                          Completed {course.year}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: Pricing & Direct Collaboration */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
              <h3 className="font-bold text-foreground text-base tracking-tight">
                Rates & Engagement
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-background/60 border border-border rounded-xl">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Hourly Rate
                  </p>
                  <p className="text-lg font-extrabold text-foreground mt-0.5">
                    {profile.hourly_rate ? `$${profile.hourly_rate}` : "Negotiable"}
                    {profile.hourly_rate && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {" "}/hr
                      </span>
                    )}
                  </p>
                </div>
                <div className="p-3.5 bg-background/60 border border-border rounded-xl">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Daily Rate
                  </p>
                  <p className="text-lg font-extrabold text-foreground mt-0.5">
                    {profile.daily_rate ? `$${profile.daily_rate}` : "Negotiable"}
                    {profile.daily_rate && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {" "}/day
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <Button
                  onClick={() => {
                    if (profile.present_address?.whatsapp) {
                      window.open(
                        `https://wa.me/${profile.present_address.whatsapp.replace(/[^0-9]/g, "")}`,
                        "_blank"
                      );
                    } else if (profile.email) {
                      window.location.href = `mailto:${profile.email}?subject=Collaboration Inquiry`;
                    } else {
                      toast.info("Collaboration inquiry initiated!");
                    }
                  }}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl h-11 text-xs shadow-lg shadow-primary/20"
                >
                  Hire Me Now
                </Button>

                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="w-full rounded-xl h-10 text-xs font-semibold gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share Profile
                </Button>
              </div>
            </div>

            {/* Card 2: Languages (Spoken & Written) */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-foreground text-base tracking-tight flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Languages
              </h3>

              {profile.languages && profile.languages.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/25 text-xs font-medium"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No languages listed.
                </p>
              )}
            </div>

            {/* Card 3: Connected Networks & Presence (matching PDF) */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-foreground text-base tracking-tight">
                Connected Networks & Presence
              </h3>

              <div className="space-y-3 pt-1 text-xs">
                {profile.social_linkedin && (
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="flex items-center gap-2 text-foreground font-medium">
                      <FaLinkedin className="w-4 h-4 text-[#0077B5]" />
                      LinkedIn Profile
                    </span>
                    <a
                      href={getValidUrl(profile.social_linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono truncate max-w-[150px] flex items-center gap-1"
                    >
                      View Profile
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}

                {profile.social_github && (
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="flex items-center gap-2 text-foreground font-medium">
                      <FaGithub className="w-4 h-4 text-foreground" />
                      GitHub Organization
                    </span>
                    <a
                      href={getValidUrl(profile.social_github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono truncate max-w-[150px] flex items-center gap-1"
                    >
                      View Repos
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}

                {profile.social_twitter && (
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="flex items-center gap-2 text-foreground font-medium">
                      <FaTwitter className="w-4 h-4 text-[#1DA1F2]" />
                      X (Twitter)
                    </span>
                    <a
                      href={getValidUrl(profile.social_twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono truncate max-w-[150px] flex items-center gap-1"
                    >
                      View Posts
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}

                {profile.present_address?.portfolio && (
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="flex items-center gap-2 text-foreground font-medium">
                      <FaGlobe className="w-4 h-4 text-primary" />
                      Personal Portfolio
                    </span>
                    <a
                      href={getValidUrl(profile.present_address.portfolio)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono truncate max-w-[150px] flex items-center gap-1"
                    >
                      {profile.present_address.portfolio.replace(/^https?:\/\//, "")}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}

                {profile.present_address?.whatsapp && (
                  <div className="flex items-center justify-between py-1 border-b border-border/40">
                    <span className="flex items-center gap-2 text-foreground font-medium">
                      <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
                      Direct WhatsApp
                    </span>
                    <a
                      href={`https://wa.me/${profile.present_address.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-mono"
                    >
                      {profile.present_address.whatsapp}
                    </a>
                  </div>
                )}

                {profile.present_address?.discord && (
                  <div className="flex items-center justify-between py-1">
                    <span className="flex items-center gap-2 text-foreground font-medium">
                      <FaDiscord className="w-4 h-4 text-[#5865F2]" />
                      Discord Handle
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {profile.present_address.discord}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 4: Location & Address Details */}
            {profile.present_address?.fullAddress && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="font-bold text-foreground text-base tracking-tight flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Location & Address
                </h3>

                <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground">
                      Present Location
                    </p>
                    <p>{profile.present_address.fullAddress}</p>
                    <p>
                      {profile.present_address.city}, {profile.present_address.state}{" "}
                      {profile.present_address.zipcode}
                    </p>
                    <p className="font-medium text-foreground">
                      {profile.present_address.country}
                    </p>
                  </div>

                  {profile.permanent_address?.fullAddress && (
                    <div className="pt-2 border-t border-border/40">
                      <p className="font-semibold text-foreground">
                        Permanent Location
                      </p>
                      <p>{profile.permanent_address.fullAddress}</p>
                      <p>
                        {profile.permanent_address.city},{" "}
                        {profile.permanent_address.state}{" "}
                        {profile.permanent_address.zipcode}
                      </p>
                      <p className="font-medium text-foreground">
                        {profile.permanent_address.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
