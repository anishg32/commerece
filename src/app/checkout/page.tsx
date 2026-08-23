"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, CreditCard, Loader2, ShieldCheck, Truck, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [shipping, setShipping] = useState({
    fullName: "", phone: "", address: "", city: "", state: "", postalCode: "", country: "India"
  });
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [useNewAddress, setUseNewAddress] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      router.push("/cart");
      return;
    }

    fetch(`/api/checkout/session?id=${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.message) throw new Error(data.message);
        setSessionData(data);
      })
      .catch(e => setError((e instanceof Error ? e.message : String(e))))
      .finally(() => setLoading(false));

    // Fetch saved addresses if logged in
    fetch("/api/user/addresses")
      .then(r => { if(r.ok) return r.json(); return []; })
      .then(data => {
        if (data && data.length > 0) {
          setSavedAddresses(data);
          const defaultAddr = data.find((a: any) => a.isDefault) || data[0];
          setShipping({
            fullName: defaultAddr.fullName,
            phone: defaultAddr.phone,
            address: `${defaultAddr.houseBuilding}, ${defaultAddr.street}`,
            city: defaultAddr.city,
            state: defaultAddr.state,
            postalCode: defaultAddr.pinCode,
            country: defaultAddr.country
          });
        } else {
          setUseNewAddress(true);
        }
      })
      .catch(e => console.error(e));
  }, [sessionId, router]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (paymentMethod === "cod") {
      setProcessing(true);
      try {
        const res = await fetch("/api/payment/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, customer, shipping })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        router.push(`/orders/confirmation?id=${data.orderId}`);
      } catch (e: unknown) {
        alert((e instanceof Error ? e.message : String(e)));
        setProcessing(false);
      }
      return;
    }

    // Razorpay Flow
    setProcessing(true);
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setProcessing(false);
      return;
    }

    try {
      // Create Razorpay order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, customer, shipping })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "LUXE.",
        description: "Premium Purchase",
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          // Verify payment
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.message);
            router.push(`/orders/confirmation?id=${verifyData.orderId}`);
          } catch (e: unknown) {
            alert((e instanceof Error ? e.message : String(e)) || "Payment verification failed");
            router.push(`/orders/failed?session_id=${sessionId}`);
          }
        },
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone
        },
        theme: { color: "#4f46e5" }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on("payment.failed", function () {
        router.push(`/orders/failed?session_id=${sessionId}`);
      });
      paymentObject.open();
    } catch (e: unknown) {
      alert((e instanceof Error ? e.message : String(e)));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error) return (
    <div className="container mx-auto py-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Checkout Error</h1>
      <p className="text-destructive mb-8">{error}</p>
      <Button asChild><Link href="/cart">Return to Cart</Link></Button>
    </div>
  );

  const inputClass = "w-full px-4 py-3 rounded-lg border bg-background text-sm outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Secure Checkout</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4" /> 256-bit encrypted secure payment
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Checkout Form */}
        <div className="flex-1 space-y-6">
          {/* Steps Progress */}
          <div className="flex items-center justify-between mb-8 px-4">
            {['Customer Info', 'Shipping', 'Payment'].map((label, i) => (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step > i + 1 ? 'bg-primary text-primary-foreground' : 
                    step === i + 1 ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden sm:block ${step >= i + 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </div>
                {i < 2 && <div className={`h-1 w-12 sm:w-24 mx-2 rounded ${step > i + 1 ? 'bg-primary' : 'bg-secondary'}`} />}
              </div>
            ))}
          </div>

          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4 animate-in fade-in">
                <h2 className="text-xl font-bold mb-4">Customer Information</h2>
                <div className="space-y-4">
                  <input type="text" placeholder="Full Name *" required value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className={inputClass} />
                  <input type="email" placeholder="Email Address *" required value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className={inputClass} />
                  <input type="tel" placeholder="Phone Number *" required value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className={inputClass} />
                </div>
                <Button type="submit" size="lg" className="w-full mt-6">Continue to Shipping</Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Shipping Address</h2>
                  <button type="button" onClick={() => setStep(1)} className="text-sm text-primary hover:underline">Edit Customer</button>
                </div>
                
                <div className="flex justify-end mb-4">
                  {!useNewAddress && savedAddresses.length > 0 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setUseNewAddress(true)}>
                      + Add New Address
                    </Button>
                  )}
                  {useNewAddress && savedAddresses.length > 0 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setUseNewAddress(false)}>
                      Use Saved Address
                    </Button>
                  )}
                </div>

                {!useNewAddress && savedAddresses.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => (
                      <label 
                        key={addr._id} 
                        className={`border rounded-xl p-4 cursor-pointer transition-colors ${
                          shipping.address.includes(addr.street) 
                            ? "border-primary bg-primary/5 ring-1 ring-primary" 
                            : "hover:border-primary/50"
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="savedAddress" 
                          className="sr-only"
                          checked={shipping.address.includes(addr.street)}
                          onChange={() => {
                            setShipping({
                              fullName: addr.fullName,
                              phone: addr.phone,
                              address: `${addr.houseBuilding}, ${addr.street}`,
                              city: addr.city,
                              state: addr.state,
                              postalCode: addr.pinCode,
                              country: addr.country
                            });
                          }}
                        />
                        <div className="font-semibold">{addr.fullName}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {addr.houseBuilding}, {addr.street}<br/>
                          {addr.city}, {addr.state} - {addr.pinCode}<br/>
                          {addr.phone}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Full Name *" required value={shipping.fullName} onChange={e => setShipping({...shipping, fullName: e.target.value})} className={inputClass} />
                    <input type="tel" placeholder="Phone *" required value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} className={inputClass} />
                    <div className="sm:col-span-2">
                      <input type="text" placeholder="Street Address *" required value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} className={inputClass} />
                    </div>
                    <input type="text" placeholder="City *" required value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} className={inputClass} />
                    <input type="text" placeholder="State/Province *" required value={shipping.state} onChange={e => setShipping({...shipping, state: e.target.value})} className={inputClass} />
                    <input type="text" placeholder="Postal Code *" required value={shipping.postalCode} onChange={e => setShipping({...shipping, postalCode: e.target.value})} className={inputClass} />
                    <input type="text" value={shipping.country} disabled className={`${inputClass} bg-secondary/50`} />
                  </div>
                )}
                
                <div className="flex gap-4 mt-6">
                  <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)}>Back</Button>
                  <Button type="submit" size="lg" className="flex-1">Continue to Payment</Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Payment Method</h2>
                  <button type="button" onClick={() => setStep(2)} className="text-sm text-primary hover:underline">Edit Shipping</button>
                </div>
                
                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-5 h-5 accent-primary" />
                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'razorpay' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <div className="font-semibold">Razorpay Secure</div>
                      <div className="text-xs text-muted-foreground">Credit Card, Debit Card, UPI, NetBanking</div>
                    </div>
                  </label>
                  
                  <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 accent-primary" />
                    <Truck className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <div className="font-semibold">Cash on Delivery</div>
                      <div className="text-xs text-muted-foreground">Pay when your order arrives</div>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button type="button" variant="outline" size="lg" onClick={() => setStep(2)} disabled={processing}>Back</Button>
                  <Button size="lg" className="flex-1 text-lg h-14" onClick={handlePayment} disabled={processing}>
                    {processing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</> : `Pay ₹${sessionData.totalPrice.toLocaleString()}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-card border rounded-2xl p-6 sticky top-24 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-6">
              {sessionData.items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <div className="relative w-16 h-16 rounded-lg bg-secondary overflow-hidden shrink-0 border">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold z-10">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-2 leading-tight mb-1">{item.name}</p>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.variant.color && `Color: ${item.variant.color}`}
                        {item.variant.color && item.variant.size && ' | '}
                        {item.variant.size && `Size: ${item.variant.size}`}
                      </p>
                    )}
                    <p className="font-semibold text-primary">₹{(item.discountPrice || item.price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{sessionData.itemsPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">₹{sessionData.taxPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{sessionData.shippingPrice === 0 ? "FREE" : `₹${sessionData.shippingPrice.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t mt-3">
                <span className="font-bold text-base">Total</span>
                <span className="font-bold text-2xl text-primary">₹{sessionData.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                <span>Protected by Razorpay secure payment gateway</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
