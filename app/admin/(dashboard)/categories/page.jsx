"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { Search, Plus, Edit2, Trash2, Tag, X, Loader2, ListTree } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AdminTableSkeleton } from "@/components/shared/AdminSkeletons";

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", icon_name: "" });
  
  // Subcategory Modal State
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [subForm, setSubForm] = useState({ name: "", slug: "", category_id: "" });
  
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Categories
    const { data: catData, error: catError } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (catError) toast.error(catError.message);
    else setCategories(catData || []);

    // Fetch Subcategories
    const { data: subData, error: subError } = await supabase
      .from("subcategories")
      .select("*")
      .order("name", { ascending: true });

    if (subError) toast.error(subError.message);
    else setSubcategories(subData || []);
    
    setLoading(false);
  };

  // --- Category Actions ---
  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", slug: "", icon_name: "" });
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name || "", slug: cat.slug || "", icon_name: cat.icon_name || "" });
    setIsCategoryModalOpen(true);
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure? This will also delete all related subcategories!")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSubcategories((prev) => prev.filter((s) => s.category_id !== id));
    }
  };

  const submitCategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editingCategory) {
      const { error } = await supabase.from("categories").update(categoryForm).eq("id", editingCategory.id);
      if (error) toast.error(error.message);
      else {
        toast.success("Category updated");
        setCategories((prev) => prev.map((c) => c.id === editingCategory.id ? { ...c, ...categoryForm } : c));
        setIsCategoryModalOpen(false);
      }
    } else {
      const { data, error } = await supabase.from("categories").insert([categoryForm]).select().single();
      if (error) toast.error(error.message);
      else {
        toast.success("Category added");
        setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        setIsCategoryModalOpen(false);
      }
    }
    setSaving(false);
  };

  // --- Subcategory Actions ---
  const openAddSubcategory = (categoryId) => {
    setEditingSub(null);
    setSubForm({ name: "", slug: "", category_id: categoryId });
    setIsSubModalOpen(true);
  };

  const openEditSubcategory = (sub) => {
    setEditingSub(sub);
    setSubForm({ name: sub.name, slug: sub.slug, category_id: sub.category_id });
    setIsSubModalOpen(true);
  };

  const deleteSubcategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return;
    const { error } = await supabase.from("subcategories").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Subcategory deleted");
      setSubcategories((prev) => prev.filter((s) => s.id !== id));
      setIsSubModalOpen(false);
    }
  };

  const submitSubcategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editingSub) {
      const { error } = await supabase.from("subcategories").update(subForm).eq("id", editingSub.id);
      if (error) toast.error(error.message);
      else {
        toast.success("Subcategory updated");
        setSubcategories((prev) => prev.map((s) => s.id === editingSub.id ? { ...s, ...subForm } : s));
        setIsSubModalOpen(false);
      }
    } else {
      const { data, error } = await supabase.from("subcategories").insert([subForm]).select().single();
      if (error) toast.error(error.message);
      else {
        toast.success("Subcategory added");
        setSubcategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        setIsSubModalOpen(false);
      }
    }
    setSaving(false);
  };

  // Filtering
  const filteredCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) || c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Categories & Subcategories</h1>
          <p className="text-gray-500 mt-1">Manage platform categories and their related subcategories.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-gray-200 focus-visible:ring-indigo-500 rounded-lg"
            />
          </div>
          <button
            onClick={openAddCategory}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <AdminTableSkeleton columns={3} rows={5} />
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 border-dashed py-24 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <ListTree className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Categories Found</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {search ? "No categories match your search." : "You haven't added any categories yet. Create your first category to get started."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-[25%]">Category Name</th>
                  <th className="px-6 py-4 w-[60%]">Subcategories</th>
                  <th className="px-6 py-4 text-right w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((cat) => {
                  const catSubs = subcategories.filter(s => s.category_id === cat.id);
                  return (
                    <tr key={cat.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-5 align-top">
                        <div className="font-bold text-gray-900 text-base mb-1">{cat.name}</div>
                        <div className="text-gray-400 font-mono text-[11px] mb-2">/{cat.slug}</div>
                        {cat.icon_name && (
                          <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                            Icon: {cat.icon_name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="flex flex-wrap gap-2 items-center">
                          {catSubs.map(sub => (
                            <button
                              key={sub.id}
                              onClick={() => openEditSubcategory(sub)}
                              className="group inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
                            >
                              {sub.name}
                              <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                          <button
                            onClick={() => openAddSubcategory(cat.id)}
                            className="inline-flex items-center justify-center bg-white border border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 text-gray-500 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Add Sub
                          </button>
                        </div>
                        {catSubs.length === 0 && (
                          <p className="text-xs text-gray-400 mt-2 italic">No subcategories yet. Add one to categorize jobs further.</p>
                        )}
                      </td>
                      <td className="px-6 py-5 align-top text-right space-x-2">
                        <button
                          onClick={() => openEditCategory(cat)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- Category Modal --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-500" />
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitCategory}>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Category Name</label>
                  <Input required value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g. Web Development" className="text-black" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">URL Slug</label>
                  <Input required value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} placeholder="e.g. web-development" className="font-mono text-sm text-black" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Icon Name (Optional)</label>
                  <Input value={categoryForm.icon_name} onChange={(e) => setCategoryForm({ ...categoryForm, icon_name: e.target.value })} placeholder="e.g. Code, Palette" className="text-black" />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Subcategory Modal --- */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <ListTree className="w-5 h-5 text-indigo-500" />
                {editingSub ? "Edit Subcategory" : "Add Subcategory"}
              </h3>
              <button onClick={() => setIsSubModalOpen(false)} className="p-2 hover:bg-indigo-100 rounded-full text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitSubcategory}>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Subcategory Name</label>
                  <Input required value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} placeholder="e.g. React.js" className="text-black" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">URL Slug</label>
                  <Input required value={subForm.slug} onChange={(e) => setSubForm({ ...subForm, slug: e.target.value })} placeholder="e.g. react-js" className="font-mono text-sm text-black" />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                {editingSub ? (
                  <button type="button" onClick={() => deleteSubcategory(editingSub.id)} className="px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                ) : (
                  <div /> // Spacer
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsSubModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? "Saving..." : "Save Subcategory"}
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
