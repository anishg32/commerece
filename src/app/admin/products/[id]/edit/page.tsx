"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { TagInput } from "@/components/admin/TagInput";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [images, setImages] = useState<{ url: string; publicId?: string }[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${resolvedParams.id}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]).then(([product, cats]) => {
      setForm({
        name: product.name || "",
        brand: product.brand || "",
        category: product.category?._id || product.category || "",
        subcategory: product.subcategory || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        price: product.price?.toString() || "",
        discountPrice: product.discountPrice?.toString() || "",
        sku: product.sku || "",
        stock: product.stock?.toString() || "0",
        colors: product.colors || [],
        sizes: product.sizes || [],
        tags: product.tags || [],
        specifications: product.specifications || [],
        isFeatured: product.isFeatured || false,
        isBestseller: product.isBestseller || false,
        isNewArrival: product.isNewArrival || false,
        isActive: product.isActive !== false,
      });
      setImages((product.images || []).map((url: string) => ({ url })));
      const thumbIndex = product.images?.indexOf(product.thumbnail);
      if (thumbIndex >= 0) setPrimaryImageIndex(thumbIndex);
      setCategories(Array.isArray(cats) ? cats : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading || !form) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading product...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = {
        name: form.name,
        brand: form.brand,
        category: form.category,
        subcategory: form.subcategory || undefined,
        description: form.description,
        shortDescription: form.shortDescription || undefined,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        sku: form.sku,
        stock: parseInt(form.stock),
        images: images.map((img) => img.url),
        thumbnail: images[primaryImageIndex]?.url || images[0]?.url,
        colors: form.colors.length > 0 ? form.colors : undefined,
        sizes: form.sizes.length > 0 ? form.sizes : undefined,
        tags: form.tags.length > 0 ? form.tags : undefined,
        specifications: form.specifications.length > 0 ? form.specifications : undefined,
        isFeatured: form.isFeatured,
        isBestseller: form.isBestseller,
        isNewArrival: form.isNewArrival,
        isActive: form.isActive,
      };

      const res = await fetch(`/api/products/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to update");
        return;
      }

      router.push("/admin/products");
    } catch (error: unknown) {
      alert((error instanceof Error ? error.message : String(error)) || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => setForm((f: any) => ({ ...f, [field]: value }));

  const selectedCategory = categories.find((c: Record<string, any>) => c._id === form.category);
  const inputClass = "w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Update product details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium">Product Name *</label>
              <input type="text" value={form.name} onChange={(e) => updateField("name", e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Brand</label>
              <input type="text" value={form.brand} onChange={(e) => updateField("brand", e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Category *</label>
              <select value={form.category} onChange={(e) => updateField("category", e.target.value)} className={inputClass}>
                <option value="">Select</option>
                {categories.map((c: Record<string, any>) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            {selectedCategory?.subcategories?.length > 0 && (
              <div className="space-y-1">
                <label className="text-sm font-medium">Subcategory</label>
                <select value={form.subcategory} onChange={(e) => updateField("subcategory", e.target.value)} className={inputClass}>
                  <option value="">Select</option>
                  {selectedCategory.subcategories.map((s: any) => <option key={s.slug} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            )}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium">Description *</label>
              <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} className={`${inputClass} min-h-[100px]`} rows={4} />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium">Short Description</label>
              <input type="text" value={form.shortDescription} onChange={(e) => updateField("shortDescription", e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Pricing & Inventory</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Price (₹) *</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => updateField("price", e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Discount Price (₹)</label>
              <input type="number" step="0.01" min="0" value={form.discountPrice} onChange={(e) => updateField("discountPrice", e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">SKU *</label>
              <input type="text" value={form.sku} onChange={(e) => updateField("sku", e.target.value.toUpperCase())} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Stock *</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => updateField("stock", e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Images</h2>
          <ImageUploader images={images} onChange={setImages} primaryIndex={primaryImageIndex} onPrimaryChange={setPrimaryImageIndex} />
        </div>

        <div className="bg-card border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Variants</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <TagInput tags={form.colors} onChange={(c: string[]) => updateField("colors", c)} placeholder="Add color..." label="Colors" suggestions={["Black","White","Red","Blue","Green","Navy","Grey"]} />
            <TagInput tags={form.sizes} onChange={(s: string[]) => updateField("sizes", s)} placeholder="Add size..." label="Sizes" suggestions={["XS","S","M","L","XL","XXL"]} />
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Tags & Status</h2>
          <TagInput tags={form.tags} onChange={(t: string[]) => updateField("tags", t)} placeholder="Add tag..." label="Tags" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {(["isFeatured","isBestseller","isNewArrival","isActive"] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[key]} onChange={(e) => updateField(key, e.target.checked)} className="w-4 h-4 rounded border accent-primary" />
                <span className="text-sm font-medium">{key.replace(/^is/, "").replace(/([A-Z])/g, " $1").trim()}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild><Link href="/admin/products">Cancel</Link></Button>
          <Button type="submit" disabled={submitting} className="min-w-[140px]">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Update Product</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
