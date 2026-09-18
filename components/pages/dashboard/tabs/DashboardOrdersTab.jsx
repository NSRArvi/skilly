"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Loader2,
  Calendar,
} from "lucide-react";
import { createClient } from "../../../../lib/client";
import { toast } from "sonner";
import Link from "next/link";

const statusConfig = {
  pending: { label: "Pending", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  accepted: { label: "Accepted", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  declined: { label: "Declined", className: "bg-red-500/15 text-red-600 border-red-500/30" },
  in_progress: { label: "In Progress", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  completed: { label: "Completed", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  cancelled: { label: "Cancelled", className: "bg-red-500/15 text-red-600 border-red-500/30" },
};

export default function DashboardOrdersTab({ userId }) {
  const [view, setView] = useState("received"); // 'received' or 'placed'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!userId) return;
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (view === "received") {
      query = query.eq("professional_id", userId);
    } else {
      query = query.eq("client_id", userId);
    }

    const { data: rawOrders, error } = await query;
    
    if (rawOrders && rawOrders.length > 0) {
      // Get unique user IDs to fetch profiles for
      const targetUserIds = [...new Set(rawOrders.map(o => view === "received" ? o.client_id : o.professional_id))];
      
      const { data: profiles } = await supabase
        .from("professionals")
        .select("user_id, full_name, avatar_url")
        .in("user_id", targetUserIds);
        
      if (profiles) {
        const enrichedOrders = rawOrders.map(order => {
          const targetId = view === "received" ? order.client_id : order.professional_id;
          const profile = profiles.find(p => p.user_id === targetId);
          return {
            ...order,
            targetProfile: profile || { full_name: "Unknown User" }
          };
        });
        setOrders(enrichedOrders);
      } else {
        setOrders(rawOrders);
      }
    } else {
      setOrders([]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [userId, view]);

  const handleAction = async (orderId, newStatus, otherUserId) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error(`Failed to ${newStatus} order`);
      return;
    }

    toast.success(`Order ${newStatus} successfully`);

    // Auto-follow logic on accept
    if (newStatus === "in_progress" || newStatus === "accepted") {
      // Professional follows client
      await supabase.from("followers").insert({
        follower_id: userId,
        following_id: otherUserId,
      }).catch(e => {}); // Ignore unique constraint errors
      
      // Client follows professional
      await supabase.from("followers").insert({
        follower_id: otherUserId,
        following_id: userId,
      }).catch(e => {});
    }

    fetchOrders();
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit">
        <button
          onClick={() => setView("received")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            view === "received"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Received Offers
        </button>
        <button
          onClick={() => setView("placed")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            view === "placed"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Placed Offers
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground space-y-3">
          <FileText className="w-8 h-8 text-primary mx-auto" />
          <h3 className="text-foreground font-semibold">No Orders Found</h3>
          <p className="text-xs max-w-md mx-auto">
            {view === "received"
              ? "You haven't received any project offers yet."
              : "You haven't placed any project offers yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const st = statusConfig[order.status] || statusConfig.pending;
            const isPendingReceived = view === "received" && order.status === "pending";
            const canChat = order.status === "accepted" || order.status === "in_progress";

            return (
              <div
                key={order.id}
                className="bg-card border border-border rounded-xl p-4 md:p-5 hover:border-primary/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${st.className}`}>
                        {st.label}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 pb-2">
                      <div className="w-6 h-6 rounded-full bg-muted overflow-hidden flex-shrink-0">
                        {order.targetProfile?.avatar_url ? (
                          <img src={order.targetProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-bold text-[10px]">
                            {order.targetProfile?.full_name?.charAt(0) || "U"}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {view === "received" ? "From: " : "To: "}
                        <span className="text-foreground">{order.targetProfile?.full_name || "Unknown User"}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-foreground">
                      {order.title}
                    </h4>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {order.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-1">
                      <span className="font-semibold text-foreground">
                        {order.offer_amount} {order.currency}
                      </span>
                      {order.delivery_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Delivery: {new Date(order.delivery_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0 pt-2 sm:pt-0">
                    {isPendingReceived && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAction(order.id, "in_progress", order.client_id)}
                          className="h-8 rounded-lg text-[11px] font-bold gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/30"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Accept Offer
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAction(order.id, "declined", order.client_id)}
                          className="h-8 rounded-lg text-[11px] font-bold gap-1 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/30"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </Button>
                      </>
                    )}

                    {canChat && (
                      <Button
                        size="sm"
                        onClick={() => toast.info("Chat feature coming next!")}
                        className="h-8 rounded-lg text-[11px] font-bold gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Chat
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
