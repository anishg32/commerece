"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search as SearchIcon, X, Clock, ArrowRight } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [query, setQuery] = useState(queryParam);
  const [debouncedQuery, setDebouncedQuery] = useState(queryParam);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
  }, []);

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    
    let isMounted = true;

    const fetchResults = async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(debouncedQuery)}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setResults(data.products || []);
        }
      } catch (error: any) {
        console.error("Search failed:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResults();
    
    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    // Update URL
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("q", query);
    router.push(`/search?${newParams.toString()}`);

    // Save to recent searches
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
    setDebouncedQuery(term);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("q", term);
    router.push(`/search?${newParams.toString()}`);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl font-bold mb-6">Search</h1>
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-4 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, brands, or categories..."
              className="w-full h-14 pl-12 pr-12 rounded-full border border-border bg-secondary/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-lg"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setDebouncedQuery("");
                  router.push("/search");
                }}
                className="absolute right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="max-w-6xl mx-auto">
        {!debouncedQuery.trim() ? (
          /* Empty State - Show Recent & Suggestions */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Searches</h3>
                  <button onClick={clearRecent} className="text-sm text-muted-foreground hover:text-foreground">
                    Clear All
                  </button>
                </div>
                <ul className="space-y-2">
                  {recentSearches.map((term, i) => (
                    <li key={i}>
                      <button
                        onClick={() => handleRecentClick(term)}
                        className="flex items-center w-full p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                      >
                        <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
                        <span>{term}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
              <div className="flex flex-wrap gap-2">
                {["Electronics", "Fashion", "Home & Furniture", "Watches", "Footwear"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleRecentClick(cat)}
                    className="px-4 py-2 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Search Results */
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                {loading ? "Searching..." : `${results.length} Results for "${debouncedQuery}"`}
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-[3/4] bg-secondary animate-pulse rounded-2xl" />
                    <div className="h-4 bg-secondary animate-pulse rounded w-2/3" />
                    <div className="h-4 bg-secondary animate-pulse rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {results.map((product) => {
                  const discountPrice = product.discountPrice;
                  const price = product.price;
                  return (
                    <Link key={product._id} href={`/products/${product._id}`} className="group space-y-4">
                      <div className="aspect-[3/4] bg-secondary relative overflow-hidden rounded-2xl">
                        <ProductImage
                          src={product.thumbnail || (product.images?.[0]?.url)}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {discountPrice && (
                          <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                            {product.discountPercentage}% OFF
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                          {product.brand?.name || 'ARJ Store'}
                        </div>
                        <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-bold">₹{(discountPrice || price).toLocaleString()}</span>
                          {discountPrice && (
                            <span className="text-muted-foreground line-through text-sm">
                              ₹{price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* No Results State */
              <div className="text-center py-24">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  We couldn't find anything matching "{debouncedQuery}". Try checking your spelling or using more general terms.
                </p>
                <button
                  onClick={() => {
                    setQuery("");
                    setDebouncedQuery("");
                    router.push("/search");
                  }}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors inline-flex items-center"
                >
                  Clear Search
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-8"><div className="h-14 bg-secondary animate-pulse rounded-full max-w-3xl mx-auto mb-12" /></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
