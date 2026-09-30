"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, X } from "lucide-react";

export default function ExperienceSection({ experience, setExperience }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
      <div>
        <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
          Work Experience
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Highlight your professional background and previous roles
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/70 pb-2">
          <span className="text-sm font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Work History
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setExperience([
                ...experience,
                {
                  id: Date.now().toString(),
                  title: "",
                  company: "",
                  startDate: "",
                  endDate: "",
                  description: "",
                },
              ])
            }
            className="gap-1.5 text-xs rounded-xl h-8"
          >
            <Plus className="w-3.5 h-3.5" /> Add Role
          </Button>
        </div>

        {experience.map((exp, index) => (
          <div
            key={exp.id || index}
            className="p-4 border border-border rounded-xl bg-background/40 relative space-y-3 group"
          >
            <button
              type="button"
              onClick={() =>
                setExperience(experience.filter((_, i) => i !== index))
              }
              className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Job Title
                </Label>
                <Input
                  placeholder="E.g. Senior Frontend Developer"
                  value={exp.title || ""}
                  onChange={(e) => {
                    const newExp = [...experience];
                    newExp[index].title = e.target.value;
                    setExperience(newExp);
                  }}
                  className="bg-background/70 border-border h-9 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Company Name
                </Label>
                <Input
                  placeholder="E.g. Acme Corp"
                  value={exp.company || ""}
                  onChange={(e) => {
                    const newExp = [...experience];
                    newExp[index].company = e.target.value;
                    setExperience(newExp);
                  }}
                  className="bg-background/70 border-border h-9 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={exp.startDate || ""}
                  onChange={(e) => {
                    const newExp = [...experience];
                    newExp[index].startDate = e.target.value;
                    setExperience(newExp);
                  }}
                  className="bg-background/70 border-border h-9 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  End Date
                </Label>
                <Input
                  type="date"
                  value={exp.endDate || ""}
                  onChange={(e) => {
                    const newExp = [...experience];
                    newExp[index].endDate = e.target.value;
                    setExperience(newExp);
                  }}
                  className="bg-background/70 border-border h-9 rounded-lg text-xs"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Description / Responsibilities
                </Label>
                <Input
                  placeholder="Brief summary of achievements and technologies used..."
                  value={exp.description || ""}
                  onChange={(e) => {
                    const newExp = [...experience];
                    newExp[index].description = e.target.value;
                    setExperience(newExp);
                  }}
                  className="bg-background/70 border-border h-9 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        ))}

        {experience.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-1">
            No work experience listed.
          </p>
        )}
      </div>
    </div>
  );
}
