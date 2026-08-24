"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Star, ShoppingCart, Heart, SearchX, Filter, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { ProductImage } from "@/components/ui/ProductImage";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("");
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    params.then((p) => setSlug(p.slug)).catch(console.error);
  }, [params]);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [sort, setSort] = useState("newest");
  const [filters, setFilters] = useState<any>({ brands: [], attributes: {} });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string[]>>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    if (!slug) return;
    fetch("/api/categories")
      .then(r => r.json())
      .then(cats => {
        const findCat = (nodes: any[], targetSlug: string): any => {
          for (const node of nodes) {
            if (node.slug === targetSlug) return node;
            if (node.children && node.children.length > 0) {
              const found = findCat(node.children, targetSlug);
              if (found) return found;
            }
          }
          return null;
        };
        const cat = findCat(cats, slug);
        if (cat) setCategoryInfo(cat);
      })
      .catch(console.error);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    const fetchProducts = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const queryParams = new URLSearchParams({
          category: slug,
          page: page.toString(),
          limit: "12",
          sort
        });

        if (selectedBrands.length > 0) {
          queryParams.set("brand", selectedBrands.join(","));
        }

        Object.entries(selectedAttrs).forEach(([attr, values]) => {
          if (values.length > 0) {
            queryParams.set(`attr_${attr}`, values.join(","));
          }
        });

        const res = await fetch(`/api/products?${queryParams.toString()}`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          if (page === 1) {
            setProducts(data.products);
            setFilters(data.filters || { brands: [], attributes: {} });
          } else {
            setProducts(prev => [...prev, ...data.products]);
          }
          setTotalPages(data.pages);
          setTotal(data.total);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        console.error(error);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [slug, page, sort, selectedBrands, selectedAttrs]);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.thumbnail || product.images?.[0]?.url || "",
      brand: product.brand?.name || 'ARJ Store',
      stock: product.stock
    }, 1);
    alert(`Added ${product.name} to cart!`);
  };

  const toggleWishlist = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    if (isInWishlist(product._id)) removeFromWishlist(product._id);
    else {
      addToWishlist({
        _id: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        image: product.thumbnail || product.images?.[0]?.url || "",
        brand: product.brand?.name || 'ARJ Store',
        stock: product.stock
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/categories" className="hover:text-primary transition-colors">Categories</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium capitalize">{categoryInfo?.name || slug}</span>
      </div>

      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight capitalize mb-4">{categoryInfo?.name || slug}</h1>
          <p className="text-lg text-muted-foreground">
            {categoryInfo?.description || `Showing premium products in the ${categoryInfo?.name || slug} category.`}
          </p>
          <div className="text-sm font-medium mt-4 text-primary bg-primary/10 inline-block px-3 py-1 rounded-full">
            {total} Products
          </div>
          
          {categoryInfo?.children && categoryInfo.children.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {categoryInfo.children.map((child: any) => (
                <Link 
                  key={child._id} 
                  href={`/categories/${child.slug}`}
                  className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors rounded-full text-sm font-medium"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="w-full md:w-auto flex gap-2">
          <Button variant="outline" className="md:hidden" onClick={() => setShowMobileFilters(!showMobileFilters)}>
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
          <select 
            value={sort} 
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="w-full md:w-48 px-4 py-2 border rounded-full bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`w-full md:w-64 shrink-0 space-y-6 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
          <div className="flex items-center justify-between md:hidden mb-4">
            <h3 className="font-bold">Filters</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {(selectedBrands.length > 0 || Object.values(selectedAttrs).some(v => v.length > 0)) && (
            <Button 
              variant="outline" 
              className="w-full mb-4"
              onClick={() => {
                setSelectedBrands([]);
                setSelectedAttrs({});
                setPage(1);
              }}
            >
              Clear All Filters
            </Button>
          )}

          {filters.brands?.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Brands</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                {filters.brands.map((b: any) => (
                  <label key={b._id} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                      checked={selectedBrands.includes(b._id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedBrands([...selectedBrands, b._id]);
                        else setSelectedBrands(selectedBrands.filter(id => id !== b._id));
                        setPage(1);
                      }}
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">{b.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {Object.entries(filters.attributes || {}).map(([attr, values]: any) => (
            <div key={attr} className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{attr}</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                {values.map((v: string) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                      checked={selectedAttrs[attr]?.includes(v) || false}
                      onChange={(e) => {
                        const current = selectedAttrs[attr] || [];
                        if (e.target.checked) {
                          setSelectedAttrs({ ...selectedAttrs, [attr]: [...current, v] });
                        } else {
                          setSelectedAttrs({ ...selectedAttrs, [attr]: current.filter(val => val !== v) });
                        }
                        setPage(1);
                      }}
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">{v}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loading && page === 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {Array(8).fill(0).map((_, i) => (
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
          <h2 className="text-2xl font-bold mb-2">No products found</h2>
          <p className="text-muted-foreground mb-6">We don't have any items in this category matching your criteria.</p>
          <Button asChild><Link href="/products">View All Products</Link></Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                    <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{product.brand?.name || 'ARJ Store'}</div>
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
