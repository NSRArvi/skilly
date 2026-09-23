"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List as ListIcon,
  Eye,
  X,
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  Users,
  Filter,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  toggleJobVerification,
  getJobApplicationsForAdmin,
} from "../../actions";
import {
  AdminTableSkeleton,
  AdminGridSkeleton,
} from "@/components/shared/AdminSkeletons";

export default function JobsAdmin() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState({
    data: [],
    loading: false,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");

  const supabase = createClient();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (jobsError) {
      toast.error(jobsError.message);
      setLoading(false);
      return;
    }

    if (!jobsData || jobsData.length === 0) {
      setJobs([]);
      setLoading(false);
      return;
    }

    // Extract unique user IDs
    const userIds = [
      ...new Set(jobsData.map((j) => j.user_id).filter(Boolean)),
    ];

    // Fetch corresponding professional profiles manually to avoid schema cache errors
    const { data: profilesData } = await supabase
      .from("professionals")
      .select("user_id, full_name, avatar_url")
      .in("user_id", userIds);

    const profilesMap = {};
    if (profilesData) {
      profilesData.forEach((p) => {
        profilesMap[p.user_id] = p;
      });
    }

    // Attach professional data to jobs
    const jobsWithProfiles = jobsData.map((job) => ({
      ...job,
      professionals: profilesMap[job.user_id] || null,
    }));

    setJobs(jobsWithProfiles);
    setLoading(false);
  };

  const handleOpenReview = async (job) => {
    setSelectedJob(job);
    setApplications({ data: [], loading: true });

    const result = await getJobApplicationsForAdmin(job.id);
    if (result.success) {
      setApplications({ data: result.data || [], loading: false });
    } else {
      setApplications({ data: [], loading: false });
    }
  };

  const handleToggleVerify = async (id, currentStatus) => {
    const newStatus = !currentStatus;

    const result = await toggleJobVerification(id, newStatus);

    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success(
        `Job ${newStatus ? "verified" : "unverified"} successfully.`,
      );
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, is_verified: newStatus } : j)),
      );
      if (selectedJob?.id === id) {
        setSelectedJob((prev) => ({ ...prev, is_verified: newStatus }));
      }
    }
  };

  const filtered = jobs.filter((j) => {
    const matchesSearch =
      j.title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || j.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || j.priority === priorityFilter;
    const matchesJobType =
      jobTypeFilter === "all" || j.job_type === jobTypeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesJobType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Jobs
          </h1>
          <p className="text-gray-500 mt-1">Manage and verify job postings.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "table" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search job title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-indigo-500 rounded-lg w-full"
          />
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Opening Soon (Pending)</option>
            <option value="active">Running (Active)</option>
            <option value="completed">Over (Completed)</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
          >
            <option value="all">All Priorities</option>
            <option value="regular">Regular</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
          >
            <option value="all">All Types</option>
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
      </div>

      {loading ? (
        viewMode === "grid" ? (
          <AdminGridSkeleton count={8} />
        ) : (
          <AdminTableSkeleton columns={5} rows={5} />
        )
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
          <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
          <p className="text-gray-500">
            Adjust your search or filters to find more jobs.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow relative cursor-pointer flex flex-col"
              onClick={() => handleOpenReview(job)}
            >
              <div className="p-6 space-y-4 flex-1">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-1.5 line-clamp-2">
                      {job.title}
                      {job.is_verified && (
                        <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </h3>
                  </div>
                  <p className="text-sm text-indigo-600 font-semibold mt-1">
                    {job.company_name}
                  </p>
                </div>

                <div className="text-xs text-gray-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />{" "}
                    {job.city || job.country || job.location_type || "Remote"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />{" "}
                    <span className="capitalize">
                      {job.job_type?.replace("-", " ") || "Full Time"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-400 leading-none">
                      ৳
                    </span>{" "}
                    {job.salary_min
                      ? `${job.salary_min} - ${job.salary_max} ${job.salary_currency}/${job.salary_period}`
                      : "Negotiable"}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${job.is_verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {job.is_verified ? "Verified" : "Unverified"}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      job.priority === "urgent"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="capitalize">{job.priority}</span>
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 border-t border-gray-100 p-4 text-xs text-gray-500 flex justify-between items-center">
                <span>
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
                <span className="capitalize">{job.status}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Job Details</th>
                  <th className="px-6 py-4">Location / Salary</th>
                  <th className="px-6 py-4">Status / Priority</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        {job.title}
                        {job.is_verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                        )}
                      </div>
                      <div className="text-xs text-indigo-600 font-medium">
                        {job.company_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 capitalize">
                        {job.job_type?.replace("-", " ")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />{" "}
                        {job.city || job.location_type || "Remote"}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <span className="font-bold text-gray-400 leading-none">
                          ৳
                        </span>{" "}
                        {job.salary_min
                          ? `${job.salary_min}-${job.salary_max}`
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 capitalize">
                        {job.status}
                      </div>
                      <div
                        className={`text-xs mt-1 capitalize font-medium ${job.priority === "urgent" ? "text-red-600" : "text-gray-500"}`}
                      >
                        {job.priority}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${job.is_verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {job.is_verified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenReview(job)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View & Verify Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                Job Review
                {selectedJob.is_verified && (
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                )}
              </h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Snapshot */}
                <div className="lg:w-1/3 flex flex-col items-center text-center space-y-4 border-r-0 lg:border-r border-gray-100 pr-0 lg:pr-4">
                  <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-3xl font-bold border border-indigo-100">
                    {selectedJob.company_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedJob.title}
                    </h2>
                    <p className="text-sm font-medium text-indigo-600">
                      {selectedJob.company_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 capitalize flex justify-center items-center gap-1">
                      <Briefcase className="w-3 h-3" />{" "}
                      {selectedJob.job_type?.replace("-", " ")}
                    </p>
                  </div>

                  {/* Verification Toggle Box */}
                  <div
                    className={`w-full mt-4 p-4 rounded-xl border ${selectedJob.is_verified ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-200"}`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-500">
                      Verification Status
                    </p>
                    <button
                      onClick={() =>
                        handleToggleVerify(
                          selectedJob.id,
                          selectedJob.is_verified,
                        )
                      }
                      className={`w-full flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-lg transition-colors ${
                        selectedJob.is_verified
                          ? "text-red-700 bg-red-100 hover:bg-red-200"
                          : "text-white bg-indigo-600 hover:bg-indigo-700 shadow-md"
                      }`}
                    >
                      {selectedJob.is_verified ? (
                        <>
                          <XCircle className="w-4 h-4" /> Revoke Verification
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Approve & Verify
                        </>
                      )}
                    </button>
                  </div>

                  <div className="w-full text-left pt-2 space-y-3 border-t border-gray-100 mt-4">
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase">
                        Poster Info
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <img
                          src={
                            selectedJob.professionals?.avatar_url ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${selectedJob.professionals?.full_name || "User"}`
                          }
                          className="w-8 h-8 rounded-full bg-gray-100"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {selectedJob.professionals?.full_name || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Data */}
                <div className="lg:w-2/3 space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                      Job Description
                    </h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedJob.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase">
                        Status
                      </span>
                      <span className="text-sm text-gray-900 font-medium capitalize">
                        {selectedJob.status}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase">
                        Priority
                      </span>
                      <span
                        className={`text-sm font-medium capitalize ${selectedJob.priority === "urgent" ? "text-red-600" : "text-gray-900"}`}
                      >
                        {selectedJob.priority}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase">
                        Location Type
                      </span>
                      <span className="text-sm text-gray-900 font-medium capitalize">
                        {selectedJob.location_type || "N/A"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-xs font-semibold text-gray-400 uppercase">
                        Location
                      </span>
                      <span className="text-sm text-gray-900 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        {[
                          selectedJob.city,
                          selectedJob.state,
                          selectedJob.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase">
                        Full Address
                      </span>
                      <span
                        className="text-sm text-gray-900 font-medium line-clamp-1"
                        title={selectedJob.full_address}
                      >
                        {selectedJob.full_address || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                      Salary & Hours
                    </h4>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1">
                          <span className="font-bold leading-none">৳</span>{" "}
                          Salary Range
                        </span>
                        <div className="text-sm font-bold text-gray-900">
                          {selectedJob.salary_min
                            ? `${selectedJob.salary_min} - ${selectedJob.salary_max} ${selectedJob.salary_currency}`
                            : "Negotiable"}{" "}
                          <span className="text-gray-500 font-normal capitalize">
                            / {selectedJob.salary_period}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1">
                          <Clock className="w-3.5 h-3.5" /> Schedule
                        </span>
                        <div className="text-sm text-gray-900">
                          {selectedJob.work_hours_per_week
                            ? `${selectedJob.work_hours_per_week} hrs/week`
                            : "Flexible hours"}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {selectedJob.start_time && selectedJob.close_time
                            ? `${selectedJob.start_time} - ${selectedJob.close_time}`
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                      Skills & Requirements
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 mb-1">
                          Required Skills
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(selectedJob.skills) &&
                          selectedJob.skills.length > 0 ? (
                            selectedJob.skills.map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                              >
                                {s}
                              </span>
                            ))
                          ) : selectedJob.skills &&
                            typeof selectedJob.skills === "string" ? (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                              {selectedJob.skills}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">
                              None listed
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 mb-1">
                          Office Days
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(selectedJob.office_days) &&
                          selectedJob.office_days.length > 0 ? (
                            selectedJob.office_days.map((d, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium capitalize"
                              >
                                {d}
                              </span>
                            ))
                          ) : selectedJob.office_days &&
                            typeof selectedJob.office_days === "string" ? (
                            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium capitalize">
                              {selectedJob.office_days}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900">
                        Application Deadline
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">
                        {selectedJob.application_deadline
                          ? new Date(
                              selectedJob.application_deadline,
                            ).toLocaleDateString()
                          : "Open until filled"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Applications Section */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Job Applications
                </h4>

                {applications.loading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-16 bg-gray-50 rounded-xl w-full border border-gray-100" />
                    <div className="h-16 bg-gray-50 rounded-xl w-full border border-gray-100" />
                  </div>
                ) : applications.data.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-100 border-dashed rounded-xl p-8 text-center">
                    <p className="text-sm text-gray-500">
                      No applications received for this job yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {applications.data.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                app.applicant?.avatar_url ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${app.applicant?.full_name || "Applicant"}`
                              }
                              className="w-10 h-10 rounded-full bg-gray-100 object-cover"
                            />
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {app.applicant?.full_name || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">
                                ID: {app.applicant_id.split("-")[0]}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                              app.status === "pending"
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : app.status === "accepted"
                                  ? "bg-green-50 text-green-600 border border-green-100"
                                  : "bg-red-50 text-red-600 border border-red-100"
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                        {app.cover_letter ? (
                          <div className="bg-gray-50 p-3 rounded-lg flex-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                              Cover Letter
                            </p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                              {app.cover_letter}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-3 rounded-lg flex flex-col justify-center items-center flex-1">
                            <p className="text-xs text-gray-400 italic">
                              No cover letter provided
                            </p>
                          </div>
                        )}
                        <p className="text-[10px] text-gray-400 mt-3 text-right">
                          Applied:{" "}
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
