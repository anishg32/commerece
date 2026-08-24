

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-sm prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <p className="lead text-lg text-muted-foreground mb-8">
          Welcome to ARJ STORE. These Terms and Conditions outline the rules and regulations for the use of ARJ STORE&apos;s Website, located at arjstore.com.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-foreground mt-8">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          By accessing this website we assume you accept these terms and conditions. Do not continue to use ARJ STORE if you do not agree to take all of the terms and conditions stated on this page.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-foreground mt-8">2. Products and Pricing</h2>
        <p className="text-muted-foreground leading-relaxed">
          All products listed on our website are subject to availability. We reserve the right to discontinue any product at any time. Prices for all products are subject to change without notice. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-foreground mt-8">3. Orders and Payments</h2>
        <p className="text-muted-foreground leading-relaxed">
          We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4 text-foreground mt-8">4. User Comments and Feedback</h2>
        <p className="text-muted-foreground leading-relaxed">
          If, at our request, you send certain specific submissions or without a request from us you send creative ideas, suggestions, proposals, plans, or other materials, whether online, by email, by postal mail, or otherwise, you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-foreground mt-8">5. Governing Law</h2>
        <p className="text-muted-foreground leading-relaxed">
          These Terms shall be governed and construed in accordance with the laws of our operating jurisdiction, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-foreground mt-8">6. Contact Information</h2>
        <p className="text-muted-foreground leading-relaxed">
          Questions about the Terms of Service should be sent to us at <a href="mailto:legal@arjstore.com" className="text-primary hover:underline">legal@arjstore.com</a>.
        </p>
      </div>
    </div>
  );
}
