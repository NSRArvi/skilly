"use client";

import React, { useEffect, useState, useMemo } from "react";
import SearchableSelect from "@/components/shared/SearchableSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag, Layers, MapPin, Building } from "lucide-react";
import { fetchStates, fetchCities } from "@/lib/locations";

/**
 * CommonTaxonomyLocationFilter
 * Shared filter component across Professionals, Jobs, and Services pages.
 * Handles:
 * - Category (SearchableSelect with Tag icon)
 * - Subcategory (SearchableSelect with Layers icon, dependent on Category)
 * - Optional Division/State (Select with MapPin icon)
 * - Optional District/City (Select with Building icon)
 */
export default function CommonTaxonomyLocationFilter({
  categories = [],
  subcategories = [],
  selectedCategory = "all",
  onCategoryChange,
  selectedSubcategory = "all",
  onSubcategoryChange,
  showLocation = true,
  selectedDivision = "all",
  onDivisionChange,
  selectedDistrict = "all",
  onDistrictChange,
  divisionLabel = "Division (State)",
  districtLabel = "District (City)",
  useDivisionCode = true, // true for ISO code (DHAKA), false for Name ("Dhaka")
  className = "",
}) {
  const [divisionsList, setDivisionsList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);

  useEffect(() => {
    if (showLocation) {
      fetchStates("BD").then((divs) => setDivisionsList(divs || []));
    }
  }, [showLocation]);

  useEffect(() => {
    if (!showLocation) return;
    const divParam = selectedDivision !== "all" ? selectedDivision : undefined;
    fetchCities("BD", divParam).then((dists) => {
      setDistrictsList(dists || []);
    });
  }, [showLocation, selectedDivision]);

  const filteredSubcategories = useMemo(() => {
    if (selectedCategory && selectedCategory !== "all") {
      return subcategories.filter(
        (sub) => String(sub.category_id) === String(selectedCategory)
      );
    }
    return subcategories;
  }, [subcategories, selectedCategory]);

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 ${
        showLocation ? "lg:grid-cols-4" : "lg:grid-cols-2"
      } gap-3 ${className}`}
    >
      {/* Category */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-primary" />
          Category
        </span>
        <SearchableSelect
          value={selectedCategory === "all" ? "" : selectedCategory}
          onChange={(val) => {
            onCategoryChange(val || "all");
            if (onSubcategoryChange) onSubcategoryChange("all");
          }}
          items={categories}
          placeholder="All Categories"
          searchPlaceholder="Search categories..."
          emptyMessage="No category found"
          triggerClassName="h-10 rounded-xl text-xs md:text-sm bg-background/60 hover:bg-background border-border"
        />
      </div>

      {/* Subcategory */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" />
          Subcategory
        </span>
        <SearchableSelect
          value={selectedSubcategory === "all" ? "" : selectedSubcategory}
          onChange={(val) => {
            if (onSubcategoryChange) onSubcategoryChange(val || "all");
          }}
          items={filteredSubcategories}
          placeholder={
            selectedCategory !== "all"
              ? "All Subcategories"
              : "All Subcategories (All)"
          }
          searchPlaceholder="Search subcategories..."
          emptyMessage="No subcategory found"
          disabled={selectedCategory !== "all" && filteredSubcategories.length === 0}
          triggerClassName="h-10 rounded-xl text-xs md:text-sm bg-background/60 hover:bg-background border-border"
        />
      </div>

      {/* Division (State) */}
      {showLocation && onDivisionChange && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {divisionLabel}
          </span>
          <Select
            value={selectedDivision}
            onValueChange={(val) => {
              onDivisionChange(val);
              if (onDistrictChange) onDistrictChange("all");
            }}
          >
            <SelectTrigger className="h-10 rounded-xl bg-background/60 hover:bg-background border-border text-xs md:text-sm font-medium">
              <SelectValue placeholder="All Divisions">
                {selectedDivision === "all"
                  ? "All Divisions"
                  : divisionsList.find((s) =>
                      useDivisionCode
                        ? s.isoCode === selectedDivision
                        : s.name === selectedDivision
                    )?.name || selectedDivision}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground max-h-64 p-1.5">
              <SelectItem value="all">All Divisions</SelectItem>
              {divisionsList.map((div) => (
                <SelectItem
                  key={div.isoCode}
                  value={useDivisionCode ? div.isoCode : div.name}
                >
                  {div.name} {div.bnName ? `(${div.bnName})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* District (City) */}
      {showLocation && onDistrictChange && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-primary" />
            {districtLabel}
          </span>
          <Select
            value={selectedDistrict}
            onValueChange={onDistrictChange}
            disabled={selectedDivision === "all" && districtsList.length === 0}
          >
            <SelectTrigger className="h-10 rounded-xl bg-background/60 hover:bg-background border-border text-xs md:text-sm font-medium">
              <SelectValue placeholder="All Districts">
                {selectedDistrict === "all" ? "All Districts" : selectedDistrict}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground max-h-64 p-1.5">
              <SelectItem value="all">All Districts</SelectItem>
              {districtsList.map((dist) => (
                <SelectItem key={dist.name} value={dist.name}>
                  {dist.name} {dist.bnName ? `(${dist.bnName})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

