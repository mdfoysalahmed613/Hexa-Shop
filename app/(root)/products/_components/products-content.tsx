"use client";

/**
 * Products Content
 *
 * Main products listing page with filtering and sorting.
 * Supports grid/list view toggle and category filtering.
 *
 * Features:
 * - Category filter via URL params (?category=slug)
 * - Search filter via URL params (?search=query)
 * - Sort options: newest, price (low/high), name (A-Z/Z-A)
 * - Grid and list view modes
 * - Quick add to cart from product cards
 */

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, SlidersHorizontal, X, ShoppingCart, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useCart } from "@/providers/cart-provider";
import type { Product } from "@/lib/services/products";
import { toast } from "sonner";

type SortOption = "newest" | "price-low" | "price-high" | "name-asc" | "name-desc";
type ViewMode = "grid" | "list";

// Helper functions
function getMinPrice(product: Product): number {
   if (!product.variants || product.variants.length === 0) return 0;
   return Math.min(...product.variants.map((v) => v.price));
}

function getMaxPrice(product: Product): number {
   if (!product.variants || product.variants.length === 0) return 0;
   return Math.max(...product.variants.map((v) => v.price));
}

function getTotalStock(product: Product): number {
   if (!product.variants || product.variants.length === 0) return 0;
   return product.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
}

