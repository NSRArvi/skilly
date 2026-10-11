"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import Container from "@/components/shared/Container";
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  MapPin,
  Calendar,
  ShieldCheck,
  Share2,
  Pencil,
  Briefcase,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import ProfessionalServicesSection from "./ProfessionalServicesSection";
import ProfessionalCareerSection from "./ProfessionalCareerSection";
import ProfessionalSidebar from "./ProfessionalSidebar";

export default function ProfessionalDetailsClient({
  initialProfile,
  initialServices = [],
  profileId,
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [services, setServices] = useState(initialServices);
  const [loading, setLoading] = useState(!initialProfile);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Hire Modal State
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [hireTitle, setHireTitle] = useState("");
  const [hireDescription, setHireDescription] = useState("");
  const [hireAmount, setHireAmount] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [submittingHire, setSubmittingHire] = useState(false);

  // Following State
  const [isFollowing, setIsFollowing] = useState(false);
  const [submittingFollow, setSubmittingFollow] = useState(false);

  useEffect(() => {
    const fetchFreshData = async () => {
      const supabase = createClient();

      // Check current auth user
      const {
        data: { user: currentUserData },
      } = await supabase.auth.getUser();

      setCurrentUser(currentUserData);

      // If initialProfile wasn't passed or to ensure live follower stats
      let prof = initialProfile;
      if (!prof && profileId) {
        const { data } = await supabase
          .from("professionals")
          .select("*, categories(name), subcategories(name)")
          .or(`id.eq.${profileId},user_id.eq.${profileId}`)
          .limit(1);

        if (data && data.length > 0) {
          prof = data[0];
        }
      }

      if (prof) {
        const { count: followersCount } = await supabase
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("following_id", prof.user_id);

        const { count: followingCount } = await supabase
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", prof.user_id);

        setProfile({
          ...prof,
          followers_count: followersCount || 0,
          following_count: followingCount || 0,
        });

        if (
          currentUserData &&
          (currentUserData.id === prof.user_id ||
            currentUserData.id === prof.id)
        ) {
          setIsOwner(true);
        }

        // Fetch services if not passed initially
        if (!initialServices || initialServices.length === 0) {
          const { data: servicesData } = await supabase
            .from("services")
            .select("*, categories(name), subcategories(name)")
            .eq("user_id", prof.user_id)
            .order("created_at", { ascending: false });

          setServices(servicesData || []);
        }

        if (currentUserData) {
          const { data: followData } = await supabase
            .from("followers")
            .select("id")
            .eq("follower_id", currentUserData.id)
            .eq("following_id", prof.user_id)
            .single();
          if (followData) setIsFollowing(true);
        }
      }
      setLoading(false);
    };

    fetchFreshData();
  }, [profileId, initialProfile, initialServices]);

  const handleHireSubmit = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to send an offer.");
      return;
    }
    if (
      !hireTitle.trim() ||
      !hireDescription.trim() ||
      !hireAmount ||
      !hireDate
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSubmittingHire(true);
    const supabase = createClient();

    const { error } = await supabase.from("orders").insert({
      client_id: currentUser.id,
      professional_id: profile.user_id,
      title: hireTitle,
      description: hireDescription,
      offer_amount: parseInt(hireAmount),
      delivery_date: new Date(hireDate).toISOString(),
      status: "pending",
    });

    if (error) {
      toast.error("Failed to send offer: " + error.message);
    } else {
      toast.success(
        "Offer sent successfully! The professional will be notified."
      );
      setIsHireModalOpen(false);
      setHireTitle("");
      setHireDescription("");
      setHireAmount("");
      setHireDate("");
    }
    setSubmittingHire(false);
  };

  const handleToggleFollow = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to follow professionals.");
      return;
    }

    setSubmittingFollow(true);
    const supabase = createClient();

    if (isFollowing) {
      const { error } = await supabase
        .from("followers")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("following_id", profile.user_id);

      if (!error) {
        setIsFollowing(false);
        const newCount = Math.max(0, (profile.followers_count || 0) - 1);
        setProfile((prev) => ({ ...prev, followers_count: newCount }));
        await supabase
          .from("professionals")
          .update({ followers_count: newCount })
          .eq("user_id", profile.user_id);
      }
    } else {
      const { error } = await supabase.from("followers").insert({
        follower_id: currentUser.id,
        following_id: profile.user_id,
      });

      if (!error) {
        setIsFollowing(true);
        const newCount = (profile.followers_count || 0) + 1;
        setProfile((prev) => ({ ...prev, followers_count: newCount }));
        await supabase
          .from("professionals")
          .update({ followers_count: newCount })
          .eq("user_id", profile.user_id);
      }
    }
    setSubmittingFollow(false);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied to clipboard!");
    }
  };

  const handleOrderService = (service) => {
    setHireTitle(`Order: ${service.title}`);
    setHireDescription(
      `Hi ${profile.full_name}, I would like to order your "${service.title}" service package.`
    );
    setHireAmount(String(service.price));
    setIsHireModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
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
          The professional profile you are looking for does not exist or may
          have been removed.
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

  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  const locationParts = [
    profile.present_address?.city,
    profile.present_address?.state,
    profile.present_address?.country,
  ].filter(Boolean);
  const locationStr =
    locationParts.length > 0
      ? locationParts.join(", ")
      : profile.permanent_address?.country || "Location not set";

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
              Share
            </Button>

            {isOwner ? (
              <Button
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs gap-1.5 shadow-lg shadow-primary/20"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleToggleFollow}
                  disabled={submittingFollow}
                  className={`rounded-xl font-bold text-xs shadow-lg px-4 ${
                    isFollowing
                      ? "bg-background/20 border-white/20 hover:bg-background/40"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsHireModalOpen(true)}
                  className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs shadow-lg shadow-primary/20 px-4"
                >
                  Hire Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Container className="relative">
        {/* Profile Identity Hero Card */}
        <div className="bg-card border border-border rounded-2xl -mt-16 md:-mt-20 p-6 md:p-8 mb-6 relative z-10">
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

                <p className="text-sm md:text-base font-semibold text-muted-foreground flex items-center gap-2">
                  {profile.categories?.name && (
                    <span className="text-primary">
                      {profile.categories.name}
                    </span>
                  )}
                  {profile.categories?.name && profile.subcategories?.name && (
                    <span>•</span>
                  )}
                  {profile.subcategories?.name && (
                    <span>{profile.subcategories.name}</span>
                  )}
                  {!profile.categories?.name &&
                    !profile.subcategories?.name && (
                      <span>
                        {profile.profession || "Independent Specialist"}
                      </span>
                    )}
                </p>

                {profile.rating_message && (
                  <p className="text-xs md:text-sm text-primary/90 font-medium italic">
                    &ldquo;{profile.rating_message}&rdquo;
                  </p>
                )}

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
          <div className="flex items-center gap-2 flex-nowrap w-full">
            <span className="whitespace-nowrap flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm flex items-center gap-1.5">
              Profile & Details
            </span>
            <span className="whitespace-nowrap flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-card border border-border text-muted-foreground flex items-center gap-1.5">
              Completed Jobs:{" "}
              <span className="text-foreground font-semibold">
                {profile.orders_count || 0}
              </span>
            </span>
            {profile.hourly_rate && (
              <span className="whitespace-nowrap flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-card border border-border text-muted-foreground flex items-center gap-1.5">
                Rate:{" "}
                <span className="text-primary font-bold">
                  ৳{profile.hourly_rate}/hr
                </span>
              </span>
            )}
            {profile.daily_rate && (
              <span className="whitespace-nowrap flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-card border border-border text-muted-foreground flex items-center gap-1.5">
                Daily:{" "}
                <span className="text-primary font-bold">
                  ৳{profile.daily_rate}/day
                </span>
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-semibold pl-4">
            <span
              className={`w-2 h-2 rounded-full ${
                isVerified
                  ? "bg-primary animate-pulse"
                  : "bg-muted-foreground/60"
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
            {/* Card 1: About & Experience */}
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
                    This professional hasn&apos;t written a biography yet.
                  </p>
                )}
              </div>
            </div>

            {/* Services & Packages Section */}
            <ProfessionalServicesSection
              services={services}
              profile={profile}
              isOwner={isOwner}
              onOrderService={handleOrderService}
            />

            {/* Core Skills Section */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                  Core Skill Sets & Specializations
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  High-value technical competencies and matched roles
                </p>
              </div>

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
            </div>

            {/* Career Timeline, Degrees & Certifications */}
            <ProfessionalCareerSection profile={profile} />
          </div>

          {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
          <div className="lg:col-span-4 space-y-6">
            <ProfessionalSidebar
              profile={profile}
              isOwner={isOwner}
              onOpenHireModal={() => setIsHireModalOpen(true)}
            />
          </div>
        </div>
      </Container>

      {/* Hire Modal */}
      <Dialog open={isHireModalOpen} onOpenChange={setIsHireModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Send an Offer
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Propose a project to {profile.full_name}. They will review it and
              get back to you.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Project Title
              </Label>
              <Input
                value={hireTitle}
                onChange={(e) => setHireTitle(e.target.value)}
                placeholder="e.g. Frontend Development for E-commerce"
                className="bg-background/50 border-border text-sm h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Description & Scope
              </Label>
              <textarea
                value={hireDescription}
                onChange={(e) => setHireDescription(e.target.value)}
                placeholder="Describe what you need help with..."
                rows={4}
                className="w-full bg-background/50 border border-border text-foreground rounded-xl text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Offer Amount (BDT)
                </Label>
                <Input
                  type="number"
                  value={hireAmount}
                  onChange={(e) => setHireAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="bg-background/50 border-border text-sm h-10 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Delivery Date
                </Label>
                <Input
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  className="bg-background/50 border-border text-sm h-10 rounded-xl"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsHireModalOpen(false)}
              className="rounded-xl h-10 font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleHireSubmit}
              disabled={submittingHire}
              className="rounded-xl h-10 bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
            >
              {submittingHire ? "Sending..." : "Send Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

