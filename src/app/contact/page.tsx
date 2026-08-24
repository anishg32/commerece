"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    // Simulate API call
    setTimeout(() => setStatus("success"), 1500);
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          We're here to help. Send us a message and our customer service team will get back to you as soon as possible.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Email Us</h3>
              <p className="text-muted-foreground text-sm mb-2">For general inquiries and support.</p>
              <a href="mailto:support@arjstore.com" className="text-primary font-medium hover:underline">support@arjstore.com</a>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Call Us</h3>
              <p className="text-muted-foreground text-sm mb-2">Mon-Fri from 9am to 6pm.</p>
              <a href="tel:+18001234567" className="text-primary font-medium hover:underline">+1 (800) 123-4567</a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Visit Us</h3>
              <p className="text-muted-foreground text-sm mb-2">Headquarters.</p>
              <address className="not-italic text-sm text-foreground/80 leading-relaxed">
                123 Luxury Avenue, Suite 500<br />
                New York, NY 10001<br />
                United States
              </address>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-2xl p-8 shadow-sm">
            {status === "success" ? (
              <div className="text-center py-16 flex flex-col items-center">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground max-w-sm">
                  Thank you for reaching out. Our support team will get back to you within 24 hours.
                </p>
                <Button onClick={() => setStatus("idle")} variant="outline" className="mt-8">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Name</label>
                    <input required type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Email</label>
                    <input required type="email" placeholder="john@example.com" className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <input required type="text" placeholder="How can we help you?" className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea required rows={5} placeholder="Write your message here..." className="w-full px-4 py-3 rounded-xl border bg-background text-sm resize-none focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold" disabled={status === "loading"}>
                  {status === "loading" ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-5 h-5 mr-2" /> Send Message</>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
