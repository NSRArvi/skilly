"use client";

import React from "react";
import {
  Globe,
  MapPin,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaWhatsapp,
  FaDiscord,
  FaGlobe,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";

export default function ProfessionalSidebar({
  profile,
  isOwner,
  onOpenHireModal,
}) {
  if (!profile) return null;

  const getValidUrl = (url) => {
    if (!url) return "#";
    const cleanUrl = url.trim();
    if (/^https?:\/\//i.test(cleanUrl)) {
      return cleanUrl;
    }
    return `https://${cleanUrl}`;
  };

  return (
    <div className="space-y-6">
      {/* Card 1: Pricing & Direct Collaboration */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
        <h3 className="font-bold text-foreground text-base tracking-tight">
          Rates & Engagement
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-background/60 border border-border rounded-xl">
            <p className="text-[11px] font-semibold text-muted-foreground">
              Hourly Rate
            </p>
            <p className="text-lg font-extrabold text-foreground mt-0.5">
              {profile.hourly_rate ? `৳${profile.hourly_rate}` : "Negotiable"}
              {profile.hourly_rate && (
                <span className="text-xs font-normal text-muted-foreground">
                  {" "}
                  /hr
                </span>
              )}
            </p>
          </div>
          <div className="p-3.5 bg-background/60 border border-border rounded-xl">
            <p className="text-[11px] font-semibold text-muted-foreground">
              Daily Rate
            </p>
            <p className="text-lg font-extrabold text-foreground mt-0.5">
              {profile.daily_rate ? `৳${profile.daily_rate}` : "Negotiable"}
              {profile.daily_rate && (
                <span className="text-xs font-normal text-muted-foreground">
                  {" "}
                  /day
                </span>
              )}
            </p>
          </div>
        </div>

        {!isOwner && (
          <div className="space-y-2.5 pt-2">
            <Button
              onClick={onOpenHireModal}
              className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm h-11 shadow-md shadow-primary/20"
            >
              Hire {profile.full_name?.split(" ")[0] || "Professional"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = `/messages?user=${profile.user_id}`;
                }
              }}
              className="w-full rounded-xl text-xs font-semibold h-10 border-border"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-2" />
              Direct Message
            </Button>
          </div>
        )}
      </div>

      {/* Card 2: Verified Social & Professional Channels */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-foreground text-base tracking-tight">
          Social & Online Presence
        </h3>

        <div className="space-y-3 text-xs">
          {profile.social_linkedin && (
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="flex items-center gap-2 text-foreground font-medium">
                <FaLinkedin className="w-4 h-4 text-[#0077b5]" />
                LinkedIn
              </span>
              <a
                href={getValidUrl(profile.social_linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-mono truncate max-w-[150px] flex items-center gap-1"
              >
                {profile.social_linkedin.replace(/^https?:\/\//, "")}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          )}

          {profile.social_github && (
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="flex items-center gap-2 text-foreground font-medium">
                <FaGithub className="w-4 h-4 text-foreground" />
                GitHub
              </span>
              <a
                href={getValidUrl(profile.social_github)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-mono truncate max-w-[150px] flex items-center gap-1"
              >
                {profile.social_github.replace(/^https?:\/\//, "")}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          )}

          {profile.social_twitter && (
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="flex items-center gap-2 text-foreground font-medium">
                <FaTwitter className="w-4 h-4 text-[#1DA1F2]" />
                X / Twitter
              </span>
              <a
                href={getValidUrl(profile.social_twitter)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-mono truncate max-w-[150px] flex items-center gap-1"
              >
                {profile.social_twitter.replace(/^https?:\/\//, "")}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          )}

          {profile.present_address?.portfolio && (
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="flex items-center gap-2 text-foreground font-medium">
                <FaGlobe className="w-4 h-4 text-primary" />
                Personal Portfolio
              </span>
              <a
                href={getValidUrl(profile.present_address.portfolio)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-mono truncate max-w-[150px] flex items-center gap-1"
              >
                {profile.present_address.portfolio.replace(/^https?:\/\//, "")}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          )}

          {profile.present_address?.whatsapp && (
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="flex items-center gap-2 text-foreground font-medium">
                <FaWhatsapp className="w-4 h-4 text-[#25D366]" />
                Direct WhatsApp
              </span>
              <a
                href={`https://wa.me/${profile.present_address.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-mono"
              >
                {profile.present_address.whatsapp}
              </a>
            </div>
          )}

          {profile.present_address?.discord && (
            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2 text-foreground font-medium">
                <FaDiscord className="w-4 h-4 text-[#5865F2]" />
                Discord Handle
              </span>
              <span className="font-mono text-muted-foreground">
                {profile.present_address.discord}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card 3: Languages (Spoken & Written) */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-foreground text-base tracking-tight flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          Languages
        </h3>

        {profile.languages && profile.languages.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {profile.languages.map((lang, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/25 text-xs font-medium"
              >
                {lang}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No languages listed.
          </p>
        )}
      </div>

      {/* Card 4: Location & Address Details */}
      {(profile.present_address?.country || profile.present_address?.fullAddress) && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-foreground text-base tracking-tight flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Location & Address
          </h3>

          <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">
                Present Location
              </p>
              {profile.present_address.fullAddress && (
                <p>{profile.present_address.fullAddress}</p>
              )}
              {[
                profile.present_address.city,
                profile.present_address.state,
                profile.present_address.zipcode,
              ].filter(Boolean).length > 0 && (
                <p>
                  {[
                    profile.present_address.city,
                    profile.present_address.state,
                    profile.present_address.zipcode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              {profile.present_address.country && (
                <p className="font-medium text-foreground">
                  {profile.present_address.country}
                </p>
              )}
            </div>

            {profile.permanent_address &&
              Object.values(profile.permanent_address).some(
                (val) => val && String(val).trim() !== ""
              ) && (
              <div className="pt-2 border-t border-border/40">
                <p className="font-semibold text-foreground">
                  Permanent Location
                </p>
                {profile.permanent_address.fullAddress && (
                  <p>{profile.permanent_address.fullAddress}</p>
                )}
                {[
                  profile.permanent_address.city,
                  profile.permanent_address.state,
                  profile.permanent_address.zipcode,
                ].filter(Boolean).length > 0 && (
                  <p>
                    {[
                      profile.permanent_address.city,
                      profile.permanent_address.state,
                      profile.permanent_address.zipcode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {profile.permanent_address.country && (
                  <p className="font-medium text-foreground">
                    {profile.permanent_address.country}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

