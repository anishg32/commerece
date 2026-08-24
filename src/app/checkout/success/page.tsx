"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-lg min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      
      <h1 className="text-3xl font-bold tracking-tight mb-4">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-8 text-lg">
        Thank you for your purchase. Your order has been placed successfully.
      </p>
      
      {orderId && (
        <div className="bg-secondary/50 p-4 rounded-xl inline-block mb-10">
          <p className="text-sm text-muted-foreground mb-1">Order Number</p>
          <p className="font-mono font-bold text-lg">{orderId}</p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Button size="lg" variant="outline" asChild className="h-14 rounded-full">
          <Link href="/profile/orders">
            View Order Status
          </Link>
        </Button>
        <Button size="lg" asChild className="h-14 rounded-full">
          <Link href="/products">
            Continue Shopping <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-20 text-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
