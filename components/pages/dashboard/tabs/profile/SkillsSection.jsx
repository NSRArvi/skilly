"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Plus, X, Check, Globe } from "lucide-react";
import { toast } from "sonner";

export default function SkillsSection({
  skills,
  setSkills,
  skillsFor,
  setSkillsFor,
  languages,
  setLanguages,
}) {
  const [newSkill, setNewSkill] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  const [newSkillFor, setNewSkillFor] = useState("");
  const [isAddingSkillFor, setIsAddingSkillFor] = useState(false);

  const [newLanguage, setNewLanguage] = useState("");
  const [newLanguageLevel, setNewLanguageLevel] = useState("Fluent");
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);

  const suggestedSkills = [
    "WCAG 2.2",
    "Tailwind CSS",
    "Storybook",
    "Prototyping",
    "Next.js",
    "TypeScript",
  ];

  const suggestedLanguages = [
    "English",
    "Bengali",
    "Spanish",
    "German",
    "French",
    "Arabic",
    "Hindi",
    "Mandarin",
  ];

  const handleAddSkill = (skillToAdd) => {
    const val = (skillToAdd || newSkill).trim();
    if (!val) return;
    if (!skills.includes(val)) {
      setSkills([...skills, val]);
      toast.success(`Added "${val}" to skills`);
    } else {
      toast.info(`"${val}" already exists`);
    }
    setNewSkill("");
    setIsAddingSkill(false);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddSkillFor = () => {
    const val = newSkillFor.trim();
    if (!val) return;
    if (!skillsFor.includes(val)) {
      setSkillsFor([...skillsFor, val]);
      toast.success(`Added "${val}" to target roles`);
    }
    setNewSkillFor("");
    setIsAddingSkillFor(false);
  };

  const handleRemoveSkillFor = (skillToRemove) => {
    setSkillsFor(skillsFor.filter((s) => s !== skillToRemove));
  };

  const handleAddLanguage = (langToAdd) => {
    const name = (langToAdd || newLanguage).trim();
    if (!name) return;
    const formatted = langToAdd
      ? name
      : newLanguageLevel
        ? `${name} (${newLanguageLevel})`
        : name;
    if (!languages.includes(formatted)) {
      setLanguages([...languages, formatted]);
      toast.success(`Added "${formatted}" to languages`);
    } else {
      toast.info(`"${formatted}" already exists`);
    }
    setNewLanguage("");
    setIsAddingLanguage(false);
  };

  const handleRemoveLanguage = (langToRemove) => {
    setLanguages(languages.filter((l) => l !== langToRemove));
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
      <div>
        <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
          Skills & Specializations
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Tags used to match high-value client requests
        </p>
      </div>

      {/* Core Skills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-foreground">
            Core Skills
          </Label>
          <span className="text-[11px] text-muted-foreground">
            {skills.length} skills listed
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="rounded-full p-0.5 hover:text-foreground text-primary/80 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {isAddingSkill ? (
            <div className="flex items-center gap-1.5 bg-background/80 border border-primary rounded-lg px-2 py-1">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  } else if (e.key === "Escape") {
                    setIsAddingSkill(false);
                  }
                }}
                autoFocus
                placeholder="Add a skill..."
                className="bg-transparent text-xs text-foreground outline-none w-28"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="text-primary hover:text-primary/80"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSkill(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingSkill(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-primary/50 text-primary hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Skill
            </button>
          )}
        </div>

        {/* Suggested Skills */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground text-[11px]">
            Suggested:
          </span>
          {suggestedSkills.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleAddSkill(s)}
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-[11px] font-medium"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Skills For (Roles/Categories) */}
      <div className="pt-4 border-t border-border/60 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-foreground">
            Skills For (Target Roles & Categories)
          </Label>
          <span className="text-[11px] text-muted-foreground">
            {skillsFor.length} roles listed
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {skillsFor.map((role) => (
            <span
              key={role}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-background/80 border border-border text-foreground hover:border-primary/40 transition-all"
            >
              {role}
              <button
                type="button"
                onClick={() => handleRemoveSkillFor(role)}
                className="rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {isAddingSkillFor ? (
            <div className="flex items-center gap-1.5 bg-background/80 border border-primary rounded-lg px-2 py-1">
              <input
                type="text"
                value={newSkillFor}
                onChange={(e) => setNewSkillFor(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkillFor();
                  } else if (e.key === "Escape") {
                    setIsAddingSkillFor(false);
                  }
                }}
                autoFocus
                placeholder="E.g. Frontend Developer"
                className="bg-transparent text-xs text-foreground outline-none w-36"
              />
              <button
                type="button"
                onClick={handleAddSkillFor}
                className="text-primary hover:text-primary/80"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSkillFor(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingSkillFor(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Role / Category
            </button>
          )}
        </div>
      </div>

      {/* Languages (Spoken & Written) */}
      <div className="space-y-3 pt-4 border-t border-border/60">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" />
            Languages (Spoken & Written)
          </Label>
          <span className="text-[11px] text-muted-foreground">
            {languages.length} languages listed
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {languages.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all"
            >
              {lang}
              <button
                type="button"
                onClick={() => handleRemoveLanguage(lang)}
                className="rounded-full p-0.5 hover:text-foreground text-primary/80 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {isAddingLanguage ? (
            <div className="flex flex-wrap items-center gap-1.5 bg-background/80 border border-primary rounded-lg p-1.5">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLanguage();
                  } else if (e.key === "Escape") {
                    setIsAddingLanguage(false);
                  }
                }}
                autoFocus
                placeholder="Language name..."
                className="bg-transparent text-xs text-foreground outline-none w-32 px-1"
              />
              <select
                value={newLanguageLevel}
                onChange={(e) => setNewLanguageLevel(e.target.value)}
                className="bg-card text-[11px] text-muted-foreground border border-border rounded px-1.5 py-0.5 outline-none"
              >
                <option value="Native">Native</option>
                <option value="Fluent">Fluent</option>
                <option value="Conversational">Conversational</option>
                <option value="Basic">Basic</option>
              </select>
              <button
                type="button"
                onClick={() => handleAddLanguage()}
                className="text-primary hover:text-primary/80 p-1"
                title="Add"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingLanguage(false)}
                className="text-muted-foreground hover:text-foreground p-1"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingLanguage(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-primary/50 text-primary hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Language
            </button>
          )}
        </div>

        {/* Suggested Languages */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground text-[11px]">
            Quick Add:
          </span>
          {suggestedLanguages.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => handleAddLanguage(l)}
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-[11px] font-medium"
            >
              <Plus className="w-2.5 h-2.5" /> {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
