import { ArrowLeft, Truck, Clock, ShieldCheck, Globe } from "lucide-react";
import Link from "next/link";

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Link>
      
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Shipping Information</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Everything you need to know about our delivery options, times, and costs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-card border rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Standard Delivery</h3>
            <p className="text-sm text-muted-foreground mb-2">3-5 Business Days</p>
            <p className="font-medium">₹50 (Free over ₹500)</p>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Express Delivery</h3>
            <p className="text-sm text-muted-foreground mb-2">1-2 Business Days</p>
            <p className="font-medium">₹150 Flat Rate</p>
          </div>
        </div>
        
        <div className="bg-card border rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">International Shipping</h3>
            <p className="text-sm text-muted-foreground mb-2">7-14 Business Days</p>
            <p className="font-medium">Rates calculated at checkout</p>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-secondary text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Secure Packaging</h3>
            <p className="text-sm text-muted-foreground mb-2">All items are insured</p>
            <p className="font-medium">100% Damage Protection</p>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-sm prose prose-slate dark:prose-invert max-w-none">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Order Processing</h2>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Orders placed before 2:00 PM local time are processed the same business day. Orders placed after 2:00 PM, or on weekends and holidays, will be processed the following business day. You will receive a confirmation email once your order has been successfully placed.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-foreground">Tracking Your Order</h2>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Once your order has been dispatched from our warehouse, you will receive a shipping confirmation email containing a tracking number and a link to track your package. You can also track your order in real-time by visiting our <Link href="/track-order" className="text-primary hover:underline">Track Order</Link> page.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-foreground">Delivery Exceptions</h2>
        <p className="text-muted-foreground leading-relaxed">
          While we strive to ensure timely delivery of all orders, unforeseen circumstances such as severe weather, natural disasters, or carrier delays may impact delivery times. In such events, we will proactively communicate any significant delays.
        </p>
      </div>
    </div>
  );
}
