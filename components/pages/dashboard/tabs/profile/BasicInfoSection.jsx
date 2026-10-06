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
              className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Gender / Sex
            </Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-sm">
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
              className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-sm"
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
              className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-sm"
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
              <SelectTrigger className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-sm">
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
              <SelectTrigger className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-sm">
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
              className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-sm"
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
              className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-sm"
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
          <div className="flex rounded-xl border border-border bg-background/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden transition-all h-10">
            <div className="flex items-center gap-1.5 px-3 bg-muted/40 border-r border-border text-foreground font-mono text-xs font-semibold select-none shrink-0">
              <span className="text-sm">🇧🇩</span>
              <span>+880</span>
            </div>
            <Input
              type="tel"
              value={phoneNumber}
              maxLength={10}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, "");
                // If user accidentally types leading 0 or +880, strip it to keep 10 digits
                if (val.startsWith("880")) val = val.slice(3);
                if (val.startsWith("0")) val = val.slice(1);
                val = val.slice(0, 10);
                setPhoneNumber(val);
                if (phoneCode !== "+880") setPhoneCode("+880");
              }}
              placeholder="1XXXXXXXXX (10 digits)"
              className="flex-1 h-full border-0 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-0 px-3 text-foreground text-sm font-mono tracking-wide"
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
