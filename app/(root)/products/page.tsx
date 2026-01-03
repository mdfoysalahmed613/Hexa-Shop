import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductsContent } from "./_components/products-content";

// Loading skeleton for products page
function ProductsLoading() {
   return (
      <div className="min-h-screen bg-background">
         <div className="container mx-auto px-4 py-8">
            {/* Header skeleton */}
            <div className="mb-8">
               <Skeleton className="h-9 w-48 mb-2" />
               <Skeleton className="h-5 w-80" />
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
               {/* Sidebar skeleton */}
               <aside className="w-full lg:w-64 flex-shrink-0">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-2">
                     {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-9 w-full" />
                     ))}
                  </div>
               </aside>

               {/* Main content skeleton */}
               <main className="flex-1">
                  {/* Toolbar skeleton */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                     <Skeleton className="h-10 w-full max-w-sm" />
                     <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-44" />
                        <Skeleton className="h-10 w-20" />
                     </div>
                  </div>

                  {/* Results count skeleton */}
                  <Skeleton className="h-4 w-32 mb-4" />

                  {/* Products grid skeleton */}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
               </main>
            </div>
         </div>
      </div>
   );
}

export default function ProductsPage() {
   return (
      <Suspense fallback={<ProductsLoading />}>
         <ProductsContent />
      </Suspense>
   );
}
