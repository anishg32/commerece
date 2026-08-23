"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Truck, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/ProductImage";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products?featured=true&limit=4"),
          fetch("/api/categories")
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          setFeaturedProducts(data.products || []);
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          // Get top 4 categories by product count, prioritizing ones with images
          const sortedCats = catData
            .filter((c: Record<string, unknown>) => (c.productCount as number) > 0)
            .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
              if (a.image && !b.image) return -1;
              if (!a.image && b.image) return 1;
              return (b.productCount as number) - (a.productCount as number);
            })
            .slice(0, 4);
          setCategories(sortedCats);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000"
            alt="Premium Interior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-in slide-in-from-bottom-8 duration-1000">
            Elevate Your <br /> Everyday
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 animate-in slide-in-from-bottom-8 duration-1000 delay-150">
            Discover our curated collection of premium products designed for the modern lifestyle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 text-lg px-8 rounded-full" asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 text-lg px-8 rounded-full" asChild>
              <Link href="/categories">View Collections</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-secondary/50 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x border-border">
            <div className="flex flex-col items-center p-4">
              <Truck className="w-8 h-8 mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Free Premium Delivery</h3>
              <p className="text-sm text-muted-foreground">On all orders over ₹500</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Shield className="w-8 h-8 mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">100% secure checkout</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Clock className="w-8 h-8 mb-4 text-primary" />
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Dedicated customer care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Shop by Category</h2>
              <p className="text-muted-foreground">Explore our most popular collections</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex" asChild>
              <Link href="/categories">
                View all categories <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-secondary animate-pulse rounded-2xl" />
              ))
            ) : categories.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">No categories available.</div>
            ) : (
              categories.map((cat) => (
                <Link key={cat._id as string} href={`/categories/${cat.slug}`} className="group relative block overflow-hidden rounded-2xl aspect-[4/5]">
                  <ProductImage 
                    src={(cat.image as any)?.url || (typeof cat.image === 'string' ? cat.image : "")} 
                    alt={cat.name as string} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 p-6 w-full text-white">
                    <h3 className="text-xl font-bold mb-1">{cat.name as string}</h3>
                    <p className="text-white/80 text-sm font-medium">{cat.productCount as number} Products</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Trending Now</h2>
              <p className="text-muted-foreground">Our most sought-after pieces</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex" asChild>
              <Link href="/products">
                Shop all products <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[3/4] bg-secondary animate-pulse rounded-2xl" />
                  <div className="h-4 bg-secondary animate-pulse rounded w-2/3" />
                  <div className="h-4 bg-secondary animate-pulse rounded w-1/3" />
                </div>
              ))
            ) : featuredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">No featured products available.</div>
            ) : (
              featuredProducts.map((product) => {
                const discountPrice = product.discountPrice as number | undefined;
                const price = product.price as number;
                return (
                <Link key={product._id as string} href={`/products/${product._id}`} className="group space-y-4">
                  <div className="aspect-[3/4] bg-secondary relative overflow-hidden rounded-2xl">
                    <ProductImage 
                      src={(product.thumbnail || (product.images as any[])?.[0]?.url) as string} 
                      alt={product.name as string} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {discountPrice && (
                      <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                        {product.discountPercentage as number}% OFF
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                      {(product.brand as string) || 'Luxe'}
                    </div>
                    <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name as string}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold">₹{(discountPrice || price).toLocaleString()}</span>
                      {discountPrice && (
                        <span className="text-muted-foreground line-through text-sm">₹{price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )})
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-2xl text-center space-y-8">
          <h2 className="text-3xl font-bold tracking-tight">Join the LUXE Community</h2>
          <p className="text-muted-foreground">
            Subscribe to receive updates, access to exclusive deals, and more.
          </p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 px-4 py-3 rounded-full border bg-background outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <Button type="submit" size="lg" className="rounded-full px-8">Subscribe</Button>
          </form>
        </div>
      </section>
    </div>
  );
}
