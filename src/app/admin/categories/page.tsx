"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", image: "", subcategories: "" });
  const [expanded, setExpanded] = useState<string[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) setCategories(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subcats = form.subcategories.split(",").map(s => s.trim()).filter(Boolean).map(name => ({ name, isActive: true }));
    const body: any = { name: form.name, description: form.description, image: form.image || undefined, subcategories: subcats };
    if (editing) body.id = editing._id;

    try {
      const res = await fetch("/api/admin/categories", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { setShowForm(false); setEditing(null); setForm({ name: "", description: "", image: "", subcategories: "" }); fetchCategories(); }
      else { const d = await res.json(); alert(d.message); }
    } catch (e: any) { alert(e.message); }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchCategories();
      else { const d = await res.json(); alert(d.message); }
    } catch (e: any) { alert(e.message); }
  };

  const toggleActive = async (cat: any) => {
    try {
      await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat._id, isActive: !cat.isActive }),
      });
      fetchCategories();
    } catch (e) { console.error(e); }
  };

  const editCategory = (cat: any) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || "",
      image: cat.image || "",
      subcategories: cat.subcategories?.map((s: any) => s.name).join(", ") || "",
    });
    setShowForm(true);
  };

  const inputClass = "w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">{categories.length} categories</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", description: "", image: "", subcategories: "" }); }}>
          <Plus className="w-4 h-4 mr-2" />{showForm ? "Cancel" : "Add Category"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">{editing ? "Edit" : "Add"} Category</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Image URL</label>
              <input type="text" value={form.image} onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))} className={inputClass} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className={inputClass} />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium">Subcategories (comma-separated)</label>
              <input type="text" value={form.subcategories} onChange={(e) => setForm(f => ({ ...f, subcategories: e.target.value }))} className={inputClass} placeholder="e.g. Smartphones, Laptops, Tablets" />
            </div>
          </div>
          <Button type="submit">{editing ? "Update" : "Create"} Category</Button>
        </form>
      )}

      <div className="bg-card border rounded-xl divide-y">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No categories yet</div>
        ) : (
          categories.map((cat) => (
            <div key={cat._id}>
              <div className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-3">
                  {cat.subcategories?.length > 0 && (
                    <button onClick={() => setExpanded(e => e.includes(cat._id) ? e.filter(id => id !== cat._id) : [...e, cat._id])}>
                      {expanded.includes(cat._id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  )}
                  <div>
                    <div className="font-medium">{cat.name}</div>
                    <div className="text-xs text-muted-foreground">{cat.productCount || 0} products • {cat.subcategories?.length || 0} subcategories</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full cursor-pointer ${cat.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`} onClick={() => toggleActive(cat)}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </span>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => editCategory(cat)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteCategory(cat._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {expanded.includes(cat._id) && cat.subcategories?.length > 0 && (
                <div className="pl-12 pb-3 space-y-1">
                  {cat.subcategories.map((sub: any) => (
                    <div key={sub.slug} className="text-sm text-muted-foreground py-1 px-3 bg-secondary/30 rounded">{sub.name}</div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
