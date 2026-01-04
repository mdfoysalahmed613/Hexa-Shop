"use client";

/**
 * Category Section
 *
 * Homepage section displaying product categories as cards.
 * Links to category-filtered products page.
 *
 * Features:
 * - Grid layout (responsive: 2-6 columns)
 * - Category images with fallback icon
 * - Product count per category
 * - Loading skeletons
 */

import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";

export function CategorySection() {
   const { data: categories = [], isLoading } = useCategories();

   // Filter only active categories with images for display
   const displayCategories = categories.filter(
      (cat) => cat.is_active
   ).slice(0, 6);

   if (isLoading) {
      return (
         <div className="py-12 md:py-16">
            <div className="container mx-auto px-4">
               <div className="text-center mb-10">
                  <Skeleton className="h-8 w-48 mx-auto mb-2" />
                  <Skeleton className="h-5 w-64 mx-auto" />
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                     <div key={i} className="rounded-lg overflow-hidden border border-border">
                        <Skeleton className="aspect-square w-full" />
                        <div className="p-4 space-y-2">
                           <Skeleton className="h-5 w-20 mx-auto" />
                           <Skeleton className="h-4 w-16 mx-auto" />
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      );
   }

   if (displayCategories.length === 0) {
      return null;
   }

   return (
      <div className="py-12 md:py-16">
         <div className="container mx-auto px-4">
            <div className="text-center mb-10">
               <h2 className="text-3xl font-bold tracking-tight mb-2">
                  Shop by Category
               </h2>
               <p className="text-muted-foreground">
                  Discover our premium collection for modern men
               </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
               {displayCategories.map((category) => (
                  <Link
                     key={category.id}
                     href={`/products?category=${category.slug}`}
                     className="group"
                  >
                     <div className="bg-background rounded-lg overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all duration-300">
                        <div className="relative aspect-square w-full bg-secondary/30">
                           {category.image_url ? (
                              <Image
                                 src={category.image_url}
                                 alt={category.name}
                                 fill
                                 className="object-cover group-hover:scale-105 transition-transform duration-300"
                                 sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                              />
                           ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                 <Package className="h-12 w-12 text-muted-foreground" />
                              </div>
                           )}
                        </div>
                        <div className="p-4 text-center">
                           <h3 className="font-semibold">{category.name}</h3>
                           {category.product_count !== undefined && (
                              <p className="text-sm text-muted-foreground">
                                 {category.product_count} Products
                              </p>
                           )}
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      </div>
   );
}
