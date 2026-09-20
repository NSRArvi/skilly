"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Tag,
  X,
  Loader2,
} from "lucide-react";
import { Country, State, City } from "country-state-city";
import { createClient } from "@/lib/client";
import { toast } from "sonner";
import Link from "next/link";

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // Form state
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [locationType, setLocationType] = useState("remote");
  const [countryCode, setCountryCode] = useState("BD");
  const [country, setCountry] = useState("Bangladesh");
  const [stateCode, setStateCode] = useState("");
  const [stateName, setStateName] = useState("");
  const [cityName, setCityName] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [jobType, setJobType] = useState("full-time");
  const [status, setStatus] = useState("running");
  const [priority, setPriority] = useState("regular");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("BDT");
  const [salaryPeriod, setSalaryPeriod] = useState("monthly");
  const [officeDays, setOfficeDays] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [startTime, setStartTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [deadline, setDeadline] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

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

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to edit a job");
        router.push("/jobs");
        return;
      }

      const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single();
      
      if (error || !data) {
        toast.error("Job not found");
        router.push("/jobs");
        return;
      }

      if (data.user_id !== user.id) {
        toast.error("You don't have permission to edit this job");
        router.push(`/jobs/${id}`);
        return;
      }

      // Populate form
      setTitle(data.title || "");
      setCompanyName(data.company_name || "");
      setDescription(data.description || "");
      setCategoryId(data.category_id || "");
      setSubcategoryId(data.subcategory_id || "");
      setLocationType(data.location_type || "remote");
      setCountry(data.country || "");
      setCountryCode(data.country_code || "");
      setStateName(data.state || "");
      setStateCode(data.state_code || "");
      setCityName(data.city || "");
      setFullAddress(data.full_address || "");
      setJobType(data.job_type || "full-time");
      setStatus(data.status || "running");
      setPriority(data.priority || "regular");
      setSalaryMin(data.salary_min ? data.salary_min.toString() : "");
      setSalaryMax(data.salary_max ? data.salary_max.toString() : "");
      setSalaryCurrency(data.salary_currency || "BDT");
      setSalaryPeriod(data.salary_period || "monthly");
      setOfficeDays(data.office_days || "");
      setWorkHours(data.work_hours_per_week ? data.work_hours_per_week.toString() : "");
      setStartTime(data.start_time || "");
      setCloseTime(data.close_time || "");
      setDeadline(data.application_deadline ? new Date(data.application_deadline).toISOString().split('T')[0] : "");
      setSkills(data.skills || []);

      setLoading(false);
    };
    fetchJob();
  }, [id, router]);


  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Job title is required");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    
    const payload = {
      title: title.trim(),
      company_name: companyName.trim() || null,
      description: description.trim() || null,
      category_id: categoryId || null,
      subcategory_id: subcategoryId || null,
      skills,
      location_type: locationType,
      country: country || null,
      country_code: countryCode || null,
      state: stateName || null,
      state_code: stateCode || null,
      city: cityName || null,
      full_address: fullAddress.trim() || null,
      job_type: jobType,
      status,
      priority,
      salary_min: salaryMin ? parseInt(salaryMin) : null,
      salary_max: salaryMax ? parseInt(salaryMax) : null,
      salary_currency: salaryCurrency,
      salary_period: salaryPeriod,
      office_days: officeDays || null,
      work_hours_per_week: workHours ? parseInt(workHours) : null,
      start_time: startTime || null,
      close_time: closeTime || null,
      application_deadline: deadline || null,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from("jobs").update(payload).eq("id", id);

    if (error) {
      toast.error("Failed to update job: " + error.message);
    } else {
      toast.success("Job updated successfully!");
      router.push(`/jobs/${id}`);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sectionClass = "bg-card border border-border rounded-2xl p-5 md:p-6 space-y-4 shadow-sm";
  const labelClass = "text-xs font-semibold text-foreground";
  const inputClass = "bg-background/50 border-border text-foreground h-10 rounded-xl text-sm";
  const selectTriggerClass = "bg-background/50 border-border text-foreground h-10 rounded-xl text-sm";

  return (
    <div className="min-h-screen bg-background py-10 md:py-14">
      <Container>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/jobs/${id}`}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Edit Job
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Update your job listing details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column — Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className={sectionClass}>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Basic Information
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className={labelClass}>Job Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Developer"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Company Name</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Skilly Inc."
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Description</Label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={5}
                    className="w-full bg-background/50 border border-border text-foreground rounded-xl text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Category & Subcategory */}
            <div className={sectionClass}>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                Category & Skills
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className={labelClass}>Category</Label>
                  <Select value={categoryId} onValueChange={(val) => { setCategoryId(val); setSubcategoryId(""); }}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Select category">
                        {categories.find(c => c.id === categoryId)?.name || "Select category"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Subcategory</Label>
                  <Select value={subcategoryId} onValueChange={setSubcategoryId} disabled={!categoryId}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Select subcategory">
                        {subcategories.find(s => s.id === subcategoryId)?.name || "Select subcategory"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {subcategories.filter(s => s.category_id === categoryId).map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Skills Input */}
              <div className="space-y-1.5">
                <Label className={labelClass}>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    placeholder="Type a skill and press Enter"
                    className={inputClass + " flex-1"}
                  />
                  <Button type="button" onClick={addSkill} variant="outline" className="h-10 rounded-xl px-4 text-xs font-semibold">
                    Add
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {skills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted/60 border border-border/60 rounded-lg text-xs font-medium text-foreground">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="text-muted-foreground hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className={sectionClass}>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Location
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className={labelClass}>Location Type</Label>
                  <Select value={locationType} onValueChange={setLocationType}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Country</Label>
                  <Select value={countryCode} onValueChange={(val) => {
                    const c = Country.getCountryByCode(val);
                    setCountryCode(val);
                    setCountry(c?.name || "");
                    setStateCode(""); setStateName(""); setCityName("");
                  }}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder="Select Country">
                        {country || "Select Country"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {Country.getAllCountries().map(c => (
                        <SelectItem key={c.isoCode} value={c.isoCode}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {countryCode && (
                  <div className="space-y-1.5">
                    <Label className={labelClass}>State / Division</Label>
                    <Select value={stateCode} onValueChange={(val) => {
                      const s = State.getStateByCodeAndCountry(val, countryCode);
                      setStateCode(val);
                      setStateName(s?.name || "");
                      setCityName("");
                    }}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Select Division">
                          {stateName || "Select Division"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground">
                        {State.getStatesOfCountry(countryCode).map(s => (
                          <SelectItem key={s.isoCode} value={s.isoCode}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {stateCode && countryCode && (
                  <div className="space-y-1.5">
                    <Label className={labelClass}>City</Label>
                    <Select value={cityName} onValueChange={setCityName}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Select City">
                          {cityName || "Select City"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground">
                        {City.getCitiesOfState(countryCode, stateCode).map(c => (
                          <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className={labelClass}>Full Address (Optional)</Label>
                  <Input
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="e.g. 123 Tech Park, Block B"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Config & Actions */}
          <div className="space-y-6">
            {/* Job Config */}
            <div className={sectionClass}>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Job Configuration
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className={labelClass}>Job Type</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="part-time">Part-Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="opening_soon">Opening Soon</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="over">Over</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Application Deadline</Label>
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Compensation */}
            <div className={sectionClass}>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="font-bold text-primary text-lg leading-none">৳</span>
                Compensation
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Min Salary</Label>
                    <Input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="e.g. 30000" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Max Salary</Label>
                    <Input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="e.g. 60000" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Currency</Label>
                    <Select value={salaryCurrency} onValueChange={setSalaryCurrency}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground">
                        <SelectItem value="BDT">BDT (৳)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Period</Label>
                    <Select value={salaryPeriod} onValueChange={setSalaryPeriod}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-card border-border text-foreground">
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="project">Per Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className={sectionClass}>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Schedule
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className={labelClass}>Office Days</Label>
                  <Input value={officeDays} onChange={(e) => setOfficeDays(e.target.value)} placeholder="e.g. Sun-Thu" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Work Hours / Week</Label>
                  <Input type="number" value={workHours} onChange={(e) => setWorkHours(e.target.value)} placeholder="e.g. 40" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Start Time</Label>
                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelClass}>Close Time</Label>
                    <Input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm shadow-md shadow-primary/20 transition-all"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
