"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, ShoppingBag, Heart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";

export function Header() {
  const { data: session } = useSession();
  const cartItemsCount = useCartStore((state) => state.getTotalItems());

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Mobile Menu Button & Logo */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <Link href="/" className="font-bold text-xl tracking-tight">
            LUXE<span className="text-primary">.</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/products" className="hover:text-primary transition-colors">Shop</Link>
          <Link href="/categories" className="hover:text-primary transition-colors">Categories</Link>
          <Link href="/offers" className="hover:text-primary transition-colors">Offers</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex relative group">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="pl-10 pr-4 py-2 bg-secondary/50 border-transparent focus:bg-background focus:border-ring outline-none rounded-full text-sm transition-all w-[200px] focus:w-[250px]"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          </div>
          
          <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
            <Link href="/wishlist">
              <Heart className="w-5 h-5" />
              <span className="sr-only">Wishlist</span>
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>

          {session ? (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href={session.user.role === "admin" ? "/admin" : "/profile"}>
                  <User className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          ) : (
            <Button className="hidden md:flex rounded-full" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
