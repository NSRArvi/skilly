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
  Globe,
  MapPin,
  Phone,
  DollarSign,
  BookOpen,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  Star,
  Heart,
  Users2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { toggleProfessionalVerification } from "../../actions";

export default function ProfessionalsAdmin() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [selectedUser, setSelectedUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("professionals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) toast.error(error.message);
    else setProfessionals(data || []);
    setLoading(false);
  };

  const handleToggleVerify = async (id, currentStatus) => {
    const newStatus = !currentStatus;

    // We use a Server Action that uses the Service Role Key to bypass RLS
    const result = await toggleProfessionalVerification(id, newStatus);

    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success(
        `User ${newStatus ? "verified" : "unverified"} successfully.`,
      );
      setProfessionals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_verified: newStatus } : p)),
      );
      if (selectedUser?.id === id) {
        setSelectedUser((prev) => ({ ...prev, is_verified: newStatus }));
      }
    }
  };

  const filtered = professionals.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.profession?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Professionals
          </h1>
          <p className="text-gray-500 mt-1">
            Manage and verify platform users.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search name, email, profession..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-gray-200 focus-visible:ring-indigo-500 rounded-lg"
            />
          </div>
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse h-64"
            ></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
          <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">
            No professionals found
          </h3>
          <p className="text-gray-500">
            Adjust your search to find more users.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow relative cursor-pointer"
              onClick={() => setSelectedUser(user)}
            >
              <div className="h-24 bg-gradient-to-br from-indigo-100 to-blue-50 relative">
                {user.cover_image_url && (
                  <img
                    src={user.cover_image_url}
                    alt="Cover"
                    className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                  />
                )}
                <div className="absolute -bottom-8 left-6">
                  <div className="w-16 h-16 rounded-full border-4 border-white bg-white overflow-hidden shadow-sm">
                    <img
                      src={
                        user.avatar_url ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`
                      }
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-10 p-6 space-y-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-1.5 truncate">
                    {user.full_name}
                    {user.is_verified && (
                      <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium truncate">
                    {user.profession || "No profession set"}
                  </p>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p className="truncate">{user.email}</p>
                  <p>
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="pt-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.is_verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {user.is_verified ? "Verified" : "Unverified"}
                  </span>
                </div>
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
                  <th className="px-6 py-4">Professional</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.avatar_url ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`
                          }
                          className="w-10 h-10 rounded-full object-cover bg-gray-100"
                        />
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                            {user.full_name}
                            {user.is_verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.profession || "No profession"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{user.email}</div>
                      <div className="text-xs text-gray-500">
                        {user.phone_number || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.is_verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        {user.is_verified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
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
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                Professional Review
                {selectedUser.is_verified && (
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                )}
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Profile Snapshot */}
                <div className="lg:w-1/3 flex flex-col items-center text-center space-y-4 border-r-0 lg:border-r border-gray-100 pr-0 lg:pr-4">
                  <img
                    src={
                      selectedUser.avatar_url ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.full_name}`
                    }
                    className="w-32 h-32 rounded-full object-cover shadow-sm border-4 border-white"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedUser.full_name}
                    </h2>
                    <p className="text-sm font-medium text-indigo-600">
                      {selectedUser.profession || "No profession set"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedUser.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500 pt-2">
                    <span className="flex items-center gap-1">
                      <Users2Icon className="w-4 h-4" />{" "}
                      {selectedUser.followers_count || 0} Followers
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400" />{" "}
                      {selectedUser.ratings_count || 0} Ratings
                    </span>
                  </div>

                  {/* Verification Toggle Box */}
                  <div
                    className={`w-full mt-4 p-4 rounded-xl border ${selectedUser.is_verified ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-200"}`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-500">
                      Verification Status
                    </p>
                    <button
                      onClick={() =>
                        handleToggleVerify(
                          selectedUser.id,
                          selectedUser.is_verified,
                        )
                      }
                      className={`w-full flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-lg transition-colors ${
                        selectedUser.is_verified
                          ? "text-red-700 bg-red-100 hover:bg-red-200"
                          : "text-white bg-indigo-600 hover:bg-indigo-700 shadow-md"
                      }`}
                    >
                      {selectedUser.is_verified ? (
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

                  {/* Social Links */}
                  <div className="w-full pt-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-left">
                      Social Links
                    </h4>
                    <div className="flex flex-col gap-2 text-sm text-left">
                      {selectedUser.social_linkedin && (
                        <a
                          href={selectedUser.social_linkedin}
                          target="_blank"
                          className="text-indigo-600 hover:underline flex items-center gap-2"
                        >
                          <LinkIcon className="w-3 h-3" /> LinkedIn
                        </a>
                      )}
                      {selectedUser.social_github && (
                        <a
                          href={selectedUser.social_github}
                          target="_blank"
                          className="text-indigo-600 hover:underline flex items-center gap-2"
                        >
                          <LinkIcon className="w-3 h-3" /> GitHub
                        </a>
                      )}
                      {selectedUser.social_twitter && (
                        <a
                          href={selectedUser.social_twitter}
                          target="_blank"
                          className="text-indigo-600 hover:underline flex items-center gap-2"
                        >
                          <LinkIcon className="w-3 h-3" /> Twitter
                        </a>
                      )}
                      {selectedUser.social_facebook && (
                        <a
                          href={selectedUser.social_facebook}
                          target="_blank"
                          className="text-indigo-600 hover:underline flex items-center gap-2"
                        >
                          <LinkIcon className="w-3 h-3" /> Facebook
                        </a>
                      )}
                      {!selectedUser.social_linkedin &&
                        !selectedUser.social_github &&
                        !selectedUser.social_twitter &&
                        !selectedUser.social_facebook && (
                          <span className="text-gray-400">
                            No social links provided.
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                {/* Detailed Data */}
                <div className="lg:w-2/3 space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                      Biography
                    </h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedUser.bio || "No biography provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4">
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase">
                        Hourly Rate
                      </span>
                      <span className="text-sm text-gray-900 font-medium flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-gray-400" />{" "}
                        {selectedUser.hourly_rate
                          ? selectedUser.hourly_rate
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase">
                        Daily Rate
                      </span>
                      <span className="text-sm text-gray-900 font-medium flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-gray-400" />{" "}
                        {selectedUser.daily_rate
                          ? selectedUser.daily_rate
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase">
                        Gender
                      </span>
                      <span className="text-sm text-gray-900 font-medium capitalize">
                        {selectedUser.gender || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase">
                        Phone
                      </span>
                      <span className="text-sm text-gray-900 font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />{" "}
                        {selectedUser.phone_number
                          ? `${selectedUser.phone_code} ${selectedUser.phone_number}`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-xs font-semibold text-gray-400 uppercase">
                        Present Location
                      </span>
                      <span
                        className="text-sm text-gray-900 font-medium flex items-center gap-1"
                        title={
                          typeof selectedUser.present_address === "object"
                            ? JSON.stringify(selectedUser.present_address)
                            : selectedUser.present_address
                        }
                      >
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        {typeof selectedUser.present_address === "object" &&
                        selectedUser.present_address
                          ? selectedUser.present_address.fullAddress ||
                            selectedUser.present_address.city ||
                            "Address Object"
                          : selectedUser.present_address || "N/A"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-xs font-semibold text-gray-400 uppercase">
                        Permanent Location
                      </span>
                      <span className="text-sm text-gray-900 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        {typeof selectedUser.permanent_address === "object" &&
                        selectedUser.permanent_address
                          ? selectedUser.permanent_address.fullAddress ||
                            selectedUser.permanent_address.city ||
                            "Address Object"
                          : selectedUser.permanent_address || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                      Skills & Qualifications
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 mb-1">
                          Skills
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedUser.skills &&
                          selectedUser.skills.length > 0 ? (
                            selectedUser.skills.map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">
                              None listed
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-500 mb-1">
                          Languages
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedUser.languages &&
                          selectedUser.languages.length > 0 ? (
                            selectedUser.languages.map((l, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                              >
                                {l}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">
                              None listed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" /> Experience
                    </h4>
                    {selectedUser.experience &&
                    selectedUser.experience.length > 0 ? (
                      <ul className="space-y-3 text-sm">
                        {selectedUser.experience.map((exp, idx) => (
                          <li
                            key={idx}
                            className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                          >
                            <div className="font-semibold text-gray-900">
                              {exp.title}{" "}
                              <span className="font-normal text-gray-500">
                                at {exp.company}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {exp.startDate} - {exp.endDate || "Present"}
                            </div>
                            {exp.description && (
                              <p className="text-gray-700 mt-2 text-xs">
                                {exp.description}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">
                        No experience added.
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" /> Education &
                      Courses
                    </h4>
                    {selectedUser.education &&
                    selectedUser.education.length > 0 ? (
                      <ul className="space-y-3 text-sm">
                        {selectedUser.education.map((edu, idx) => (
                          <li
                            key={idx}
                            className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                          >
                            <div className="font-semibold text-gray-900">
                              {edu.degree}
                            </div>
                            <div className="text-gray-600 text-xs">
                              {edu.institution}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {edu.year}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">
                        No education added.
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                      Identity Documents
                    </h4>
                    <div className="flex gap-4">
                      {selectedUser.id_front_url ? (
                        <a
                          href={selectedUser.id_front_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-32 h-20 bg-gray-100 rounded-lg overflow-hidden hover:opacity-80 transition-opacity border border-gray-200"
                        >
                          <img
                            src={selectedUser.id_front_url}
                            alt="ID Front"
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ) : (
                        <div className="w-32 h-20 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 text-center px-2">
                          No Front ID
                        </div>
                      )}

                      {selectedUser.id_back_url ? (
                        <a
                          href={selectedUser.id_back_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-32 h-20 bg-gray-100 rounded-lg overflow-hidden hover:opacity-80 transition-opacity border border-gray-200"
                        >
                          <img
                            src={selectedUser.id_back_url}
                            alt="ID Back"
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ) : (
                        <div className="w-32 h-20 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 text-center px-2">
                          No Back ID
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
