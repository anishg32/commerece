"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Star, ShoppingCart, Heart, SearchX, Filter, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { ProductImage } from "@/components/ui/ProductImage";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [products, setProducts] = useState<any[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [sort, setSort] = useState("newest");
  
  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(cats => {
        const cat = cats.find((c: any) => c.slug === slug);
        if (cat) setCategoryInfo(cat);
      })
      .catch(console.error);
  }, [slug]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await fetch(`/api/products?category=${slug}&page=${page}&limit=12&sort=${sort}`);
        if (res.ok) {
          const data = await res.json();
          if (page === 1) setProducts(data.products);
          else setProducts(prev => [...prev, ...data.products]);
          setTotalPages(data.pages);
          setTotal(data.total);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchProducts();
  }, [slug, page, sort]);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.thumbnail || product.images?.[0] || "",
      brand: product.brand || 'Luxe',
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
        image: product.thumbnail || product.images?.[0] || "",
        brand: product.brand || 'Luxe',
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
        </div>
        <div className="w-full md:w-auto">
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

      {loading && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                      src={product.thumbnail || product.images?.[0]} 
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
  );
}
