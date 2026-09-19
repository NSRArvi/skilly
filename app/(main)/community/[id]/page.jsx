"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import Container from "@/components/shared/Container";
import PostCard from "@/components/community/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, Send, CornerDownRight, X, Heart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id;
  const supabase = createClient();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // { id, name }

  useEffect(() => {
    fetchData();
  }, [postId]);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    // 1. Fetch Post
    const { data: postData, error: postError } = await supabase
      .from("community_posts")
      .select(`
        *,
        reactions:community_reactions(count),
        comments:community_comments(count)
      `)
      .eq("id", postId)
      .single();

    if (postError || !postData) {
      toast.error("Post not found");
      router.push("/community");
      return;
    }

    // 2. Fetch Post Author Profile
    const { data: postProfile } = await supabase
      .from("professionals")
      .select("user_id, full_name, avatar_url")
      .eq("user_id", postData.user_id)
      .single();

    setPost({
      ...postData,
      author: postProfile || { full_name: "Unknown", avatar_url: null, user_id: postData.user_id }
    });

    // 3. Fetch Comments & Reactions
    await Promise.all([
      fetchComments(user),
      fetchReactions()
    ]);
    
    setLoading(false);
  };

  const fetchComments = async (user) => {
    const { data: commentsData, error: commentsError } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (commentsData && commentsData.length > 0) {
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from("professionals")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const enrichedComments = commentsData.map(comment => {
        const profile = profiles?.find(p => p.user_id === comment.user_id);
        return {
          ...comment,
          author: profile || { full_name: "Unknown", avatar_url: null, user_id: comment.user_id }
        };
      });

      // Organize into threaded structure
      const rootComments = enrichedComments.filter(c => !c.parent_id);
      const replies = enrichedComments.filter(c => c.parent_id);
      
      rootComments.forEach(root => {
        root.replies = replies.filter(r => r.parent_id === root.id);
      });

      setComments(rootComments);
    } else {
      setComments([]);
    }
  };

  const fetchReactions = async () => {
    const { data: reactionsData } = await supabase
      .from("community_reactions")
      .select("*")
      .eq("post_id", postId);
      
    if (reactionsData && reactionsData.length > 0) {
      const userIds = [...new Set(reactionsData.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("professionals")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);
        
      const enrichedReactions = reactionsData.map(reaction => {
        const profile = profiles?.find(p => p.user_id === reaction.user_id);
        return {
          ...reaction,
          author: profile || { full_name: "Unknown User", avatar_url: null, user_id: reaction.user_id }
        };
      });
      setReactions(enrichedReactions);
    } else {
      setReactions([]);
    }
  };

  const handlePostDeleted = () => {
    router.push("/community");
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("You must be logged in to comment.");
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);

    const { error } = await supabase
      .from("community_comments")
      .insert({
        post_id: postId,
        user_id: currentUser.id,
        content: newComment.trim(),
        parent_id: replyTo ? replyTo.id : null
      });

    if (error) {
      toast.error("Failed to post comment");
    } else {
      setNewComment("");
      setReplyTo(null);
      await fetchComments(currentUser); // Refetch instantly
    }

    setSubmittingComment(false);
  };

  const CommentNode = ({ comment, isReply = false }) => {
    return (
      <div className={`flex gap-3 ${isReply ? 'mt-3' : 'mb-5'}`}>
        {isReply && (
          <div className="flex-shrink-0 flex items-start pt-2">
            <CornerDownRight className="w-4 h-4 text-border" />
          </div>
        )}
        <Link href={`/professionals/${comment.author.user_id}`} className="flex-shrink-0">
          <Avatar className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} border border-border cursor-pointer hover:opacity-80`}>
            <AvatarImage src={comment.author.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {comment.author.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="bg-muted/40 border border-border/50 rounded-2xl p-3 inline-block max-w-full">
            <Link href={`/professionals/${comment.author.user_id}`}>
              <h5 className="text-[13px] font-bold text-foreground hover:underline inline-block mr-2">
                {comment.author.full_name}
              </h5>
            </Link>
            <p className="text-[14px] text-foreground leading-snug mt-0.5 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-2">
            <span className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {!isReply && currentUser && (
              <button 
                onClick={() => setReplyTo({ id: comment.id, name: comment.author.full_name })}
                className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Reply
              </button>
            )}
          </div>
          
          {/* Render Replies */}
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map(reply => (
                <CommentNode key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-background/50 py-6 md:py-10">
      <Container className="max-w-3xl">
        <div className="mb-6">
          <Link href="/community">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent">
              <ArrowLeft className="w-4 h-4" /> Back to Community
            </Button>
          </Link>
        </div>

        <PostCard 
          post={post} 
          currentUser={currentUser} 
          onDelete={handlePostDeleted}
          isDetailView={true}
        />

        {reactions.length > 0 && (
          <div className="mt-5 flex items-center flex-wrap gap-1.5 bg-card border border-border/50 p-3 rounded-2xl">
            <div className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 mr-2">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> {reactions.length} Likes
            </div>
            {reactions.map(reaction => (
              <Link key={reaction.id} href={`/professionals/${reaction.author.user_id}`} title={reaction.author.full_name}>
                <Avatar className="w-7 h-7 border border-border hover:scale-110 transition-transform">
                  <AvatarImage src={reaction.author.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                    {reaction.author.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            Comments 
            <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
              {comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}
            </span>
          </h3>

          <div className="mb-8">
            {comments.map(comment => (
              <CommentNode key={comment.id} comment={comment} />
            ))}
            {comments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm bg-card border border-border/40 rounded-2xl">
                No comments yet. Be the first to share your thoughts!
              </div>
            )}
          </div>
        </div>
      </Container>
      
      {/* Sticky Comment Input */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-background/80 backdrop-blur-xl border-t border-border/60 p-4 z-40">
        <Container className="max-w-3xl relative">
          {!currentUser ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border/60 p-4 rounded-2xl shadow-sm">
              <p className="text-sm text-foreground font-medium text-center sm:text-left">
                Join the conversation to react and comment.
              </p>
              <Link href="/login">
                <Button className="rounded-xl font-bold px-6 shadow-sm shadow-primary/20">
                  Log In
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {replyTo && (
                <div className="absolute -top-10 left-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-t-lg flex items-center gap-2 shadow-sm">
                  Replying to {replyTo.name}
                  <button onClick={() => setReplyTo(null)} className="ml-2 bg-primary-foreground/20 rounded-full p-0.5 hover:bg-primary-foreground/40">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <form onSubmit={handleSubmitComment} className="flex items-center gap-3 relative z-10">
                <Avatar className="w-10 h-10 border border-border/50 hidden sm:block">
                  {currentUser?.user_metadata?.avatar_url ? (
                    <AvatarImage src={currentUser.user_metadata.avatar_url} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {currentUser?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Input 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyTo ? `Reply to ${replyTo.name}...` : "Write a comment..."}
                  className="flex-1 bg-card border-border/60 focus:border-primary/50 focus:ring-primary/20 rounded-2xl h-11"
                />
                <Button 
                  type="submit" 
                  disabled={!newComment.trim() || submittingComment}
                  className="h-11 rounded-xl px-4 font-bold shadow-sm shadow-primary/20"
                >
                  {submittingComment ? <Loader2 className="w-4 h-4 animate-spin sm:mr-2" /> : <Send className="w-4 h-4 sm:mr-2" />}
                  <span className="hidden sm:inline">Comment</span>
                </Button>
              </form>
            </>
          )}
        </Container>
      </div>
    </div>
  );
}
