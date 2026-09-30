"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaWhatsapp,
  FaDiscord,
  FaGlobe,
} from "react-icons/fa";

export default function SocialLinksSection({
  socialLinkedin,
  setSocialLinkedin,
  socialGithub,
  setSocialGithub,
  socialTwitter,
  setSocialTwitter,
  socialPortfolio,
  setSocialPortfolio,
  socialWhatsapp,
  setSocialWhatsapp,
  socialDiscord,
  setSocialDiscord,
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-5 shadow-sm">
      <div>
        <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
          Connected Networks & Presence
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Link your active developer and design channels
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* LinkedIn */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            LinkedIn Profile
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <FaLinkedin className="w-4 h-4" />
            </div>
            <Input
              value={socialLinkedin}
              onChange={(e) => setSocialLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="pl-9 bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* GitHub */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            GitHub Organization
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <FaGithub className="w-4 h-4" />
            </div>
            <Input
              value={socialGithub}
              onChange={(e) => setSocialGithub(e.target.value)}
              placeholder="https://github.com/username"
              className="pl-9 bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* X (Twitter) */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            X (Twitter)
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <FaTwitter className="w-4 h-4" />
            </div>
            <Input
              value={socialTwitter}
              onChange={(e) => setSocialTwitter(e.target.value)}
              placeholder="@username"
              className="pl-9 bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Portfolio Domain */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Portfolio Domain
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <FaGlobe className="w-4 h-4" />
            </div>
            <Input
              value={socialPortfolio}
              onChange={(e) => setSocialPortfolio(e.target.value)}
              placeholder="yourdomain.design"
              className="pl-9 bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Direct WhatsApp */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Direct WhatsApp
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <FaWhatsapp className="w-4 h-4" />
            </div>
            <Input
              value={socialWhatsapp}
              onChange={(e) => setSocialWhatsapp(e.target.value)}
              placeholder="+88017XXXXXXXX"
              className="pl-9 bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Discord Handle */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Discord Handle
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <FaDiscord className="w-4 h-4" />
            </div>
            <Input
              value={socialDiscord}
              onChange={(e) => setSocialDiscord(e.target.value)}
              placeholder="username#1234"
              className="pl-9 bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
