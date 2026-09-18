import Image from "next/image";
import Link from "next/link";
import {
  Star,
  CheckCircle,
  MapPin,
  Briefcase,
  Users,
  StarIcon,
} from "lucide-react";

export default function ProfessionalsCard({ professional }) {
  const address = professional.present_address || {};
  const location = [address.city, address.country].filter(Boolean).join(", ");
  const isVerified = Boolean(professional.is_verified ?? professional.is_verify);

  return (
    <Link
      href={`/professionals/${professional.id}`}
      className={`bg-card border rounded-2xl p-5 flex flex-col justify-between h-full hover:shadow-md transition-all group block cursor-pointer ${
        isVerified
          ? "border-primary/35 hover:border-primary"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div>
        <div className="flex gap-4 mb-3">
          <div className="relative h-14 w-14 rounded-full flex-shrink-0">
            <div
              className={`h-14 w-14 rounded-full bg-muted overflow-hidden relative ${
                isVerified ? "ring-2 ring-primary/40" : ""
              }`}
            >
              <Image
                src={
                  professional.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.full_name || "U")}&background=random`
                }
                alt={professional.full_name || "Professional"}
                fill
                className="object-cover"
              />
            </div>
            {/* Verified Badge */}
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-[2px] shadow-sm">
                <CheckCircle className="w-4 h-4 text-primary fill-primary/20" />
              </div>
            )}
          </div>

          <div className="flex flex-col overflow-hidden justify-center">
            <h3 className="text-foreground font-semibold truncate text-base group-hover:text-primary transition-colors">
              {professional.full_name}
            </h3>
            <p className="text-muted-foreground text-sm truncate">
              {professional.subcategories?.name || professional.categories?.name || professional.profession || "Independent Professional"}
            </p>
            {professional.ratings_count > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-foreground text-sm font-medium">5.0</span>
                <span className="text-muted-foreground text-sm">
                  ({professional.ratings_count})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Metadata Row: Location, Orders, Ratings */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-muted-foreground text-[13px] font-medium">
          {location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[140px]">{location}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{professional.orders_count || 0} Orders</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StarIcon className="w-3.5 h-3.5" />
            <span>{professional.ratings_count || 0} Ratings</span>
          </div>
        </div>

        {/* Bio */}
        {professional.bio && (
          <p className="text-sm text-foreground/80 line-clamp-2 mb-4 leading-relaxed">
            {professional.bio}
          </p>
        )}

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {professional.skills?.slice(0, 3).map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-muted/50 border border-border rounded-full text-[11px] text-foreground font-medium"
            >
              {skill}
            </span>
          ))}
          {professional.skills?.length > 3 && (
            <span className="px-2 py-1 bg-muted/50 border border-border rounded-full text-[11px] text-muted-foreground font-medium flex items-center justify-center">
              +{professional.skills.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto">
        <div className="h-[1px] w-full bg-border/50 mb-4" />
        <div className="flex items-center justify-between">
          <div>
            {!professional.hourly_rate && !professional.daily_rate ? (
              <span className="text-foreground font-bold">Negotiable</span>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-foreground font-bold text-lg">
                  ${professional.hourly_rate || professional.daily_rate}
                </span>
                <span className="text-muted-foreground text-[13px] font-medium">
                  {professional.hourly_rate ? "/ hr" : "/ day"}
                </span>
              </div>
            )}
          </div>
          <div className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            View Profile
          </div>
        </div>
      </div>
    </Link>
  );
}
