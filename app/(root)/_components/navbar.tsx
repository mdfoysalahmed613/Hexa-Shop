"use client";

/**
 * Navbar
 *
 * Main site navigation with search, cart, and user menu.
 * Features live product search with dropdown results.
 *
 * Components:
 * - Logo and brand link
 * - Product search with debounced query and live results
 * - Cart icon with item count badge
 * - Auth button (login/user menu)
 */

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, X, Hexagon, Package, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { useCart } from "@/providers/cart-provider";
import { Badge } from "@/components/ui/badge";
import { useSearchProducts } from "@/hooks/use-products";
import type { Product } from "@/lib/services/products";
import AuthButton from "./auth-button";

// Helper function for price display
function getMinPrice(product: { variants?: { price: number }[] }) {
   if (!product.variants || product.variants.length === 0) return 0;
   return Math.min(...product.variants.map((v) => v.price));
}

// Search results dropdown component - defined outside to avoid re-creation during render
interface SearchResultsDropdownProps {
   showResults: boolean;
   searchQuery: string;
   isSearching: boolean;
   searchResults: Product[] | undefined;
   onProductClick: (slug: string) => void;
   onViewAllClick: (e: React.FormEvent) => void;
}

function SearchResultsDropdown({
   showResults,
   searchQuery,
   isSearching,
   searchResults,
   onProductClick,
   onViewAllClick,
}: SearchResultsDropdownProps) {
   if (!showResults || searchQuery.length < 2) return null;

   return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
         {isSearching ? (
            <div className="flex items-center justify-center py-6">
               <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
         ) : searchResults && searchResults.length > 0 ? (
            <div className="py-2">
               {searchResults.map((product) => (
                  <button
                     key={product.id}
                     onClick={() => onProductClick(product.slug)}
                     className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors text-left"
                  >
                     <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        {product.primary_image?.url ? (
                           <Image
                              src={product.primary_image.url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                           />
                        ) : (
                           <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                           </div>
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                           ${getMinPrice(product).toFixed(2)}
                        </p>
                     </div>
                  </button>
               ))}
               <div className="border-t mt-2 pt-2 px-4 pb-2">
                  <button
                     onClick={onViewAllClick}
                     className="text-sm text-primary hover:underline"
                  >
                     View all results for &quot;{searchQuery}&quot;
                  </button>
               </div>
            </div>
         ) : (
            <div className="py-6 text-center text-muted-foreground">
               No products found
            </div>
         )}
      </div>
   );
}

export function Navbar() {
   const router = useRouter();
   const [searchOpen, setSearchOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const [showResults, setShowResults] = useState(false);
   const { openCart, itemCount } = useCart();
   const searchContainerRef = useRef<HTMLDivElement>(null);
   const mobileSearchRef = useRef<HTMLDivElement>(null);

   const { data: searchResults, isLoading: isSearching } = useSearchProducts(
      searchQuery,
      searchQuery.length >= 2
   );

   // Close dropdown when clicking outside
   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         if (
            searchContainerRef.current &&
            !searchContainerRef.current.contains(event.target as Node) &&
            mobileSearchRef.current &&
            !mobileSearchRef.current.contains(event.target as Node)
         ) {
            setShowResults(false);
         }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   const handleSearchFocus = useCallback(() => {
      if (searchQuery.length >= 2) {
         setShowResults(true);
      }
   }, [searchQuery]);

   const handleSearchChange = useCallback((value: string) => {
      setSearchQuery(value);
      if (value.length >= 2) {
         setShowResults(true);
      } else {
         setShowResults(false);
      }
   }, []);

   const handleProductClick = useCallback((slug: string) => {
      setShowResults(false);
      setSearchQuery("");
      setSearchOpen(false);
      router.push(`/products/${slug}`);
   }, [router]);

   const handleSearchSubmit = useCallback((e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
         setShowResults(false);
         setSearchOpen(false);
         router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      }
   }, [searchQuery, router]);

   return (
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
         <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between gap-4">
               {/* Logo and Site Name - Hidden when search is open on mobile */}
               <Link
                  href="/"
                  className={cn(
                     "flex items-center gap-2 hover:opacity-80 transition-opacity",
                     searchOpen && "hidden md:flex"
                  )}
               >
                  <Hexagon strokeWidth={3} className="h-8 w-8 text-primary" />
                  <span className="text-xl font-bold text-primary">Hexa Shop</span>
               </Link>

               {/* Desktop Search Bar */}
               <div ref={searchContainerRef} className="relative hidden md:flex md:flex-1 md:max-w-xl md:mx-8">
                  <form onSubmit={handleSearchSubmit} className="w-full">
                     <InputGroup>
                        <InputGroupInput
                           value={searchQuery}
                           placeholder="Search products..."
                           onChange={(e) => handleSearchChange(e.target.value)}
                           onFocus={handleSearchFocus}
                        />
                        <InputGroupAddon>
                           <Search />
                        </InputGroupAddon>
                     </InputGroup>
                  </form>
                  <SearchResultsDropdown
                     showResults={showResults}
                     searchQuery={searchQuery}
                     isSearching={isSearching}
                     searchResults={searchResults}
                     onProductClick={handleProductClick}
                     onViewAllClick={handleSearchSubmit}
                  />
               </div>

               {/* Mobile Search Bar - Shows when search is open */}
               {searchOpen && (
                  <div ref={mobileSearchRef} className="relative flex-1 md:hidden">
                     <form onSubmit={handleSearchSubmit}>
                        <div className="relative w-full">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input
                              type="search"
                              placeholder="Search products..."
                              className="w-full pl-9 pr-4"
                              value={searchQuery}
                              onChange={(e) => handleSearchChange(e.target.value)}
                              onFocus={handleSearchFocus}
                              autoFocus
                           />
                        </div>
                     </form>
                     <SearchResultsDropdown
                        showResults={showResults}
                        searchQuery={searchQuery}
                        isSearching={isSearching}
                        searchResults={searchResults}
                        onProductClick={handleProductClick}
                        onViewAllClick={handleSearchSubmit}
                     />
                  </div>
               )}

               {/* Right Side Actions */}
               <div className={cn(
                  "flex items-center gap-2",
                  searchOpen && "hidden md:flex"
               )}>
                  {/* Mobile Search Toggle */}
                  <Button
                     variant="ghost"
                     size="icon"
                     className="md:hidden"
                     onClick={() => setSearchOpen(!searchOpen)}
                  >
                     <Search className="h-5 w-5" />
                     <span className="sr-only">Search</span>
                  </Button>

                  <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
                     <ShoppingCart className="h-5 w-5" />
                     {itemCount > 0 && (
                        <Badge
                           variant="destructive"
                           className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                           {itemCount > 99 ? "99+" : itemCount}
                        </Badge>
                     )}
                     <span className="sr-only">Shopping Cart</span>
                  </Button>
                  <AuthButton />

               </div>

               {/* Close Search Button - Shows when search is open on mobile */}
               {searchOpen && (
                  <Button
                     variant="ghost"
                     size="icon"
                     className="md:hidden"
                     onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                        setShowResults(false);
                     }}
                  >
                     <X className="h-5 w-5" />
                     <span className="sr-only">Close search</span>
                  </Button>
               )}
            </div>
         </div>
      </nav>
   );
}
