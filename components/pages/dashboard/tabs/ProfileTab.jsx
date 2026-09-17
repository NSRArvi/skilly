"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Plus, UploadCloud } from "lucide-react";
import { createClient } from "../../../../lib/client";

import { FaFacebook, FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";

import { toast } from "sonner";

export default function ProfileTab({ onProfileUpdate }) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [gender, setGender] = useState("prefer-not");
  const [phoneCode, setPhoneCode] = useState("+880");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");

  const [presentAddress, setPresentAddress] = useState({
    country: "",
    state: "",
    city: "",
    zipcode: "",
    fullAddress: "",
  });
  const [permanentAddress, setPermanentAddress] = useState({
    country: "",
    state: "",
    city: "",
    zipcode: "",
    fullAddress: "",
  });

  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [socialGithub, setSocialGithub] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");

  const [idType, setIdType] = useState("nid");

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [courses, setCourses] = useState([]);

  const [isGoogleAuth, setIsGoogleAuth] = useState(false);

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  const [skillsFor, setSkillsFor] = useState([]);
  const [newSkillFor, setNewSkillFor] = useState("");

  const [frontId, setFrontId] = useState(null);
  const [backId, setBackId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);

        let defaultEmail = data.user.email || "";
        let defaultName = "";

        // If Google Auth, extract name and lock inputs
        if (data.user.app_metadata?.provider === "google") {
          setIsGoogleAuth(true);
          defaultName = data.user.user_metadata?.full_name || "";
        }

        // Fetch existing professional data
        const { data: profDataArray } = await supabase
          .from("professionals")
          .select("*")
          .eq("user_id", data.user.id)
          .limit(1);

        const profData = profDataArray?.[0];

        if (profData) {
          setFullName(profData.full_name || defaultName);
          setEmail(profData.email || defaultEmail);
          setProfession(profData.profession || "");
          setHourlyRate(
            profData.hourly_rate ? String(profData.hourly_rate) : "",
          );
          setDailyRate(profData.daily_rate ? String(profData.daily_rate) : "");
          setDateOfBirth(profData.date_of_birth || "");
          setExperience(profData.experience || []);
          setEducation(profData.education || []);
          setCourses(profData.courses || []);
          setRatingMessage(profData.rating_message || "");
          setPresentAddress(
            profData.present_address || {
              country: "",
              state: "",
              city: "",
              zipcode: "",
              fullAddress: "",
            },
          );
          setPermanentAddress(
            profData.permanent_address || {
              country: "",
              state: "",
              city: "",
              zipcode: "",
              fullAddress: "",
            },
          );
          setBio(profData.bio || "");
          setGender(profData.gender || "prefer-not");
          setPhoneCode(profData.phone_code || "+880");
          setPhoneNumber(profData.phone_number || "");
          setSkills(profData.skills || []);
          setSkillsFor(profData.skills_for || []);
          setSocialLinkedin(profData.social_linkedin || "");
          setSocialGithub(profData.social_github || "");
          setSocialTwitter(profData.social_twitter || "");
          setSocialFacebook(profData.social_facebook || "");
          setIdType(profData.id_type || "nid");

          if (profData.id_front_url) {
            setFrontId({
              previewUrl: profData.id_front_url,
              name: "Previously Uploaded Front ID",
            });
          }
          if (profData.id_back_url) {
            setBackId({
              previewUrl: profData.id_back_url,
              name: "Previously Uploaded Back ID",
            });
          }
        } else {
          setFullName(defaultName);
          setEmail(defaultEmail);
        }
      }
    };
    fetchUser();
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddSkillFor = (e) => {
    e.preventDefault();
    if (newSkillFor.trim() && !skillsFor.includes(newSkillFor.trim())) {
      setSkillsFor([...skillsFor, newSkillFor.trim()]);
      setNewSkillFor("");
    }
  };

  const handleRemoveSkillFor = (skillToRemove) => {
    setSkillsFor(skillsFor.filter((s) => s !== skillToRemove));
  };

  const handleFileDrop = (e, setFile) => {
    e.preventDefault();
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFile({ file, previewUrl, name: file.name });
    }
  };

  const uploadFile = async (file, suffix) => {
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${suffix}-${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("kyc-documents")
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("kyc-documents").getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const supabase = createClient();

    let frontUrl = null;
    let backUrl = null;

    if (frontId?.file) {
      frontUrl = await uploadFile(frontId.file, "front");
    }

    if (backId?.file) {
      backUrl = await uploadFile(backId.file, "back");
    }

    const updateData = {
      user_id: user.id,
      full_name: fullName,
      email: email,
      profession: profession,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
      daily_rate: dailyRate ? parseFloat(dailyRate) : null,
      date_of_birth: dateOfBirth || null,
      experience: experience,
      education: education,
      courses: courses,
      present_address: presentAddress,
      permanent_address: permanentAddress,
      bio: bio,
      gender: gender,
      phone_code: phoneCode,
      phone_number: phoneNumber,
      skills: skills,
      skills_for: skillsFor,
      social_linkedin: socialLinkedin,
      social_github: socialGithub,
      social_twitter: socialTwitter,
      social_facebook: socialFacebook,
      id_type: idType,
    };

    if (frontUrl) updateData.id_front_url = frontUrl;
    if (backUrl) updateData.id_back_url = backUrl;

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

  return (
    <form onSubmit={handleSave} className="space-y-10">
      {/* Basic Information */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold text-foreground">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-foreground">Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="E.g. Alex Sterling"
            />
            {isGoogleAuth && (
              <p className="text-xs text-muted-foreground">
                Provided by Google
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Email</Label>
            <Input
              value={email}
              readOnly
              className="bg-background border-border text-foreground opacity-70 cursor-not-allowed"
              placeholder="Email address"
            />
            <p className="text-xs text-muted-foreground">
              Managed by your authentication provider
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Profession</Label>
            <Input
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="E.g. Frontend Developer"
              className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Hourly Rate ($)</Label>
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="E.g. 50 (or Negotiable)"
              className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Daily Rate ($)</Label>
            <Input
              type="number"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              placeholder="E.g. 400 (or Negotiable)"
              className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground text-sm font-semibold">
              Date of Birth
            </Label>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Gender / Sex</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Phone Number</Label>
            <div className="flex gap-2">
              <Select value={phoneCode} onValueChange={setPhoneCode}>
                <SelectTrigger className="w-[100px] bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="+1">+1 (US)</SelectItem>
                  <SelectItem value="+44">+44 (UK)</SelectItem>
                  <SelectItem value="+880">+880 (BD)</SelectItem>
                  <SelectItem value="+91">+91 (IN)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="17XXXXXXXX"
                className="flex-1 bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold text-foreground">
          Address Information
        </h2>

        {/* Present Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            Present Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold">
                Country
              </Label>
              <Input
                value={presentAddress.country}
                onChange={(e) =>
                  setPresentAddress({
                    ...presentAddress,
                    country: e.target.value,
                  })
                }
                placeholder="E.g. USA"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold">
                State / Province
              </Label>
              <Input
                value={presentAddress.state}
                onChange={(e) =>
                  setPresentAddress({
                    ...presentAddress,
                    state: e.target.value,
                  })
                }
                placeholder="E.g. California"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold">
                City
              </Label>
              <Input
                value={presentAddress.city}
                onChange={(e) =>
                  setPresentAddress({ ...presentAddress, city: e.target.value })
                }
                placeholder="E.g. San Francisco"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold">
                Zip/Postal Code
              </Label>
              <Input
                value={presentAddress.zipcode}
                onChange={(e) =>
                  setPresentAddress({
                    ...presentAddress,
                    zipcode: e.target.value,
                  })
                }
                placeholder="E.g. 94105"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-muted-foreground text-xs font-semibold">
                Full Address
              </Label>
              <Input
                value={presentAddress.fullAddress}
                onChange={(e) =>
                  setPresentAddress({
                    ...presentAddress,
                    fullAddress: e.target.value,
                  })
                }
                placeholder="E.g. 123 Main St, Apt 4B"
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Permanent Address */}
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            Permanent Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold">
                Country
              </Label>
              <Input
                value={permanentAddress.country}
                onChange={(e) =>
                  setPermanentAddress({
                    ...permanentAddress,
                    country: e.target.value,
                  })
                }
                placeholder="E.g. USA"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold">
                State / Province
              </Label>
              <Input
                value={permanentAddress.state}
                onChange={(e) =>
                  setPermanentAddress({
                    ...permanentAddress,
                    state: e.target.value,
                  })
                }
                placeholder="E.g. California"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold">
                City
              </Label>
              <Input
                value={permanentAddress.city}
                onChange={(e) =>
                  setPermanentAddress({
                    ...permanentAddress,
                    city: e.target.value,
                  })
                }
                placeholder="E.g. San Francisco"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold">
                Zip/Postal Code
              </Label>
              <Input
                value={permanentAddress.zipcode}
                onChange={(e) =>
                  setPermanentAddress({
                    ...permanentAddress,
                    zipcode: e.target.value,
                  })
                }
                placeholder="E.g. 94105"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-muted-foreground text-xs font-semibold">
                Full Address
              </Label>
              <Input
                value={permanentAddress.fullAddress}
                onChange={(e) =>
                  setPermanentAddress({
                    ...permanentAddress,
                    fullAddress: e.target.value,
                  })
                }
                placeholder="E.g. 123 Main St, Apt 4B"
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      {/* About & Experience */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold text-foreground">
          Experience & Education
        </h2>
        <div className="space-y-2">
          <Label className="text-foreground">About Me</Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about your background and how you help others..."
            className="min-h-[150px] bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary resize-y"
          />
        </div>

        {/* Dynamic Experience Array */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-foreground text-lg font-semibold">
              Work Experience
            </Label>
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
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Add Role
            </Button>
          </div>
          {experience.map((exp, index) => (
            <div
              key={exp.id}
              className="p-4 border border-border rounded-xl bg-muted/30 relative space-y-4 group"
            >
              <button
                type="button"
                onClick={() =>
                  setExperience(experience.filter((_, i) => i !== index))
                }
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs font-semibold">
                    Job Title
                  </Label>
                  <Input
                    placeholder="E.g. Senior Frontend Developer"
                    value={exp.title}
                    onChange={(e) => {
                      const newExp = [...experience];
                      newExp[index].title = e.target.value;
                      setExperience(newExp);
                    }}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs font-semibold">
                    Company Name
                  </Label>
                  <Input
                    placeholder="E.g. Acme Corp"
                    value={exp.company}
                    onChange={(e) => {
                      const newExp = [...experience];
                      newExp[index].company = e.target.value;
                      setExperience(newExp);
                    }}
                    className="bg-background border-border"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="space-y-1.5 w-full">
                    <Label className="text-muted-foreground text-xs font-semibold">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) => {
                        const newExp = [...experience];
                        newExp[index].startDate = e.target.value;
                        setExperience(newExp);
                      }}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-1.5 w-full">
                    <Label className="text-muted-foreground text-xs font-semibold">
                      End Date
                    </Label>
                    <Input
                      type="date"
                      value={exp.endDate}
                      onChange={(e) => {
                        const newExp = [...experience];
                        newExp[index].endDate = e.target.value;
                        setExperience(newExp);
                      }}
                      className="bg-background border-border"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold">
                  Description
                </Label>
                <Textarea
                  placeholder="Describe your responsibilities, achievements, and technologies used..."
                  value={exp.description}
                  onChange={(e) => {
                    const newExp = [...experience];
                    newExp[index].description = e.target.value;
                    setExperience(newExp);
                  }}
                  className="bg-background border-border min-h-[100px]"
                />
              </div>
            </div>
          ))}
          {experience.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No experience added yet.
            </p>
          )}
        </div>

        {/* Dynamic Education Array */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Label className="text-foreground text-lg font-semibold">
              Education
            </Label>
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
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Add Degree
            </Button>
          </div>
          {education.map((edu, index) => (
            <div
              key={edu.id}
              className="p-4 border border-border rounded-xl bg-muted/30 relative space-y-4 group grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <button
                type="button"
                onClick={() =>
                  setEducation(education.filter((_, i) => i !== index))
                }
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="space-y-1.5 md:col-span-1">
                <Label className="text-muted-foreground text-xs font-semibold">
                  Degree / Certification
                </Label>
                <Input
                  placeholder="E.g. B.S. Computer Science"
                  value={edu.degree}
                  onChange={(e) => {
                    const newEdu = [...education];
                    newEdu[index].degree = e.target.value;
                    setEducation(newEdu);
                  }}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1.5 md:col-span-1">
                <Label className="text-muted-foreground text-xs font-semibold">
                  Institution / University
                </Label>
                <Input
                  placeholder="E.g. MIT"
                  value={edu.institution}
                  onChange={(e) => {
                    const newEdu = [...education];
                    newEdu[index].institution = e.target.value;
                    setEducation(newEdu);
                  }}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1.5 md:col-span-1">
                <Label className="text-muted-foreground text-xs font-semibold">
                  Graduation Year
                </Label>
                <Input
                  type="number"
                  placeholder="E.g. 2020"
                  max={new Date().getFullYear()}
                  value={edu.year}
                  onChange={(e) => {
                    const newEdu = [...education];
                    newEdu[index].year = e.target.value;
                    setEducation(newEdu);
                  }}
                  className="bg-background border-border"
                />
              </div>
            </div>
          ))}
          {education.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No education added yet.
            </p>
          )}
        </div>

        {/* Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-4 mt-8">
            <h3 className="font-semibold text-foreground text-lg">
              Courses & Certifications
            </h3>
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
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Add Course
            </Button>
          </div>
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="p-4 border border-border rounded-xl bg-muted/30 relative space-y-4 group grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
            >
              <button
                type="button"
                onClick={() =>
                  setCourses(courses.filter((_, i) => i !== index))
                }
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="space-y-1.5 md:col-span-1">
                <Label className="text-muted-foreground text-xs font-semibold">
                  Course Title
                </Label>
                <Input
                  placeholder="E.g. Advanced React Patterns"
                  value={course.title}
                  onChange={(e) => {
                    const newCourses = [...courses];
                    newCourses[index].title = e.target.value;
                    setCourses(newCourses);
                  }}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1.5 md:col-span-1">
                <Label className="text-muted-foreground text-xs font-semibold">
                  Provider / Platform
                </Label>
                <Input
                  placeholder="E.g. Coursera"
                  value={course.provider}
                  onChange={(e) => {
                    const newCourses = [...courses];
                    newCourses[index].provider = e.target.value;
                    setCourses(newCourses);
                  }}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1.5 md:col-span-1">
                <Label className="text-muted-foreground text-xs font-semibold">
                  Completion Year
                </Label>
                <Input
                  type="number"
                  placeholder="E.g. 2023"
                  max={new Date().getFullYear()}
                  value={course.year}
                  onChange={(e) => {
                    const newCourses = [...courses];
                    newCourses[index].year = e.target.value;
                    setCourses(newCourses);
                  }}
                  className="bg-background border-border"
                />
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No courses added yet.
            </p>
          )}
        </div>
      </div>

      {/* Skill Sets */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold text-foreground">Core Skills</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill}
                className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 px-3 py-1.5 text-sm gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="Add a skill (e.g. Node.js)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill(e);
                }
              }}
              className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <Button
              type="button"
              onClick={handleAddSkill}
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 space-y-4">
          <h3 className="font-semibold text-foreground text-lg">
            Skills For (Categories/Roles)
          </h3>
          <div className="flex flex-wrap gap-2">
            {skillsFor.map((skillFor) => (
              <Badge
                key={skillFor}
                className="bg-secondary/20 text-secondary-foreground border border-secondary/30 hover:bg-secondary/30 px-3 py-1.5 text-sm gap-2"
              >
                {skillFor}
                <button
                  type="button"
                  onClick={() => handleRemoveSkillFor(skillFor)}
                  className="hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="E.g. Frontend Developer"
              value={newSkillFor}
              onChange={(e) => setNewSkillFor(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkillFor(e);
                }
              }}
              className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <Button
              type="button"
              onClick={handleAddSkillFor}
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold text-foreground">Social Profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-foreground flex items-center gap-2">
              <FaLinkedin /> LinkedIn
            </Label>
            <Input
              value={socialLinkedin}
              onChange={(e) => setSocialLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="bg-background border-border text-muted-foreground focus:text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground flex items-center gap-2">
              <FaGithub className="w-4 h-4 text-foreground" /> GitHub
            </Label>
            <Input
              value={socialGithub}
              onChange={(e) => setSocialGithub(e.target.value)}
              placeholder="https://github.com/username"
              className="bg-background border-border text-muted-foreground focus:text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground flex items-center gap-2">
              <FaTwitter /> Twitter (X)
            </Label>
            <Input
              value={socialTwitter}
              onChange={(e) => setSocialTwitter(e.target.value)}
              placeholder="https://twitter.com/username"
              className="bg-background border-border text-muted-foreground focus:text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground flex items-center gap-2">
              <FaFacebook /> Facebook
            </Label>
            <Input
              value={socialFacebook}
              onChange={(e) => setSocialFacebook(e.target.value)}
              placeholder="https://facebook.com/username"
              className="bg-background border-border text-muted-foreground focus:text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* KYC / Verification */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-xl font-bold text-foreground mb-1">
            Identity Verification (KYC)
          </h2>
          <p className="text-muted-foreground text-sm max-w-2xl">
            To earn a Verified Badge, please submit a valid government ID. Your
            data is encrypted and used solely for verification purposes.
          </p>
        </div>

        <div className="space-y-2 max-w-md relative z-10">
          <Label className="text-foreground">Document Type</Label>
          <Select value={idType} onValueChange={setIdType}>
            <SelectTrigger className="bg-background border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
              <SelectValue placeholder="Select ID Type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="nid">National ID (NID)</SelectItem>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="driving">Driving License</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {/* Front ID Dropzone */}
          <div
            className={`border-2 border-dashed border-border hover:border-primary/50 bg-background rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group overflow-hidden relative min-h-[200px] ${frontId ? "border-primary/50 p-2" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleFileDrop(e, setFrontId)}
            onClick={() => document.getElementById("front-id-upload").click()}
          >
            <input
              type="file"
              id="front-id-upload"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileDrop(e, setFrontId)}
            />
            {frontId?.previewUrl ? (
              <img
                src={frontId.previewUrl}
                alt="Front ID Preview"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <>
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <UploadCloud className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                </div>
                <h4 className="text-foreground font-medium mb-1">
                  Upload Front of ID
                </h4>
                <p className="text-xs text-muted-foreground">
                  Drag & drop or click to browse
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-4">
                  JPG, PNG up to 5MB
                </p>
              </>
            )}
          </div>

          {/* Back ID Dropzone */}
          <div
            className={`border-2 border-dashed border-border hover:border-primary/50 bg-background rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group overflow-hidden relative min-h-[200px] ${backId ? "border-primary/50 p-2" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleFileDrop(e, setBackId)}
            onClick={() => document.getElementById("back-id-upload").click()}
          >
            <input
              type="file"
              id="back-id-upload"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileDrop(e, setBackId)}
            />
            {backId?.previewUrl ? (
              <img
                src={backId.previewUrl}
                alt="Back ID Preview"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <>
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <UploadCloud className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                </div>
                <h4 className="text-foreground font-medium mb-1">
                  Upload Back of ID
                </h4>
                <p className="text-xs text-muted-foreground">
                  Drag & drop or click to browse
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-4">
                  JPG, PNG up to 5MB
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="sticky bottom-6 bg-card/90 backdrop-blur-xl border border-border p-4 rounded-xl flex items-center justify-end gap-4 shadow-2xl z-50">
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 shadow-lg shadow-primary/20 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
