"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Image as ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

export default function CreateCommunityPostPage() {
  const router = useRouter();
  const { openModal } = useAuthModal();
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]); // File objects
  const [previewUrls, setPreviewUrls] = useState([]); // Base64 or Object URLs for preview
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create a post.");
        openModal();
        return;
      }
      setCurrentUser(user);
      setCheckingAuth(false);
    };
    init();
  }, []);

  // Cleanup object urls on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    if (files.length + selectedFiles.length > 4) {
      toast.error("You can upload a maximum of 4 images per post.");
      return;
    }

    const validFiles = [];
    const validPreviews = [];

    for (const file of selectedFiles) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image format.`);
        continue;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 2MB size limit.`);
        continue;
      }
      
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...validPreviews]);
    e.target.value = null; // reset input
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setPreviewUrls((prev) => {
      const newUrls = [...prev];
      URL.revokeObjectURL(newUrls[indexToRemove]); // cleanup memory
      newUrls.splice(indexToRemove, 1);
      return newUrls;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) {
      toast.error("Please add some text or images to your post.");
      return;
    }

    setLoading(true);
    try {
      const uploadedImageUrls = [];

      // 1. Upload Images to Supabase Storage
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("community_images")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error", uploadError);
          throw new Error("Failed to upload image(s).");
        }

        const { data: publicUrlData } = supabase.storage
          .from("community_images")
          .getPublicUrl(filePath);

        uploadedImageUrls.push(publicUrlData.publicUrl);
      }

      // 2. Insert Post to DB
      const { error: dbError } = await supabase
        .from("community_posts")
        .insert({
          user_id: currentUser.id,
          content: content.trim(),
          images: uploadedImageUrls,
        });

      if (dbError) {
        console.error("DB Error", dbError);
        throw new Error("Failed to save post.");
      }

      toast.success("Post created successfully!");
      router.push("/community");

    } catch (error) {
      toast.error(error.message || "An error occurred while creating the post.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
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
          <Link href="/community">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted/80">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Create Post</h1>
            <p className="text-sm text-muted-foreground">Share your thoughts with the community</p>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-3xl p-5 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[150px] bg-transparent resize-none focus:outline-none text-foreground text-[15px] placeholder:text-muted-foreground/60 mb-4"
            />

            {/* Image Previews */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden bg-muted h-32 md:h-48 border border-border/50">
                    <img src={url} alt={`Preview ${idx+1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/png, image/jpeg, image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={files.length >= 4}
                />
                <label 
                  htmlFor="image-upload"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    files.length >= 4 
                      ? "text-muted-foreground opacity-50 cursor-not-allowed" 
                      : "text-primary hover:bg-primary/10"
                  }`}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Photo</span>
                </label>
                <span className="text-xs text-muted-foreground ml-2">
                  {files.length}/4 (Max 2MB each)
                </span>
              </div>

              <Button 
                type="submit" 
                disabled={loading || (!content.trim() && files.length === 0)}
                className="font-bold px-6 rounded-xl shadow-sm shadow-primary/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
