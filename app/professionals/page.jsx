"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Container from "../../components/shared/Container";
import ProfessionalsCard from "../../components/pages/home/ProfessionalsCard";
import { createClient } from "../../lib/client";
import { Country, State, City } from "country-state-city";
import { SlidersHorizontal, ArrowUpDown, MapPin, Search, X, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const [selectedCountry, setSelectedCountry] = useState("BD");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

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

    // Pagination
    query = query.range(rangeStart, rangeEnd);

    return query;
  }, [selectedCategory, selectedSubcategory, selectedCountry, selectedState, selectedCity, sortBy, searchQuery]);

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
    selectedCountry !== "all" && selectedCountry !== "BD",
    selectedState !== "all",
    selectedCity !== "all",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSelectedCountry("BD");
    setSelectedState("all");
    setSelectedCity("all");
    setSearchQuery("");
    setSortBy("default");
  };

  return (
    <div className="min-h-screen bg-background py-10 md:py-16">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Find Experts
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {!loading && `${professionals.length}${hasMore ? "+" : ""} professionals available`}
              </p>
            </div>

            {/* Search + Sort Row */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 md:w-[260px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full h-9 pl-9 pr-8 rounded-xl bg-card border border-border text-foreground text-xs font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-[160px] rounded-xl bg-card border-border text-xs font-semibold gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <SelectValue placeholder="Sort">
                    {sortBy === "popular" ? "Most Popular" : sortBy === "latest" ? "Latest" : "Default"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="latest">Latest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-card border border-border rounded-2xl p-4 md:p-5 space-y-4">
            {/* Top row: Category pills + active filter info */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => { setSelectedCategory("all"); setSelectedSubcategory("all"); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubcategory("all");
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/60 border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Subcategory pills */}
            {selectedCategory !== "all" && (
              <div className="flex flex-wrap items-center gap-1.5 pl-4 border-l-2 border-primary/30">
                <button
                  onClick={() => setSelectedSubcategory("all")}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                    selectedSubcategory === "all"
                      ? "bg-foreground text-background"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/40"
                  }`}
                >
                  All in {categories.find(c => c.id === selectedCategory)?.name}
                </button>
                {subcategories
                  .filter(sub => sub.category_id === selectedCategory)
                  .map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubcategory(sub.id)}
                      className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                        selectedSubcategory === sub.id
                          ? "bg-foreground text-background"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/40"
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
              </div>
            )}

            {/* Location row */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/40">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Location</span>
              </div>

              <div className="w-[170px]">
                <Select
                  value={selectedCountry}
                  onValueChange={(val) => {
                    setSelectedCountry(val);
                    setSelectedState("all");
                    setSelectedCity("all");
                  }}
                >
                  <SelectTrigger className="h-8 rounded-lg bg-background/60 border-border/60 text-[11px] font-semibold">
                    <SelectValue placeholder="All Countries">
                      {selectedCountry === "all" ? "All Countries" : Country.getCountryByCode(selectedCountry)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="all">All Countries</SelectItem>
                    {Country.getAllCountries().map((c) => (
                      <SelectItem key={c.isoCode} value={c.isoCode}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCountry !== "all" && (
                <div className="w-[170px]">
                  <Select
                    value={selectedState}
                    onValueChange={(val) => {
                      setSelectedState(val);
                      setSelectedCity("all");
                    }}
                  >
                    <SelectTrigger className="h-8 rounded-lg bg-background/60 border-border/60 text-[11px] font-semibold">
                      <SelectValue placeholder="All Divisions">
                        {selectedState === "all" ? "All Divisions" : State.getStateByCodeAndCountry(selectedState, selectedCountry)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="all">All Divisions</SelectItem>
                      {State.getStatesOfCountry(selectedCountry).map((s) => (
                        <SelectItem key={s.isoCode} value={s.isoCode}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedState !== "all" && selectedCountry !== "all" && (
                <div className="w-[170px]">
                  <Select
                    value={selectedCity}
                    onValueChange={setSelectedCity}
                  >
                    <SelectTrigger className="h-8 rounded-lg bg-background/60 border-border/60 text-[11px] font-semibold">
                      <SelectValue placeholder="All Cities">
                        {selectedCity === "all" ? "All Cities" : selectedCity}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="all">All Cities</SelectItem>
                      {City.getCitiesOfState(selectedCountry, selectedState).map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
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
