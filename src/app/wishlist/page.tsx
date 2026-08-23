"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Save items you love to your wishlist. Review them anytime and easily move them to your cart.
        </p>
        <Button size="lg" asChild className="rounded-full">
          <Link href="/products">Discover Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'items'} saved</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item._id} className="group flex flex-col bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="aspect-square bg-secondary relative overflow-hidden">
              <Link href={`/products/${item._id}`}>
                <Image 
                  src={item.image} 
                  alt={item.name} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="rounded-full shadow-sm opacity-90 hover:opacity-100" 
                  onClick={() => removeItem(item._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-5 space-y-4 flex-1 flex flex-col">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.brand}</div>
                <Link href={`/products/${item._id}`}>
                  <h3 className="font-semibold leading-tight line-clamp-2 hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                </Link>
              </div>
              
              <div className="mt-auto pt-4 flex items-center justify-between">
                <div className="font-bold text-lg">${item.price.toFixed(2)}</div>
                <Button 
                  size="sm" 
                  className="rounded-full" 
                  disabled={item.stock <= 0}
                  onClick={() => {
                    addItem({ ...item }, 1);
                    removeItem(item._id);
                    alert(`Moved ${item.name} to cart!`);
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" /> Move to Cart
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
