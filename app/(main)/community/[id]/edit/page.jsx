"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

export default function EditCommunityPostPage() {
  const params = useParams();
  const router = useRouter();
  const { openModal } = useAuthModal();
  const postId = params.id;
  const supabase = createClient();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login first.");
      openModal();
      return;
    }
    setCurrentUser(user);

    const { data, error } = await supabase
      .from("community_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error || !data) {
      toast.error("Post not found.");
      router.push("/community");
      return;
    }

    if (data.user_id !== user.id) {
      toast.error("You don't have permission to edit this post.");
      router.push("/community");
      return;
    }

    setContent(data.content || "");
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Post content cannot be empty.");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("community_posts")
      .update({ content: content.trim() })
      .eq("id", postId);

    if (error) {
      toast.error("Failed to update post.");
    } else {
      toast.success("Post updated successfully!");
      router.push(`/community/${postId}`);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background/50 py-6 md:py-10">
      <Container className="max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href={`/community/${postId}`}>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted/80">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Edit Post</h1>
            <p className="text-sm text-muted-foreground">Update your post's content</p>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-8 shadow-sm">
          <form onSubmit={handleUpdate} className="flex flex-col h-full">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[200px] bg-transparent resize-none focus:outline-none text-foreground text-[15px] placeholder:text-muted-foreground/60 mb-6"
            />

            <div className="flex items-center justify-end mt-auto pt-4 border-t border-border/50 gap-3">
              <Link href={`/community/${postId}`}>
                <Button type="button" variant="ghost" className="font-bold px-6 rounded-xl">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={saving || !content.trim()}
                className="font-bold px-6 rounded-xl shadow-sm shadow-primary/20"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
