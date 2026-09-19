"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import Container from "@/components/shared/Container";
import PostCard from "@/components/community/PostCard";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Users2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

export default function CommunityPage() {
  const router = useRouter();
  const { requireAuth } = useAuthModal();
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'activities'

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUser(user);

    let query = supabase
      .from("community_posts")
      .select(
        `
        *,
        reactions:community_reactions(count),
        comments:community_comments(count)
      `,
      )
      .order("created_at", { ascending: false });

    if (activeTab === "activities" && user) {
      query = query.eq("user_id", user.id);
    } else {
      query = query.not("is_archived", "eq", true);
    }

    const { data: postsData, error: postsError } = await query;

    if (postsError) {
      toast.error("Failed to load posts");
      setLoading(false);
      return;
    }

    if (postsData && postsData.length > 0) {
      // Fetch author details from professionals table
      const userIds = [...new Set(postsData.map((p) => p.user_id))];
      const { data: profiles } = await supabase
        .from("professionals")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const enrichedPosts = postsData.map((post) => {
        const profile = profiles?.find((p) => p.user_id === post.user_id);
        return {
          ...post,
          author: {
            user_id: post.user_id,
            full_name: profile?.full_name || "Unknown User",
            avatar_url: profile?.avatar_url || null,
          },
        };
      });
      setPosts(enrichedPosts);
    } else {
      setPosts([]);
    }

    setLoading(false);
  };

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="min-h-screen bg-background py-6 md:py-10">
      <Container className="max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Community
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Share updates, ask questions, and connect.
            </p>
          </div>

          <Link href="/community/create" onClick={(e) => requireAuth(e, undefined)}>
            <Button className="font-bold gap-2 rounded-xl h-10 px-5 shadow-sm shadow-primary/20">
              <PlusCircle className="w-4 h-4" /> Create Post
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Community Posts
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "activities"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Activities
          </button>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border/50 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
              <Users2 className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              No posts yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              {activeTab === "activities"
                ? "You haven't published any posts yet. Share your first thought!"
                : "Be the first one to start a discussion in the community."}
            </p>
            <Link href="/community/create" onClick={(e) => requireAuth(e, undefined)}>
              <Button
                variant="outline"
                className="rounded-xl border-border/60 font-bold"
              >
                Create a Post
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