export function ProductsContent() {
   const searchParams = useSearchParams();
   const categorySlug = searchParams.get("category");
   const urlSearchQuery = searchParams.get("search") || "";

   const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
   const [sortBy, setSortBy] = useState<SortOption>("newest");
   const [viewMode, setViewMode] = useState<ViewMode>("grid");

   // Sync search query with URL params
   useEffect(() => {
      setSearchQuery(urlSearchQuery);
   }, [urlSearchQuery]);

   const { data: products = [], isLoading: productsLoading } = useProducts();
   const { data: categories = [], isLoading: categoriesLoading } = useCategories();
   const { addItem } = useCart();

   // Get active categories
   const activeCategories = categories.filter((c) => c.is_active);

   // Find selected category by slug
   const selectedCategory = categorySlug
      ? activeCategories.find((c) => c.slug === categorySlug)
      : null;

   // Filter and sort products
   const filteredProducts = useMemo(() => {
      let result = products.filter((p) => p.is_active);

      // Filter by category
      if (selectedCategory) {
         result = result.filter(
            (p) => p.category_id === selectedCategory.id || p.category === selectedCategory.id
         );
      }

      // Filter by search
      if (searchQuery) {
         const query = searchQuery.toLowerCase();
         result = result.filter(
            (p) =>
               p.name.toLowerCase().includes(query) ||
               p.description?.toLowerCase().includes(query) ||
               p.category_name?.toLowerCase().includes(query)
         );
      }

      // Sort
      switch (sortBy) {
         case "price-low":
            result.sort((a, b) => getMinPrice(a) - getMinPrice(b));
            break;
         case "price-high":
            result.sort((a, b) => getMinPrice(b) - getMinPrice(a));
            break;
         case "name-asc":
            result.sort((a, b) => a.name.localeCompare(b.name));
            break;
         case "name-desc":
            result.sort((a, b) => b.name.localeCompare(a.name));
            break;
         case "newest":
         default:
            result.sort(
               (a, b) =>
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
      }

      return result;
   }, [products, selectedCategory, searchQuery, sortBy]);

   const handleAddToCart = (product: Product) => {
      if (!product.variants || product.variants.length === 0) {
         toast.error("This product has no available variants");
         return;
      }
      // Add first active variant with stock
      const variant = product.variants.find((v) => v.is_active && v.stock > 0);
      if (!variant) {
         toast.error("This product is out of stock");
         return;
      }
      addItem(product, variant);
      toast.success(`${product.name} added to cart!`);
   };

   const isLoading = productsLoading || categoriesLoading;

   return (
      <div className="min-h-screen bg-background">
         <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
               <h1 className="text-3xl font-bold tracking-tight mb-2">
                  {selectedCategory ? selectedCategory.name : "All Products"}
               </h1>
               <p className="text-muted-foreground">
                  {selectedCategory
                     ? `Browse our ${selectedCategory.name.toLowerCase()} collection`
                     : "Discover our complete collection of premium essentials"}
               </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
               {/* Sidebar - Categories */}
               <aside className="w-full lg:w-64 flex-shrink-0">
                  <div className="sticky top-20">
                     <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Categories
                     </h2>
                     <div className="space-y-1">
                        <Link
                           href="/products"
                           className={`block px-3 py-2 rounded-md text-sm transition-colors ${!categorySlug
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                              }`}
                        >
                           All Products
                        </Link>
                        {activeCategories.map((category) => (
                           <Link
                              key={category.id}
                              href={`/products?category=${category.slug}`}
                              className={`block px-3 py-2 rounded-md text-sm transition-colors ${categorySlug === category.slug
                                 ? "bg-primary text-primary-foreground"
                                 : "hover:bg-muted"
                                 }`}
                           >
                              {category.name}
                           </Link>
                        ))}
                     </div>
                  </div>
               </aside>

               {/* Main Content */}
               <main className="flex-1">
                  {/* Toolbar */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                     <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 max-w-sm"
                     />
                     <div className="flex items-center gap-2">
                        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                           <SelectTrigger className="w-44">
                              <SelectValue placeholder="Sort by" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="newest">Newest First</SelectItem>
                              <SelectItem value="price-low">Price: Low to High</SelectItem>
                              <SelectItem value="price-high">Price: High to Low</SelectItem>
                              <SelectItem value="name-asc">Name: A-Z</SelectItem>
                              <SelectItem value="name-desc">Name: Z-A</SelectItem>
                           </SelectContent>
                        </Select>
                        <div className="flex border rounded-md">
                           <Button
                              variant={viewMode === "grid" ? "secondary" : "ghost"}
                              size="icon"
                              onClick={() => setViewMode("grid")}
                           >
                              <Grid3X3 className="h-4 w-4" />
                           </Button>
                           <Button
                              variant={viewMode === "list" ? "secondary" : "ghost"}
                              size="icon"
                              onClick={() => setViewMode("list")}
                           >
                              <List className="h-4 w-4" />
                           </Button>
                        </div>
                     </div>
                  </div>

                  {/* Results Count */}
                  <div className="text-sm text-muted-foreground mb-4">
                     {isLoading ? (
                        <Skeleton className="h-4 w-32" />
                     ) : (
                        `Showing ${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}`
                     )}
                  </div>
                  {/* Products Grid/List */}
                  {isLoading ? (
                     <div
                        className={
                           viewMode === "grid"
                              ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                              : "space-y-4"
                        }
                     >
                        {[...Array(8)].map((_, i) => (
                           <div key={i} className="rounded-lg border overflow-hidden">
                              <Skeleton className="aspect-square w-full" />
                              <div className="p-4 space-y-2">
                                 <Skeleton className="h-5 w-3/4" />
                                 <Skeleton className="h-4 w-1/2" />
                                 <Skeleton className="h-6 w-20" />
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : filteredProducts.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-16">
                        <div className="rounded-full bg-muted p-6">
                           <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No products found</h3>
                        <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
                           {searchQuery
                              ? "Try adjusting your search or filter to find what you're looking for."
                              : "Check back later for new arrivals."}
                        </p>
                        {(searchQuery || categorySlug) && (
                           <Button variant="outline" className="mt-4" asChild>
                              <Link href="/products">
                                 <X className="mr-2 h-4 w-4" />
                                 Clear Filters
                              </Link>
                           </Button>
                        )}
                     </div>
                  ) : viewMode === "grid" ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map((product) => (
                           <ProductCard
                              key={product.id}
                              product={product}
                              onAddToCart={() => handleAddToCart(product)}
                           />
                        ))}
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {filteredProducts.map((product) => (
                           <ProductListItem
                              key={product.id}
                              product={product}
                              onAddToCart={() => handleAddToCart(product)}
                           />
                        ))}
                     </div>
                  )}
               </main>
            </div>
         </div>
      </div>
   );
}

// Product Card Component
function ProductCard({
   product,
   onAddToCart,
}: {
   product: Product;
   onAddToCart: () => void;
}) {
   const minPrice = getMinPrice(product);
   const maxPrice = getMaxPrice(product);
   const totalStock = getTotalStock(product);
   const isOutOfStock = totalStock === 0;

   return (
      <div className="group rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-all duration-300">
         <Link href={`/products/${product.slug}`}>
            <div className="relative aspect-square bg-muted">
               {product.primary_image?.url ? (
                  <Image
                     src={product.primary_image.url}
                     alt={product.name}
                     fill
                     className="object-cover group-hover:scale-105 transition-transform duration-300"
                     sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
               ) : (
                  <div className="flex h-full w-full items-center justify-center">
                     <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
               )}
               {isOutOfStock && (
                  <Badge
                     variant="destructive"
                     className="absolute top-2 right-2"
                  >
                     Out of Stock
                  </Badge>
               )}
            </div>
         </Link>
         <div className="p-4">
            <Link href={`/products/${product.slug}`}>
               <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors">
                  {product.name}
               </h3>
            </Link>
            <p className="text-sm text-muted-foreground mb-2">
               {product.category_name}
            </p>
            <div className="flex items-center justify-between">
               <p className="font-bold">
                  {minPrice === maxPrice ? (
                     `$${minPrice.toFixed(2)}`
                  ) : (
                     `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`
                  )}
               </p>
               <Button
                  size="sm"
                  variant="outline"
                  disabled={isOutOfStock}
                  onClick={(e) => {
                     e.preventDefault();
                     onAddToCart();
                  }}
               >
                  <ShoppingCart className="h-4 w-4" />
               </Button>
            </div>
         </div>
      </div>
   );
}

// Product List Item Component
function ProductListItem({
   product,
   onAddToCart,
}: {
   product: Product;
   onAddToCart: () => void;
}) {
   const minPrice = getMinPrice(product);
   const maxPrice = getMaxPrice(product);
   const totalStock = getTotalStock(product);
   const isOutOfStock = totalStock === 0;

   return (
      <div className="flex gap-4 rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
         <Link
            href={`/products/${product.slug}`}
            className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-md bg-muted"
         >
            {product.primary_image?.url ? (
               <Image
                  src={product.primary_image.url}
                  alt={product.name}
                  fill
                  className="object-cover"
               />
            ) : (
               <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
               </div>
            )}
         </Link>
         <div className="flex  flex-col">
            <Link href={`/products/${product.slug}`}>
               <h3 className="font-semibold hover:text-primary transition-colors">
                  {product.name}
               </h3>
            </Link>
            <p className="text-sm text-muted-foreground">{product.category_name}</p>
            {product.description && (
               <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {product.description.replace(/<[^>]*>/g, "")}
               </p>
            )}
            <div className="mt-auto flex items-center justify-between pt-2">
               <div className="flex items-center gap-2">
                  <p className="font-bold">
                     {minPrice === maxPrice ? (
                        `$${minPrice.toFixed(2)}`
                     ) : (
                        `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`
                     )}
                  </p>
                  {isOutOfStock && (
                     <Badge variant="destructive">Out of Stock</Badge>
                  )}
               </div>
               <Button
                  size="sm"
                  disabled={isOutOfStock}
                  onClick={onAddToCart}
               >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
               </Button>
            </div>
         </div>
      </div>
   );
}
