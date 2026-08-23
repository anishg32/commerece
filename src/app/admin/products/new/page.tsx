"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { TagInput } from "@/components/admin/TagInput";

interface ProductForm {
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  shortDescription: string;
  price: string;
  discountPrice: string;
  sku: string;
  stock: string;
  colors: string[];
  sizes: string[];
  tags: string[];
  specifications: { key: string; value: string }[];
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
}

const initialForm: ProductForm = {
  name: "",
  brand: "",
  category: "",
  subcategory: "",
  description: "",
  shortDescription: "",
  price: "",
  discountPrice: "",
  sku: "",
  stock: "0",
  colors: [],
  sizes: [],
  tags: [],
  specifications: [],
  isFeatured: false,
  isBestseller: false,
  isNewArrival: false,
  isActive: true,
};

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [images, setImages] = useState<{ url: string; publicId?: string }[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const selectedCategory = categories.find((c) => c._id === form.category);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Product name is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.price || parseFloat(form.price) <= 0) errs.price = "Valid price is required";
    if (form.discountPrice && parseFloat(form.discountPrice) >= parseFloat(form.price))
      errs.discountPrice = "Discount price must be less than price";
    if (!form.sku.trim()) errs.sku = "SKU is required";
    if (!form.stock || parseInt(form.stock) < 0) errs.stock = "Valid stock is required";
    if (!form.category) errs.category = "Category is required";
    if (images.length === 0) errs.images = "At least one image is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const body = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category,
        subcategory: form.subcategory || undefined,
        description: form.description.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        sku: form.sku.trim(),
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

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to create product");
        return;
      }

      router.push("/admin/products");
    } catch (error: unknown) {
      alert((error instanceof Error ? error.message : String(error)) || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: keyof ProductForm, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const addSpec = () => {
    setForm((f) => ({
      ...f,
      specifications: [...f.specifications, { key: "", value: "" }],
    }));
  };

  const updateSpec = (index: number, field: "key" | "value", value: string) => {
    setForm((f) => ({
      ...f,
      specifications: f.specifications.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }));
  };

  const removeSpec = (index: number) => {
    setForm((f) => ({
      ...f,
      specifications: f.specifications.filter((_, i) => i !== index),
    }));
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-ring ${
      errors[field] ? "border-destructive" : ""
    }`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
          <p className="text-muted-foreground">Create a new product listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium">
                Product Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={inputClass("name")}
                placeholder="e.g. Premium Wireless Headphones"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => updateField("brand", e.target.value)}
                className={inputClass("brand")}
                placeholder="e.g. Aura"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className={inputClass("category")}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>
            {selectedCategory?.subcategories?.length > 0 && (
              <div className="space-y-1">
                <label className="text-sm font-medium">Subcategory</label>
                <select
                  value={form.subcategory}
                  onChange={(e) => updateField("subcategory", e.target.value)}
                  className={inputClass("subcategory")}
                >
                  <option value="">Select subcategory</option>
                  {selectedCategory.subcategories.map((sub: Record<string, any>) => (
                    <option key={sub.slug} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className={`${inputClass("description")} min-h-[100px] resize-y`}
                placeholder="Full product description..."
                rows={4}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-sm font-medium">Short Description</label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) => updateField("shortDescription", e.target.value)}
                className={inputClass("shortDescription")}
                placeholder="Brief product summary"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Pricing & Inventory</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Price (₹) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                className={inputClass("price")}
                placeholder="0.00"
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Discount Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.discountPrice}
                onChange={(e) => updateField("discountPrice", e.target.value)}
                className={inputClass("discountPrice")}
                placeholder="0.00"
              />
              {form.discountPrice && form.price && parseFloat(form.discountPrice) < parseFloat(form.price) && (
                <p className="text-xs text-green-600">
                  {Math.round(((parseFloat(form.price) - parseFloat(form.discountPrice)) / parseFloat(form.price)) * 100)}% off
                </p>
              )}
              {errors.discountPrice && <p className="text-xs text-destructive">{errors.discountPrice}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                SKU <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => updateField("sku", e.target.value.toUpperCase())}
                className={inputClass("sku")}
                placeholder="e.g. PROD-001"
              />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Stock <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => updateField("stock", e.target.value)}
                className={inputClass("stock")}
              />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            Images <span className="text-destructive">*</span>
          </h2>
          <ImageUploader
            images={images}
            onChange={setImages}
            primaryIndex={primaryImageIndex}
            onPrimaryChange={setPrimaryImageIndex}
          />
          {errors.images && <p className="text-xs text-destructive">{errors.images}</p>}
        </div>

        {/* Variants */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Variants</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <TagInput
              tags={form.colors}
              onChange={(colors) => updateField("colors", colors)}
              placeholder="Add color and press Enter..."
              label="Colors"
              suggestions={["Black", "White", "Red", "Blue", "Green", "Navy", "Grey", "Brown", "Pink", "Purple"]}
            />
            <TagInput
              tags={form.sizes}
              onChange={(sizes) => updateField("sizes", sizes)}
              placeholder="Add size and press Enter..."
              label="Sizes"
              suggestions={["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42"]}
            />
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Specifications</h2>
            <Button type="button" variant="outline" size="sm" onClick={addSpec}>
              Add Spec
            </Button>
          </div>
          {form.specifications.map((spec, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={spec.key}
                onChange={(e) => updateSpec(index, "key", e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. Battery Life"
              />
              <input
                type="text"
                value={spec.value}
                onChange={(e) => updateSpec(index, "value", e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g. 30 hours"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(index)} className="text-destructive shrink-0">
                <span className="text-lg">×</span>
              </Button>
            </div>
          ))}
        </div>

        {/* Tags & Flags */}
        <div className="bg-card border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Tags & Status</h2>
          <TagInput
            tags={form.tags}
            onChange={(tags) => updateField("tags", tags)}
            placeholder="Add tag and press Enter..."
            label="Tags"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {[
              { key: "isFeatured" as const, label: "Featured" },
              { key: "isBestseller" as const, label: "Bestseller" },
              { key: "isNewArrival" as const, label: "New Arrival" },
              { key: "isActive" as const, label: "Active" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => updateField(key, e.target.checked)}
                  className="w-4 h-4 rounded border accent-primary"
                />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting} className="min-w-[140px]">
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Product</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
