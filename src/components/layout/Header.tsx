"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, ShoppingBag, Heart, User, Menu, X, Loader2, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";

interface CategoryResponse {
  _id: string;
  name: string;
  slug: string;
  subcategories: { name: string; slug: string }[];
}

interface ProductSearchResponse {
  _id: string;
  name: string;
  price: number;
  thumbnail?: string;
  images?: { url: string }[];
}

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const categoriesLinkRef = useRef<HTMLButtonElement>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch Categories for Mega Menu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (e) {
        console.error("Failed to fetch categories", e);
      }
    };
    fetchCategories();
  }, []);

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSearchDropdown(false);
      }
      if (
        megaMenuRef.current && 
        categoriesLinkRef.current &&
        !megaMenuRef.current.contains(target) && 
        !categoriesLinkRef.current.contains(target)
      ) {
        setShowMegaMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setShowSearchDropdown(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'glass shadow-sm' : 'bg-background/80 border-b'}`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Mobile Menu Button & Logo */}
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <Link href="/" className="font-bold text-xl md:text-2xl tracking-tight">
              LUXE<span className="text-primary">.</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-8 text-sm font-medium">
            <Link href="/products" className="hover:text-primary transition-colors">Shop</Link>
            
            <div className="relative">
              <button 
                ref={categoriesLinkRef}
                onClick={() => setShowMegaMenu(!showMegaMenu)}
                className={`flex items-center gap-1 hover:text-primary transition-colors ${showMegaMenu ? 'text-primary' : ''}`}
              >
                Categories
              </button>
              
              {/* Mega Menu Panel */}
              {showMegaMenu && (
                <div 
                  ref={megaMenuRef}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-6 w-[800px] bg-card border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 p-8 grid grid-cols-3 gap-8 z-50"
                  onClick={() => setShowMegaMenu(false)}
                >
                  {categories.length > 0 ? categories.map((cat: CategoryResponse) => (
                    <div key={cat._id} className="flex flex-col gap-3">
                      <Link href={`/category/${cat.slug}`} className="font-bold text-base hover:text-primary transition-colors">
                        {cat.name}
                      </Link>
                      <div className="flex flex-col gap-2">
                        {cat.subcategories?.map((sub: { name: string; slug: string }) => (
                          <Link 
                            key={sub.slug} 
                            href={`/products?category=${cat.slug}&subcategory=${sub.slug}`}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-3 text-center py-8 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading categories...
                    </div>
                  )}
                  <div className="col-span-3 pt-4 border-t mt-2">
                    <Link href="/categories" className="text-primary font-medium hover:underline text-sm flex items-center justify-center">
                      View All 40+ Categories &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/offers" className="hover:text-primary transition-colors text-orange-500">Offers</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 md:gap-4 flex-1">
            
            {/* Search Bar */}
            <div className="hidden md:block relative group" ref={searchRef}>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!e.target.value.trim()) {
                      setSearchResults([]);
                      setShowSearchDropdown(false);
                    }
                  }}
                  onFocus={() => { if(searchQuery) setShowSearchDropdown(true); }}
                  className="pl-10 pr-4 py-2 bg-secondary/50 border-transparent focus:bg-background focus:border-ring outline-none rounded-full text-sm transition-all w-[200px] focus:w-[300px]"
                />
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                {isSearching && <Loader2 className="w-4 h-4 absolute right-3 top-2.5 text-primary animate-spin" />}
              </div>
              
              {/* Search Dropdown */}
              {showSearchDropdown && (
                <div className="absolute top-full right-0 mt-2 w-[350px] bg-card border rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map(product => (
                        <Link 
                          key={product._id} 
                          href={`/products/${product._id}`}
                          onClick={() => { setShowSearchDropdown(false); setSearchQuery(""); }}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-secondary transition-colors"
                        >
                          <div className="w-10 h-10 bg-secondary rounded overflow-hidden shrink-0 relative">
                            <Image src={product.thumbnail || product.images?.[0]?.url || ""} alt={product.name} fill className="object-cover" sizes="40px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{product.name}</div>
                            <div className="text-xs text-muted-foreground">₹{product.price.toLocaleString()}</div>
                          </div>
                        </Link>
                      ))}
                      <div className="px-4 py-2 border-t mt-2">
                        <Button variant="ghost" className="w-full text-xs text-primary h-8" onClick={() => {
                          setShowSearchDropdown(false);
                          router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                        }}>
                          View all results
                        </Button>
                      </div>
                    </div>
                  ) : searchQuery.length > 1 && !isSearching ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No products found for &quot;{searchQuery}&quot;
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link href="/wishlist">
                <Heart className="w-5 h-5 hover:fill-primary/20 hover:text-primary transition-all" />
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild className="relative group">
              <Link href="/cart">
                <ShoppingBag className="w-5 h-5 group-hover:text-primary transition-colors" />
                {cartItemsCount > 0 && (
                  <span className="absolute 2 top-1.5 right-1.5 translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                    {cartItemsCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Link>
            </Button>

            {session ? (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={session.user.role === "admin" ? "/admin" : "/dashboard"}>
                    <User className="w-5 h-5 hover:text-primary transition-colors" />
                  </Link>
                </Button>
              </div>
            ) : (
              <Button className="hidden md:flex rounded-full shadow-sm hover:shadow-md transition-shadow" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-y-0 left-0 w-3/4 max-w-sm bg-card shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-4 border-b flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight" onClick={() => setMobileMenuOpen(false)}>
            LUXE<span className="text-primary">.</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setMobileMenuOpen(false);
                  router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                }
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary border-transparent focus:bg-background focus:border-primary outline-none rounded-xl text-sm transition-all"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-secondary font-medium">
            Shop All Products
          </Link>
          <Link href="/categories" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-secondary font-medium">
            Browse Categories
          </Link>
          <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-secondary font-medium flex items-center gap-3">
            <Heart className="w-4 h-4" /> My Wishlist
          </Link>
          
          <div className="mt-4 pt-4 border-t">
            {session ? (
              <>
                <div className="px-4 py-2 text-xs text-muted-foreground uppercase font-bold tracking-wider">Account</div>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-secondary font-medium flex items-center gap-3">
                  <User className="w-4 h-4" /> Profile
                </Link>
                <Link href="/dashboard/orders" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-secondary font-medium flex items-center gap-3">
                  <Package className="w-4 h-4" /> Orders
                </Link>
                {session.user.role === "admin" && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl hover:bg-secondary font-medium text-primary">
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={() => signOut()} className="w-full text-left px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive font-medium flex items-center gap-3 mt-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="p-4 bg-secondary/50 rounded-2xl mt-4">
                <p className="text-sm text-center mb-4 text-muted-foreground">Sign in to manage your orders and profile.</p>
                <Button className="w-full rounded-xl" asChild onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/login">Sign In / Register</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
