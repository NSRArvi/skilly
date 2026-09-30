"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Plus, X } from "lucide-react";

export default function EducationSection({
  education,
  setEducation,
  courses,
  setCourses,
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
      <div>
        <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
          Education & Credentials
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Degrees, academic background, and certified courses
        </p>
      </div>

      {/* Education */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/70 pb-2">
          <span className="text-sm font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            Education & Degrees
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setEducation([
                ...education,
                {
                  id: Date.now().toString(),
                  degree: "",
                  institution: "",
                  year: "",
                },
              ])
            }
            className="gap-1.5 text-xs rounded-xl h-8"
          >
            <Plus className="w-3.5 h-3.5" /> Add Degree
          </Button>
        </div>

        {education.map((edu, index) => (
          <div
            key={edu.id || index}
            className="p-4 border border-border rounded-xl bg-background/40 relative grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <button
              type="button"
              onClick={() =>
                setEducation(education.filter((_, i) => i !== index))
              }
              className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Degree / Major
              </Label>
              <Input
                placeholder="E.g. B.S. in CSE"
                value={edu.degree || ""}
                onChange={(e) => {
                  const newEdu = [...education];
                  newEdu[index].degree = e.target.value;
                  setEducation(newEdu);
                }}
                className="bg-background/70 border-border h-9 rounded-lg text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Institution
              </Label>
              <Input
                placeholder="E.g. University"
                value={edu.institution || ""}
                onChange={(e) => {
                  const newEdu = [...education];
                  newEdu[index].institution = e.target.value;
                  setEducation(newEdu);
                }}
                className="bg-background/70 border-border h-9 rounded-lg text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Graduation Year
              </Label>
              <Input
                type="number"
                placeholder="E.g. 2020"
                value={edu.year || ""}
                onChange={(e) => {
                  const newEdu = [...education];
                  newEdu[index].year = e.target.value;
                  setEducation(newEdu);
                }}
                className="bg-background/70 border-border h-9 rounded-lg text-xs"
              />
            </div>
          </div>
        ))}

        {education.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-1">
            No education listed.
          </p>
        )}
      </div>

      {/* Courses & Certifications */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        <div className="flex items-center justify-between border-b border-border/70 pb-2">
          <span className="text-sm font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Courses & Certifications
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setCourses([
                ...courses,
                {
                  id: Date.now().toString(),
                  title: "",
                  provider: "",
                  year: "",
                },
              ])
            }
            className="gap-1.5 text-xs rounded-xl h-8"
          >
            <Plus className="w-3.5 h-3.5" /> Add Course
          </Button>
        </div>

        {courses.map((course, index) => (
          <div
            key={course.id || index}
            className="p-4 border border-border rounded-xl bg-background/40 relative grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <button
              type="button"
              onClick={() =>
                setCourses(courses.filter((_, i) => i !== index))
              }
              className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Course Title
              </Label>
              <Input
                placeholder="E.g. Advanced System Design"
                value={course.title || ""}
                onChange={(e) => {
                  const newCourses = [...courses];
                  newCourses[index].title = e.target.value;
                  setCourses(newCourses);
                }}
                className="bg-background/70 border-border h-9 rounded-lg text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Platform / Provider
              </Label>
              <Input
                placeholder="E.g. Coursera / AWS"
                value={course.provider || ""}
                onChange={(e) => {
                  const newCourses = [...courses];
                  newCourses[index].provider = e.target.value;
                  setCourses(newCourses);
                }}
                className="bg-background/70 border-border h-9 rounded-lg text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Year Completed
              </Label>
              <Input
                type="number"
                placeholder="E.g. 2023"
                value={course.year || ""}
                onChange={(e) => {
                  const newCourses = [...courses];
                  newCourses[index].year = e.target.value;
                  setCourses(newCourses);
                }}
                className="bg-background/70 border-border h-9 rounded-lg text-xs"
              />
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-1">
            No courses added yet.
          </p>
        )}
      </div>
    </div>
  );
}
