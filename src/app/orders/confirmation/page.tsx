"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronRight, Package, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const { clearCart } = useCartStore();
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!cleared && orderId) {
      clearCart();
      setCleared(true);
    }
  }, [orderId, cleared, clearCart]);

  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Order</h1>
        <p className="text-muted-foreground mb-8">No order ID was provided.</p>
        <Button asChild><Link href="/">Return to Home</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-4">Order Confirmed!</h1>
      <p className="text-xl text-muted-foreground mb-2">Thank you for your purchase.</p>
      <p className="text-muted-foreground mb-8">
        Your order <span className="font-semibold text-foreground">{orderId}</span> has been received and is being processed. 
        We've sent a confirmation email with your order details.
      </p>

      <div className="bg-card border rounded-2xl p-8 mb-8 text-left max-w-md mx-auto">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" /> What happens next?
        </h2>
        <ul className="space-y-4 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">1</div>
            <p>We're currently processing your order and preparing it for shipment.</p>
          </li>
          <li className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">2</div>
            <p>You'll receive an email with tracking information once your order ships.</p>
          </li>
          <li className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-medium">3</div>
            <p>Your premium products will arrive at your doorstep within 3-5 business days.</p>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-14 px-8">
          <Link href="/products">Continue Shopping</Link>
        </Button>
        <Button size="lg" asChild className="w-full sm:w-auto h-14 px-8 group">
          <Link href="/dashboard/orders">
            View Order Status <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
