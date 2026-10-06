"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "../../../../lib/client";
import { getMyKycSignedUrls } from "@/lib/actions/media";

import BasicInfoSection from "./profile/BasicInfoSection";
import AddressSection from "./profile/AddressSection";
import BioSection from "./profile/BioSection";
import SkillsSection from "./profile/SkillsSection";
import ExperienceSection from "./profile/ExperienceSection";
import EducationSection from "./profile/EducationSection";
import SocialLinksSection from "./profile/SocialLinksSection";
import KycSection from "./profile/KycSection";
import ProfileSidebarCard from "./profile/ProfileSidebarCard";

export default function ProfileTab({ onProfileUpdate }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState(null);

  // 1. Basic Information States
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
  const [isSameAddress, setIsSameAddress] = useState(false);

  // 3. Skills & Categories States
  const [skills, setSkills] = useState([]);
  const [skillsFor, setSkillsFor] = useState([]);
  const [languages, setLanguages] = useState([]);

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
  const [isVerified, setIsVerified] = useState(false);

  // Fetch initial profile & taxonomy data
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        setUser(authUser);
        setEmail(authUser.email || "");

        const defaultName =
          authUser.user_metadata?.full_name ||
          authUser.email?.split("@")[0] ||
          "";

        const { data: profData } = await supabase
          .from("professionals")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();

        if (profData) {
          setFullName(profData.full_name || defaultName);
          setProfession(profData.profession || "");
          setHourlyRate(profData.hourly_rate ? String(profData.hourly_rate) : "");
          setDailyRate(profData.daily_rate ? String(profData.daily_rate) : "");
          setDateOfBirth(profData.date_of_birth || "");
          setGender(profData.gender || "prefer-not");
          setPhoneCode("+880");
          let rawPhone = (profData.phone_number || "").replace(/\D/g, "");
          if (rawPhone.startsWith("880")) rawPhone = rawPhone.slice(3);
          if (rawPhone.startsWith("0")) rawPhone = rawPhone.slice(1);
          setPhoneNumber(rawPhone.slice(0, 10));
          setBioTagline(profData.rating_message || "");
          setAboutText(profData.bio || "");
          setSelectedCategory(profData.category_id || "");
          setSelectedSubcategory(profData.subcategory_id || "");

          if (profData.present_address) {
            setPresentAddress({
              country: profData.present_address.country || "Bangladesh",
              countryCode: profData.present_address.countryCode || "BD",
              state: profData.present_address.state || "",
              stateCode: profData.present_address.stateCode || "",
              city: profData.present_address.city || "",
              zipcode: profData.present_address.zipcode || "",
              fullAddress: profData.present_address.fullAddress || "",
            });
            setSocialPortfolio(profData.present_address.portfolio || "");
            setSocialWhatsapp(profData.present_address.whatsapp || "");
            setSocialDiscord(profData.present_address.discord || "");
          }

          if (profData.permanent_address) {
            setPermanentAddress({
              country: profData.permanent_address.country || "Bangladesh",
              countryCode: profData.permanent_address.countryCode || "BD",
              state: profData.permanent_address.state || "",
              stateCode: profData.permanent_address.stateCode || "",
              city: profData.permanent_address.city || "",
              zipcode: profData.permanent_address.zipcode || "",
              fullAddress: profData.permanent_address.fullAddress || "",
            });

            if (
              profData.present_address &&
              JSON.stringify(profData.present_address) ===
                JSON.stringify(profData.permanent_address)
            ) {
              setIsSameAddress(true);
            }
          }

          if (Array.isArray(profData.skills)) setSkills(profData.skills);
          if (Array.isArray(profData.skills_for)) setSkillsFor(profData.skills_for);
          if (Array.isArray(profData.languages)) setLanguages(profData.languages);
          if (Array.isArray(profData.experience)) setExperience(profData.experience);
          if (Array.isArray(profData.education)) setEducation(profData.education);
          if (Array.isArray(profData.courses)) setCourses(profData.courses);

          setSocialLinkedin(profData.social_linkedin || "");
          setSocialGithub(profData.social_github || "");
          setSocialTwitter(profData.social_twitter || "");
          setIdType(profData.id_type || "nid");
          const verifiedStatus = Boolean(
            profData.is_verified ?? profData.is_verify ?? false
          );
          setIsVerified(verifiedStatus);

          if (profData.id_front_url || profData.id_back_url) {
            getMyKycSignedUrls().then((kycRes) => {
              if (kycRes.success) {
                if (profData.id_front_url) {
                  setFrontId({
                    name: "National ID (Front)",
                    previewUrl: kycRes.frontSignedUrl,
                    storageUrl: profData.id_front_url,
                    verified: verifiedStatus,
                  });
                }
                if (profData.id_back_url) {
                  setBackId({
                    name: "National ID (Back)",
                    previewUrl: kycRes.backSignedUrl,
                    storageUrl: profData.id_back_url,
                  });
                }
              }
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
    };

    fetchTaxonomy();
  }, []);

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

    const cleanPhone = (phoneNumber || "").replace(/\D/g, "");
    if (cleanPhone && cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit Bangladesh mobile number (e.g. 17XXXXXXXX)");
      setIsSaving(false);
      return;
    }

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
      permanent_address: isSameAddress ? presentAddress : permanentAddress,
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

    if (frontId?.storageUrl) {
      updateData.id_front_url = frontId.storageUrl;
    } else if (
      frontId?.previewUrl &&
      !frontId.previewUrl.includes("?token=") &&
      !frontId.previewUrl.startsWith("blob:")
    ) {
      updateData.id_front_url = frontId.previewUrl;
    }

    if (backId?.storageUrl) {
      updateData.id_back_url = backId.storageUrl;
    } else if (
      backId?.previewUrl &&
      !backId.previewUrl.includes("?token=") &&
      !backId.previewUrl.startsWith("blob:")
    ) {
      updateData.id_back_url = backId.previewUrl;
    }

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
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-8 space-y-6">
          <BasicInfoSection
            fullName={fullName}
            setFullName={setFullName}
            gender={gender}
            setGender={setGender}
            profession={profession}
            setProfession={setProfession}
            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}
            categories={categories}
            subcategories={subcategories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
            hourlyRate={hourlyRate}
            setHourlyRate={setHourlyRate}
            dailyRate={dailyRate}
            setDailyRate={setDailyRate}
            phoneCode={phoneCode}
            setPhoneCode={setPhoneCode}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            isVerified={isVerified}
            bioTagline={bioTagline}
            setBioTagline={setBioTagline}
          />

          <AddressSection
            presentAddress={presentAddress}
            setPresentAddress={setPresentAddress}
            permanentAddress={permanentAddress}
            setPermanentAddress={setPermanentAddress}
            isSameAddress={isSameAddress}
            setIsSameAddress={setIsSameAddress}
          />

          <BioSection aboutText={aboutText} setAboutText={setAboutText} />

          <SkillsSection
            skills={skills}
            setSkills={setSkills}
            skillsFor={skillsFor}
            setSkillsFor={setSkillsFor}
            languages={languages}
            setLanguages={setLanguages}
          />

          <ExperienceSection
            experience={experience}
            setExperience={setExperience}
          />

          <EducationSection
            education={education}
            setEducation={setEducation}
            courses={courses}
            setCourses={setCourses}
          />

          <SocialLinksSection
            socialLinkedin={socialLinkedin}
            setSocialLinkedin={setSocialLinkedin}
            socialGithub={socialGithub}
            setSocialGithub={setSocialGithub}
            socialTwitter={socialTwitter}
            setSocialTwitter={setSocialTwitter}
            socialPortfolio={socialPortfolio}
            setSocialPortfolio={setSocialPortfolio}
            socialWhatsapp={socialWhatsapp}
            setSocialWhatsapp={setSocialWhatsapp}
            socialDiscord={socialDiscord}
            setSocialDiscord={setSocialDiscord}
          />
        </div>

        {/* ================= RIGHT COLUMN (SIDEBAR) ================= */}
        <div className="lg:col-span-4 space-y-6">
          <KycSection
            idType={idType}
            setIdType={setIdType}
            frontId={frontId}
            setFrontId={setFrontId}
            backId={backId}
            setBackId={setBackId}
            isVerified={isVerified}
            onProfileUpdate={onProfileUpdate}
          />

          <ProfileSidebarCard
            email={email}
            phoneCode={phoneCode}
            phoneNumber={phoneNumber}
            isVerified={isVerified}
            frontId={frontId}
            backId={backId}
          />
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
