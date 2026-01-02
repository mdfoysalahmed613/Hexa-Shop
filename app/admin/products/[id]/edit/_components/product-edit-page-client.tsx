"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/app/admin/products/new/_components/product-form";
import { useProduct } from "@/hooks/use-products";

interface ProductEditPageClientProps {
   productId: string;
}

export function ProductEditPageClient({ productId }: ProductEditPageClientProps) {
   const { data: product, isLoading, error } = useProduct(productId);

   if (isLoading) {
      return (
         <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading product...</p>
         </div>
      );
   }

   if (error || !product) {
      return (
         <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <p className="text-destructive">Product not found</p>
            <Button variant="outline" asChild>
               <Link href="/admin/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Products
               </Link>
            </Button>
         </div>
      );
   }

   return (
      <div className="flex flex-1 flex-col gap-6 p-6">
         {/* Header */}
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
               <Link href="/admin/products">
                  <ArrowLeft className="h-4 w-4" />
               </Link>
            </Button>
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
               <p className="text-muted-foreground">
                  Editing: {product.name}
               </p>
            </div>
         </div>

         {/* Form */}
         <ProductForm product={product} />
      </div>
   );
}
