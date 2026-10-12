"use client";

import React from "react";
import { Briefcase, GraduationCap, BookOpen } from "lucide-react";

export default function ProfessionalCareerSection({ profile }) {
  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Work Experience Timeline */}
      {profile.experience && profile.experience.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                Work Experience & Career History
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Demonstrated track record of real-world industry delivery
              </p>
            </div>
          </div>

          <div className="relative border-l-2 border-primary/30 pl-5 space-y-6 ml-2">
            {profile.experience.map((exp, index) => (
              <div key={exp.id || index} className="relative group">
                <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-card ring-2 ring-primary/30" />
                <div className="space-y-1">
                  <h3 className="text-sm md:text-base font-bold text-foreground">
                    {exp.title}
                  </h3>
                  <p className="text-xs font-semibold text-primary">
                    {exp.company}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {exp.startDate || "Past"} — {exp.endDate || "Present"}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-muted-foreground pt-1 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education & Degrees */}
      {profile.education && profile.education.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                Education & Degrees
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Academic qualifications and verified educational institutions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.education.map((edu, index) => (
              <div
                key={edu.id || index}
                className="p-4 rounded-xl bg-background/50 border border-border space-y-1"
              >
                <h4 className="text-xs md:text-sm font-bold text-foreground">
                  {edu.degree}
                </h4>
                <p className="text-xs text-primary font-medium">
                  {edu.institution}
                </p>
                {edu.year && (
                  <p className="text-[11px] text-muted-foreground">
                    Graduated {edu.year}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses & Certifications */}
      {profile.courses && profile.courses.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                Courses & Certifications
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Specialized training programs and industry accreditations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.courses.map((course, index) => (
              <div
                key={course.id || index}
                className="p-4 rounded-xl bg-background/50 border border-border space-y-1"
              >
                <h4 className="text-xs md:text-sm font-bold text-foreground">
                  {course.title}
                </h4>
                <p className="text-xs text-primary font-medium">
                  {course.provider}
                </p>
                {course.year && (
                  <p className="text-[11px] text-muted-foreground">
                    Completed {course.year}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

