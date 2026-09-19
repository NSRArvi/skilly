"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { Search, Briefcase, MapPin, Calendar, Clock, Filter, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const statuses = ["pending", "active", "completed", "cancelled"];

export default function JobsAdmin() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) toast.error(error.message);
    else setJobs(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", id);
      
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Job status updated to ${newStatus}`);
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus } : j));
    }
  };

  const filtered = jobs.filter(j => {
    const matchesSearch = j.title?.toLowerCase().includes(search.toLowerCase()) || j.company_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Jobs</h1>
          <p className="text-gray-500 mt-1">Review and manage job postings.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search title or company..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-gray-200 focus-visible:ring-indigo-500 rounded-lg"
            />
          </div>
          <div className="relative w-full sm:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option value="all">All Statuses</option>
              {statuses.map(s => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse h-32"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(job => (
            <div key={job.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="space-y-3 flex-1">
                <div className="flex items-start justify-between md:justify-start gap-4">
                  <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                    ${job.status === 'active' ? 'bg-green-100 text-green-700' : 
                      job.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      job.status === 'completed' ? 'bg-blue-100 text-blue-700' : 
                      'bg-red-100 text-red-700'}`}>
                    {job.status || "pending"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.company_name || "Unknown Company"}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.city ? `${job.city}, ${job.country}` : 'Remote'}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(job.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {job.job_type || 'Full Time'}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-w-[140px] pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6">
                <label className="text-xs font-semibold text-gray-500 uppercase">Update Status</label>
                <select 
                  value={job.status || "pending"}
                  onChange={(e) => updateStatus(job.id, e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 capitalize font-medium text-gray-700"
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
          <p className="text-gray-500">No jobs match your current filters.</p>
        </div>
      )}
    </div>
  );
}
