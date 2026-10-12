"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Container from "@/components/shared/Container";
import ProfessionalsCard from "@/components/pages/home/ProfessionalsCard";
import { createClient } from "@/lib/client";
import { fetchCountries, fetchStates, fetchCities } from "@/lib/locations";
import { SlidersHorizontal, ArrowUpDown, MapPin, Search, X, Loader2, ShieldCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CommonTaxonomyLocationFilter from "@/components/shared/CommonTaxonomyLocationFilter";

const PAGE_SIZE = 12;

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");

  const [selectedCountry] = useState("BD");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedVerified, setSelectedVerified] = useState("all");

  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  useEffect(() => {
    fetchStates("BD").then((data) => {
      setStatesList(data);
    });
  }, []);

  useEffect(() => {
    fetchCities("BD", selectedState).then((data) => {
      setCitiesList(data);
    });
  }, [selectedState]);

  const [sortBy, setSortBy] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");

  const sentinelRef = useRef(null);

  // Fetch Categories
  useEffect(() => {
    const fetchTaxonomy = async () => {
      const supabase = createClient();
      const { data: catData } = await supabase.from("categories").select("*").order("name");
      if (catData) setCategories(catData);

      const { data: subData } = await supabase.from("subcategories").select("*").order("name");
      if (subData) setSubcategories(subData);
    };
    fetchTaxonomy();
  }, []);

  // Build query helper
  const buildQuery = useCallback((supabase, rangeStart, rangeEnd) => {
    let query = supabase
      .from("professionals")
      .select("*, categories(name), subcategories(name)");

    // Sorting
    if (sortBy === "popular") {
      query = query.order("ratings_count", { ascending: false });
    } else if (sortBy === "latest") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Category filters
    if (selectedCategory !== "all") {
      query = query.eq("category_id", selectedCategory);
    }
    if (selectedSubcategory !== "all") {
      query = query.eq("subcategory_id", selectedSubcategory);
    }

    // Location filters
    if (selectedCountry !== "all") {
      query = query.eq("present_address->>countryCode", selectedCountry);
    }
    if (selectedState !== "all") {
      query = query.eq("present_address->>stateCode", selectedState);
    }
    if (selectedCity !== "all") {
      query = query.eq("present_address->>city", selectedCity);
    }

    // Search filter
    if (searchQuery.trim()) {
      query = query.ilike("full_name", `%${searchQuery.trim()}%`);
    }

    // Verified filter
    if (selectedVerified !== "all") {
      query = query.eq("is_verified", selectedVerified === "true");
    }

    // Pagination
    query = query.range(rangeStart, rangeEnd);

    return query;
  }, [selectedCategory, selectedSubcategory, selectedCountry, selectedState, selectedCity, selectedVerified, sortBy, searchQuery]);

  // Initial + filter-change fetch
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      setProfessionals([]);
      setPage(0);
      setHasMore(true);

      const supabase = createClient();
      const query = buildQuery(supabase, 0, PAGE_SIZE - 1);
      const { data } = await query;

      if (data) {
        setProfessionals(data);
        setHasMore(data.length === PAGE_SIZE);
      }
      setLoading(false);
    };

    fetchInitial();
  }, [buildQuery]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const nextPage = page + 1;
    const rangeStart = nextPage * PAGE_SIZE;
    const rangeEnd = rangeStart + PAGE_SIZE - 1;

    const supabase = createClient();
    const query = buildQuery(supabase, rangeStart, rangeEnd);
    const { data } = await query;

    if (data) {
      setProfessionals(prev => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
      setPage(nextPage);
    }
    setLoadingMore(false);
  }, [page, loadingMore, hasMore, buildQuery]);

  // Intersection Observer for infinite scroll (triggers at 60%)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "0px", threshold: 0.1 }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [loadMore]);

  // Active filter count for badge
  const activeFilterCount = [
    selectedCategory !== "all",
    selectedSubcategory !== "all",
    selectedState !== "all",
    selectedCity !== "all",
    selectedVerified !== "all",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSelectedState("all");
    setSelectedCity("all");
    setSelectedVerified("all");
    setSearchQuery("");
    setSortBy("default");
  };

  return (
    <div className="min-h-screen bg-background py-10 md:py-16" suppressHydrationWarning>
      <Container>
        {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Find Professionals
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {!loading && `${professionals.length}${hasMore ? "+" : ""} professionals available`}
              </p>
            </div>
          </div>

          {/* Unified Minimal & Professional Filter Section */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 mb-8">
            {/* Row 1: Primary Search + Quick Filters (Verification, Sort) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Search Bar */}
              <div className="md:col-span-6 lg:col-span-6 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, skills or keywords..."
                  className="w-full h-10 pl-10 pr-9 rounded-xl bg-background/60 hover:bg-background border border-border text-foreground text-xs md:text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Verification Filter */}
              <div className="md:col-span-3 lg:col-span-3">
                <Select value={selectedVerified} onValueChange={setSelectedVerified}>
                  <SelectTrigger className="h-10 rounded-xl bg-background/60 hover:bg-background border-border text-xs md:text-sm font-medium">
                    <div className="flex items-center gap-2 truncate">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                      <SelectValue placeholder="Verification">
                        {selectedVerified === "all"
                          ? "All Profiles"
                          : selectedVerified === "true"
                          ? "Verified Only"
                          : "Unverified Only"}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="all">All Profiles</SelectItem>
                    <SelectItem value="true">Verified Only</SelectItem>
                    <SelectItem value="false">Unverified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div className="md:col-span-3 lg:col-span-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-10 rounded-xl bg-background/60 hover:bg-background border-border text-xs md:text-sm font-medium gap-1.5">
                    <div className="flex items-center gap-2 truncate">
                      <ArrowUpDown className="w-3.5 h-3.5 text-primary shrink-0" />
                      <SelectValue placeholder="Sort by">
                        {sortBy === "popular"
                          ? "Most Popular"
                          : sortBy === "latest"
                          ? "Latest First"
                          : "Default Order"}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="default">Default Order</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="latest">Latest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Divider with Filter Badge */}
            <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
              <div className="flex items-center gap-2 font-medium text-muted-foreground">
                <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                <span>Refine by Category & Location</span>
                {activeFilterCount > 0 && (
                  <span className="bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Reset all filters
                </button>
              )}
            </div>

            {/* Common Category, Subcategory, Division, District Filter */}
            <CommonTaxonomyLocationFilter
              categories={categories}
              subcategories={subcategories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedSubcategory={selectedSubcategory}
              onSubcategoryChange={setSelectedSubcategory}
              showLocation={true}
              selectedDivision={selectedState}
              onDivisionChange={(val) => {
                setSelectedState(val);
                setSelectedCity("all");
              }}
              selectedDistrict={selectedCity}
              onDistrictChange={setSelectedCity}
              useDivisionCode={true}
            />
          </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between h-[320px] animate-pulse"
              >
                <div>
                  <div className="flex gap-4 mb-6">
                    <div className="h-12 w-12 rounded-full bg-muted flex-shrink-0"></div>
                    <div className="space-y-2 flex-1 mt-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <div className="h-6 w-16 bg-muted rounded-full"></div>
                    <div className="h-6 w-20 bg-muted rounded-full"></div>
                    <div className="h-6 w-14 bg-muted rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="h-[1px] w-full bg-border/50 mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-muted rounded w-1/3"></div>
                    <div className="h-9 bg-muted rounded-xl w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : professionals.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals.map((prof) => (
                <ProfessionalsCard key={prof.id} professional={prof} />
              ))}
            </div>

            {/* Infinite scroll sentinel — placed at ~60% of last row */}
            {hasMore && (
              <div
                ref={sentinelRef}
                className="flex items-center justify-center py-10"
                style={{ marginTop: "-40%" }}
              >
                {loadingMore && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading more...
                  </div>
                )}
              </div>
            )}

            {/* Loading more indicator at the bottom */}
            {loadingMore && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading more professionals...
                </div>
              </div>
            )}

            {!hasMore && professionals.length > PAGE_SIZE && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  You&apos;ve reached the end · {professionals.length} professionals shown
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-card border border-border rounded-3xl">
            <div className="max-w-sm mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No professionals found
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Try adjusting your filters or search query.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
