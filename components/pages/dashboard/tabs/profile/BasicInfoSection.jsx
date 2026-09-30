"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Clock } from "lucide-react";

export default function BasicInfoSection({
  fullName,
  setFullName,
  gender,
  setGender,
  profession,
  setProfession,
  dateOfBirth,
  setDateOfBirth,
  categories,
  subcategories,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  hourlyRate,
  setHourlyRate,
  dailyRate,
  setDailyRate,
  phoneCode,
  setPhoneCode,
  phoneNumber,
  setPhoneNumber,
  isVerified,
  bioTagline,
  setBioTagline,
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
            Basic Information
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Your core public identity across the talent ecosystem
          </p>
        </div>
        <span className="px-2 py-0.5 rounded text-[11px] font-mono tracking-widest font-semibold border border-primary/40 text-primary bg-primary/5 uppercase">
          SECTION 01
        </span>
      </div>

      <div className="space-y-4">
        {/* Row 1: Full Name & Gender / Sex */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Full Name
            </Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Gender / Sex
            </Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Profession & Date of Birth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Profession / Title
            </Label>
            <Input
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="E.g. Senior Frontend Developer"
              className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Date of Birth
            </Label>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl"
            />
          </div>
        </div>

        {/* Row 2.5: Category & Subcategory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Category
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={(val) => {
                setSelectedCategory(val);
                setSelectedSubcategory("");
              }}
            >
              <SelectTrigger className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl">
                <SelectValue placeholder="Select a category">
                  {categories.find((c) => c.id === selectedCategory)?.name ||
                    "Select a category"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Subcategory
            </Label>
            <Select
              value={selectedSubcategory}
              onValueChange={setSelectedSubcategory}
              disabled={!selectedCategory}
            >
              <SelectTrigger className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl">
                <SelectValue placeholder="Select a subcategory">
                  {subcategories.find((s) => s.id === selectedSubcategory)
                    ?.name || "Select a subcategory"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {subcategories
                  .filter((sub) => sub.category_id === selectedCategory)
                  .map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 3: Hourly & Daily Rates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Hourly Rate (৳)
            </Label>
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="E.g. 50"
              className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Daily Rate (৳)
            </Label>
            <Input
              type="number"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              placeholder="E.g. 400"
              className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl"
            />
          </div>
        </div>

        {/* Row 4: Phone Number */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">
              Phone Number
            </Label>
            {phoneNumber ? (
              isVerified ? (
                <span className="text-[11px] font-medium text-primary flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Number
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Pending Verification
                </span>
              )
            ) : null}
          </div>
          <div className="flex gap-2">
            <Select value={phoneCode} onValueChange={setPhoneCode}>
              <SelectTrigger className="w-[140px] bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-xs font-medium">
                <SelectValue placeholder="Code" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="+880">🇧🇩 +880 (BD)</SelectItem>
                <SelectItem value="+1">🇺🇸 +1 (US)</SelectItem>
                <SelectItem value="+44">🇬🇧 +44 (UK)</SelectItem>
                <SelectItem value="+91">🇮🇳 +91 (IN)</SelectItem>
                <SelectItem value="+49">🇩🇪 +49 (DE)</SelectItem>
                <SelectItem value="+61">🇦🇺 +61 (AU)</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="17XXXXXXXX"
              className="flex-1 bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Row 5: Bio Tagline */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">
              Bio Tagline
            </Label>
            <span className="text-[11px] text-muted-foreground">
              Displayed beneath your headline
            </span>
          </div>
          <Input
            value={bioTagline}
            onChange={(e) => setBioTagline(e.target.value)}
            placeholder="E.g. Crafting scalable design systems & high-conversion fintech interfaces"
            className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-sm"
          />
        </div>
      </div>
    </div>
  );
}
