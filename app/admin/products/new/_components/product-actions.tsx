"use client";

/**
 * Product Form Actions
 *
 * Submit and cancel buttons for the product form.
 */

import Link from "next/link";
import { X, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProductActionsProps {
   isEditing: boolean;
   isPending: boolean;
}

export function ProductActions({ isEditing, isPending }: ProductActionsProps) {
   return (
      <Card>
         <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
               <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full"
                  size="lg"
               >
                  {isPending ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? "Updating..." : "Creating..."}
                     </>
                  ) : (
                     <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditing ? "Update Product" : "Save Product"}
                     </>
                  )}
               </Button>
               <Button
                  type="button"
                  variant="outline"
                  asChild
                  disabled={isPending}
                  className="w-full"
               >
                  <Link href="/admin/products">
                     <X className="mr-2 h-4 w-4" />
                     Discard
                  </Link>
               </Button>
            </div>
         </CardContent>
      </Card>
   );
}
