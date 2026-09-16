import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, CheckCircle } from "lucide-react";

export default function ProfessionalsCard({ professional }) {
  return (
    <Link 
      href={`/professionals/${professional.id}`}
      className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between h-full hover:border-primary/50 transition-colors group block cursor-pointer"
    >
      <div>
        <div className="flex gap-4 mb-4">
          <div className="relative h-12 w-12 rounded-full flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-muted overflow-hidden relative">
              <Image
                src={professional.avatar}
                alt={professional.name}
                fill
                className="object-cover"
              />
            </div>
            {/* Verified Badge */}
            <div className="absolute -bottom-1 -right-1 bg-card rounded-full p-[2px]">
              <CheckCircle className="w-4 h-4 text-background fill-primary" />
            </div>
          </div>

          <div className="flex flex-col overflow-hidden">
            <h3 className="text-foreground font-semibold truncate text-base group-hover:text-primary transition-colors">
              {professional.name}
            </h3>
            <p className="text-muted-foreground text-sm truncate">
              {professional.title}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="text-foreground text-sm font-medium">
                {professional.rating}
              </span>
              <span className="text-muted-foreground text-sm">
                ({professional.reviews})
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {professional.skills?.map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-background border border-border rounded-full text-xs text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="h-[1px] w-full bg-border/50 mb-4" />
        <div className="flex items-center justify-between">
          <div>
            {professional.price === "Negotiable" || !professional.price ? (
              <span className="text-foreground font-bold">Negotiable</span>
            ) : (
              <>
                <span className="text-foreground font-bold">
                  ${professional.price}
                </span>
                <span className="text-muted-foreground text-sm"> / session</span>
              </>
            )}
          </div>
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
            View Profile
          </div>
        </div>
      </div>
    </Link>
  );
}
