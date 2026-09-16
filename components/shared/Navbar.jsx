"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Moon, Sun, Briefcase, UserCircle, LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "../../lib/client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setPopoverOpen(false);
    router.push("/");
  };

  const getAvatarUrl = () => {
    return user?.user_metadata?.picture || user?.user_metadata?.avatar_url || null;
  };

  return (
    <div className="w-full max-w-7xl mx-auto pt-6 px-6 sticky top-0 z-50">
      <nav className="w-full bg-card/90 backdrop-blur-md border border-border rounded-xl px-4 md:px-6 py-3 flex items-center justify-between shadow-lg transition-colors duration-300">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <Link href="/" className="font-bold text-xl text-foreground tracking-tight">
            Skilly
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex justify-center md:justify-start md:ml-10">
          <Link href="/professionals" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Professionals
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Auth Section */}
          <div className="relative">
            {user ? (
              <>
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setPopoverOpen(!popoverOpen)}
                >
                  <Avatar className="w-9 h-9 border border-border">
                    <AvatarImage src={getAvatarUrl()} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-sm">
                    <p className="font-medium text-foreground">{user.user_metadata?.full_name || "User"}</p>
                  </div>
                </div>

                {/* Popover Menu */}
                {popoverOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setPopoverOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 flex flex-col py-1">
                      <Link 
                        href="/dashboard" 
                        onClick={() => setPopoverOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <div className="h-px w-full bg-border" />
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar className="w-9 h-9 border border-border bg-muted">
                  <AvatarFallback>
                    <UserCircle className="w-5 h-5 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex gap-2 ml-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Log In</Button>
                  </Link>
                  <Link href="/login">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
