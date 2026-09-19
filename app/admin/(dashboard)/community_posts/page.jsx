"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { Search, Heart, MessageCircle, Eye, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function PostsAdmin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    // Fetch posts
    const { data: postsData, error: postsError } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (postsError) {
      toast.error(postsError.message);
      setLoading(false);
      return;
    }

    if (postsData && postsData.length > 0) {
      // Fetch author profiles
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("professionals")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);
      
      const enrichedPosts = postsData.map(post => {
        const profile = profiles?.find(p => p.user_id === post.user_id);
        return {
          ...post,
          professionals: profile || null
        };
      });
      setPosts(enrichedPosts);
    } else {
      setPosts([]);
    }
    
    setLoading(false);
  };

  const deletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const { error } = await supabase.from("community_posts").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Post deleted successfully");
      setPosts(prev => prev.filter(p => p.id !== id));
    }
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
          <p className="text-gray-500 mt-1">Monitor and moderate community content.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search content or author..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-gray-200 focus-visible:ring-indigo-500 rounded-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse h-64 break-inside-avoid"></div>
          ))}
        </div>
      ) : (
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
          {filtered.map(post => {
            const hasImages = post.images && Array.isArray(post.images) && post.images.length > 0;
            return (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden break-inside-avoid hover:shadow-md transition-shadow group">
                <div className="p-5 flex items-center justify-between">
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
                  <button 
                    onClick={() => deletePost(post.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="px-5 pb-4">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{post.content}</p>
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
                    <Eye className="w-4 h-4" /> {post.impressions_count || 0}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
          <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No posts found</h3>
          <p className="text-gray-500">The community is quiet right now.</p>
        </div>
      )}
    </div>
  );
}
