import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Truck, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/ProductImage";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Brand from "@/models/Brand";

// Disable Next.js static caching for this page so it always shows the latest products
export const dynamic = "force-dynamic";

export default async function Home() {
  await dbConnect();

  // Fetch categories directly on the server
  const categoriesDocs = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  // Fetch direct product counts for each category
  const counts = await Product.aggregate([
    { $match: { isActive: true, isDeleted: { $ne: true }, status: "ACTIVE" } },
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);
  const countMap = new Map(counts.map((c: any) => [c._id.toString(), c.count]));

  const categories = categoriesDocs
    .map((c) => {
      const productCount = countMap.get(c._id.toString()) || 0;
      return { ...c, productCount };
    })
    .filter((c) => c.productCount > 0)
    .sort((a, b) => {
      if (a.image && !b.image) return -1;
      if (!a.image && b.image) return 1;
      return b.productCount - a.productCount;
    })
    .slice(0, 4);

  // Fetch featured products
  let featuredProducts = await Product.find({
    isActive: true,
    isDeleted: { $ne: true },
    status: "ACTIVE",
    isFeatured: true,
  })
    .populate("brand", "name slug")
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  if (featuredProducts.length === 0) {
    featuredProducts = await Product.find({
      isActive: true,
      isDeleted: { $ne: true },
      status: "ACTIVE",
    })
      .populate("brand", "name slug")
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();
  }

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
            {categories.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">No categories available.</div>
            ) : (
              categories.map((cat: any) => (
                <Link key={cat._id.toString()} href={`/categories/${cat.slug}`} className="group relative block overflow-hidden rounded-2xl aspect-[4/5]">
                  <ProductImage
                    src={(cat.image?.url) || (typeof cat.image === 'string' ? cat.image : "")}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 p-6 w-full text-white">
                    <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                    <p className="text-white/80 text-sm font-medium">{cat.productCount} Products</p>
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
            {featuredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">No featured products available.</div>
            ) : (
              featuredProducts.map((product: any) => {
                const discountPrice = product.discountPrice;
                const price = product.price;
                const percentOff = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : null;
                return (
                  <Link key={product._id.toString()} href={`/products/${product._id.toString()}`} className="group space-y-4">
                    <div className="aspect-[3/4] bg-secondary relative overflow-hidden rounded-2xl">
                      <ProductImage
                        src={(product.thumbnail || product.images?.[0]?.url) as string}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {discountPrice && (
                        <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                          {percentOff}% OFF
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                        {product.brand?.name || 'ARJ Store'}
                      </div>
                      <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold">₹{(discountPrice || price).toLocaleString()}</span>
                        {discountPrice && (
                          <span className="text-muted-foreground line-through text-sm">₹{price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
