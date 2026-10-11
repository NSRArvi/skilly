"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfessionalServicesSection({
  services = [],
  profile,
  isOwner,
  onOrderService,
}) {
  if (!services || services.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Services & Packages
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Fixed-scope packages and direct deliverables offered by this professional
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          {services.length} {services.length === 1 ? "Package" : "Packages"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-2xl border border-border overflow-hidden bg-background/50 hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            {service.image_url && (
              <div className="relative w-full h-36 bg-muted">
                <Image
                  src={service.image_url}
                  alt={service.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-foreground">
                    {service.title}
                  </h3>
                  <span className="text-xs font-black text-primary px-2 py-0.5 rounded-md bg-primary/10 whitespace-nowrap">
                    ৳{Number(service.price).toLocaleString()}
                  </span>
                </div>

                {/* Category & Location Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 pb-1">
                  {service.categories?.name && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      {service.categories.name}
                    </span>
                  )}
                  {service.subcategories?.name && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                      {service.subcategories.name}
                    </span>
                  )}
                  {(service.district || service.division) && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-foreground/80 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" />
                      {service.district && service.division
                        ? `${service.district}, ${service.division}`
                        : service.district || service.division}
                    </span>
                  )}
                </div>

                {service.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                )}

                {Array.isArray(service.features) && service.features.length > 0 && (
                  <ul className="pt-2 border-t border-border/50 space-y-1">
                    {service.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-1.5 text-[11px] text-foreground/80"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {!isOwner && (
                <Button
                  size="sm"
                  onClick={() => onOrderService(service)}
                  className="w-full mt-2 rounded-xl text-xs font-bold h-8"
                >
                  Order This Package
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

