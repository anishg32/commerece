"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalTotal = items.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
  const savings = originalTotal - total;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cart",
          cartItems: items.map(item => ({
            productId: item._id,
            quantity: item.quantity,
            variant: item.variant
          }))
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Checkout failed");
      }

      router.push(`/checkout?session_id=${data.sessionId}`);
    } catch (e: unknown) {
      alert((e instanceof Error ? e.message : String(e)));
      setIsProcessing(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Looks like you haven't added anything to your cart yet. Discover our premium collections.
        </p>
        <Button size="lg" asChild className="rounded-full">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 space-y-6">
          {items.map((item, index) => (
            <div 
              key={`${item._id}-${JSON.stringify(item.variant)}`} 
              className="flex flex-col sm:flex-row gap-4 p-4 bg-card border rounded-2xl relative group animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
            >
              <Link href={`/products/${item._id}`} className="shrink-0">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-secondary rounded-xl overflow-hidden">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
              </Link>
              
              <div className="flex flex-col flex-1 py-1">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{item.brand}</div>
                    <Link href={`/products/${item._id}`}>
                      <h3 className="font-semibold leading-tight hover:text-primary transition-colors pr-8">
                        {item.name}
                      </h3>
                    </Link>
                    {item.variant && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.variant.color && <span>Color: {item.variant.color} </span>}
                        {item.variant.size && <span>Size: {item.variant.size}</span>}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => removeItem(item._id)}
                    className="absolute top-4 right-4 sm:static sm:top-auto sm:right-auto text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4">
                  <div className="flex items-center border rounded-lg h-10">
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-10 h-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors rounded-l-lg"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="w-10 h-full flex items-center justify-center font-medium text-sm border-x">
                      {item.quantity}
                    </div>
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-10 h-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors rounded-r-lg"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="font-bold text-lg">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="w-full lg:w-96 shrink-0 animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="glass-card rounded-2xl p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total MRP ({items.length} items)</span>
                <span className="font-medium text-muted-foreground line-through">₹{originalTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount on MRP</span>
                <span className="font-medium text-green-600">- ₹{savings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-xs pb-4 border-b">
                <span>Taxes and shipping calculated at checkout</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="font-bold text-base">Estimated Total</span>
                <span className="font-bold text-2xl">₹{total.toLocaleString()}</span>
              </div>
              {savings > 0 && (
                <div className="bg-green-50 text-green-700 text-sm font-medium px-4 py-2 rounded-lg text-center mt-2 border border-green-200">
                  You will save ₹{savings.toLocaleString()} on this order
                </div>
              )}
            </div>
            
            <Button 
              size="lg" 
              className="w-full h-14 text-base font-semibold group" 
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Preparing Checkout...</>
              ) : (
                <>Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>
              )}
            </Button>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Secure encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
