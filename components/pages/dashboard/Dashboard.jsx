"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Pencil, ExternalLink, LogOut, Camera, Share2 } from "lucide-react";
import ProfileTab from "./tabs/ProfileTab";
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
    profession: "Professional",
    headline: "Update your profile",
    followers: 0,
    following: 0,
    ratingsCount: 0,
    tasksCompleted: 0,
    status: false,
    avatarUrl: null,
    coverUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fallback to Google Auth name and picture if available
        let defaultName = user.user_metadata?.full_name || "New Professional";
        let defaultAvatar =
          user.user_metadata?.picture || user.user_metadata?.avatar_url || null;

        // Fetch from professionals table
        const { data: profDataArray, error } = await supabase
          .from("professionals")
          .select(
            "id, full_name, profession, headline, followers_count, following_count, ratings_count, orders_count, is_verified, avatar_url, cover_image_url"
          )
          .eq("user_id", user.id)
          .limit(1);

        const profData = profDataArray?.[0];

        if (profData) {
          setUserProfile({
            id: user.id,
            profileId: profData.id,
            name: profData.full_name || defaultName,
            profession: profData.profession || "Professional",
            headline: profData.headline || "Update your profile",
            followers: profData.followers_count || 0,
            following: profData.following_count || 0,
            ratingsCount: profData.ratings_count || 0,
            tasksCompleted: profData.orders_count || 0,
            status: profData.is_verified || false,
            avatarUrl: profData.avatar_url || defaultAvatar,
            coverUrl: profData.cover_image_url || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070",
          });
        } else {
          setUserProfile((prev) => ({
            ...prev,
            id: user.id,
            name: defaultName,
            avatarUrl: defaultAvatar,
          }));
        }
      }
    };

    fetchProfile();
  }, [refreshKey]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const uploadDirectFile = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile.id) return;

    if (type === 'avatar') setUploadingAvatar(true);
    if (type === 'cover') setUploadingCover(true);

    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userProfile.id}-${type}-${Date.now()}.${fileExt}`;
    
    // 1. Upload to storage
    const { error: uploadError } = await supabase.storage.from('kyc-documents').upload(fileName, file, { upsert: true });
    
    if (uploadError) {
      toast.error(`Failed to upload ${type}`);
      if (type === 'avatar') setUploadingAvatar(false);
      if (type === 'cover') setUploadingCover(false);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('kyc-documents').getPublicUrl(fileName);

    // 2. Update professionals table
    const { data: { user } } = await supabase.auth.getUser();
    
    const updatePayload = type === 'avatar' 
      ? { avatar_url: publicUrl } 
      : { cover_image_url: publicUrl };

    const { error: dbError } = await supabase
      .from('professionals')
      .upsert({ 
        user_id: userProfile.id, 
        full_name: userProfile.name === "Loading..." ? (user.user_metadata?.full_name || "New Professional") : userProfile.name,
        email: user?.email || "",
        ...updatePayload 
      }, { onConflict: 'user_id' });

    if (dbError) {
      toast.error(`Failed to save ${type} to profile`);
    } else {
      toast.success(`${type === 'avatar' ? 'Profile picture' : 'Cover image'} updated!`);
      setRefreshKey(r => r + 1); // Trigger refetch
    }

    if (type === 'avatar') setUploadingAvatar(false);
    if (type === 'cover') setUploadingCover(false);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <Container className="space-y-8">
        {/* Top Profile Header Card - Social Media Style */}
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden relative">
          {/* Cover Banner */}
          <div className="h-48 md:h-64 w-full bg-muted relative group">
            <img 
              src={userProfile.coverUrl} 
              alt="Cover" 
              className={`w-full h-full object-cover transition-opacity ${uploadingCover ? 'opacity-50' : 'opacity-100'}`}
            />
            {/* Inline Cover Edit Overlay */}
            <div 
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => document.getElementById("header-cover-upload").click()}
            >
              <div className="flex flex-col items-center text-white">
                <Camera className="w-8 h-8 mb-2" />
                <span className="font-medium text-sm drop-shadow-md">Change Cover Image</span>
              </div>
              <input
                type="file"
                id="header-cover-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => uploadDirectFile(e, 'cover')}
              />
            </div>
          </div>

          {/* Profile Details Area */}
          <div className="px-6 pb-8 md:px-12 relative flex flex-col items-center text-center">
            {/* Centered Avatar overlapping the banner */}
            <div className="relative -mt-16 md:-mt-20 mb-4 group cursor-pointer" onClick={() => document.getElementById("header-avatar-upload").click()}>
              <Avatar className={`w-32 h-32 md:w-40 md:h-40 border-4 border-card shadow-xl transition-opacity ${uploadingAvatar ? 'opacity-50' : 'opacity-100'}`}>
                <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                <AvatarFallback className="bg-primary/20 text-primary text-4xl font-bold">
                  {userProfile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              {/* Edit overlay */}
              <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Camera className="w-6 h-6 text-white mb-1" />
                <span className="text-white text-[10px] font-medium">Change</span>
              </div>
              <input
                type="file"
                id="header-avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => uploadDirectFile(e, 'avatar')}
              />
              
              {/* Verification Badge */}
              {userProfile.status === true && (
                <div className="absolute -bottom-2 -right-2 bg-card rounded-full p-1.5 shadow-xl z-20">
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 border-none px-2.5 py-1 gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified
                  </Badge>
                </div>
              )}
            </div>

            {/* Name & Titles */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              {userProfile.name}
            </h1>
            <p className="text-primary font-medium text-lg mt-1">
              {userProfile.profession}
            </p>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              {userProfile.headline}
            </p>

            {/* Profile Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  if (userProfile.profileId) {
                    const link = `${window.location.origin}/professionals/${userProfile.profileId}`;
                    navigator.clipboard.writeText(link);
                    toast.success("Public profile link copied to clipboard!");
                  }
                }}
                disabled={!userProfile.profileId}
                className="gap-2 rounded-xl border-primary text-primary hover:bg-primary/10"
              >
                <Share2 className="w-4 h-4" />
                Share Profile
              </Button>
              <Button
                onClick={() => userProfile.profileId && router.push(`/professionals/${userProfile.profileId}`)}
                disabled={!userProfile.profileId}
                className="gap-2 rounded-xl"
              >
                <ExternalLink className="w-4 h-4" />
                View Public Profile
              </Button>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mt-8 pt-6 border-t border-border w-full max-w-3xl mx-auto">
              <div className="flex flex-col items-center">
                <span className="font-bold text-foreground text-xl md:text-2xl">
                  {userProfile.followers}
                </span>
                <span className="text-sm text-muted-foreground">Followers</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-foreground text-xl md:text-2xl">
                  {userProfile.following}
                </span>
                <span className="text-sm text-muted-foreground">Following</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-foreground text-xl md:text-2xl">
                  {userProfile.ratingsCount}
                </span>
                <span className="text-sm text-muted-foreground">Reviews</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-foreground text-xl md:text-2xl">
                  {userProfile.tasksCompleted}
                </span>
                <span className="text-sm text-muted-foreground">Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <Tabs defaultValue="profile" className="w-full mt-6">
          <TabsList className="w-full justify-start h-auto p-0 rounded-none border-b border-border bg-transparent overflow-x-auto flex-nowrap scrollbar-hide">
            <TabsTrigger
              value="profile"
              className="rounded-none border-b-2 border-transparent px-6 py-4 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground hover:text-foreground transition-all whitespace-nowrap"
            >
              Profile & Details
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-none border-b-2 border-transparent px-6 py-4 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground hover:text-foreground transition-all whitespace-nowrap"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="rounded-none border-b-2 border-transparent px-6 py-4 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground hover:text-foreground transition-all whitespace-nowrap"
            >
              Requests
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="rounded-none border-b-2 border-transparent px-6 py-4 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground hover:text-foreground transition-all whitespace-nowrap"
            >
              Following
            </TabsTrigger>
            <TabsTrigger
              value="followers"
              className="rounded-none border-b-2 border-transparent px-6 py-4 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground hover:text-foreground transition-all whitespace-nowrap"
            >
              Followers
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent
              value="profile"
              className="m-0 border-none outline-none"
            >
              <ProfileTab onProfileUpdate={() => setRefreshKey(r => r + 1)} />
            </TabsContent>
            <TabsContent
              value="orders"
              className="m-0 border-none outline-none"
            >
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                Orders component will go here
              </div>
            </TabsContent>
            <TabsContent
              value="requests"
              className="m-0 border-none outline-none"
            >
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                Requests component will go here
              </div>
            </TabsContent>
            <TabsContent
              value="following"
              className="m-0 border-none outline-none"
            >
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                Following component will go here
              </div>
            </TabsContent>
            <TabsContent
              value="followers"
              className="m-0 border-none outline-none"
            >
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                Followers component will go here
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Container>
    </div>
  );
}
