"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, RefreshCcw, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function FailedContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
        <XCircle className="w-12 h-12" />
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-4">Payment Failed</h1>
      <p className="text-lg text-muted-foreground mb-8">
        We were unable to process your payment. No charges were made to your account.
        This could be due to a declined card, insufficient funds, or a network error.
      </p>

      <div className="bg-card border rounded-2xl p-6 mb-8 text-left">
        <h3 className="font-semibold mb-2">Suggestions to resolve this:</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
          <li>Check if your card has sufficient funds or limit.</li>
          <li>Ensure your card is authorized for online/e-commerce transactions.</li>
          <li>Try using a different payment method (like UPI or NetBanking).</li>
          <li>Try again after a few minutes in case of network issues.</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-14 px-8 group">
          <Link href="/cart">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Return to Cart
          </Link>
        </Button>
        {sessionId && (
          <Button size="lg" asChild className="w-full sm:w-auto h-14 px-8">
            <Link href={`/checkout?session_id=${sessionId}`}>
              <RefreshCcw className="w-4 h-4 mr-2" /> Try Payment Again
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function OrderFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <FailedContent />
    </Suspense>
  );
}
