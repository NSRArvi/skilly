"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { Search, Heart, MessageCircle, Eye, Trash2, ShieldAlert, Archive, CheckCircle2, XCircle, LayoutGrid, List as ListIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { togglePostArchive } from "../../actions";
import ImageGallery from "@/components/shared/ImageGallery";
import { AdminTableSkeleton } from "@/components/shared/AdminSkeletons";

export default function CommunityAdmin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Gallery State
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  
  // Post Details (Comments/Reactions)
  const [postDetails, setPostDetails] = useState({ comments: [], reactions: [], loading: false });

  const supabase = createClient();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data: postsData, error: postsError } = await supabase
      .from("community_posts")
      .select("*, community_comments(count), community_reactions(count)")
      .order("created_at", { ascending: false });
    
    if (postsError) {
      toast.error(postsError.message);
      setLoading(false);
      return;
    }

    if (postsData && postsData.length > 0) {
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("professionals")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);
      
      const enrichedPosts = postsData.map(post => {
        const profile = profiles?.find(p => p.user_id === post.user_id);
        return {
          ...post,
          professionals: profile || null,
          comment_count: post.community_comments?.[0]?.count || 0,
          reaction_count: post.community_reactions?.[0]?.count || 0,
        };
      });
      setPosts(enrichedPosts);
    } else {
      setPosts([]);
    }
    
    setLoading(false);
  };

  const deletePost = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this post?")) return;
    const { error } = await supabase.from("community_posts").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Post deleted successfully");
      setPosts(prev => prev.filter(p => p.id !== id));
      if (selectedPost?.id === id) setSelectedPost(null);
    }
  };

  const handleToggleArchive = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    const result = await togglePostArchive(id, newStatus);
      
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success(`Post ${newStatus ? "archived" : "unarchived"} successfully.`);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, is_archived: newStatus } : p));
      if (selectedPost?.id === id) {
        setSelectedPost(prev => ({ ...prev, is_archived: newStatus }));
      }
    }
  };

  const handleOpenReview = async (post) => {
    setSelectedPost(post);
    setPostDetails({ comments: [], reactions: [], loading: true });

    // Fetch comments and reactions for this post
    const [commentsRes, reactionsRes] = await Promise.all([
      supabase.from("community_comments").select("*").eq("post_id", post.id).order("created_at", { ascending: true }),
      supabase.from("community_reactions").select("*").eq("post_id", post.id)
    ]);

    const userIds = [...new Set([
      ...(commentsRes.data || []).map(c => c.user_id),
      ...(reactionsRes.data || []).map(r => r.user_id)
    ])];
    
    let profiles = [];
    if (userIds.length > 0) {
      const { data } = await supabase.from("professionals").select("user_id, full_name, avatar_url").in("user_id", userIds);
      if (data) profiles = data;
    }
    
    const enrichedComments = (commentsRes.data || []).map(c => ({
      ...c,
      professionals: profiles.find(p => p.user_id === c.user_id) || null
    }));
    
    const enrichedReactions = (reactionsRes.data || []).map(r => ({
      ...r,
      professionals: profiles.find(p => p.user_id === r.user_id) || null
    }));

    setPostDetails({
      comments: enrichedComments,
      reactions: enrichedReactions,
      loading: false
    });
  };

  const filtered = posts.filter(p => 
    p.content?.toLowerCase().includes(search.toLowerCase()) || 
    p.professionals?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Community Posts</h1>
          <p className="text-gray-500 mt-1">Monitor, archive, and manage community content.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <div className="relative flex-1 w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search content or author..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-gray-200 focus-visible:ring-indigo-500 rounded-lg w-full"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <AdminTableSkeleton columns={5} rows={5} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
          <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No posts found</h3>
          <p className="text-gray-500">The community is quiet right now.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
          {filtered.map(post => {
            const hasImages = post.images && Array.isArray(post.images) && post.images.length > 0;
            return (
              <div 
                key={post.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden break-inside-avoid hover:shadow-md transition-shadow group cursor-pointer relative"
                onClick={() => handleOpenReview(post)}
              >
                {post.is_archived && (
                  <div className="absolute top-0 inset-x-0 bg-amber-500 text-white text-[10px] font-bold text-center py-1 uppercase tracking-wider z-10 flex items-center justify-center gap-1">
                    <Archive className="w-3 h-3" /> Archived
                  </div>
                )}
                <div className={`p-5 flex items-center justify-between ${post.is_archived ? 'pt-8' : ''}`}>
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.professionals?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${post.professionals?.full_name || 'User'}`}
                      alt="Author" 
                      className="w-10 h-10 rounded-full object-cover bg-gray-100"
                    />
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">{post.professionals?.full_name || 'Unknown User'}</h4>
                      <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-5 pb-4">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap line-clamp-4">{post.content}</p>
                </div>

                {hasImages && (
                  <div className={`grid gap-1 px-5 pb-5 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {post.images.slice(0, 4).map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={img} alt="Post media" className="w-full h-full object-cover" />
                        {idx === 3 && post.images.length > 4 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold">+{post.images.length - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="px-5 py-3 border-t border-gray-50 flex items-center gap-6 text-gray-500">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Heart className="w-4 h-4" /> {post.reaction_count}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <MessageCircle className="w-4 h-4" /> {post.comment_count}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Eye className="w-4 h-4" /> {post.impressions_count || 0}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Content Snippet</th>
                  <th className="px-6 py-4 text-center">Engagement</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={post.professionals?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${post.professionals?.full_name || 'User'}`}
                          alt="Author" 
                          className="w-8 h-8 rounded-full object-cover bg-gray-100"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{post.professionals?.full_name || 'Unknown'}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{new Date(post.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700 line-clamp-1 max-w-sm">{post.content || "No text content"}</div>
                      {post.images && post.images.length > 0 && (
                        <div className="text-[10px] text-indigo-600 font-medium mt-1">Has {post.images.length} attachment(s)</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.reaction_count}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.comment_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${post.is_archived ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {post.is_archived ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenReview(post)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review & Archive Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                Post Review
                {selectedPost.is_archived && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Archive className="w-3 h-3" /> Archived</span>}
              </h3>
              <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Left Side: Post Content */}
              <div className="lg:w-1/2 border-r border-gray-100 p-6 overflow-y-auto bg-white flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <img 
                    src={selectedPost.professionals?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedPost.professionals?.full_name || 'User'}`}
                    alt="Author" 
                    className="w-12 h-12 rounded-full object-cover border border-gray-100"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedPost.professionals?.full_name || 'Unknown User'}</h4>
                    <p className="text-xs text-gray-500">{new Date(selectedPost.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-800 whitespace-pre-wrap mb-6">
                  {selectedPost.content}
                </div>

                {selectedPost.images && selectedPost.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {selectedPost.images.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="rounded-xl overflow-hidden bg-gray-100 border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          setGalleryIndex(idx);
                          setGalleryOpen(true);
                        }}
                      >
                        <img src={img} alt="Attachment" className="w-full h-auto object-contain" />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-auto pt-6">
                  <div className={`w-full p-4 rounded-xl border ${selectedPost.is_archived ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-200'}`}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-500">Moderation Action</p>
                    <button 
                      onClick={() => handleToggleArchive(selectedPost.id, selectedPost.is_archived)}
                      className={`w-full flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-lg transition-colors shadow-sm ${
                        selectedPost.is_archived 
                          ? "text-emerald-700 bg-emerald-100 hover:bg-emerald-200" 
                          : "text-white bg-amber-600 hover:bg-amber-700"
                      }`}
                    >
                      {selectedPost.is_archived ? (
                        <><CheckCircle2 className="w-4 h-4" /> Restore to Public Feed</>
                      ) : (
                        <><Archive className="w-4 h-4" /> Archive Post</>
                      )}
                    </button>
                    {!selectedPost.is_archived && (
                      <p className="text-[10px] text-amber-700/70 mt-2 text-center">Archived posts are hidden from the community but remain visible to the creator.</p>
                    )}
                  </div>

                  <div className="mt-4 flex justify-center">
                     <button 
                        onClick={() => deletePost(selectedPost.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 px-3 py-1.5 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Permanently Delete
                      </button>
                  </div>
                </div>
              </div>

              {/* Right Side: Comments & Reactions */}
              <div className="lg:w-1/2 bg-gray-50/50 p-6 overflow-y-auto flex flex-col h-full">
                {postDetails.loading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                      <p className="text-sm text-gray-500 font-medium">Loading engagement data...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Heart className="w-4 h-4" /> Reactions ({postDetails.reactions.length})
                      </h4>
                      {postDetails.reactions.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No reactions yet.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {postDetails.reactions.map(reaction => (
                            <div key={reaction.id} className="flex items-center gap-2 bg-white border border-gray-100 rounded-full pl-1 pr-3 py-1 shadow-sm" title={reaction.professionals?.full_name}>
                              <img src={reaction.professionals?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${reaction.professionals?.full_name}`} className="w-5 h-5 rounded-full" />
                              <span className="text-[11px] font-medium text-gray-700 max-w-[100px] truncate">{reaction.professionals?.full_name || 'User'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" /> Comments ({postDetails.comments.length})
                      </h4>
                      {postDetails.comments.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No comments yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {postDetails.comments.map(comment => (
                            <div key={comment.id} className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm flex gap-3">
                              <img src={comment.professionals?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.professionals?.full_name}`} className="w-8 h-8 rounded-full bg-gray-50" />
                              <div className="flex-1">
                                <div className="flex items-baseline justify-between mb-1">
                                  <span className="text-sm font-bold text-gray-900">{comment.professionals?.full_name || 'Unknown User'}</span>
                                  <span className="text-[10px] text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPost && (
        <ImageGallery 
          images={selectedPost.images || []}
          initialIndex={galleryIndex}
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
}
