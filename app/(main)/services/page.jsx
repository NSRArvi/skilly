"use client";

import React, { useEffect, useState, useMemo } from "react";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Sparkles,
  MapPin,
  Tag,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  X,
  Loader2,
  User,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/client";
import { fetchStates, fetchCities } from "@/lib/locations";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { toast } from "sonner";

export default function ServicesPage() {
  const { requireAuth } = useAuthModal();
  const [currentUser, setCurrentUser] = useState(null);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Taxonomy states
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // Location states
  const [divisionsList, setDivisionsList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Booking Modal states
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingNote, setBookingNote] = useState("");
  const [bookingDeliveryDate, setBookingDeliveryDate] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Check auth user
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    checkUser();
  }, []);

  // Fetch categories & subcategories
  useEffect(() => {
    const fetchTaxonomy = async () => {
      const supabase = createClient();
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (catData) setCategories(catData);

      const { data: subData } = await supabase
        .from("subcategories")
        .select("*")
        .order("name");
      if (subData) setSubcategories(subData);
    };
    fetchTaxonomy();
  }, []);

  // Fetch Bangladesh Divisions
  useEffect(() => {
    fetchStates("BD").then((divs) => setDivisionsList(divs || []));
  }, []);

  // Fetch Districts when division filter changes
  useEffect(() => {
    if (selectedDivision !== "all") {
      fetchCities("BD", selectedDivision).then((districts) => {
        setDistrictsList(districts || []);
      });
    } else {
      fetchCities("BD").then((allDistricts) => {
        setDistrictsList(allDistricts || []);
      });
    }
  }, [selectedDivision]);

  // Fetch Services from Supabase
  const loadServices = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from("services")
        .select(
          "*, categories(name), subcategories(name), professionals!services_user_id_fkey(id, full_name, avatar_url, profession, is_verified)"
        );

      // Category filter
      if (selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }
      if (selectedSubcategory !== "all") {
        query = query.eq("subcategory_id", selectedSubcategory);
      }

      // Location filters
      if (selectedDivision !== "all") {
        query = query.eq("division", selectedDivision);
      }
      if (selectedDistrict !== "all") {
        query = query.eq("district", selectedDistrict);
      }

      // Sorting
      if (sortBy === "price_low") {
        query = query.order("price", { ascending: true });
      } else if (sortBy === "price_high") {
        query = query.order("price", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        // Fallback without relation if foreign key name varies
        const { data: fallbackData } = await supabase
          .from("services")
          .select("*, categories(name), subcategories(name)")
          .order("created_at", { ascending: false });

        setServices(fallbackData || []);
      } else {
        setServices(data || []);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [selectedCategory, selectedSubcategory, selectedDivision, selectedDistrict, sortBy]);

  // Client-side text search
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services;
    const term = searchTerm.toLowerCase().trim();
    return services.filter(
      (s) =>
        s.title?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term) ||
        s.categories?.name?.toLowerCase().includes(term) ||
        s.subcategories?.name?.toLowerCase().includes(term) ||
        s.district?.toLowerCase().includes(term) ||
        s.division?.toLowerCase().includes(term) ||
        s.features?.some((f) => f.toLowerCase().includes(term))
    );
  }, [services, searchTerm]);

  // Open booking modal
  const handleOpenBooking = (e, service) => {
    requireAuth(e, () => {
      setSelectedService(service);
      setBookingNote(
        `Hi! I'd like to book your "${service.title}" package.`
      );
      // Default delivery date: 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setBookingDeliveryDate(defaultDate.toISOString().split("T")[0]);
      setBookingModalOpen(true);
    });
  };

  // Submit Order / Booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please login to book a service");
      return;
    }
    if (!selectedService) return;

    if (currentUser.id === selectedService.user_id) {
      toast.error("You cannot book your own service package.");
      return;
    }

    if (!bookingDeliveryDate) {
      toast.error("Please choose an expected completion/delivery date.");
      return;
    }

    try {
      setSubmittingBooking(true);
      const supabase = createClient();

      const { error } = await supabase.from("orders").insert({
        client_id: currentUser.id,
        professional_id: selectedService.user_id,
        title: `Service: ${selectedService.title}`,
        description: bookingNote || `Order for ${selectedService.title}`,
        offer_amount: Math.round(Number(selectedService.price) || 0),
        delivery_date: new Date(bookingDeliveryDate).toISOString(),
        status: "pending",
      });

      if (error) throw error;

      toast.success(
        "Service booking request sent successfully! Check your dashboard orders."
      );
      setBookingModalOpen(false);
      setSelectedService(null);
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.message || "Failed to book service. Please try again.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSelectedDivision("all");
    setSelectedDistrict("all");
    setSortBy("newest");
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCategory !== "all" ||
    selectedSubcategory !== "all" ||
    selectedDivision !== "all" ||
    selectedDistrict !== "all" ||
    sortBy !== "newest";

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <Container>
        {/* Page Header */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Explore Services & Packages
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Hire Verified Solutions
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Browse pre-packaged services from verified Bangladeshi professionals. Filter by location, domain, and book with one click.
              </p>
            </div>

            <Link href="/dashboard">
              <Button className="rounded-xl text-xs font-bold h-10 gap-2 shadow-sm">
                <Sparkles className="w-4 h-4" />
                Offer Your Own Service
              </Button>
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
            {/* Top row: Search input & Sorting */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-primary" />
                  Search Services
                </Label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by title, deliverables, tags (e.g. Next.js, SEO, Logo design)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 text-sm rounded-xl"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                  Sort Order
                </Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-10 text-sm rounded-xl">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="p-2">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bottom Row: Category and Location Selects with Labels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-border/60">
              {/* Category */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  Category
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(val) => {
                    setSelectedCategory(val);
                    setSelectedSubcategory("all");
                  }}
                >
                  <SelectTrigger className="h-10 text-xs md:text-sm rounded-xl">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="p-2">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  Subcategory
                </Label>
                <Select
                  value={selectedSubcategory}
                  onValueChange={setSelectedSubcategory}
                  disabled={selectedCategory === "all"}
                >
                  <SelectTrigger className="h-10 text-xs md:text-sm rounded-xl">
                    <SelectValue placeholder="All Subcategories" />
                  </SelectTrigger>
                  <SelectContent className="p-2">
                    <SelectItem value="all">All Subcategories</SelectItem>
                    {subcategories
                      .filter((s) => s.category_id === selectedCategory)
                      .map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Division (বিভাগ) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  Division (বিভাগ)
                </Label>
                <Select
                  value={selectedDivision}
                  onValueChange={(val) => {
                    setSelectedDivision(val);
                    setSelectedDistrict("all");
                  }}
                >
                  <SelectTrigger className="h-10 text-xs md:text-sm rounded-xl">
                    <SelectValue placeholder="All Divisions" />
                  </SelectTrigger>
                  <SelectContent className="p-2">
                    <SelectItem value="all">All Divisions (বিভাগ)</SelectItem>
                    {divisionsList.map((div) => (
                      <SelectItem key={div.isoCode} value={div.name}>
                        {div.name} {div.bnName ? `(${div.bnName})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* District / City (জেলা) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  District (জেলা)
                </Label>
                <Select
                  value={selectedDistrict}
                  onValueChange={setSelectedDistrict}
                >
                  <SelectTrigger className="h-10 text-xs md:text-sm rounded-xl">
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent className="p-2">
                    <SelectItem value="all">All Districts (জেলা)</SelectItem>
                    {districtsList.map((dist) => (
                      <SelectItem key={dist.name} value={dist.name}>
                        {dist.name} {dist.bnName ? `(${dist.bnName})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters pill display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-muted-foreground font-medium">
                  Showing {filteredServices.length} {filteredServices.length === 1 ? "service" : "services"} matching filters
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 text-xs text-destructive hover:bg-destructive/10"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Services Results Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Finding available service packages...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="text-lg font-bold text-foreground">
                No Services Found
              </h3>
              <p className="text-xs text-muted-foreground">
                Try loosening your category or location filters to see more results.
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="rounded-xl text-xs font-semibold h-9"
              >
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const prof = service.professionals;

              return (
                <div
                  key={service.id}
                  className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Image Header & Badges */}
                  <div>
                    <div className="relative w-full h-48 bg-muted overflow-hidden flex items-center justify-center">
                      {service.image_url ? (
                        <Image
                          src={service.image_url}
                          alt={service.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground/60 gap-1.5">
                          <Layers className="w-8 h-8 opacity-40" />
                          <span className="text-[11px] font-semibold tracking-wider uppercase">
                            Skilly Service Package
                          </span>
                        </div>
                      )}

                      {/* Price Badge */}
                      <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-md px-3 py-1 rounded-full border border-border/80 shadow-md text-xs font-black text-primary">
                        ৳{Number(service.price).toLocaleString()}
                      </div>

                      {/* Category Badge */}
                      {service.categories?.name && (
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                          <Tag className="w-3 h-3 text-primary" />
                          <span className="truncate max-w-[130px]">
                            {service.categories.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3.5">
                      {/* Professional / Provider Profile Row */}
                      {prof && (
                        <Link
                          href={`/professionals/${prof.id || service.user_id}`}
                          className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
                        >
                          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-muted flex-shrink-0">
                            {prof.avatar_url ? (
                              <Image
                                src={prof.avatar_url}
                                alt={prof.full_name || "Provider"}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-[10px]">
                                {prof.full_name?.charAt(0) || "U"}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-foreground truncate block">
                              {prof.full_name || "Verified Professional"}
                            </span>
                            {prof.profession && (
                              <span className="text-[10px] text-muted-foreground truncate block">
                                {prof.profession}
                              </span>
                            )}
                          </div>
                        </Link>
                      )}

                      {/* Title & Description */}
                      <div className="space-y-1.5">
                        <h2 className="text-base font-bold text-foreground leading-snug line-clamp-1">
                          {service.title}
                        </h2>

                        {/* Location Tag */}
                        {(service.district || service.division) && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span>
                              {service.district && service.division
                                ? `${service.district}, ${service.division}`
                                : service.district || service.division}
                            </span>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed pt-0.5">
                          {service.description || "No full description provided."}
                        </p>
                      </div>

                      {/* Features */}
                      {Array.isArray(service.features) && service.features.length > 0 && (
                        <div className="pt-2 border-t border-border/60 space-y-1">
                          {service.features.slice(0, 3).map((feat, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 text-xs text-foreground/80"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                          {service.features.length > 3 && (
                            <span className="text-[10px] text-muted-foreground italic pl-5 block">
                              +{service.features.length - 3} more deliverables
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="p-5 pt-0 border-t border-border/60 mt-3 flex items-center justify-between gap-2">
                    <Link
                      href={`/professionals/${service.professionals?.id || service.user_id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View Provider
                    </Link>

                    <Button
                      size="sm"
                      onClick={(e) => handleOpenBooking(e, service)}
                      className="rounded-xl text-xs font-bold h-9 px-4 gap-1.5 shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Book Service
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Book Service Order Modal */}
        <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
          <DialogContent className="max-w-md w-full rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                Book Service Package
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Confirm your requirements and booking date. The professional will review your order.
              </DialogDescription>
            </DialogHeader>

            {selectedService && (
              <form onSubmit={handleConfirmBooking} className="space-y-4 pt-2">
                {/* Summary Card */}
                <div className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-foreground">
                      {selectedService.title}
                    </h4>
                    <span className="text-xs font-black text-primary px-2 py-0.5 rounded bg-primary/10">
                      ৳{Number(selectedService.price).toLocaleString()}
                    </span>
                  </div>
                  {(selectedService.district || selectedService.division) && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" />
                      {selectedService.district && selectedService.division
                        ? `${selectedService.district}, ${selectedService.division}`
                        : selectedService.district || selectedService.division}
                    </p>
                  )}
                </div>

                {/* Delivery / Target Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Target Completion Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={bookingDeliveryDate}
                    onChange={(e) => setBookingDeliveryDate(e.target.value)}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="h-10 text-sm rounded-xl"
                  />
                </div>

                {/* Custom Note / Instructions */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Order Instructions / Details
                  </Label>
                  <Textarea
                    placeholder="Provide details about your project, links, or specific requirements..."
                    value={bookingNote}
                    onChange={(e) => setBookingNote(e.target.value)}
                    rows={3}
                    className="text-sm rounded-xl resize-none"
                  />
                </div>

                <DialogFooter className="pt-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setBookingModalOpen(false)}
                    disabled={submittingBooking}
                    className="rounded-xl text-xs font-semibold h-10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingBooking}
                    className="rounded-xl text-xs font-bold h-10 gap-2"
                  >
                    {submittingBooking && <Loader2 className="w-4 h-4 animate-spin" />}
                    Confirm Booking (৳{Number(selectedService.price).toLocaleString()})
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </div>
  );
}

