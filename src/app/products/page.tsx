"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, ShoppingCart, Heart, SearchX, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

export default function ProductsPage() {
  const [products, setProducts] = useState<Record<string, any>[]>([]);
  const [categories, setCategories] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [attributeFilters, setAttributeFilters] = useState<Record<string, string[]>>({});
  
  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  const activeCategoryData = categories.find(c => c.slug === category);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  // Reset attribute filters when category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAttributeFilters({});
    }, 0);
    return () => clearTimeout(timer);
  }, [category]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({ 
          page: page.toString(), 
          limit: "12",
          sort
        });
        if (category) params.set("category", category);

        // Add dynamic attribute filters to URL params
        Object.entries(attributeFilters).forEach(([key, values]) => {
          if (values.length > 0) {
            params.set(`attr_${key}`, values.join(','));
          }
        });

        const res = await fetch(`/api/products?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (page === 1) {
            setProducts(data.products);
          } else {
            setProducts(prev => [...prev, ...data.products]);
          }
          setTotalPages(data.pages);
          setTotal(data.total);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchProducts();
  }, [page, category, sort, attributeFilters]);

  const handleAddToCart = (e: React.MouseEvent, product: Record<string, any>) => {
    e.preventDefault();
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.thumbnail || product.images?.[0]?.url || "",
      brand: product.brand || 'Luxe',
      stock: product.stock
    }, 1);
    alert(`Added ${product.name} to cart!`);
  };

  const toggleWishlist = (e: React.MouseEvent, product: Record<string, any>) => {
    e.preventDefault();
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist({
        _id: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        image: product.thumbnail || product.images?.[0]?.url || "",
        brand: product.brand || 'Luxe',
        stock: product.stock
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">All Products</h1>
          <p className="text-muted-foreground">Showing {products.length} of {total} products</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="md:hidden flex-1" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <select 
            value={sort} 
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-4 py-2 border rounded-full bg-background text-sm outline-none focus:ring-2 focus:ring-primary flex-1 md:w-[200px]"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0 space-y-8`}>
          <div className="flex items-center justify-between md:hidden">
            <h2 className="font-bold text-lg">Filters</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-4 pb-2 border-b">Categories</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="category" 
                  checked={category === ""} 
                  onChange={() => { setCategory(""); setPage(1); }}
                  className="accent-primary" 
                />
                <span className={category === "" ? "font-medium" : "text-muted-foreground"}>All Categories</span>
              </label>
              {categories.map(cat => (
                <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="category" 
                    checked={category === cat.slug} 
                    onChange={() => { setCategory(cat.slug); setPage(1); }}
                    className="accent-primary" 
                  />
                  <span className={`flex-1 ${category === cat.slug ? "font-medium" : "text-muted-foreground"}`}>{cat.name}</span>
                  <span className="text-xs text-muted-foreground">({cat.productCount})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dynamic Attribute Filters based on Selected Category */}
          {activeCategoryData && activeCategoryData.attributes?.filter((attr: Record<string, any>) => attr.isFilterable && attr.options?.length > 0).map((attr: Record<string, any>) => (
            <div key={attr.name} className="animate-in fade-in slide-in-from-top-4">
              <h3 className="font-semibold mb-4 pb-2 border-b">{attr.name}</h3>
              {attr.type === "color" ? (
                <div className="flex flex-wrap gap-2">
                  {attr.options.map((opt: string) => {
                    const isChecked = attributeFilters[attr.name]?.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          setAttributeFilters(prev => {
                            const current = prev[attr.name] || [];
                            const updated = isChecked ? current.filter(c => c !== opt) : [...current, opt];
                            return { ...prev, [attr.name]: updated };
                          });
                          setPage(1);
                        }}
                        title={opt}
                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${isChecked ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-border hover:scale-105'}`}
                        style={{ backgroundColor: opt.toLowerCase().replace(' ', '') === 'naturaltitanium' ? '#b0aba5' : opt.toLowerCase() }}
                      >
                        {isChecked && (
                          <span className={`text-[10px] ${['White', 'Silver'].includes(opt) ? 'text-black' : 'text-white'}`}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {attr.options.map((opt: string) => {
                    const isChecked = attributeFilters[attr.name]?.includes(opt);
                    return (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setAttributeFilters(prev => {
                              const current = prev[attr.name] || [];
                              const updated = isChecked ? current.filter(c => c !== opt) : [...current, opt];
                              return { ...prev, [attr.name]: updated };
                            });
                            setPage(1);
                          }}
                          className="rounded border-input text-primary focus:ring-primary accent-primary"
                        />
                        <span className={`text-sm transition-colors group-hover:text-foreground ${isChecked ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading && page === 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/5] bg-secondary animate-pulse rounded-2xl" />
                  <div className="h-4 bg-secondary animate-pulse rounded w-2/3" />
                  <div className="h-4 bg-secondary animate-pulse rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed rounded-2xl">
              <SearchX className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
              <h2 className="text-xl font-bold mb-2">No products found</h2>
              <p className="text-muted-foreground mb-6">Try adjusting your filters.</p>
              <Button onClick={() => { setCategory(""); setSort("newest"); }}>Clear Filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                  const isWishlisted = isInWishlist(product._id);
                  const price = product.discountPrice || product.price;
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <Link key={product._id} href={`/products/${product._id}`} className="group flex flex-col">
                      <div className="aspect-[4/5] bg-secondary relative overflow-hidden rounded-2xl mb-4">
                        <ProductImage 
                          src={product.thumbnail || product.images?.[0]?.url} 
                          alt={product.name} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.discountPrice && (
                            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-full">
                              {product.discountPercentage}% OFF
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                              SOLD OUT
                            </span>
                          )}
                        </div>

                        {/* Wishlist Button */}
                        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            className={`w-9 h-9 rounded-full shadow-sm bg-white/90 hover:bg-white transition-colors ${isWishlisted ? 'text-destructive' : ''}`}
                            onClick={(e) => toggleWishlist(e, product)}
                          >
                            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{product.brand || 'Luxe'}</div>
                        <h3 className="font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors text-sm mb-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-auto">
                          <span className="font-bold text-base">₹{price.toLocaleString()}</span>
                          {product.discountPrice && (
                            <span className="text-xs text-muted-foreground line-through">₹{product.price.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {page < totalPages && (
                <div className="mt-12 text-center">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="rounded-full px-8" 
                    onClick={() => setPage(p => p + 1)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load More Products'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
