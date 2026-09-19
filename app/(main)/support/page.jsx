"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Send, HelpCircle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { submitSupportMessage } from "./actions";

export default function HelpAndSupportPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch full name from professionals table if possible
        const { data: profile } = await supabase
          .from("professionals")
          .select("full_name")
          .eq("user_id", user.id)
          .single();
          
        if (profile?.full_name) setName(profile.full_name);
        if (user.email) setEmail(user.email);
      }
      setLoadingUser(false);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.target);
    
    // We append the controlled state just in case, but standard form data works fine 
    // since we use standard input names.
    
    const result = await submitSupportMessage(formData);
    
    if (result.success) {
      toast.success(result.message);
      // Reset non-user fields
      setTitle("");
      setMessage("");
    } else {
      toast.error(result.error);
    }
    
    setSubmitting(false);
  };

  if (loadingUser) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background/50 py-6 md:py-10">
      <Container className="max-w-2xl">
        
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-full hover:bg-muted/80">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              Help & Support
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Have a question or need assistance? Send us a message and our team will get back to you shortly.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Honeypot field - Hidden from users, traps bots */}
            <input 
              type="text" 
              name="website" 
              className="hidden" 
              tabIndex={-1} 
              autoComplete="off" 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground ml-1">Name</label>
                <Input 
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="bg-background border-border/60 focus:border-primary/50 focus:ring-primary/20 rounded-xl h-11"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground ml-1">Email</label>
                <Input 
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-background border-border/60 focus:border-primary/50 focus:ring-primary/20 rounded-xl h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground ml-1">Subject / Title</label>
              <Input 
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What is this regarding?"
                className="bg-background border-border/60 focus:border-primary/50 focus:ring-primary/20 rounded-xl h-11"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground ml-1">Message</label>
              <textarea 
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or ask your question here..."
                className="w-full min-h-[160px] p-4 bg-background border border-border/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-xl resize-none outline-none text-sm placeholder:text-muted-foreground/70"
                required
              />
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-border/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldAlert className="w-4 h-4 text-primary/70" />
                <span>Protected by spam filters</span>
              </div>
              
              <Button 
                type="submit" 
                disabled={submitting}
                className="font-bold px-8 h-11 rounded-xl shadow-sm shadow-primary/20"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </div>
            
          </form>
        </div>

      </Container>
    </div>
  );
}
