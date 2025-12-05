"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/common/logo.png";
import { ShoppingCart, User, Search, X, Hexagon } from "lucide-react";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import AuthButton from "../auth/auth-button";

export function Navbar() {

   const [searchOpen, setSearchOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   
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
               <div className="hidden md:flex md:flex-1 md:max-w-xl md:mx-8">
                  <div className="relative w-full">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                        type="search"
                        placeholder="Search products..."
                        className="w-full pl-9 pr-4"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>
               </div>

               {/* Mobile Search Bar - Shows when search is open */}
               {searchOpen && (
                  <div className="flex-1 md:hidden">
                     <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                           type="search"
                           placeholder="Search products..."
                           className="w-full pl-9 pr-4"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           autoFocus
                        />
                     </div>
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

                  <Button variant="ghost" size="icon" asChild>
                     <Link href="/cart">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="sr-only">Shopping Cart</span>
                     </Link>
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
