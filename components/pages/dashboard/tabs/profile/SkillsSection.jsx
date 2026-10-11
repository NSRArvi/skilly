"use client";

import React, { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Plus, X, Globe, Sparkles, Search, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/client";

export default function SkillsSection({
  skills = [],
  setSkills,
  languages = [],
  setLanguages,
  selectedCategory = "",
  selectedSubcategory = "",
}) {
  // DB Skills state
  const [dbSkills, setDbSkills] = useState([]);
  const [loadingDbSkills, setLoadingDbSkills] = useState(true);

  // Search & input state for core skills
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Languages State
  const [newLanguage, setNewLanguage] = useState("");
  const [newLanguageLevel, setNewLanguageLevel] = useState("Fluent");
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);

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

  // Load all verified skills from Supabase
  useEffect(() => {
    let isCancelled = false;

    async function fetchSkills() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("skills")
          .select("id, name, slug, category_id")
          .order("name", { ascending: true });

        if (!isCancelled && !error && data) {
          setDbSkills(data);
        }
      } catch (err) {
        console.error("Error fetching skills:", err);
      } finally {
        if (!isCancelled) setLoadingDbSkills(false);
      }
    }

    fetchSkills();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter skills based on user search query
  const matchingSkills = dbSkills
    .filter((s) => !skills.includes(s.name)) // exclude already added
    .filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
    .slice(0, 15); // show top 15 matches

  // Compute recommended skills based on selected category
  const categoryRecommendedSkills = dbSkills
    .filter((s) => !skills.includes(s.name))
    .filter((s) => selectedCategory && s.category_id === selectedCategory)
    .slice(0, 8);

  // Fallback recommended skills if no category is selected yet
  const generalRecommendedSkills = dbSkills
    .filter((s) => !skills.includes(s.name))
    .slice(0, 8);

  const activeRecommendations =
    categoryRecommendedSkills.length > 0
      ? categoryRecommendedSkills
      : generalRecommendedSkills;

  // Add skill (must come strictly from dbSkills)
  const handleSelectSkill = (skillName) => {
    if (!skillName) return;
    if (skills.includes(skillName)) {
      toast.info(`"${skillName}" is already added.`);
      return;
    }

    // Double check it exists in database
    const exists = dbSkills.some((s) => s.name === skillName);
    if (!exists) {
      toast.error("Please select a verified skill from the suggestions list.");
      return;
    }

    setSkills([...skills, skillName]);
    toast.success(`Added "${skillName}"`);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Language Handlers
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
      toast.success(`Added "${formatted}"`);
    } else {
      toast.info(`"${formatted}" is already listed.`);
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
        <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Skills & Specializations
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Select verified professional skills to match high-value client requests
        </p>
      </div>

      {/* Core Skills Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-foreground">
            Core Skills
          </Label>
          <span className="text-[11px] text-muted-foreground">
            {skills.length} skills selected
          </span>
        </div>

        {/* Selected Skills Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all shadow-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="rounded-full p-0.5 hover:text-foreground text-primary/80 transition-colors"
                title="Remove skill"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {skills.length === 0 && (
            <span className="text-xs text-muted-foreground italic">
              No core skills selected yet. Search and select from verified skills below.
            </span>
          )}
        </div>

        {/* Live Search & Autocomplete Input */}
        <div className="relative" ref={searchContainerRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matchingSkills.length > 0) {
                  e.preventDefault();
                  handleSelectSkill(matchingSkills[0].name);
                } else if (e.key === "Escape") {
                  setIsSearchOpen(false);
                }
              }}
              placeholder="Search and select verified skills (e.g. Next.js, Node.js, Figma, SQL)..."
              className="w-full pl-9 pr-9 py-2 text-xs md:text-sm bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-10 transition-colors"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : loadingDbSkills ? (
              <Loader2 className="absolute right-3 w-4 h-4 text-muted-foreground animate-spin" />
            ) : null}
          </div>

          {/* Autocomplete Dropdown List */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto p-1.5 animate-in fade-in-0 zoom-in-95 duration-150">
              {matchingSkills.length === 0 ? (
                <div className="py-5 text-center text-xs text-muted-foreground">
                  No verified skill matching &ldquo;{searchQuery}&rdquo;.
                  <p className="text-[11px] text-muted-foreground/70 mt-1">
                    Skills must be verified by administrators.
                  </p>
                </div>
              ) : (
                matchingSkills.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSkill(item.name)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left text-foreground hover:bg-muted/80 transition-colors"
                  >
                    <span className="font-medium">{item.name}</span>
                    <Plus className="w-3.5 h-3.5 text-primary shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        {activeRecommendations.length > 0 && (
          <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground text-[11px] font-semibold flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-primary" />
              Suggested for you:
            </span>
            {activeRecommendations.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSkill(s.name)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted/60 text-foreground hover:bg-primary hover:text-white border border-border/80 transition-colors"
              >
                <Plus className="w-3 h-3" />
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Languages (Spoken & Written) */}
      <div className="space-y-3 pt-5 border-t border-border/60">
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
        <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
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
