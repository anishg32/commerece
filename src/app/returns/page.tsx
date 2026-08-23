import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </Link>
      
      <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Returns & Exchanges</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Our Return Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              At LUXE, we want you to be completely satisfied with your purchase. If for any reason you are not, we offer a hassle-free 30-day return window from the date of delivery for all eligible items.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Eligibility Criteria</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Items must be unused, unaltered, and in their original packaging.</li>
              <li>All tags, manuals, and accessories must be included.</li>
              <li>Proof of purchase (order confirmation or receipt) is required.</li>
              <li>Certain items like personal care products, innerwear, and final sale items are non-returnable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">How to Return an Item</h2>
            <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
              <li><strong className="text-foreground">Initiate Return:</strong> Go to your Account Dashboard or our Track Order page to request a return.</li>
              <li><strong className="text-foreground">Print Label:</strong> Once approved, we will email you a prepaid shipping label.</li>
              <li><strong className="text-foreground">Pack Item:</strong> Securely pack the item in its original packaging.</li>
              <li><strong className="text-foreground">Ship:</strong> Drop off the package at any authorized shipping center.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Refund Process</h2>
            <p className="text-muted-foreground leading-relaxed">
              Once we receive and inspect your returned item (usually within 48 hours of receipt), we will process your refund. Funds will be returned to your original payment method within 5-7 business days, depending on your bank's processing time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Damaged or Defective Products</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you receive an item that is damaged or defective, please contact our customer support team immediately at <a href="mailto:support@luxe.com" className="text-primary hover:underline">support@luxe.com</a> with photos of the damage. We will expedite a replacement or full refund at no additional cost to you.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
