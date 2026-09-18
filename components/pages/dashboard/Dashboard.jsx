"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Pencil,
  ExternalLink,
  LogOut,
  Camera,
  Share2,
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  IdCard,
  Briefcase,
  Sparkles,
} from "lucide-react";
import ProfileTab from "./tabs/ProfileTab";
import DashboardJobsTab from "./tabs/DashboardJobsTab";
import DashboardOrdersTab from "./tabs/DashboardOrdersTab";
import DashboardFollowList from "./tabs/DashboardFollowList";
import Container from "../../shared/Container";
import { createClient } from "../../../lib/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Real user state fetched from Supabase
  const [userProfile, setUserProfile] = useState({
    id: null,
    profileId: null,
    name: "Loading...",
    email: "",
    profession: "Professional",
    headline: "Update your profile",
    followers: 0,
    following: 0,
    ratingsCount: 0,
    tasksCompleted: 0,
    status: false,
    avatarUrl: null,
    coverUrl:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070",
    joinedDate: "",
    location: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        let defaultName = user.user_metadata?.full_name || "New Professional";
        let defaultAvatar =
          user.user_metadata?.picture || user.user_metadata?.avatar_url || null;

        // Fetch from professionals table with all real columns
        const { data: profDataArray, error } = await supabase
          .from("professionals")
          .select(
            "id, full_name, profession, bio, rating_message, followers_count, following_count, ratings_count, orders_count, is_verified, avatar_url, cover_image_url, created_at, present_address",
          )
          .eq("user_id", user.id)
          .limit(1);

        const profData = profDataArray?.[0];

        // Fetch live counts
        const { count: followersCount } = await supabase
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("following_id", user.id);

        const { count: followingCount } = await supabase
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", user.id);

        const { count: ordersCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("professional_id", user.id);

        if (profData) {
          const joinedStr = profData.created_at
            ? new Date(profData.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : "Recently";

          const locationStr =
            profData.present_address?.city && profData.present_address?.country
              ? `${profData.present_address.city}, ${profData.present_address.country}`
              : profData.present_address?.country || "Location not set";

          setUserProfile({
            id: user.id,
            profileId: profData.id,
            name: profData.full_name || defaultName,
            email: user.email || "",
            profession: profData.profession || "Professional",
            headline:
              profData.rating_message || profData.bio || "Update your profile",
            followers: followersCount || 0,
            following: followingCount || 0,
            ratingsCount: profData.ratings_count || 0,
            orders_count: ordersCount || 0,
            status: Boolean(
              profData.is_verified ?? profData.is_verify ?? false,
            ),
            avatarUrl: profData.avatar_url || defaultAvatar,
            coverUrl:
              profData.cover_image_url ||
              "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070",
            joinedDate: joinedStr,
            location: locationStr,
          });
        } else {
          setUserProfile((prev) => ({
            ...prev,
            id: user.id,
            name: defaultName,
            email: user.email || "",
            avatarUrl: defaultAvatar,
            joinedDate: "Recently",
            location: "Location not set",
          }));
        }
      }
    };

    fetchProfile();
  }, [refreshKey]);

  const uploadDirectFile = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile.id) return;

    if (type === "avatar") setUploadingAvatar(true);
    if (type === "cover") setUploadingCover(true);

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${userProfile.id}-${type}-${Date.now()}.${fileExt}`;

    // 1. Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("kyc-documents")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast.error(`Failed to upload ${type}`);
      if (type === "avatar") setUploadingAvatar(false);
      if (type === "cover") setUploadingCover(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("kyc-documents").getPublicUrl(fileName);

    // 2. Update professionals table
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const updatePayload =
      type === "avatar"
        ? { avatar_url: publicUrl }
        : { cover_image_url: publicUrl };

    const { error: dbError } = await supabase.from("professionals").upsert(
      {
        user_id: userProfile.id,
        full_name:
          userProfile.name === "Loading..."
            ? user.user_metadata?.full_name || "New Professional"
            : userProfile.name,
        email: user?.email || "",
        ...updatePayload,
      },
      { onConflict: "user_id" },
    );

    if (dbError) {
      toast.error(`Failed to save ${type} to profile`);
    } else {
      toast.success(
        `${type === "avatar" ? "Profile picture" : "Cover image"} updated!`,
      );
      setRefreshKey((r) => r + 1); // Trigger refetch
    }

    if (type === "avatar") setUploadingAvatar(false);
    if (type === "cover") setUploadingCover(false);
  };

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <Container className="space-y-6">
        {/* Top Profile Header Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden relative shadow-sm">
          {/* Cover Banner */}
          <div className="h-40 md:h-52 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 relative group">
            <img
              src={userProfile.coverUrl}
              alt="Cover"
              className={`w-full h-full object-cover transition-opacity ${uploadingCover ? "opacity-50" : "opacity-100"}`}
            />
            {/* Subtle gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 pointer-events-none" />

            {/* Inline Cover Edit Overlay */}
            <div
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
              onClick={() =>
                document.getElementById("header-cover-upload").click()
              }
            >
              <div className="flex flex-col items-center text-white">
                <Camera className="w-7 h-7 mb-1.5" />
                <span className="font-medium text-xs drop-shadow-md">
                  Change Cover Image
                </span>
              </div>
              <input
                type="file"
                id="header-cover-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => uploadDirectFile(e, "cover")}
              />
            </div>

            {/* Top Right Action Buttons */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (userProfile.profileId) {
                    const link = `${window.location.origin}/professionals/${userProfile.profileId}`;
                    navigator.clipboard.writeText(link);
                    toast.success("Public profile link copied to clipboard!");
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Profile link copied!");
                  }
                }}
                className="gap-1.5 rounded-lg bg-black/50 backdrop-blur-md border-white/20 text-white hover:bg-black/70 hover:text-white text-xs px-3 py-1.5 h-8 shadow-sm transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share Profile
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  userProfile.profileId &&
                  router.push(`/professionals/${userProfile.profileId}`)
                }
                className="gap-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/70 hover:text-white text-xs px-3 py-1.5 h-8 shadow-sm transition-all"
              >
                View Public Profile
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Profile Identity Details Row */}
          <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 md:-mt-14 z-20">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-5">
              {/* Avatar with Camera Overlay and Online Indicator */}
              <div
                className="relative group cursor-pointer"
                onClick={() =>
                  document.getElementById("header-avatar-upload").click()
                }
              >
                <Avatar
                  className={`w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-card shadow-2xl bg-muted transition-all ${
                    userProfile.status
                      ? "ring-2 ring-primary shadow-primary/20"
                      : "ring-1 ring-border/60"
                  } ${uploadingAvatar ? "opacity-50" : "opacity-100"}`}
                >
                  <AvatarImage
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                  />
                  <AvatarFallback className="bg-primary/20 text-primary text-3xl font-bold">
                    {userProfile.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Camera icon button overlay at bottom-left */}
                <div className="absolute bottom-0.5 left-0.5 bg-card/90 hover:bg-card p-1.5 rounded-full border border-border shadow-md transition-colors text-foreground">
                  <Camera className="w-3.5 h-3.5" />
                </div>

                {/* Verification / status indicator dot */}
                {userProfile.status ? (
                  <div
                    title="100% ID Verified Professional"
                    className="absolute bottom-1 right-1 w-4 h-4 bg-primary rounded-full border-2 border-card flex items-center justify-center shadow-sm"
                  >
                    <CheckCircle2 className="w-3 h-3 text-black stroke-[3]" />
                  </div>
                ) : (
                  <div
                    title="Verification Pending"
                    className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-muted-foreground/40 rounded-full border-2 border-card ring-1 ring-border"
                  />
                )}

                <input
                  type="file"
                  id="header-avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => uploadDirectFile(e, "avatar")}
                />
              </div>

              {/* Name, Verified Badge, Headline & Meta Details */}
              <div className="space-y-1 pb-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    {userProfile.name}
                  </h1>
                  {userProfile.status ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Pro • ID Authenticated
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                      <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                      Verification Pending
                    </span>
                  )}
                </div>

                <p className="text-sm md:text-base font-medium text-muted-foreground">
                  {userProfile.profession || "Professional"}
                </p>

                {/* Meta details row: Rating, Location, Join Date */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-0.5">
                  <span className="flex items-center gap-1 text-foreground font-medium">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    {userProfile.ratingsCount > 0 ? "5.0" : "New"}
                    <span className="text-muted-foreground font-normal">
                      ({userProfile.ratingsCount} reviews)
                    </span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    {userProfile.location || "Location not set"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    Joined {userProfile.joinedDate || "Recently"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side Followers & Following */}
            <div className="flex items-center gap-6 self-start md:self-end pb-1 pt-2 md:pt-0">
              <div className="text-center">
                <p className="font-bold text-foreground">
                  {userProfile.followers || 0}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Followers
                </p>
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground">
                  {userProfile.following || 0}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Following
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <Tabs defaultValue="profile" className="w-full space-y-6">
          <div className="flex items-center justify-between border-b border-border/80 pb-3 overflow-x-auto scrollbar-hide">
            <TabsList className="justify-start h-auto p-0 bg-transparent gap-2 flex-nowrap">
              <TabsTrigger
                value="profile"
                className="rounded-xl px-4 py-2 text-xs md:text-sm font-semibold transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md text-muted-foreground hover:text-foreground flex items-center gap-2"
              >
                <IdCard className="w-4 h-4" />
                Profile & Details
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="rounded-xl px-4 py-2 text-xs md:text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground hover:text-foreground flex items-center gap-2"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="jobs"
                className="rounded-xl px-4 py-2 text-xs md:text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground hover:text-foreground flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Jobs
              </TabsTrigger>
              {/* <TabsTrigger
                value="services"
                className="rounded-xl px-4 py-2 text-xs md:text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground hover:text-foreground flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Services
              </TabsTrigger> */}
              <TabsTrigger
                value="following"
                className="rounded-xl px-4 py-2 text-xs md:text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground hover:text-foreground flex items-center gap-2"
              >
                Following
                <span className="bg-muted text-muted-foreground text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {userProfile.following || "0"}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="followers"
                className="rounded-xl px-4 py-2 text-xs md:text-sm font-medium transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground hover:text-foreground flex items-center gap-2"
              >
                Followers
                <span className="bg-muted text-muted-foreground text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {userProfile.followers || "0"}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Completion Indicator on far right */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-muted-foreground whitespace-nowrap pl-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>
                Profile Completion:{" "}
                <span className="text-primary font-bold">
                  {userProfile.status ? "100%" : "85%"}
                </span>
              </span>
            </div>
          </div>

          <div>
            <TabsContent
              value="profile"
              className="m-0 border-none outline-none"
            >
              <ProfileTab onProfileUpdate={() => setRefreshKey((r) => r + 1)} />
            </TabsContent>
            <TabsContent
              value="orders"
              className="m-0 border-none outline-none"
            >
              <DashboardOrdersTab userId={userProfile.id} />
            </TabsContent>
            <TabsContent value="jobs" className="m-0 border-none outline-none">
              <DashboardJobsTab userId={userProfile.id} />
            </TabsContent>
            {/* <TabsContent
              value="services"
              className="m-0 border-none outline-none"
            >
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground space-y-3">
                <Sparkles className="w-8 h-8 text-primary mx-auto" />
                <h3 className="text-foreground font-semibold">
                  My Services & Packages
                </h3>
                <p className="text-xs max-w-md mx-auto">
                  Package your expertise into bookable services, design audits,
                  and consulting sprints.
                </p>
                <Button
                  onClick={() => toast.info("Service creation modal")}
                  className="mt-2 text-xs font-bold rounded-xl"
                >
                  + Create New Service
                </Button>
              </div>
            </TabsContent> */}
            <TabsContent
              value="following"
              className="m-0 border-none outline-none"
            >
              <DashboardFollowList userId={userProfile.id} type="following" />
            </TabsContent>
            <TabsContent
              value="followers"
              className="m-0 border-none outline-none"
            >
              <DashboardFollowList userId={userProfile.id} type="followers" />
            </TabsContent>
          </div>
        </Tabs>
      </Container>
    </div>
  );
}
