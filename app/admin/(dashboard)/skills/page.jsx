"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import {
  createSkill,
  updateSkill,
  deleteSkillAction,
} from "@/app/admin/actions";
import { Search, Plus, Edit2, Trash2, X, Loader2, Sparkles, Filter } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AdminTableSkeleton } from "@/components/shared/AdminSkeletons";

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export default function SkillsAdminPage() {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", category_id: "" });
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      // Fetch Categories
      const { data: catData } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (isCancelled) return;
      if (catData) setCategories(catData);

      // Fetch Skills
      const { data: skillsData, error: skillsError } = await supabase
        .from("skills")
        .select("*, categories(name)")
        .order("name", { ascending: true });

      if (isCancelled) return;

      if (skillsError) toast.error(skillsError.message);
      else setSkills(skillsData || []);

      setLoading(false);
    }

    loadData();
    return () => {
      isCancelled = true;
    };
  }, []);

  const openAdd = () => {
    setEditingSkill(null);
    setForm({
      name: "",
      slug: "",
      category_id: selectedCategoryFilter !== "all" ? selectedCategoryFilter : "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (skill) => {
    setEditingSkill(skill);
    setForm({
      name: skill.name,
      slug: skill.slug,
      category_id: skill.category_id || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;
    const result = await deleteSkillAction(id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Skill deleted");
      setSkills((prev) => prev.filter((s) => s.id !== id));
      setIsModalOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || generateSlug(form.name),
      category_id: form.category_id || null,
    };

    if (editingSkill) {
      const result = await updateSkill(editingSkill.id, payload);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("Skill updated successfully");
        const categoryObj = categories.find((c) => c.id === payload.category_id);
        setSkills((prev) =>
          prev.map((s) =>
            s.id === editingSkill.id
              ? { ...s, ...payload, categories: categoryObj ? { name: categoryObj.name } : null }
              : s
          )
        );
        setIsModalOpen(false);
      }
    } else {
      const result = await createSkill(payload);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success("Skill created successfully");
        const categoryObj = categories.find((c) => c.id === payload.category_id);
        const newRecord = {
          ...result.data,
          categories: categoryObj ? { name: categoryObj.name } : null,
        };
        setSkills((prev) =>
          [...prev, newRecord].sort((a, b) => a.name.localeCompare(b.name))
        );
        setIsModalOpen(false);
      }
    }
    setSaving(false);
  };

  // Filtered skills
  const filteredSkills = skills.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.slug?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "all" || s.category_id === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-indigo-600" />
            Verified Skills Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage industry skills that professionals can search and select for their profiles.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" /> Add New Skill
          </button>
        </div>
      </div>

      {/* Controls: Search & Category Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search skills (e.g. Next.js)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-gray-200 focus-visible:ring-indigo-500 rounded-lg text-sm text-black"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-60"
          >
            <option value="all">All Categories ({skills.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <AdminTableSkeleton columns={3} rows={8} />
      ) : filteredSkills.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 border-dashed py-20 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">No Skills Found</h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">
            {search
              ? "No skills match your current search criteria."
              : "No skills have been registered for this filter."}
          </p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Skill Now
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Showing {filteredSkills.length} of {skills.length} skills
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 w-[40%]">Skill Name</th>
                  <th className="px-6 py-3.5 w-[35%]">Parent Category</th>
                  <th className="px-6 py-3.5 text-right w-[25%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSkills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-gray-900">{skill.name}</div>
                      <div className="text-gray-400 font-mono text-[11px]">/{skill.slug}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      {skill.categories?.name ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {skill.categories.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs italic">General / Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEdit(skill)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Skill"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Skill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                {editingSkill ? "Edit Skill" : "Add New Skill"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-indigo-100 rounded-full text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Skill Name</label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      })
                    }
                    placeholder="e.g. Next.js, Figma, Node.js"
                    className="text-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">URL Slug</label>
                  <Input
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="e.g. next-js"
                    className="font-mono text-sm text-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Parent Category</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">None (General Skill)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                {editingSkill ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingSkill.id)}
                    className="px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? "Saving..." : "Save Skill"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

