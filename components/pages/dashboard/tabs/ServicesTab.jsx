"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
  Upload,
  Loader2,
  Package,
  Layers,
  MapPin,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { createClient } from "../../../../lib/client";
import { uploadServiceImage } from "@/lib/actions/media";
import { fetchStates, fetchCities } from "@/lib/locations";
import { toast } from "sonner";

export default function ServicesTab({ userId }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Categories & Subcategories
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // Bangladesh Divisions and Districts
  const [divisionsList, setDivisionsList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [imageUrl, setImageUrl] = useState("");
  const [features, setFeatures] = useState([""]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete confirm modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load Categories & Subcategories from DB
  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        const supabase = createClient();
        const { data: cats } = await supabase
          .from("categories")
          .select("*")
          .order("name");
        if (cats) setCategories(cats);

        const { data: subs } = await supabase
          .from("subcategories")
          .select("*")
          .order("name");
        if (subs) setSubcategories(subs);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    fetchTaxonomy();
  }, []);

  // Load Bangladesh Divisions
  useEffect(() => {
    fetchStates("BD").then((divisions) => {
      setDivisionsList(divisions || []);
    });
  }, []);

  // Load Districts whenever selected Division changes
  useEffect(() => {
    if (selectedDivision) {
      fetchCities("BD", selectedDivision).then((districts) => {
        setDistrictsList(districts || []);
      });
    } else {
      fetchCities("BD").then((allDistricts) => {
        setDistrictsList(allDistricts || []);
      });
    }
  }, [selectedDivision]);

  // Fetch Services
  const fetchServices = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("services")
        .select("*, categories(name), subcategories(name)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        // Fallback without joins if foreign keys aren't set
        const { data: fallbackData } = await supabase
          .from("services")
          .select("*")
          .eq("user_id", userId)
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
    fetchServices();
  }, [userId]);

  // Open modal for New Service
  const handleOpenCreate = () => {
    setEditingService(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setCurrency("BDT");
    setImageUrl("");
    setFeatures([""]);
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedDivision("");
    setSelectedDistrict("");
    setModalOpen(true);
  };

  // Open modal for Edit Service
  const handleOpenEdit = (service) => {
    setEditingService(service);
    setTitle(service.title || "");
    setDescription(service.description || "");
    setPrice(service.price ? String(service.price) : "");
    setCurrency(service.currency || "BDT");
    setImageUrl(service.image_url || "");
    setFeatures(
      Array.isArray(service.features) && service.features.length > 0
        ? service.features
        : [""]
    );
    setSelectedCategory(service.category_id || "");
    setSelectedSubcategory(service.subcategory_id || "");
    setSelectedDivision(service.division || "");
    setSelectedDistrict(service.district || "");
    setModalOpen(true);
  };

  // Feature item handlers
  const handleFeatureChange = (index, val) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const handleAddFeature = () => {
    setFeatures([...features, ""]);
  };

  const handleRemoveFeature = (index) => {
    const updated = features.filter((_, i) => i !== index);
    setFeatures(updated.length ? updated : [""]);
  };

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadServiceImage(formData);
      if (res.success && res.publicUrl) {
        setImageUrl(res.publicUrl);
        toast.success("Service image uploaded successfully!");
      } else {
        toast.error(res.error || "Failed to upload image");
      }
    } catch {
      toast.error("An error occurred during image upload.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Save (Create or Update) Service
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a service title.");
      return;
    }
    if (!price || isNaN(Number(price))) {
      toast.error("Please enter a valid price.");
      return;
    }

    const filteredFeatures = features
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    setSaving(true);
    const supabase = createClient();

    try {
      const payload = {
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        currency: currency,
        image_url: imageUrl || null,
        features: filteredFeatures,
        category_id: selectedCategory || null,
        subcategory_id: selectedSubcategory || null,
        division: selectedDivision || null,
        district: selectedDistrict || null,
        country: "Bangladesh",
      };

      if (editingService) {
        // Update
        const { error } = await supabase
          .from("services")
          .update(payload)
          .eq("id", editingService.id);

        if (error) throw error;
        toast.success("Service updated successfully!");
      } else {
        // Create
        const { error } = await supabase.from("services").insert([payload]);
        if (error) throw error;
        toast.success("Service created successfully!");
      }

      setModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error(err);
      toast.error(
        err.message ||
          "Failed to save service. Please ensure the Supabase 'services' table columns exist."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete Action
  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    setDeleting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceToDelete.id);

      if (error) throw error;
      toast.success("Service deleted successfully.");
      setDeleteConfirmOpen(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete service.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/80 p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              My Services
            </h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            Showcase fixed-price offerings with categories, deliverables, and local Bangladesh service locations.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-xl gap-2 font-bold text-xs h-10 px-4 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Service
        </Button>
      </div>

      {/* Services List / Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading your services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-foreground">
              No services added yet
            </h3>
            <p className="text-xs text-muted-foreground">
              Add your first service package with title, category, location, and pricing to let clients book you directly.
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="rounded-xl gap-2 font-bold text-xs h-10 px-5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create First Service
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const categoryName =
              service.categories?.name ||
              categories.find((c) => c.id === service.category_id)?.name;
            const subcategoryName =
              service.subcategories?.name ||
              subcategories.find((s) => s.id === service.subcategory_id)?.name;

            return (
              <div
                key={service.id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image Banner */}
                <div className="relative w-full h-44 bg-muted overflow-hidden flex items-center justify-center">
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
                        No Image Provided
                      </span>
                    </div>
                  )}

                  {/* Price Tag Badge */}
                  <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-md px-3 py-1 rounded-full border border-border/80 shadow-sm text-xs font-black text-primary">
                    ৳{Number(service.price).toLocaleString()}
                  </div>

                  {/* Category Pill Tag */}
                  {categoryName && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                      <Tag className="w-3 h-3 text-primary" />
                      <span className="truncate max-w-[130px]">{categoryName}</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-foreground line-clamp-1">
                      {service.title}
                    </h3>

                    {/* Location & Subcategory tags */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-medium">
                      {(service.district || service.division) && (
                        <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md text-foreground/80">
                          <MapPin className="w-3 h-3 text-primary" />
                          {service.district && service.division
                            ? `${service.district}, ${service.division}`
                            : service.district || service.division}
                        </span>
                      )}
                      {subcategoryName && (
                        <span className="inline-flex items-center bg-primary/10 text-primary px-2 py-0.5 rounded-md font-semibold">
                          {subcategoryName}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {service.description || "No description provided for this service."}
                    </p>

                    {/* Features list */}
                    {Array.isArray(service.features) && service.features.length > 0 && (
                      <div className="pt-2 border-t border-border/60 space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                          Included Features:
                        </span>
                        <ul className="space-y-1">
                          {service.features.slice(0, 3).map((feat, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-1.5 text-xs text-foreground/90"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                          {service.features.length > 3 && (
                            <p className="text-[11px] text-muted-foreground italic pl-5">
                              +{service.features.length - 3} more features
                            </p>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(service)}
                      className="rounded-xl h-8 px-3 text-xs font-semibold gap-1.5 hover:bg-muted"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setServiceToDelete(service);
                        setDeleteConfirmOpen(true);
                      }}
                      className="rounded-xl h-8 px-3 text-xs font-semibold gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingService ? "Edit Service Package" : "Create New Service"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the deliverables, dynamic categories, location, and price for your service.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveService} className="space-y-4 pt-2">
            {/* Service Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                Service Title <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g. Next.js Full Stack MVP Development"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-10 text-sm rounded-xl"
              />
            </div>

            {/* Dynamic Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(val) => {
                    setSelectedCategory(val);
                    setSelectedSubcategory("");
                  }}
                >
                  <SelectTrigger className="h-10 text-sm rounded-xl">
                    <SelectValue placeholder="Select a category">
                      {categories.find((c) => c.id === selectedCategory)?.name ||
                        "Select a category"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="p-2">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Subcategory</Label>
                <Select
                  value={selectedSubcategory}
                  onValueChange={setSelectedSubcategory}
                  disabled={!selectedCategory}
                >
                  <SelectTrigger className="h-10 text-sm rounded-xl">
                    <SelectValue placeholder="Select a subcategory">
                      {subcategories.find((s) => s.id === selectedSubcategory)?.name ||
                        "Select a subcategory"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="p-2">
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

            {/* Location (Division & District of Bangladesh) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  Division (বিভাগ)
                </Label>
                <Select
                  value={selectedDivision}
                  onValueChange={(val) => {
                    setSelectedDivision(val);
                    setSelectedDistrict("");
                  }}
                >
                  <SelectTrigger className="h-10 text-sm rounded-xl">
                    <SelectValue placeholder="Select Division">
                      {divisionsList.find(
                        (d) => d.name === selectedDivision || d.isoCode === selectedDivision
                      )?.name ||
                        selectedDivision ||
                        "Select Division"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="p-2">
                    {divisionsList.map((div) => (
                      <SelectItem key={div.isoCode} value={div.name}>
                        {div.name} {div.bnName ? `(${div.bnName})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  District / City (জেলা)
                </Label>
                <Select
                  value={selectedDistrict}
                  onValueChange={setSelectedDistrict}
                >
                  <SelectTrigger className="h-10 text-sm rounded-xl">
                    <SelectValue placeholder="Select District">
                      {selectedDistrict || "Select District"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="p-2">
                    {districtsList.map((dist) => (
                      <SelectItem key={dist.name} value={dist.name}>
                        {dist.name} {dist.bnName ? `(${dist.bnName})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price & Service Image Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  Price (BDT ৳) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">
                    ৳
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 5000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="h-10 text-sm pl-8 rounded-xl"
                  />
                </div>
              </div>

              {/* Service Image Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  Cover Image
                </Label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <div className="h-10 px-3 border border-input rounded-xl bg-card hover:bg-muted/50 flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground transition-colors">
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>
                        {uploadingImage
                          ? "Uploading..."
                          : imageUrl
                          ? "Change Image"
                          : "Upload Image"}
                      </span>
                    </div>
                  </label>
                  {imageUrl && (
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-border flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                Description
              </Label>
              <Textarea
                placeholder="Describe what the client receives, timelines, and deliverables..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="text-sm rounded-xl resize-none"
              />
            </div>

            {/* Features Array */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground">
                  Features / What&apos;s Included
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddFeature}
                  className="h-7 text-xs font-bold text-primary gap-1 hover:bg-primary/10"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Feature
                </Button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {features.map((feat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Feature #${index + 1} (e.g. Source code included)`}
                      value={feat}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="h-9 text-xs rounded-xl flex-1"
                    />
                    {features.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFeature(index)}
                        className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dialog Footer Actions */}
            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="rounded-xl text-xs font-semibold h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl text-xs font-bold h-10 gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingService ? "Update Service" : "Create Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Service"
        description={`Are you sure you want to permanently delete "${serviceToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Service"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleDeleteService}
      />
    </div>
  );
}
