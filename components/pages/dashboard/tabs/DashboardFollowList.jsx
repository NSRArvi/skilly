"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Loader2, UserMinus } from "lucide-react";
import { createClient } from "../../../../lib/client";
import { toast } from "sonner";
import Link from "next/link";

export default function DashboardFollowList({ userId, type }) {
  // type is either "followers" or "following"
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    if (!userId) return;
    setLoading(true);
    const supabase = createClient();

    // Stage 1: Get the follow records
    let query = supabase.from("followers").select("*");
    if (type === "followers") {
      query = query.eq("following_id", userId);
    } else {
      query = query.eq("follower_id", userId);
    }

    const { data: followRecords, error } = await query;

    if (followRecords && followRecords.length > 0) {
      // Extract the user IDs we need to fetch profiles for
      const targetUserIds = followRecords.map((r) =>
        type === "followers" ? r.follower_id : r.following_id,
      );

      // Stage 2: Fetch profiles from professionals table
      const { data: profiles } = await supabase
        .from("professionals")
        .select("id, user_id, full_name, avatar_url, profession")
        .in("user_id", targetUserIds);

      if (profiles) {
        let myFollowingIds = new Set();
        if (type === "followers") {
          const { data: myFollowing } = await supabase
            .from("followers")
            .select("following_id")
            .eq("follower_id", userId)
            .in("following_id", targetUserIds);
          if (myFollowing) {
            myFollowingIds = new Set(myFollowing.map((f) => f.following_id));
          }
        }

        // Map the profiles back to the follow records
        const combined = followRecords
          .map((record) => {
            const targetId =
              type === "followers" ? record.follower_id : record.following_id;
            const profile = profiles.find((p) => p.user_id === targetId);
            return {
              ...record,
              profile,
              isFollowingBack:
                type === "followers" ? myFollowingIds.has(targetId) : true,
            };
          })
          .filter((item) => item.profile); // Only keep ones where profile exists

        setList(combined);
      }
    } else {
      setList([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, [userId, type]);

  const handleUnfollow = async (followRecordId, name) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("followers")
      .delete()
      .eq("id", followRecordId);

    if (error) {
      toast.error("Failed to unfollow");
    } else {
      toast.success(`Unfollowed ${name}`);
      setList(list.filter((item) => item.id !== followRecordId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground space-y-3">
        <Users className="w-8 h-8 text-primary mx-auto" />
        <h3 className="text-foreground font-semibold">
          {type === "followers" ? "No Followers Yet" : "Not Following Anyone"}
        </h3>
        <p className="text-xs max-w-md mx-auto">
          {type === "followers"
            ? "When other users follow you, they will appear here."
            : "Find professionals and click Follow to stay updated with their work."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {list.map((item) => {
        const profile = Array.isArray(item.profile)
          ? item.profile[0]
          : item.profile;
        if (!profile) return null;

        return (
          <div
            key={item.id}
            className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
          >
            <Link
              href={`/professionals/${profile.id}`}
              className="flex items-center gap-3 flex-1 min-w-0 group"
            >
              <Avatar className="w-10 h-10 border border-border group-hover:border-primary transition-colors">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {profile.full_name?.charAt(0) || "P"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {profile.full_name}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {profile.profession || "Professional"}
                </p>
              </div>
            </Link>

            {type === "following" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnfollow(item.id, profile.full_name)}
                className="h-8 rounded-lg text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border"
              >
                Unfollow
              </Button>
            ) : item.isFollowingBack ? (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase
                    .from("followers")
                    .delete()
                    .eq("follower_id", userId)
                    .eq("following_id", profile.user_id);
                  toast.success(`Unfollowed ${profile.full_name}`);
                  fetchList(); // Refresh list to update state
                }}
                className="h-8 rounded-lg text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border"
              >
                Following
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.from("followers").insert({
                    follower_id: userId,
                    following_id: profile.user_id,
                  });
                  toast.success(`Followed ${profile.full_name}`);
                  fetchList(); // Refresh list to update state
                }}
                className="h-8 rounded-lg text-xs font-bold shadow-sm"
              >
                Follow Back
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
