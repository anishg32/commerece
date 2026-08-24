"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Truck, CreditCard, ChevronRight, CheckCircle2, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCartStore();

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  useEffect(() => {
    if (!sessionId) {
      router.push("/cart");
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/checkout/session?id=${sessionId}`);
        if (res.ok) {
          setSessionData(await res.json());
        } else {
          const errData = await res.json();
          setError(errData.message || "Failed to load checkout session");
        }
      } catch (e: unknown) {
        setError((e instanceof Error ? e.message : String(e)));
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, router]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          shippingAddress,
          paymentMethod
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      // If it was a cart checkout, clear the cart
      if (sessionData.type === "cart") {
        clearCart();
      }

      router.push(`/checkout/success?order_id=${data.orderId}`);
    } catch (e: unknown) {
      alert((e instanceof Error ? e.message : String(e)));
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading secure checkout...</p>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Checkout Error</h1>
        <p className="text-muted-foreground mb-8">{error || "Invalid checkout session"}</p>
        <Button asChild><Link href="/cart">Return to Cart</Link></Button>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-8 overflow-x-auto pb-2">
        <span className="text-primary flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Cart</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</div> Details</span>
        <ChevronRight className="w-4 h-4" />
        <span className="opacity-50">Payment</span>
        <ChevronRight className="w-4 h-4" />
        <span className="opacity-50">Review</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column: Form */}
        <div className="flex-1">
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-12">
            
            {/* Shipping Address */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Truck className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Shipping Address</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-sm font-medium">Full Name</label>
                  <input type="text" required value={shippingAddress.fullName} onChange={e => setShippingAddress(s => ({...s, fullName: e.target.value}))} className={inputClass} placeholder="John Doe" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-sm font-medium">Street Address</label>
                  <input type="text" required value={shippingAddress.address} onChange={e => setShippingAddress(s => ({...s, address: e.target.value}))} className={inputClass} placeholder="123 Main St, Apartment 4B" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">City</label>
                  <input type="text" required value={shippingAddress.city} onChange={e => setShippingAddress(s => ({...s, city: e.target.value}))} className={inputClass} placeholder="Mumbai" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">State / Province</label>
                  <input type="text" required value={shippingAddress.state} onChange={e => setShippingAddress(s => ({...s, state: e.target.value}))} className={inputClass} placeholder="Maharashtra" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Postal Code</label>
                  <input type="text" required value={shippingAddress.postalCode} onChange={e => setShippingAddress(s => ({...s, postalCode: e.target.value}))} className={inputClass} placeholder="400001" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Phone Number</label>
                  <input type="tel" required value={shippingAddress.phone} onChange={e => setShippingAddress(s => ({...s, phone: e.target.value}))} className={inputClass} placeholder="+91 9876543210" />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Payment Method</h2>
              </div>
              
              <div className="grid gap-4">
                {[
                  { id: "Credit Card", label: "Credit / Debit Card", desc: "Visa, Mastercard, Amex" },
                  { id: "UPI", label: "UPI", desc: "Google Pay, PhonePe, Paytm" },
                  { id: "Cash on Delivery", label: "Cash on Delivery", desc: "Pay when you receive" }
                ].map((method) => (
                  <label 
                    key={method.id}
                    className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === method.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50"
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 mr-4 w-4 h-4 text-primary focus:ring-primary accent-primary"
                    />
                    <div>
                      <div className="font-semibold">{method.label}</div>
                      <div className="text-sm text-muted-foreground">{method.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="bg-card border rounded-2xl p-6 sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {sessionData.items.map((item: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden shrink-0 relative">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium line-clamp-2 leading-tight">{item.name}</div>
                    {item.variant && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.variant.color} • {item.variant.size}
                      </div>
                    )}
                    <div className="text-sm font-bold mt-1">₹{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 text-sm pt-6 border-t mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{sessionData.itemsPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {sessionData.shippingPrice === 0 ? <span className="text-green-600">Free</span> : `₹${sessionData.shippingPrice.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Tax</span>
                <span className="font-medium">₹{sessionData.taxPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t">
                <span className="font-bold text-base">Total</span>
                <span className="font-bold text-2xl text-primary">₹{sessionData.totalPrice.toLocaleString()}</span>
              </div>
            </div>
            
            <Button 
              type="submit" 
              form="checkout-form"
              size="lg" 
              className="w-full h-14 text-base font-bold shadow-md"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
              ) : (
                <><Lock className="w-5 h-5 mr-2" /> Pay ₹{sessionData.totalPrice.toLocaleString()}</>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-20 text-center">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
