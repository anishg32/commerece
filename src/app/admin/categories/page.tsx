"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", image: "", parentId: "", sortOrder: 0 });
  const [expanded, setExpanded] = useState<string[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories?includeInactive=true"); // Or the admin API if we change it to return tree
      // Wait, our /api/categories returns a tree. The admin API /api/admin/categories returns a flat list right now.
      // Let's use the admin API which returns flat list so we can easily edit them.
      const adminRes = await fetch("/api/admin/categories");
      if (adminRes.ok) {
        const flatCategories = await adminRes.json();
        // We'll build the tree here for display
        const roots: any[] = [];
        const map = new Map();
        flatCategories.forEach((c: any) => { map.set(c._id, { ...c, children: [] }); });
        flatCategories.forEach((c: any) => {
          const node = map.get(c._id);
          if (c.parentId) {
            const parent = map.get(c.parentId);
            if (parent) parent.children.push(node);
            else roots.push(node);
          } else {
            roots.push(node);
          }
        });
        setCategories(roots);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body: any = { 
      name: form.name, 
      description: form.description, 
      image: form.image ? { url: form.image } : undefined, 
      parentId: form.parentId || null,
      sortOrder: Number(form.sortOrder)
    };
    if (editing) body.id = editing._id;

    try {
      const res = await fetch("/api/admin/categories", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { 
        setShowForm(false); setEditing(null); 
        setForm({ name: "", description: "", image: "", parentId: "", sortOrder: 0 }); 
        fetchCategories(); 
      }
      else { const d = await res.json(); alert(d.message); }
    } catch (e: unknown) { alert((e instanceof Error ? e.message : String(e))); }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchCategories();
      else { const d = await res.json(); alert(d.message); }
    } catch (e: unknown) { alert((e instanceof Error ? e.message : String(e))); }
  };

  const toggleActive = async (cat: Record<string, any>) => {
    try {
      await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat._id, isActive: !cat.isActive }),
      });
      fetchCategories();
    } catch (e) { console.error(e); }
  };

  const editCategory = (cat: Record<string, any>) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || "",
      image: cat.image?.url || "",
      parentId: cat.parentId || "",
      sortOrder: cat.sortOrder || 0
    });
    setShowForm(true);
  };

  const inputClass = "w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-ring";

  // Flatten categories for parent dropdown
  const getFlatCategoriesList = (nodes: any[], prefix = ""): {id: string, name: string}[] => {
    let result: {id: string, name: string}[] = [];
    for (const node of nodes) {
      result.push({ id: node._id, name: prefix + node.name });
      if (node.children && node.children.length > 0) {
        result = result.concat(getFlatCategoriesList(node.children, prefix + "— "));
      }
    }
    return result;
  };
  const parentOptions = getFlatCategoriesList(categories);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">{parentOptions.length} total categories</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", description: "", image: "", parentId: "", sortOrder: 0 }); }}>
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
            <div className="space-y-1">
              <label className="text-sm font-medium">Parent Category</label>
              <select value={form.parentId} onChange={(e) => setForm(f => ({ ...f, parentId: e.target.value }))} className={inputClass}>
                <option value="">None (Top Level)</option>
                {parentOptions.map(opt => (
                  <option key={opt.id} value={opt.id} disabled={editing?._id === opt.id}>{opt.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} className={inputClass} />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium">Description / SEO Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className={inputClass} />
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
                  {cat.children?.length > 0 && (
                    <button onClick={() => setExpanded(e => e.includes(cat._id) ? e.filter(id => id !== cat._id) : [...e, cat._id])}>
                      {expanded.includes(cat._id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  )}
                  <div>
                    <div className="font-medium">{cat.name}</div>
                    <div className="text-xs text-muted-foreground">{cat.productCount || 0} direct products • {cat.children?.length || 0} subcategories</div>
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
              {expanded.includes(cat._id) && cat.children?.length > 0 && (
                <div className="pl-12 pb-3 space-y-2 pt-2 border-t border-dashed ml-6">
                  {cat.children.map((sub: Record<string, any>) => (
                    <div key={sub._id} className="flex items-center justify-between py-1 px-3 bg-secondary/30 rounded border">
                      <div className="text-sm">
                         {sub.name} <span className="text-xs text-muted-foreground ml-2">({sub.productCount || 0} products)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => editCategory(sub)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteCategory(sub._id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
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
