"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Trash2,
  Edit
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "../../lib/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PostCard({ 
  post, 
  currentUser, 
  onDelete, 
  isDetailView = false 
}) {
  const router = useRouter();
  const supabase = createClient();
  const observerRef = useRef(null);
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.reactions?.[0]?.count || 0);
  const [commentCount, setCommentCount] = useState(post.comments?.[0]?.count || 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isOwner = currentUser?.id === post.user_id;
  const postAuthor = post.author || {};
  const images = post.images || [];

  // Check if current user liked this post initially
  useEffect(() => {
    const checkLike = async () => {
      if (!currentUser) return;
      const { data } = await supabase
        .from('community_reactions')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', currentUser.id)
        .single();
        
      if (data) setIsLiked(true);
    };
    checkLike();
  }, [post.id, currentUser]);

  // Impression tracking
  useEffect(() => {
    if (!currentUser || isOwner) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Track impression silently
          supabase
            .from('community_impressions')
            .insert({ post_id: post.id, user_id: currentUser.id })
            .then(() => {}) // Ignore errors (like unique constraint violations) silently
            .catch(() => {});
          
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => observer.disconnect();
  }, [post.id, currentUser, isOwner]);

  const handleLike = async (e) => {
    if (e) e.preventDefault();
    if (e) e.stopPropagation();
    if (!currentUser) {
      toast.error("Please login to react to posts.");
      return;
    }

    const previousLiked = isLiked;
    const previousCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    if (!isLiked) {
      const { error } = await supabase
        .from('community_reactions')
        .insert({ post_id: post.id, user_id: currentUser.id });
        
      if (error && error.code !== '23505') { // Ignore unique violation if clicked twice fast
        setIsLiked(previousLiked);
        setLikeCount(previousCount);
        toast.error("Failed to react.");
      }
    } else {
      const { error } = await supabase
        .from('community_reactions')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUser.id);
        
      if (error) {
        setIsLiked(previousLiked);
        setLikeCount(previousCount);
        toast.error("Failed to remove reaction.");
      }
    }
  };

  const handleShare = async (e) => {
    if (e) e.preventDefault();
    if (e) e.stopPropagation();
    
    const shareData = {
      title: 'Skilly Community Post',
      text: `Check out this post by ${postAuthor.full_name}`,
      url: `${window.location.origin}/community/${post.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleDelete = async (e) => {
    if (e) e.preventDefault();
    if (e) e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this post?")) {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', post.id);
        
      if (error) {
        toast.error("Failed to delete post");
      } else {
        toast.success("Post deleted successfully");
        if (onDelete) onDelete(post.id);
        if (isDetailView) router.push('/community');
      }
    }
  };

  const handleEdit = (e) => {
    if (e) e.preventDefault();
    if (e) e.stopPropagation();
    router.push(`/community/${post.id}/edit`);
  };

  // Render Image Grid (1 to 4 images max)
  const renderImageGrid = () => {
    if (!images || images.length === 0) return null;
    
    const totalImages = Math.min(images.length, 4);
    
    // Different grid classes based on image count
    let gridClass = "grid gap-1 mt-3 rounded-xl overflow-hidden";
    if (totalImages === 1) gridClass += " grid-cols-1";
    if (totalImages === 2) gridClass += " grid-cols-2";
    if (totalImages >= 3) gridClass += " grid-cols-2";

    return (
      <div className={gridClass} onClick={(e) => {
        if (!isDetailView) {
          e.preventDefault(); 
          router.push(`/community/${post.id}`);
        }
      }}>
        {images.slice(0, 4).map((url, index) => {
          let imgClass = "w-full h-full object-cover bg-muted";
          if (totalImages === 1) imgClass += " max-h-[400px]";
          else if (totalImages === 2) imgClass += " h-[250px]";
          else if (totalImages === 3 && index === 0) imgClass += " h-[300px] col-span-2"; // First image large on top
          else if (totalImages === 3 && index > 0) imgClass += " h-[150px]";
          else if (totalImages === 4) imgClass += " h-[150px]";
          
          return (
            <div key={index} className="relative cursor-pointer hover:opacity-95 transition-opacity">
              <img src={url} alt={`Post attachment ${index+1}`} className={imgClass} />
              {images.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                  +{images.length - 4}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const Wrapper = isDetailView ? "div" : Link;
  const wrapperProps = isDetailView ? {} : { href: `/community/${post.id}` };

  return (
    <div 
      ref={observerRef} 
      className="bg-card border border-border/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow relative"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link href={`/professionals/${postAuthor.user_id}`} onClick={(e) => e.stopPropagation()}>
            <Avatar className="w-10 h-10 border border-border cursor-pointer hover:opacity-80">
              <AvatarImage src={postAuthor.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {postAuthor.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link href={`/professionals/${postAuthor.user_id}`} onClick={(e) => e.stopPropagation()}>
              <h4 className="font-bold text-foreground text-sm hover:underline cursor-pointer">
                {postAuthor.full_name}
              </h4>
            </Link>
            <p className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground rounded-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            
            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                />
                <div className="absolute right-0 mt-1 w-36 bg-card border border-border shadow-lg rounded-xl z-50 overflow-hidden py-1">
                  <button 
                    onClick={(e) => {
                      setIsMenuOpen(false);
                      handleEdit(e);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/50 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    onClick={(e) => {
                      setIsMenuOpen(false);
                      handleDelete(e);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <Wrapper {...wrapperProps} className="block group">
        <p className="text-[15px] text-foreground leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>
        
        {renderImageGrid()}
      </Wrapper>

      {/* Footer Actions */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/40">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors ${
            isLiked ? 'text-rose-500 bg-rose-500/10' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          {likeCount > 0 ? likeCount : 'React'}
        </button>

        <Wrapper {...wrapperProps}>
          <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:bg-muted px-2 py-1.5 rounded-lg transition-colors">
            <MessageCircle className="w-4 h-4" />
            {commentCount > 0 ? commentCount : 'Comment'}
          </button>
        </Wrapper>

        <button 
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:bg-muted px-2 py-1.5 rounded-lg transition-colors ml-auto"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}
