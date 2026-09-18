"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Search,
  Plus,
  Bell,
  Moon,
  Sun,
  Menu,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Users2,
} from "lucide-react";
import { createClient } from "../../lib/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Navbar({ onToggleMobileSidebar }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    fetchUser();
  }, []);

  const toggleTheme = () => {
    const currentTheme = theme === "system" ? resolvedTheme : theme;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setPopoverOpen(false);
    toast.success("Signed out successfully");
    router.push("/login");
  };

  const getAvatarUrl = () => {
    return (
      user?.user_metadata?.picture || user?.user_metadata?.avatar_url || null
    );
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(
        `/professionals?query=${encodeURIComponent(searchQuery.trim())}`,
      );
    }
  };

  const isDarkMode = mounted ? (resolvedTheme || theme) === "dark" : true;

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-background/80 backdrop-blur-xl border-b border-border/70 px-4 md:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile hamburger & Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar matching screenshot */}
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search professionals, jobs, skills..."
            className="w-full bg-background/60 border border-border/80 text-foreground placeholder:text-muted-foreground text-xs rounded-xl pl-9 pr-12 py-2 h-9 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center">
            <span className="text-[10px] font-mono text-muted-foreground/80 bg-muted/60 border border-border/60 px-1.5 py-0.5 rounded">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 md:gap-3">
        {/* "+ Post a Job" Button matching screenshot */}
        <Link href="/jobs/create">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs px-3.5 py-2 h-9 rounded-xl shadow-sm shadow-primary/20 flex items-center gap-1.5 transition-all">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Post a Job</span>
          </Button>
        </Link>

        {/* Notifications Bell */}
        <button
          type="button"
          onClick={() => toast.info("You have 3 unread notifications")}
          className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
        </button>

        {/* Dark Mode Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Toggle Theme"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4 text-amber-400 hover:text-amber-300 transition-colors" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 hover:text-slate-900 transition-colors" />
          )}
        </button>

        {/* User Profile Avatar with dropdown */}
        <div className="relative pl-1">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setPopoverOpen(!popoverOpen)}
          >
            <div className="relative">
              <Avatar className="w-8 h-8 rounded-full border border-border/80">
                <AvatarImage src={getAvatarUrl()} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
            </div>
          </div>

          {/* Popover Menu */}
          {popoverOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setPopoverOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col py-1">
                <div className="px-4 py-2 border-b border-border/60">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {user?.user_metadata?.full_name || "Elena Vance"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {user?.email || "elena@vance.io"}
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setPopoverOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <Link
                  href="/messages"
                  onClick={() => setPopoverOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Messages
                </Link>
                <Link
                  href="/community"
                  onClick={() => setPopoverOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                >
                  <Users2 className="w-3.5 h-3.5" />
                  Community
                </Link>
                <div className="h-px w-full bg-border/60" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors text-left w-full"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
