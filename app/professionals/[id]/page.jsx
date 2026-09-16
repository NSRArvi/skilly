"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../lib/client";
import Container from "../../../components/shared/Container";
import { Loader2, ArrowLeft, Star, CheckCircle, MapPin, Globe, Briefcase, Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";

export default function ProfessionalDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 animate-pulse">
        {/* Cover Skeleton */}
        <div className="h-64 w-full bg-muted"></div>
        <Container className="relative">
          <div className="bg-card border border-border rounded-3xl shadow-xl -mt-20 p-8 md:p-12 mb-8 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-muted border-4 border-card shadow-xl -mt-24 flex-shrink-0"></div>
              <div className="flex-1 space-y-4 w-full mt-2">
                <div className="h-8 bg-muted rounded w-1/3"></div>
                <div className="h-5 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-2/3 mt-6"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="flex gap-4 mt-8">
                  <div className="h-6 bg-muted rounded w-24"></div>
                  <div className="h-6 bg-muted rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-card border border-border rounded-3xl p-8 h-48 bg-muted/30"></div>
              <div className="bg-card border border-border rounded-3xl p-8 h-64 bg-muted/30"></div>
            </div>
            <div className="space-y-8">
              <div className="bg-card border border-border rounded-3xl p-8 h-40 bg-muted/30"></div>
              <div className="bg-card border border-border rounded-3xl p-8 h-40 bg-muted/30"></div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center text-center p-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">Profile not found</h2>
        <p className="text-muted-foreground mb-6">The professional you are looking for does not exist.</p>
        <Button onClick={() => router.push("/professionals")}>
          Back to Professionals
        </Button>
      </div>
    );
  }

  const price = profile.hourly_rate || profile.daily_rate;
  const isNegotiable = !price || price === "Negotiable";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Cover Image Banner */}
      <div className="h-64 w-full bg-muted relative">
        <img 
          src={profile.cover_image_url || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070"} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-6 left-6 z-10">
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full bg-background/50 backdrop-blur-md border-none text-foreground hover:bg-background"
            onClick={() => router.push("/professionals")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Container className="relative">
        <div className="bg-card border border-border rounded-3xl shadow-xl -mt-20 p-8 md:p-12 mb-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Avatar */}
            <div className="relative -mt-24">
              <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-card shadow-xl">
                <AvatarImage src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'U')}&background=random`} />
                <AvatarFallback className="bg-primary/20 text-primary text-4xl font-bold">
                  {profile.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {profile.is_verified && (
                <div className="absolute -bottom-2 -right-2 bg-card rounded-full p-1.5 shadow-lg">
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 border-none px-2.5 py-1 gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </Badge>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {profile.full_name}
                  </h1>
                  <p className="text-primary font-medium text-lg mt-1">
                    {profile.profession || "Independent Professional"}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-2xl font-bold text-foreground">
                    {isNegotiable ? "Negotiable" : `$${price}`}
                  </div>
                  {!isNegotiable && (
                    <div className="text-muted-foreground text-sm">per session</div>
                  )}
                  <Button className="mt-4 w-full md:w-auto px-8" size="lg">
                    Hire Me
                  </Button>
                  
                  <div className="flex items-center md:justify-end gap-4 mt-4 text-muted-foreground">
                    {profile.social_linkedin && <a href={profile.social_linkedin.startsWith('http') ? profile.social_linkedin : `https://${profile.social_linkedin}`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors"><svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>}
                    {profile.social_github && <a href={profile.social_github.startsWith('http') ? profile.social_github : `https://${profile.social_github}`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors"><svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>}
                    {profile.social_twitter && <a href={profile.social_twitter.startsWith('http') ? profile.social_twitter : `https://${profile.social_twitter}`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors"><svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>}
                    {profile.social_facebook && <a href={profile.social_facebook.startsWith('http') ? profile.social_facebook : `https://${profile.social_facebook}`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors"><svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg></a>}
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground mt-4 text-lg">
                {profile.headline}
              </p>

              {profile.present_address?.city && profile.present_address?.country && (
                <div className="flex items-center gap-2 text-muted-foreground mt-3">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.present_address.city}, {profile.present_address.country}</span>
                </div>
              )}

              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  <span className="font-bold text-foreground">5.0</span>
                  <span className="text-muted-foreground">({profile.ratings_count || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="w-5 h-5" />
                  <span>{profile.orders_count || 0} jobs completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout for Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (About & Experience) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-3xl p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">About Me</h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {profile.bio || "This professional hasn't written a bio yet."}
              </p>
            </div>

            {profile.experience && profile.experience.length > 0 && (
              <div className="bg-card border border-border rounded-3xl p-8">
                <h3 className="text-xl font-bold text-foreground mb-6">Work Experience</h3>
                <div className="space-y-6">
                  {profile.experience.map((exp) => (
                    <div key={exp.id} className="border-l-2 border-primary/20 pl-4 relative">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5" />
                      <h4 className="text-lg font-semibold text-foreground">{exp.title}</h4>
                      <p className="text-primary font-medium">{exp.company}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {exp.startDate} - {exp.endDate || "Present"}
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {profile.education && profile.education.length > 0 && (
              <div className="bg-card border border-border rounded-3xl p-8">
                <h3 className="text-xl font-bold text-foreground mb-6">Education</h3>
                <div className="space-y-6">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-primary/20 pl-4 relative">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5" />
                      <h4 className="text-lg font-semibold text-foreground">{edu.degree}</h4>
                      <p className="text-primary font-medium">{edu.institution}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {edu.year}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (Skills & Details) */}
          <div className="space-y-8">
            
            <div className="bg-card border border-border rounded-3xl p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-2 rounded-lg text-primary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground truncate">{profile.email}</p>
                  </div>
                </div>
                {profile.phone_number && (
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-lg text-primary">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium text-foreground">{profile.phone_code} {profile.phone_number}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {profile.present_address?.fullAddress && (
              <div className="bg-card border border-border rounded-3xl p-8">
                <h3 className="text-xl font-bold text-foreground mb-4">Location</h3>
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    <p className="text-foreground font-medium mb-1">Present Address</p>
                    {profile.present_address.fullAddress}<br />
                    {profile.present_address.city}, {profile.present_address.state} {profile.present_address.zipcode}<br />
                    {profile.present_address.country}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card border border-border rounded-3xl p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">Skills</h3>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-muted text-foreground rounded-xl text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No skills listed.</p>
              )}
            </div>

            <div className="bg-card border border-border rounded-3xl p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">Languages</h3>
              {profile.languages && profile.languages.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {profile.languages.map((lang, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-foreground font-medium">{lang}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No languages listed.</p>
              )}
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
}
