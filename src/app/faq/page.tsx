"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    category: "Orders & Shipping",
    questions: [
      { q: "How do I place an order?", a: "Simply browse our categories, select your desired product and variants, click 'Add to Cart' or 'Buy Now', and follow the checkout process." },
      { q: "How can I track my order?", a: "Once your order ships, you will receive a tracking number via email. You can also track your order directly on our 'Track Order' page." },
      { q: "How long does delivery take?", a: "Standard delivery typically takes 3-5 business days. Express shipping options are available at checkout for 1-2 day delivery." },
      { q: "Can I cancel my order?", a: "You can cancel your order within 1 hour of placing it by contacting our support team. Once an order is processing or shipped, it cannot be cancelled." }
    ]
  },
  {
    category: "Payments & Refunds",
    questions: [
      { q: "What payment methods are supported?", a: "We accept all major credit cards (Visa, MasterCard, Amex), PayPal, Apple Pay, Google Pay, and Cash on Delivery (for eligible orders)." },
      { q: "What is the return policy?", a: "We offer a 30-day return window for unopened, unused items in their original packaging. Please check our Returns & Exchanges page for specific details." },
      { q: "How do refunds work?", a: "Once we receive and inspect your return, we will process your refund to the original payment method within 5-7 business days." }
    ]
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string>("0-0");

  const toggleAccordion = (index: string) => {
    setOpenIndex(openIndex === index ? "" : index);
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Find answers to common questions about our products, shipping, returns, and more.
        </p>
      </div>

      <div className="space-y-12">
        {faqs.map((category, catIdx) => (
          <div key={catIdx}>
            <h2 className="text-2xl font-bold mb-6 text-foreground">{category.category}</h2>
            <div className="space-y-4">
              {category.questions.map((faq, qIdx) => {
                const index = `${catIdx}-${qIdx}`;
                const isOpen = openIndex === index;
                return (
                  <div key={qIdx} className="bg-card border rounded-2xl overflow-hidden transition-all duration-200">
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full flex items-center justify-between p-6 text-left font-medium text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div 
                      className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"}`}
                    >
                      <p className="text-muted-foreground leading-relaxed pt-2 border-t">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
