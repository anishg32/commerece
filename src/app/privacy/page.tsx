import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-sm prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <p className="lead text-lg text-muted-foreground mb-8">
          At LUXE, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-foreground mt-8">1. Information We Collect</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may collect information about you in a variety of ways. The information we may collect on the Site includes:
        </p>
        <ul className="text-muted-foreground list-disc pl-6 space-y-2 mt-4">
          <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.</li>
          <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
          <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Site.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 text-foreground mt-8">2. Use of Your Information</h2>
        <p className="text-muted-foreground leading-relaxed">
          Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
        </p>
        <ul className="text-muted-foreground list-disc pl-6 space-y-2 mt-4">
          <li>Create and manage your account.</li>
          <li>Process and manage purchases, orders, payments, and other transactions related to the Site.</li>
          <li>Deliver targeted advertising, coupons, newsletters, and other information regarding promotions and the Site to you.</li>
          <li>Email you regarding your account or order.</li>
          <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 text-foreground mt-8">3. Disclosure of Your Information</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
        </p>
        <ul className="text-muted-foreground list-disc pl-6 space-y-2 mt-4">
          <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
          <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 text-foreground mt-8">4. Contact Us</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you have questions or comments about this Privacy Policy, please contact us at: <br/><br/>
          <strong>LUXE Inc.</strong><br/>
          123 Luxury Avenue, Suite 500<br/>
          New York, NY 10001<br/>
          <a href="mailto:privacy@luxe.com" className="text-primary hover:underline">privacy@luxe.com</a>
        </p>
      </div>
    </div>
  );
}
