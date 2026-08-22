"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, ShoppingCart, Heart, Truck, Shield, ArrowRight, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { ProductImage } from "@/components/ui/ProductImage";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isProcessingBuyNow, setIsProcessingBuyNow] = useState(false);
  
  const { addItem: addToCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${resolvedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
          if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex animate-pulse">
        <div className="w-full md:w-1/2 aspect-square bg-secondary rounded-2xl" />
        <div className="w-full md:w-1/2 p-8 space-y-4">
          <div className="h-8 bg-secondary rounded w-3/4" />
          <div className="h-4 bg-secondary rounded w-1/4" />
          <div className="h-6 bg-secondary rounded w-1/3" />
          <div className="h-32 bg-secondary rounded w-full mt-8" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">The product you are looking for does not exist or has been removed.</p>
        <Button asChild><Link href="/products">Back to Products</Link></Button>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id);
  const price = product.discountPrice || product.price;
  const isOutOfStock = product.stock <= 0;
  const images = product.images?.length > 0 ? product.images : [product.thumbnail || ""];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      _id: product._id,
      name: product.name,
      price: price,
      image: images[0],
      brand: product.brand || 'Luxe',
      stock: product.stock,
      variant: { color: selectedColor, size: selectedSize }
    }, quantity);
    alert(`Added ${quantity} ${product.name} to cart!`);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    setIsProcessingBuyNow(true);
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "buy_now",
          productId: product._id,
          quantity,
          variant: { color: selectedColor, size: selectedSize }
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?callbackUrl=/products/${product._id}`);
          return;
        }
        throw new Error(data.message);
      }
      
      router.push(`/checkout?session_id=${data.sessionId}`);
    } catch (e: any) {
      alert(e.message || "Failed to initiate checkout");
      setIsProcessingBuyNow(false);
    }
  };

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist({
        _id: product._id,
        name: product.name,
        price: price,
        image: images[0],
        brand: product.brand || 'Luxe',
        stock: product.stock
      });
    }
  };

  const nextImage = () => setActiveImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
        {product.category?.name && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/categories/${product.category.slug}`} className="hover:text-primary transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Product Images */}
        <div className="w-full lg:w-1/2 space-y-4">
          <div className="relative aspect-square bg-secondary rounded-2xl overflow-hidden group">
            <ProductImage 
              src={images[activeImage]} 
              alt={product.name} 
              fill 
              className="object-cover" 
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {product.discountPrice && (
              <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1.5 rounded-full z-10">
                {product.discountPercentage}% OFF
              </div>
            )}
            
            {/* Gallery Navigation */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
              {images.map((img: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 snap-start border-2 transition-colors ${
                    activeImage === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <ProductImage src={img} alt={`Thumbnail ${i+1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="mb-6">
            <div className="text-sm text-primary font-semibold uppercase tracking-wider mb-2">
              {product.brand || 'Luxe'}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-yellow-500">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} className={`w-4 h-4 ${star <= Math.round(product.rating || 5) ? "fill-current" : "text-muted opacity-30"}`} />
                ))}
                <span className="text-sm text-muted-foreground ml-1">({product.numReviews || 0} reviews)</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="text-sm font-medium text-muted-foreground">
                SKU: <span className="uppercase">{product.sku}</span>
              </div>
            </div>

            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-bold">₹{price.toLocaleString()}</span>
              {product.discountPrice && (
                <span className="text-xl text-muted-foreground line-through mb-1">
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">
              {product.shortDescription || product.description}
            </p>
          </div>

          <div className="space-y-6 mb-8 flex-1">
            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Color: <span className="text-muted-foreground">{selectedColor}</span></h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedColor === color 
                          ? "border-primary bg-primary text-primary-foreground" 
                          : "border-input bg-background hover:bg-secondary"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Size: <span className="text-muted-foreground">{selectedSize}</span></h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg border flex items-center justify-center font-medium transition-all ${
                        selectedSize === size 
                          ? "border-primary bg-primary text-primary-foreground" 
                          : "border-input bg-background hover:bg-secondary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Quantity</h3>
                <span className={`text-sm font-medium ${
                  product.stock > 10 ? "text-green-600" : 
                  product.stock > 0 ? "text-orange-500" : "text-destructive"
                }`}>
                  {product.stock > 10 ? "In Stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of Stock"}
                </span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center border rounded-lg h-12">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors rounded-l-lg disabled:opacity-50"
                    disabled={isOutOfStock}
                  >
                    -
                  </button>
                  <div className="w-12 h-full flex items-center justify-center font-medium border-x">
                    {quantity}
                  </div>
                  <button 
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-12 h-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors rounded-r-lg disabled:opacity-50"
                    disabled={isOutOfStock || quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 text-base font-semibold"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
            <Button 
              size="lg" 
              className="h-14 text-base font-semibold"
              onClick={handleBuyNow}
              disabled={isOutOfStock || isProcessingBuyNow}
            >
              {isProcessingBuyNow ? "Processing..." : "Buy Now"}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 py-6 border-y border-border">
            <button 
              onClick={toggleWishlist}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isWishlisted ? "text-destructive" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
              {isWishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-xl">
              <Truck className="w-5 h-5 text-primary" />
              <div className="text-sm">
                <span className="font-semibold block">Free Delivery</span>
                <span className="text-muted-foreground">Orders over ₹500</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-xl">
              <Shield className="w-5 h-5 text-primary" />
              <div className="text-sm">
                <span className="font-semibold block">Secure Payment</span>
                <span className="text-muted-foreground">100% protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specs Tabs */}
      <div className="mt-24">
        <h2 className="text-2xl font-bold tracking-tight mb-8">Product Details</h2>
        <div className="bg-card border rounded-2xl p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </div>
            </div>
            {product.specifications?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                <div className="divide-y border rounded-xl overflow-hidden">
                  {product.specifications.map((spec: any, i: number) => (
                    <div key={i} className={`flex p-4 text-sm ${i % 2 === 0 ? 'bg-secondary/20' : 'bg-background'}`}>
                      <div className="w-1/3 font-medium text-muted-foreground">{spec.key}</div>
                      <div className="w-2/3">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
