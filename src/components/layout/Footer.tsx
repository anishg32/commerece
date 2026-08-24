"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Loader2, ShieldCheck, Truck, Lock } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data.slice(0, 5))) // Show top 5 active categories
      .catch(console.error);
      
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(console.error);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setStatus("success");
      setMessage(data.message);
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setMessage((err instanceof Error ? err.message : String(err)) || "Failed to subscribe");
    }
  };

  return (
    <footer className="bg-[#0f172a] text-slate-300 border-t border-slate-800 mt-auto">
      {/* Trust Banner */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x divide-slate-800">
            <div className="flex flex-col items-center justify-center space-y-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-slate-200">Secure Payments</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <Lock className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-slate-200">Secure Checkout</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <Truck className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-slate-200">Order Tracking</span>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
              <span className="text-sm font-medium text-slate-200">Customer Support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="font-bold text-3xl tracking-tight text-white inline-block">
              ARJ STORE<span className="text-primary">.</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {settings?.brandDescription || "Premium e-commerce destination for high-quality products and an exceptional shopping experience."}
            </p>
            <div className="flex items-center gap-4">
              {settings?.socialLinks?.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {settings?.socialLinks?.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
              {settings?.socialLinks?.twitter && (
                <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
              )}
              {settings?.socialLinks?.youtube && (
                <a href={settings.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                </a>
              )}
            </div>
          </div>
          
          {/* Shop */}
          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase text-sm mb-6">Shop</h3>
            <ul className="space-y-3 text-sm">
              {categories.map((cat: Category) => (
                <li key={cat._id}>
                  <Link href={`/categories/${cat.slug}`} className="text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="text-slate-500 animate-pulse">Loading categories...</li>
              )}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase text-sm mb-6">Customer Service</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  Track Order
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} ARJ STORE. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
