"use client";

import React from "react";
import { CheckCircle2, Clock } from "lucide-react";

export default function ProfileSidebarCard({
  email,
  phoneCode,
  phoneNumber,
  isVerified,
  frontId,
  backId,
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
      <h3 className="font-bold text-foreground text-base tracking-tight">
        Trust & Verification Status
      </h3>

      <div className="space-y-3 pt-1">
        {/* Email Address */}
        <div className="flex items-center justify-between py-1 border-b border-border/40">
          <span className="flex items-center gap-2 text-xs text-foreground font-medium">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            Email Address
          </span>
          <span className="text-xs font-mono text-muted-foreground truncate max-w-[170px]">
            {email || "Not provided"}
          </span>
        </div>

        {/* Phone Number */}
        <div className="flex items-center justify-between py-1 border-b border-border/40">
          <span className="flex items-center gap-2 text-xs text-foreground font-medium">
            {phoneNumber && isVerified ? (
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            ) : (
              <Clock
                className={`w-4 h-4 flex-shrink-0 ${
                  phoneNumber ? "text-amber-500" : "text-muted-foreground"
                }`}
              />
            )}
            Phone Number
          </span>
          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
            {phoneNumber
              ? `${phoneCode} ${phoneNumber.slice(-4).padStart(phoneNumber.length, "•")}`
              : "Not provided"}
            {phoneNumber && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-sans ${
                  isVerified
                    ? "text-primary bg-primary/10 border border-primary/20 font-semibold"
                    : "text-amber-500 bg-amber-500/10 border border-amber-500/20 font-medium"
                }`}
              >
                {isVerified ? "Verified" : "Pending"}
              </span>
            )}
          </span>
        </div>

        {/* Government ID Review */}
        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-2 text-xs text-foreground font-medium">
            {isVerified ? (
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )}
            Government ID Review
          </span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded font-medium ${
              isVerified
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}
          >
            {isVerified
              ? "Verified"
              : frontId && !backId
                ? "Pending Back Scan"
                : frontId && backId
                  ? "Under Review"
                  : "Not Uploaded"}
          </span>
        </div>
      </div>
    </div>
  );
}
