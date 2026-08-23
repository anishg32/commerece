"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/ProductImage";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Shop by Category</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Browse our curated collections to find exactly what you're looking for. From premium electronics to high-end fashion, we've got you covered.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-secondary animate-pulse rounded-2xl" />
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            No categories available.
          </div>
        ) : (
          categories.map((cat) => (
            <Link key={cat._id} href={`/categories/${cat.slug}`} className="group relative block overflow-hidden rounded-2xl aspect-[4/3]">
              <ProductImage 
                src={cat.image?.url} 
                alt={cat.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90" />
              
              <div className="absolute bottom-0 left-0 p-6 w-full text-white flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{cat.name}</h2>
                  <p className="text-white/80 text-sm font-medium">{cat.productCount} Products</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
