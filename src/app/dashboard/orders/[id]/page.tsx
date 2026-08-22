"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Package, CheckCircle2, Clock, Truck, Home, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = ["Pending", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered"];
const ICONS: Record<string, any> = {
  "Pending": Clock,
  "Processing": Package,
  "Packed": Package,
  "Shipped": Truck,
  "Out for Delivery": Truck,
  "Delivered": Home,
  "Return Requested": AlertTriangle,
  "Returned": CheckCircle2,
  "Cancelled": XCircle
};

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${resolvedParams.id}`);
      if (res.ok) setOrder(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [resolvedParams.id]);

  const handleAction = async (action: "cancel" | "return") => {
    const reason = prompt(`Please provide a reason for ${action === 'cancel' ? 'cancellation' : 'return'}:`);
    if (reason === null) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${resolvedParams.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Order successfully ${action === 'cancel' ? 'cancelled' : 'marked for return'}`);
      fetchOrder();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 animate-pulse">Loading order details...</div>;
  if (!order) return <div className="text-center py-20">Order not found.</div>;

  const currentStepIndex = STEPS.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";
  const isReturn = ["Return Requested", "Returned", "Refunded"].includes(order.status);

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Order #{order.orderId.slice(-8).toUpperCase()}</h1>
          <p className="text-muted-foreground text-sm">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="ml-auto">
          {order.status === "Delivered" && (
            <Button variant="outline" onClick={() => handleAction("return")} disabled={actionLoading}>
              Request Return
            </Button>
          )}
          {["Pending", "Processing", "Confirmed"].includes(order.status) && (
            <Button variant="destructive" onClick={() => handleAction("cancel")} disabled={actionLoading}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tracking Timeline */}
          <div className="bg-card border rounded-2xl p-8">
            <h2 className="font-semibold text-lg mb-6">Tracking Status</h2>
            
            {isCancelled || isReturn ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-semibold">Order {order.status}</div>
                  <div className="text-sm mt-1">{order.cancellationReason || order.returnReason || "Status updated by admin"}</div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-secondary" />
                <div className="space-y-8">
                  {STEPS.map((step, idx) => {
                    const isCompleted = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;
                    const Icon = ICONS[step] || Clock;
                    
                    const historyLog = order.trackingHistory?.find((h: any) => h.status === step);

                    return (
                      <div key={step} className="flex gap-6 relative z-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-background transition-colors ${
                          isCompleted ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="pt-2">
                          <h3 className={`font-semibold ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                            {step}
                          </h3>
                          {historyLog && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(historyLog.timestamp).toLocaleString()}
                              {historyLog.comment && ` - ${historyLog.comment}`}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-card border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4">Items in this order</h2>
            <div className="space-y-4">
              {order.orderItems.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-xl bg-secondary overflow-hidden border">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <Link href={`/products/${item.product}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      Qty: {item.quantity} • ₹{item.price.toLocaleString()}
                    </p>
                    {item.variant && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Variant: {Object.values(item.variant).filter(Boolean).join(" | ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Details */}
        <div className="space-y-8">
          <div className="bg-card border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4">Payment Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Payment Method</span>
                <span className="uppercase text-foreground">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{order.itemsPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{order.shippingPrice === 0 ? "Free" : `₹${order.shippingPrice.toLocaleString()}`}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-3 border-t">
                <span>Total</span>
                <span className="text-primary text-lg">₹{order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className={`text-center py-2 rounded-lg text-sm font-semibold ${
                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 
                order.paymentStatus === 'refunded' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {order.paymentStatus.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4">Shipping Details</h2>
            <div className="text-sm space-y-1">
              <p className="font-medium text-base mb-2">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
              <p className="mt-2 text-muted-foreground">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
