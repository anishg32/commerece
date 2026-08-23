"use client";

import { useState } from "react";
import { Package, Truck, CheckCircle2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "error">("idle");
  const [orderStatus, setOrderStatus] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !email) return;
    
    setStatus("loading");
    
    // Simulate API delay and mock response
    setTimeout(() => {
      if (orderId.length > 5) {
        setStatus("found");
        setOrderStatus("SHIPPED"); // Mock status
      } else {
        setStatus("error");
      }
    }, 1500);
  };

  const steps = [
    { id: "PENDING", label: "Order Placed", icon: Package },
    { id: "PROCESSING", label: "Processing", icon: Package },
    { id: "SHIPPED", label: "Shipped", icon: Truck },
    { id: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
    { id: "DELIVERED", label: "Delivered", icon: CheckCircle2 }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.id === orderStatus);
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Track Your Order</h1>
        <p className="text-muted-foreground text-lg">
          Enter your Order ID and Email Address to receive real-time updates on your package.
        </p>
      </div>

      <div className="bg-card border rounded-3xl p-8 shadow-sm mb-8">
        <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input 
              required
              type="text" 
              placeholder="Order ID (e.g., ORD-12345)" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all h-12" 
            />
          </div>
          <div className="flex-1">
            <input 
              required
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all h-12" 
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-8 font-semibold shrink-0" disabled={status === "loading"}>
            {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-5 h-5 mr-2" /> Track</>}
          </Button>
        </form>

        {status === "error" && (
          <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium text-center">
            We couldn't find an order with that ID and email combination. Please check your details and try again.
          </div>
        )}
      </div>

      {status === "found" && (
        <div className="bg-card border rounded-3xl p-8 shadow-sm">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold mb-2">Order {orderId.toUpperCase()}</h2>
            <p className="text-muted-foreground">Expected Delivery: {new Date(Date.now() + 86400000 * 2).toLocaleDateString()}</p>
          </div>

          <div className="relative flex justify-between items-center max-w-xl mx-auto mb-8">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -translate-y-1/2 z-0" />
            
            {/* Active Line Progress */}
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-1000 ease-in-out"
              style={{ width: `${(getCurrentStepIndex() / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, idx) => {
              const isActive = idx <= getCurrentStepIndex();
              const isCurrent = idx === getCurrentStepIndex();
              const Icon = step.icon;

              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-500 border-4 border-card ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-semibold hidden md:block absolute -bottom-6 w-32 text-center -ml-10 ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="mt-16 p-6 bg-secondary/30 rounded-2xl">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Latest Updates</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Package has left the courier facility</p>
                  <p className="text-xs text-muted-foreground">Today, 9:41 AM</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-primary/50 mt-2 shrink-0" />
                <div>
                  <p className="font-medium text-sm text-foreground/80">Package arrived at transit facility</p>
                  <p className="text-xs text-muted-foreground">Yesterday, 4:20 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
