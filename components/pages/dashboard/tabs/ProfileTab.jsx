"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  X,
  Plus,
  UploadCloud,
  CheckCircle2,
  Clock,
  Lock,
  FileText,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Code,
  Quote,
  ShieldCheck,
  Check,
  MapPin,
  GraduationCap,
  Briefcase,
  BookOpen,
  Globe,
} from "lucide-react";
import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaWhatsapp,
  FaDiscord,
  FaGlobe,
} from "react-icons/fa";
import { createClient } from "../../../../lib/client";
import { toast } from "sonner";
import { Country, State, City } from "country-state-city";

export default function ProfileTab({ onProfileUpdate }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState(null);

  // 1. Basic Information States (empty by default, populated directly from DB)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("prefer-not");
  const [phoneCode, setPhoneCode] = useState("+880");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bioTagline, setBioTagline] = useState("");
  const [aboutText, setAboutText] = useState("");

  // Categories States
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  // 2. Address States
  const [presentAddress, setPresentAddress] = useState({
    country: "Bangladesh",
    countryCode: "BD",
    state: "",
    stateCode: "",
    city: "",
    zipcode: "",
    fullAddress: "",
  });
  const [permanentAddress, setPermanentAddress] = useState({
    country: "Bangladesh",
    countryCode: "BD",
    state: "",
    stateCode: "",
    city: "",
    zipcode: "",
    fullAddress: "",
  });

  // 3. Skills & Categories States
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  const [skillsFor, setSkillsFor] = useState([]);
  const [newSkillFor, setNewSkillFor] = useState("");
  const [isAddingSkillFor, setIsAddingSkillFor] = useState(false);

  // 3.1 Languages States
  const [languages, setLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [newLanguageLevel, setNewLanguageLevel] = useState("Fluent");
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);

  // 4. Experience, Education & Courses
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [courses, setCourses] = useState([]);

  // 5. Social Links
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [socialGithub, setSocialGithub] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialPortfolio, setSocialPortfolio] = useState("");
  const [socialWhatsapp, setSocialWhatsapp] = useState("");
  const [socialDiscord, setSocialDiscord] = useState("");

  // 6. KYC States
  const [idType, setIdType] = useState("nid");
  const [frontId, setFrontId] = useState(null);
  const [backId, setBackId] = useState(null);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const textareaRef = useRef(null);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      setFetching(true);
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        setUser(data.user);
        const userEmail = data.user.email || "";
        const defaultName = data.user.user_metadata?.full_name || "";
        setEmail(userEmail);

        // Fetch from professionals table
        const { data: profDataArray, error } = await supabase
          .from("professionals")
          .select("*")
          .eq("user_id", data.user.id)
          .limit(1);

        const profData = profDataArray?.[0];

        if (profData) {
          setFullName(profData.full_name || defaultName);
          setEmail(profData.email || userEmail);
          setProfession(profData.profession || "");
          setSelectedCategory(profData.category_id || "");
          setSelectedSubcategory(profData.subcategory_id || "");
          setHourlyRate(
            profData.hourly_rate ? String(profData.hourly_rate) : "",
          );
          setDailyRate(profData.daily_rate ? String(profData.daily_rate) : "");
          setDateOfBirth(profData.date_of_birth || "");
          setGender(profData.gender || "prefer-not");
          setPhoneCode(profData.phone_code || "+880");
          setPhoneNumber(profData.phone_number || "");
          setBioTagline(profData.rating_message || "");
          setAboutText(profData.bio || "");

          if (
            profData.present_address &&
            typeof profData.present_address === "object"
          ) {
            setPresentAddress({
              country: profData.present_address.country || "Bangladesh",
              countryCode: profData.present_address.countryCode || "BD",
              state: profData.present_address.state || "",
              stateCode: profData.present_address.stateCode || "",
              city: profData.present_address.city || "",
              zipcode: profData.present_address.zipcode || "",
              fullAddress: profData.present_address.fullAddress || "",
            });
            if (profData.present_address.portfolio) {
              setSocialPortfolio(profData.present_address.portfolio);
            }
            if (profData.present_address.whatsapp) {
              setSocialWhatsapp(profData.present_address.whatsapp);
            }
            if (profData.present_address.discord) {
              setSocialDiscord(profData.present_address.discord);
            }
          }

          if (
            profData.permanent_address &&
            typeof profData.permanent_address === "object"
          ) {
            setPermanentAddress({
              country: profData.permanent_address.country || "Bangladesh",
              countryCode: profData.permanent_address.countryCode || "BD",
              state: profData.permanent_address.state || "",
              stateCode: profData.permanent_address.stateCode || "",
              city: profData.permanent_address.city || "",
              zipcode: profData.permanent_address.zipcode || "",
              fullAddress: profData.permanent_address.fullAddress || "",
            });
          }

          setSkills(Array.isArray(profData.skills) ? profData.skills : []);
          setSkillsFor(
            Array.isArray(profData.skills_for) ? profData.skills_for : [],
          );
          setLanguages(
            Array.isArray(profData.languages) ? profData.languages : [],
          );
          setExperience(
            Array.isArray(profData.experience) ? profData.experience : [],
          );
          setEducation(
            Array.isArray(profData.education) ? profData.education : [],
          );
          setCourses(Array.isArray(profData.courses) ? profData.courses : []);

          setSocialLinkedin(profData.social_linkedin || "");
          setSocialGithub(profData.social_github || "");
          setSocialTwitter(profData.social_twitter || "");
          setIdType(profData.id_type || "nid");
          const verifiedStatus = Boolean(
            profData.is_verified ?? profData.is_verify ?? false,
          );
          setIsVerified(verifiedStatus);

          if (profData.id_front_url) {
            setFrontId({
              name: "National ID (Front)",
              previewUrl: profData.id_front_url,
              verified: verifiedStatus,
            });
          }

          if (profData.id_back_url) {
            setBackId({
              name: "National ID (Back)",
              previewUrl: profData.id_back_url,
            });
          }
        } else {
          setFullName(defaultName);
        }
      }
      setFetching(false);
    };

    fetchUser();
  }, []);

  // Fetch Categories & Subcategories
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

  // Word counter
  const wordCount = aboutText.trim()
    ? aboutText
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length
    : 0;

  // Markdown toolbar actions
  const insertMarkdown = (prefix, suffix = "") => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selection = text.substring(start, end);

    const replacement = `${prefix}${selection || "text"}${suffix}`;
    const newText =
      text.substring(0, start) + replacement + text.substring(end);
    setAboutText(newText);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selection ? selection.length : 4),
      );
    }, 0);
  };

  // Skill Handlers
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

  const suggestedSkills = [
    "WCAG 2.2",
    "Tailwind CSS",
    "Storybook",
    "Prototyping",
    "Next.js",
    "TypeScript",
  ];

  // Languages Handlers
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

  // Direct File Upload for Front of Document
  const handleFrontUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setUploadingFront(true);
    try {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      const activeUser = authUser || user;

      if (!activeUser) {
        toast.error("Please log in to upload documents.");
        setUploadingFront(false);
        return;
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const cleanExt = fileExt.replace(/[^a-zA-Z0-9]/g, "");
      const fileName = `${activeUser.id}-front-${Date.now()}.${cleanExt}`;

      const { error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        toast.error(`Front upload failed: ${uploadError.message}`);
        setUploadingFront(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("kyc-documents").getPublicUrl(fileName);

      const nameToSave =
        fullName?.trim() ||
        activeUser.user_metadata?.full_name ||
        activeUser.email?.split("@")[0] ||
        "Professional";
      const emailToSave = email?.trim() || activeUser.email || "";

      // 1. Try UPDATE first for existing row
      let { data: updatedRows, error: dbError } = await supabase
        .from("professionals")
        .update({
          id_front_url: publicUrl,
          id_type: idType,
        })
        .eq("user_id", activeUser.id)
        .select();

      // 2. If no existing row was updated, perform upsert with full_name & email
      if (!dbError && (!updatedRows || updatedRows.length === 0)) {
        const { error: upsertError } = await supabase
          .from("professionals")
          .upsert(
            {
              user_id: activeUser.id,
              full_name: nameToSave,
              email: emailToSave,
              id_front_url: publicUrl,
              id_type: idType,
            },
            { onConflict: "user_id" },
          );
        dbError = upsertError;
      }

      if (dbError) {
        console.error("Database update error:", dbError);
        toast.error(
          `Uploaded file, but failed to save to profile: ${dbError.message}`,
        );
      } else {
        setFrontId({
          name: file.name,
          previewUrl: publicUrl,
          verified: isVerified,
        });
        toast.success("Front of document uploaded and secured!");
        if (onProfileUpdate) onProfileUpdate();
      }
    } catch (err) {
      console.error("Unexpected error during front upload:", err);
      toast.error("An unexpected error occurred while uploading.");
    } finally {
      setUploadingFront(false);
      if (frontInputRef.current) frontInputRef.current.value = "";
    }
  };

  // Direct File Upload for Back of Document
  const handleBackUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setUploadingBack(true);
    try {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      const activeUser = authUser || user;

      if (!activeUser) {
        toast.error("Please log in to upload documents.");
        setUploadingBack(false);
        return;
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const cleanExt = fileExt.replace(/[^a-zA-Z0-9]/g, "");
      const fileName = `${activeUser.id}-back-${Date.now()}.${cleanExt}`;

      const { error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        toast.error(`Back upload failed: ${uploadError.message}`);
        setUploadingBack(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("kyc-documents").getPublicUrl(fileName);

      const nameToSave =
        fullName?.trim() ||
        activeUser.user_metadata?.full_name ||
        activeUser.email?.split("@")[0] ||
        "Professional";
      const emailToSave = email?.trim() || activeUser.email || "";

      // 1. Try UPDATE first for existing row
      let { data: updatedRows, error: dbError } = await supabase
        .from("professionals")
        .update({
          id_back_url: publicUrl,
          id_type: idType,
        })
        .eq("user_id", activeUser.id)
        .select();

      // 2. If no existing row was updated, perform upsert with full_name & email
      if (!dbError && (!updatedRows || updatedRows.length === 0)) {
        const { error: upsertError } = await supabase
          .from("professionals")
          .upsert(
            {
              user_id: activeUser.id,
              full_name: nameToSave,
              email: emailToSave,
              id_back_url: publicUrl,
              id_type: idType,
            },
            { onConflict: "user_id" },
          );
        dbError = upsertError;
      }

      if (dbError) {
        console.error("Database update error:", dbError);
        toast.error(
          `Uploaded file, but failed to save to profile: ${dbError.message}`,
        );
      } else {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setBackId({
          name: file.name,
          size: `${sizeMB} MB`,
          previewUrl: publicUrl,
        });
        toast.success("Back of document uploaded successfully!");
        if (onProfileUpdate) onProfileUpdate();
      }
    } catch (err) {
      console.error("Unexpected error during back upload:", err);
      toast.error("An unexpected error occurred while uploading.");
    } finally {
      setUploadingBack(false);
      if (backInputRef.current) backInputRef.current.value = "";
    }
  };

  // Form Save
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      toast.error("Please log in to save your profile");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const updatedPresentAddress = {
      ...presentAddress,
      portfolio: socialPortfolio,
      whatsapp: socialWhatsapp,
      discord: socialDiscord,
    };

    const nameToSave =
      fullName?.trim() ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Professional";
    const emailToSave = email?.trim() || user.email || "";

    const updateData = {
      user_id: user.id,
      full_name: nameToSave,
      email: emailToSave,
      profession: profession,
      category_id: selectedCategory || null,
      subcategory_id: selectedSubcategory || null,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      daily_rate: dailyRate ? parseFloat(dailyRate) : null,
      date_of_birth: dateOfBirth || null,
      gender: gender,
      phone_code: phoneCode,
      phone_number: phoneNumber,
      rating_message: bioTagline,
      bio: aboutText,
      present_address: updatedPresentAddress,
      permanent_address: permanentAddress,
      skills: skills,
      skills_for: skillsFor,
      languages: languages,
      experience: experience,
      education: education,
      courses: courses,
      social_linkedin: socialLinkedin,
      social_github: socialGithub,
      social_twitter: socialTwitter,
      id_type: idType,
    };

    if (frontId?.previewUrl) updateData.id_front_url = frontId.previewUrl;
    if (backId?.previewUrl) updateData.id_back_url = backId.previewUrl;

    const { error } = await supabase
      .from("professionals")
      .upsert(updateData, { onConflict: "user_id" });

    setLoading(false);
    if (error) {
      console.error(error);
      toast.error("Failed to save profile: " + error.message);
    } else {
      toast.success("Profile updated successfully!");
      if (onProfileUpdate) onProfileUpdate();
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">
          Loading your profile data...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-12">
      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Information */}
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
                      <SelectItem value="prefer-not">
                        Prefer not to say
                      </SelectItem>
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
                        {categories.find((c) => c.id === selectedCategory)
                          ?.name || "Select a category"}
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

          {/* Card 2: Address Information (Present & Permanent) */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                  Address Information
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Your physical and billing locations
                </p>
              </div>
            </div>

            {/* Present Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground border-b border-border/70 pb-2 flex items-center gap-2">
                Present Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Country
                  </Label>
                  <Select
                    value={presentAddress.countryCode}
                    onValueChange={(val) => {
                      const countryData = Country.getCountryByCode(val);
                      setPresentAddress({
                        ...presentAddress,
                        countryCode: val,
                        country: countryData?.name || "",
                        stateCode: "",
                        state: "",
                        city: "",
                      });
                    }}
                  >
                    <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs">
                      <SelectValue placeholder="Select Country">
                        {presentAddress.country || "Select Country"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {Country.getAllCountries().map((c) => (
                        <SelectItem key={c.isoCode} value={c.isoCode}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    State / Division
                  </Label>
                  <Select
                    value={presentAddress.stateCode}
                    disabled={!presentAddress.countryCode}
                    onValueChange={(val) => {
                      const stateData = State.getStateByCodeAndCountry(
                        val,
                        presentAddress.countryCode,
                      );
                      setPresentAddress({
                        ...presentAddress,
                        stateCode: val,
                        state: stateData?.name || "",
                        city: "",
                      });
                    }}
                  >
                    <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs">
                      <SelectValue placeholder="Select State/Division">
                        {presentAddress.state || "Select State/Division"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {State.getStatesOfCountry(presentAddress.countryCode).map(
                        (s) => (
                          <SelectItem key={s.isoCode} value={s.isoCode}>
                            {s.name}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    City
                  </Label>
                  <Select
                    value={presentAddress.city}
                    disabled={!presentAddress.stateCode}
                    onValueChange={(val) => {
                      setPresentAddress({
                        ...presentAddress,
                        city: val,
                      });
                    }}
                  >
                    <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs">
                      <SelectValue placeholder="Select City">
                        {presentAddress.city || "Select City"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {City.getCitiesOfState(
                        presentAddress.countryCode,
                        presentAddress.stateCode,
                      ).map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Zip / Postal Code
                  </Label>
                  <Input
                    value={presentAddress.zipcode}
                    onChange={(e) =>
                      setPresentAddress({
                        ...presentAddress,
                        zipcode: e.target.value,
                      })
                    }
                    placeholder="E.g. 1207"
                    className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Full Street Address
                  </Label>
                  <Input
                    value={presentAddress.fullAddress}
                    onChange={(e) =>
                      setPresentAddress({
                        ...presentAddress,
                        fullAddress: e.target.value,
                      })
                    }
                    placeholder="E.g. House 12, Road 4, Sector 7, Uttara"
                    className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Permanent Address */}
            <div className="space-y-4 pt-2 border-t border-border/60">
              <h3 className="text-sm font-bold text-foreground border-b border-border/70 pb-2 flex items-center gap-2">
                Permanent Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Country
                  </Label>
                  <Select
                    value={permanentAddress.countryCode}
                    onValueChange={(val) => {
                      const countryData = Country.getCountryByCode(val);
                      setPermanentAddress({
                        ...permanentAddress,
                        countryCode: val,
                        country: countryData?.name || "",
                        stateCode: "",
                        state: "",
                        city: "",
                      });
                    }}
                  >
                    <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs">
                      <SelectValue placeholder="Select Country">
                        {permanentAddress.country || "Select Country"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {Country.getAllCountries().map((c) => (
                        <SelectItem key={c.isoCode} value={c.isoCode}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    State / Division
                  </Label>
                  <Select
                    value={permanentAddress.stateCode}
                    disabled={!permanentAddress.countryCode}
                    onValueChange={(val) => {
                      const stateData = State.getStateByCodeAndCountry(
                        val,
                        permanentAddress.countryCode,
                      );
                      setPermanentAddress({
                        ...permanentAddress,
                        stateCode: val,
                        state: stateData?.name || "",
                        city: "",
                      });
                    }}
                  >
                    <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs">
                      <SelectValue placeholder="Select State/Division">
                        {permanentAddress.state || "Select State/Division"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {State.getStatesOfCountry(
                        permanentAddress.countryCode,
                      ).map((s) => (
                        <SelectItem key={s.isoCode} value={s.isoCode}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    City
                  </Label>
                  <Select
                    value={permanentAddress.city}
                    disabled={!permanentAddress.stateCode}
                    onValueChange={(val) => {
                      setPermanentAddress({
                        ...permanentAddress,
                        city: val,
                      });
                    }}
                  >
                    <SelectTrigger className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs">
                      <SelectValue placeholder="Select City">
                        {permanentAddress.city || "Select City"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {City.getCitiesOfState(
                        permanentAddress.countryCode,
                        permanentAddress.stateCode,
                      ).map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Zip / Postal Code
                  </Label>
                  <Input
                    value={permanentAddress.zipcode}
                    onChange={(e) =>
                      setPermanentAddress({
                        ...permanentAddress,
                        zipcode: e.target.value,
                      })
                    }
                    placeholder="E.g. 1207"
                    className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Full Street Address
                  </Label>
                  <Input
                    value={permanentAddress.fullAddress}
                    onChange={(e) =>
                      setPermanentAddress({
                        ...permanentAddress,
                        fullAddress: e.target.value,
                      })
                    }
                    placeholder="Permanent street address"
                    className="bg-background/50 border-border text-foreground h-10 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: About & Experience (Markdown Bio) */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                  About & Biography
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  Highlight your background, philosophy, and proven deliverables
                </p>
              </div>
              <span className="text-xs text-muted-foreground font-medium pt-1">
                Markdown Supported
              </span>
            </div>

            {/* Markdown Toolbar */}
            <div className="space-y-0">
              <div className="flex items-center justify-between bg-muted/40 border border-border border-b-0 rounded-t-xl px-3 py-2 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => insertMarkdown("**", "**")}
                    className="p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("*", "*")}
                    className="p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("[", "](url)")}
                    className="p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors"
                    title="Insert Link"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-px h-3.5 bg-border mx-1" />
                  <button
                    type="button"
                    onClick={() => insertMarkdown("\n• ")}
                    className="p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("\n1. ")}
                    className="p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("`", "`")}
                    className="p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors"
                    title="Code"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("\n> ")}
                    className="p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors"
                    title="Quote"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-[11px] font-mono text-muted-foreground">
                  {wordCount} / 2,000 words
                </span>
              </div>

              <textarea
                ref={textareaRef}
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                placeholder="Tell us about your background, experience, and how you deliver value..."
                className="w-full min-h-[170px] rounded-t-none rounded-b-xl bg-background/50 border border-border p-4 text-xs md:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* Card 4: Core Skills & Skills For (Categories/Roles) */}
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
                {skills.map((skill, idx) => (
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

          {/* Card 5: Experience, Education & Courses */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-6 shadow-sm">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                Work Experience & Credentials
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Add your career history, degrees, and certified courses
              </p>
            </div>

            {/* Work Experience */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/70 pb-2">
                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Work Experience
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
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Description & Achievements
                    </Label>
                    <Input
                      placeholder="Key deliverables and impact..."
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
              ))}

              {experience.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-1">
                  No work experience listed.
                </p>
              )}
            </div>

            {/* Education */}
            <div className="space-y-4 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between border-b border-border/70 pb-2">
                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Education & Degrees
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEducation([
                      ...education,
                      {
                        id: Date.now().toString(),
                        degree: "",
                        institution: "",
                        year: "",
                      },
                    ])
                  }
                  className="gap-1.5 text-xs rounded-xl h-8"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Degree
                </Button>
              </div>

              {education.map((edu, index) => (
                <div
                  key={edu.id || index}
                  className="p-4 border border-border rounded-xl bg-background/40 relative grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setEducation(education.filter((_, i) => i !== index))
                    }
                    className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Degree / Major
                    </Label>
                    <Input
                      placeholder="E.g. B.S. in CSE"
                      value={edu.degree || ""}
                      onChange={(e) => {
                        const newEdu = [...education];
                        newEdu[index].degree = e.target.value;
                        setEducation(newEdu);
                      }}
                      className="bg-background/70 border-border h-9 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Institution
                    </Label>
                    <Input
                      placeholder="E.g. University"
                      value={edu.institution || ""}
                      onChange={(e) => {
                        const newEdu = [...education];
                        newEdu[index].institution = e.target.value;
                        setEducation(newEdu);
                      }}
                      className="bg-background/70 border-border h-9 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Graduation Year
                    </Label>
                    <Input
                      type="number"
                      placeholder="E.g. 2020"
                      value={edu.year || ""}
                      onChange={(e) => {
                        const newEdu = [...education];
                        newEdu[index].year = e.target.value;
                        setEducation(newEdu);
                      }}
                      className="bg-background/70 border-border h-9 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))}

              {education.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-1">
                  No education listed.
                </p>
              )}
            </div>

            {/* Courses & Certifications */}
            <div className="space-y-4 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between border-b border-border/70 pb-2">
                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Courses & Certifications
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCourses([
                      ...courses,
                      {
                        id: Date.now().toString(),
                        title: "",
                        provider: "",
                        year: "",
                      },
                    ])
                  }
                  className="gap-1.5 text-xs rounded-xl h-8"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Course
                </Button>
              </div>

              {courses.map((course, index) => (
                <div
                  key={course.id || index}
                  className="p-4 border border-border rounded-xl bg-background/40 relative grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setCourses(courses.filter((_, i) => i !== index))
                    }
                    className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Course Title
                    </Label>
                    <Input
                      placeholder="E.g. Advanced System Design"
                      value={course.title || ""}
                      onChange={(e) => {
                        const newCourses = [...courses];
                        newCourses[index].title = e.target.value;
                        setCourses(newCourses);
                      }}
                      className="bg-background/70 border-border h-9 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Platform / Provider
                    </Label>
                    <Input
                      placeholder="E.g. Coursera / AWS"
                      value={course.provider || ""}
                      onChange={(e) => {
                        const newCourses = [...courses];
                        newCourses[index].provider = e.target.value;
                        setCourses(newCourses);
                      }}
                      className="bg-background/70 border-border h-9 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Year Completed
                    </Label>
                    <Input
                      type="number"
                      placeholder="E.g. 2023"
                      value={course.year || ""}
                      onChange={(e) => {
                        const newCourses = [...courses];
                        newCourses[index].year = e.target.value;
                        setCourses(newCourses);
                      }}
                      className="bg-background/70 border-border h-9 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))}

              {courses.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-1">
                  No courses added yet.
                </p>
              )}
            </div>
          </div>

          {/* Card 6: Connected Networks & Presence */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-5 shadow-sm">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
                Connected Networks & Presence
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Link your active developer and design channels
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* LinkedIn */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  LinkedIn Profile
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <FaLinkedin className="w-4 h-4" />
                  </div>
                  <Input
                    value={socialLinkedin}
                    onChange={(e) => setSocialLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="pl-9 bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* GitHub */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  GitHub Organization
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <FaGithub className="w-4 h-4" />
                  </div>
                  <Input
                    value={socialGithub}
                    onChange={(e) => setSocialGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="pl-9 bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* X (Twitter) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  X (Twitter)
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <FaTwitter className="w-4 h-4" />
                  </div>
                  <Input
                    value={socialTwitter}
                    onChange={(e) => setSocialTwitter(e.target.value)}
                    placeholder="@username"
                    className="pl-9 bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Portfolio Domain */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Portfolio Domain
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <FaGlobe className="w-4 h-4" />
                  </div>
                  <Input
                    value={socialPortfolio}
                    onChange={(e) => setSocialPortfolio(e.target.value)}
                    placeholder="yourdomain.design"
                    className="pl-9 bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Direct WhatsApp */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Direct WhatsApp
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <FaWhatsapp className="w-4 h-4" />
                  </div>
                  <Input
                    value={socialWhatsapp}
                    onChange={(e) => setSocialWhatsapp(e.target.value)}
                    placeholder="+88017XXXXXXXX"
                    className="pl-9 bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Discord Handle */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Discord Handle
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <FaDiscord className="w-4 h-4" />
                  </div>
                  <Input
                    value={socialDiscord}
                    onChange={(e) => setSocialDiscord(e.target.value)}
                    placeholder="username#1234"
                    className="pl-9 bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Identity Verification */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-foreground text-base tracking-tight">
                  Identity Verification
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Verify your government-issued identity to receive the Verified
                  Talent badge and unlock instant payouts.
                </p>
              </div>
            </div>

            {/* Document Type Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                Document Type
              </Label>
              <Select value={idType} onValueChange={setIdType}>
                <SelectTrigger className="bg-background/50 border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary h-10 rounded-xl text-xs">
                  <SelectValue placeholder="Select ID Type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="nid">National ID / NID</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="driving">Driving License</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Front of Document (NOT DELETABLE once uploaded per user instruction) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Front of Document
                </Label>
                {frontId && (
                  <span
                    className={`text-[11px] font-semibold flex items-center gap-1 ${
                      isVerified ? "text-primary" : "text-amber-500"
                    }`}
                  >
                    {isVerified ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified & Locked
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        Uploaded • Pending Review
                      </>
                    )}
                  </span>
                )}
              </div>

              {frontId ? (
                <div className="bg-background/60 border border-border rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      {frontId.previewUrl ? (
                        <a
                          href={frontId.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-foreground hover:text-primary underline truncate block"
                          title="Click to view uploaded front document"
                        >
                          {frontId.name || "National ID (Front)"}
                        </a>
                      ) : (
                        <p className="text-xs font-medium text-foreground truncate">
                          {frontId.name || "National ID (Front)"}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        {isVerified
                          ? "Uploaded & Verified • Locked"
                          : "Uploaded • Editable till verified"}
                      </p>
                    </div>
                  </div>

                  {isVerified ? (
                    <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                      Locked
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => frontInputRef.current?.click()}
                        disabled={uploadingFront}
                        className="text-xs text-primary hover:underline font-semibold"
                      >
                        Change
                      </button>
                      <input
                        ref={frontInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleFrontUpload}
                      />
                    </div>
                  )}
                </div>
              ) : uploadingFront ? (
                <div className="border border-border bg-background/30 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
                  <p className="text-xs font-semibold text-foreground">
                    Uploading Front Document...
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Encrypting and uploading to secure KYC storage
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => frontInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary/50 bg-background/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                >
                  <input
                    ref={frontInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleFrontUpload}
                  />
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors text-muted-foreground">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    Upload Document Front
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    PNG, JPG, or PDF (max 10MB)
                  </p>
                  <span className="text-xs font-semibold text-primary hover:underline mt-2">
                    Browse Files
                  </span>
                </div>
              )}
            </div>

            {/* Back of Document */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Back of Document
                </Label>
                {backId && (
                  <span
                    className={`text-[11px] font-semibold flex items-center gap-1 ${
                      isVerified ? "text-primary" : "text-amber-500"
                    }`}
                  >
                    {isVerified ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified & Locked
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        Uploaded • Pending Review
                      </>
                    )}
                  </span>
                )}
              </div>

              {backId ? (
                <div className="bg-background/60 border border-border rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      {backId.previewUrl ? (
                        <a
                          href={backId.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-foreground hover:text-primary underline truncate block"
                          title="Click to view uploaded back document"
                        >
                          {backId.name || "National ID (Back)"}
                        </a>
                      ) : (
                        <p className="text-xs font-medium text-foreground truncate">
                          {backId.name || "National ID (Back)"}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        {backId.size ? `${backId.size} • ` : ""}
                        {isVerified
                          ? "Uploaded & Verified • Locked"
                          : "Uploaded • Editable till verified"}
                      </p>
                    </div>
                  </div>

                  {isVerified ? (
                    <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                      Locked
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => backInputRef.current?.click()}
                        disabled={uploadingBack}
                        className="text-xs text-primary hover:underline font-semibold"
                      >
                        Change
                      </button>
                      <input
                        ref={backInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleBackUpload}
                      />
                    </div>
                  )}
                </div>
              ) : uploadingBack ? (
                <div className="border border-border bg-background/30 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
                  <p className="text-xs font-semibold text-foreground">
                    Uploading Back Document...
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Encrypting and uploading to secure KYC storage
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => backInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary/50 bg-background/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                >
                  <input
                    ref={backInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleBackUpload}
                  />
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors text-muted-foreground">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    Upload Document Reverse
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    PNG, JPG, or PDF (max 10MB)
                  </p>
                  <span className="text-xs font-semibold text-primary hover:underline mt-2">
                    Browse Files
                  </span>
                </div>
              )}
            </div>

            {/* Institutional AES Storage Callout */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex items-start gap-3">
              <Lock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-foreground">
                  Institutional 256-Bit AES Storage
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Data is encrypted in compliant cold storage vaults. Never
                  shared with third parties or advertisers.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Trust & Verification Status */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-foreground text-base tracking-tight">
              Trust & Verification Status
            </h3>

            <div className="space-y-3 pt-1">
              {/* Email Address */}
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="flex items-center gap-2 text-xs text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  Email Address
                </span>
                <span className="text-xs font-mono text-muted-foreground truncate max-w-[170px]">
                  {email || "Not provided"}
                </span>
              </div>

              {/* Phone Number */}
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="flex items-center gap-2 text-xs text-foreground font-medium">
                  {phoneNumber && isVerified ? (
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : (
                    <Clock
                      className={`w-4 h-4 flex-shrink-0 ${
                        phoneNumber ? "text-amber-500" : "text-muted-foreground"
                      }`}
                    />
                  )}
                  Phone Number
                </span>
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                  {phoneNumber
                    ? `${phoneCode} ${phoneNumber.slice(-4).padStart(phoneNumber.length, "•")}`
                    : "Not provided"}
                  {phoneNumber && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-sans ${
                        isVerified
                          ? "text-primary bg-primary/10 border border-primary/20 font-semibold"
                          : "text-amber-500 bg-amber-500/10 border border-amber-500/20 font-medium"
                      }`}
                    >
                      {isVerified ? "Verified" : "Pending"}
                    </span>
                  )}
                </span>
              </div>

              {/* Government ID Review */}
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-xs text-foreground font-medium">
                  {isVerified ? (
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                  Government ID Review
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                    isVerified
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {isVerified
                    ? "Verified"
                    : frontId && !backId
                      ? "Pending Back Scan"
                      : frontId && backId
                        ? "Under Review"
                        : "Not Uploaded"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating / Sticky Save Action Bar */}
      <div className="sticky bottom-6 bg-card/90 backdrop-blur-xl border border-border p-4 rounded-2xl flex items-center justify-end gap-3 shadow-2xl z-50">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            toast.info("Reverted unsaved changes");
            if (onProfileUpdate) onProfileUpdate();
          }}
          className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-medium px-4"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 text-xs md:text-sm shadow-lg shadow-primary/20 disabled:opacity-70 rounded-xl"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving to Database...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
