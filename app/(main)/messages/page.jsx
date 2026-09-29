"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Loader2,
  MessageSquare,
  ArrowLeft,
  Search,
  MoreVertical,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("user_id");
  const { openModal } = useAuthModal();

  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingSentRef = useRef(false);
  const activeChannelRef = useRef(null);
  const supabase = createClient();

  useEffect(() => {
    // Scroll to bottom on new messages
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchConversations = async (userId) => {
    const { data: convos, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (error) {
      toast.error("Failed to load conversations");
      return;
    }

    if (convos && convos.length > 0) {
      const otherUserIds = convos.map((c) =>
        c.participant1_id === userId ? c.participant2_id : c.participant1_id,
      );

      const { data: profiles } = await supabase
        .from("professionals")
        .select("user_id, full_name, avatar_url")
        .in("user_id", otherUserIds);

      const enrichedConvos = convos.map((c) => {
        const otherId =
          c.participant1_id === userId ? c.participant2_id : c.participant1_id;
        const profile = profiles?.find((p) => p.user_id === otherId);
        return {
          ...c,
          otherUser: {
            id: otherId,
            full_name: profile?.full_name || "Unknown User",
            avatar_url: profile?.avatar_url || null,
          },
        };
      });

      setConversations(enrichedConvos);
    } else {
      setConversations([]);
    }
  };

  const createConversation = async (otherUserId) => {
    if (!currentUser) return;

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(participant1_id.eq.${currentUser.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${currentUser.id})`,
      )
      .single();

    if (existing) {
      setActiveConversationId(existing.id);
      return;
    }

    const { data } = await supabase
      .from("conversations")
      .insert({
        participant1_id: currentUser.id,
        participant2_id: otherUserId,
      })
      .select()
      .single();

    if (data) {
      await fetchConversations(currentUser.id);
      setActiveConversationId(data.id);
      router.replace("/messages", undefined, { shallow: true });
    } else {
      toast.error("Failed to create conversation");
    }
  };

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        openModal();
        return;
      }
      setCurrentUser(user);

      await fetchConversations(user.id);

      setLoading(false);
    };
    init();
  }, []);

  // Track online users globally with Supabase Realtime Presence
  useEffect(() => {
    if (!currentUser) return;

    const presenceChannel = supabase.channel("online-users", {
      config: {
        presence: { key: currentUser.id },
      },
    });

    const syncPresence = () => {
      const state = presenceChannel.presenceState();
      setOnlineUserIds(new Set(Object.keys(state)));
    };

    presenceChannel
      .on("presence", { event: "sync" }, syncPresence)
      .on("presence", { event: "join" }, syncPresence)
      .on("presence", { event: "leave" }, syncPresence)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            user_id: currentUser.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [currentUser]);

  // Set active conversation from targetUserId or list
  useEffect(() => {
    const handleTargetUser = async () => {
      if (!loading && currentUser && targetUserId) {
        const existingConv = conversations.find(
          (c) =>
            c.participant1_id === targetUserId ||
            c.participant2_id === targetUserId,
        );

        if (existingConv) {
          if (activeConversationId !== existingConv.id) {
            setActiveConversationId(existingConv.id);
          }
        } else {
          await createConversation(targetUserId);
        }
      }
    };
    handleTargetUser();
  }, [loading, targetUserId, conversations, currentUser, activeConversationId]);

  // Fetch messages and subscribe to active conversation & typing broadcasts
  useEffect(() => {
    if (!activeConversationId) return;

    const fetchMsgs = async () => {
      setIsOtherTyping(false);
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
    };

    fetchMsgs();

    // Subscribe to new messages & typing broadcasts
    const channel = supabase
      .channel(`chat:${activeConversationId}`, {
        config: {
          broadcast: { ack: false },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          // Mark as read if not sender
          if (payload.new.sender_id !== currentUser?.id) {
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", payload.new.id)
              .then();
            setIsOtherTyping(false);
          }
        },
      )
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.userId !== currentUser?.id) {
          setIsOtherTyping(Boolean(payload?.isTyping));
        }
      })
      .subscribe();

    activeChannelRef.current = channel;

    return () => {
      setIsOtherTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      isTypingSentRef.current = false;
      activeChannelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, currentUser?.id]);

  const sendTypingStatus = (isTyping) => {
    if (!activeChannelRef.current || !currentUser) return;
    activeChannelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: currentUser.id, isTyping },
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    // Auto-grow textarea height
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;

    if (value.trim().length > 0) {
      if (!isTypingSentRef.current) {
        sendTypingStatus(true);
        isTypingSentRef.current = true;
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false);
        isTypingSentRef.current = false;
      }, 2000);
    } else if (isTypingSentRef.current) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      sendTypingStatus(false);
      isTypingSentRef.current = false;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId || !currentUser) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingSentRef.current) {
      sendTypingStatus(false);
      isTypingSentRef.current = false;
    }

    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConversationId,
      sender_id: currentUser.id,
      content,
    });

    if (error) {
      toast.error("Failed to send message");
      setNewMessage(content);
    } else {
      setConversations((prev) => {
        const newConvos = [...prev];
        const idx = newConvos.findIndex((c) => c.id === activeConversationId);
        if (idx !== -1) {
          newConvos[idx].updated_at = new Date().toISOString();
          newConvos.sort(
            (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
          );
        }
        return newConvos;
      });
    }

    setSending(false);
  };

  if (loading) {
    return (
      <div className="h-[calc(100dvh-64px)] w-full flex justify-center items-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  const filteredConversations = conversations.filter((c) =>
    c.otherUser.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isOtherUserOnline = activeConversation
    ? onlineUserIds.has(activeConversation.otherUser.id)
    : false;

  return (
    <div className="h-[calc(100dvh-64px)] w-full bg-background flex overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div
        className={`${activeConversationId ? "hidden lg:flex" : "flex"} w-full lg:w-[320px] lg:w-[380px] flex-col border-r border-border/60 bg-card/40 backdrop-blur-md z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}
      >
        <div className="p-4 lg:p-5 border-b border-border/50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              Messages
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-background/50 border-border/60 focus:border-primary/50 focus:ring-primary/20 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-primary/40" />
              </div>
              <p className="text-sm font-medium">No conversations found.</p>
              <p className="text-xs mt-1 text-muted-foreground/70">
                Start a chat from a professional&apos;s profile or an order.
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isUserOnline = onlineUserIds.has(conv.otherUser.id);
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`flex items-center gap-4 px-4 lg:px-5 py-3.5 mx-2 lg:mx-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                    activeConversationId === conv.id
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[0.98]"
                      : "hover:bg-muted/60 text-foreground hover:scale-[0.99]"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar
                      className={`w-12 h-12 border-2 ${activeConversationId === conv.id ? "border-primary-foreground/20" : "border-background"} shadow-sm`}
                    >
                      <AvatarImage src={conv.otherUser.avatar_url} />
                      <AvatarFallback
                        className={
                          activeConversationId === conv.id
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-primary/10 text-primary"
                        }
                      >
                        {conv.otherUser.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {/* Status indicator dot */}
                    <div
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                        activeConversationId === conv.id
                          ? isUserOnline
                            ? "border-primary bg-emerald-400"
                            : "border-primary bg-primary-foreground/40"
                          : isUserOnline
                            ? "border-card bg-emerald-500"
                            : "border-card bg-muted-foreground/30"
                      }`}
                      title={isUserOnline ? "Online" : "Offline"}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4
                        className={`text-sm font-bold truncate ${activeConversationId === conv.id ? "text-primary-foreground" : "text-foreground"}`}
                      >
                        {conv.otherUser.full_name}
                      </h4>
                      <span
                        className={`text-[10px] font-medium whitespace-nowrap ml-2 ${activeConversationId === conv.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {new Date(conv.updated_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate ${activeConversationId === conv.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                    >
                      Click to view conversation
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Area - Active Chat */}
      <div
        className={`${!activeConversationId ? "hidden lg:flex" : "flex"} flex-col bg-background fixed inset-0 z-[100] h-[100dvh] w-full lg:relative lg:inset-auto lg:z-auto lg:h-auto lg:flex-1`}
      >
        {/* Abstract Background pattern for chat */}
        <div
          className="absolute inset-0 z-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 lg:px-6 border-b border-border/50 flex items-center justify-between bg-card/60 backdrop-blur-lg z-10 sticky top-0 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="relative hidden sm:block">
                    <Avatar className="w-10 h-10 border border-border shadow-sm">
                      <AvatarImage
                        src={activeConversation.otherUser.avatar_url}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {activeConversation.otherUser.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                        isOtherUserOnline ? "bg-emerald-500" : "bg-muted-foreground/30"
                      }`}
                      title={isOtherUserOnline ? "Online" : "Offline"}
                    />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-foreground leading-none">
                      {activeConversation.otherUser.full_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {isOtherTyping ? (
                        <span className="text-[11px] font-semibold text-primary flex items-center gap-1 animate-pulse">
                          typing...
                        </span>
                      ) : isOtherUserOnline ? (
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active now
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Offline
                        </span>
                      )}
                      <span className="text-muted-foreground/40 text-[10px]">•</span>
                      <Link
                        href={`/professionals/${activeConversation.otherUser.id}`}
                      >
                        <span className="text-[11px] font-medium text-primary hover:underline">
                          View Profile
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 z-10 relative scrollbar-hide">
              {messages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-center">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <Avatar className="w-16 h-16 border-2 border-background shadow-md">
                      <AvatarImage
                        src={activeConversation.otherUser.avatar_url}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                        {activeConversation.otherUser.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Say hi to{" "}
                    {activeConversation.otherUser.full_name.split(" ")[0]}!
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    This is the beginning of your direct message history.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMine = msg.sender_id === currentUser.id;
                  const showAvatar =
                    !isMine &&
                    (index === messages.length - 1 ||
                      messages[index + 1]?.sender_id === currentUser.id);

                  return (
                    <div
                      key={msg.id}
                      className={`flex w-full ${isMine ? "justify-end" : "justify-start"} group`}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-[85%] lg:max-w-[70%]`}
                      >
                        {!isMine && (
                          <div className="w-7 h-7 flex-shrink-0 hidden sm:block">
                            {showAvatar ? (
                              <Avatar className="w-7 h-7 border border-border/50 shadow-sm">
                                <AvatarImage
                                  src={activeConversation.otherUser.avatar_url}
                                />
                                <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                                  {activeConversation.otherUser.full_name?.charAt(
                                    0,
                                  )}
                                </AvatarFallback>
                              </Avatar>
                            ) : null}
                          </div>
                        )}

                        <div className="flex flex-col gap-1 w-full">
                          <div
                            className={`px-4 py-2.5 text-[15px] leading-relaxed shadow-sm transition-all ${
                              isMine
                                ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                                : "bg-card border border-border/60 text-foreground rounded-2xl rounded-bl-sm"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity ${
                              isMine
                                ? "text-right text-muted-foreground pr-1"
                                : "text-left text-muted-foreground pl-1"
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator bubble */}
              {isOtherTyping && (
                <div className="flex items-end gap-2 justify-start animate-in fade-in duration-200">
                  <div className="w-7 h-7 flex-shrink-0 hidden sm:block">
                    <Avatar className="w-7 h-7 border border-border/50 shadow-sm">
                      <AvatarImage
                        src={activeConversation.otherUser.avatar_url}
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                        {activeConversation.otherUser.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="px-4 py-2.5 bg-card border border-border/60 text-muted-foreground rounded-2xl rounded-bl-sm flex items-center gap-1.5 shadow-sm">
                    <span className="text-xs mr-1 text-muted-foreground font-medium">
                      {activeConversation.otherUser.full_name.split(" ")[0]} is typing
                    </span>
                    <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-background/80 backdrop-blur-lg border-t border-border/50 z-10 sticky bottom-0">
              <form
                onSubmit={handleSendMessage}
                className="max-w-4xl mx-auto relative flex items-end gap-2 bg-card/50 border border-border/80 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 rounded-2xl p-1.5 transition-all shadow-sm"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 flex-shrink-0 rounded-xl text-muted-foreground hover:bg-muted/80"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
                <textarea
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 max-h-[120px] min-h-[40px] py-2.5 bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground/70"
                  rows={1}
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className={`h-10 px-4 rounded-xl font-bold flex-shrink-0 transition-all ${
                    newMessage.trim()
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Send className="w-4 h-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Send</span>
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground z-10 p-4">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <MessageSquare className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Your Messages
            </h3>
            <p className="text-sm text-center max-w-sm leading-relaxed">
              Select a conversation from the sidebar or start a new chat from a
              professional&apos;s profile to begin messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100dvh-64px)] w-full flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
