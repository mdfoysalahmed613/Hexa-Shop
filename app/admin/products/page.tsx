"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   Package,
   Plus,
   Search,
   MoreHorizontal,
   Pencil,
   Trash2,
   Loader2,
} from "lucide-react";
import {
   InputGroup,
   InputGroupAddon,
   InputGroupInput,
} from "@/components/ui/input-group";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { useProducts, useDeleteProduct } from "@/hooks/use-products";
import type { Product } from "@/lib/services/products";

function getStockStatus(stock: number): { label: string; variant: "default" | "secondary" | "destructive" } {
   if (stock === 0) return { label: "Out of Stock", variant: "destructive" };
   if (stock <= 10) return { label: "Low Stock", variant: "secondary" };
   return { label: "In Stock", variant: "default" };
}

export default function ProductsPage() {
   const [searchQuery, setSearchQuery] = useState("");
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

   const { data: products = [], isLoading } = useProducts();
   const deleteMutation = useDeleteProduct();

   // Filter products based on search
   const filteredProducts = useMemo(() => {
      const query = searchQuery.toLowerCase();
      return products.filter(
         (product) =>
            product.name.toLowerCase().includes(query) ||
            product.slug.toLowerCase().includes(query) ||
            product.category_name?.toLowerCase().includes(query) ||
            product.sku?.toLowerCase().includes(query)
      );
   }, [products, searchQuery]);

   const handleDelete = async () => {
      if (!selectedProduct) return;
      await deleteMutation.mutateAsync(selectedProduct.id);
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
   };

   return (
      <div className="flex flex-1 flex-col gap-4 p-6 z-40">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Products</h1>
               <p className="text-muted-foreground">
                  Manage your product inventory
               </p>
            </div>
            <Button asChild>
               <Link href="/admin/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
               </Link>
            </Button>
         </div>

         {/* Search */}
         <Card>
            <CardContent>
               <InputGroup>
                  <InputGroupInput
                     value={searchQuery}
                     placeholder="Search products by name, category, or SKU..."
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <InputGroupAddon>
                     <Search />
                  </InputGroupAddon>
               </InputGroup>
            </CardContent>
         </Card>

         {/* Products Table */}
         <Card>
            <CardHeader>
               <CardTitle>
                  All Products ({filteredProducts.length})
               </CardTitle>
            </CardHeader>
            <CardContent>
               {isLoading ? (
                  <div className="space-y-4">
                     {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between border-b pb-4">
                           <div className="flex items-center gap-4">
                              <Skeleton className="h-12 w-12 rounded-lg" />
                              <div className="space-y-2">
                                 <Skeleton className="h-4 w-40" />
                                 <Skeleton className="h-3 w-24" />
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <Skeleton className="h-4 w-16" />
                              <Skeleton className="h-6 w-20" />
                           </div>
                        </div>
                     ))}
                  </div>
               ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                     <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                     <h3 className="mt-4 text-lg font-semibold">No products found</h3>
                     <p className="text-muted-foreground">
                        {searchQuery
                           ? "Try adjusting your search query"
                           : "Get started by adding your first product"}
                     </p>
                     {!searchQuery && (
                        <Button asChild className="mt-4">
                           <Link href="/admin/products/new">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Product
                           </Link>
                        </Button>
                     )}
                  </div>
               ) : (
                  <div className="space-y-4">
                     {filteredProducts.map((product) => {
                        const stockStatus = getStockStatus(product.stock);
                        return (
                           <div
                              key={product.id}
                              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                           >
                              <div className="flex items-center gap-4">
                                 <div className="h-12 w-12 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                                    {product.primary_image ? (
                                       <Image
                                          src={product.primary_image}
                                          alt={product.name}
                                          width={48}
                                          height={48}
                                          className="h-full w-full object-cover"
                                       />
                                    ) : (
                                       <Package className="h-6 w-6 text-muted-foreground" />
                                    )}
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-sm font-medium">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                       {product.category_name}
                                       {product.sku && ` • SKU: ${product.sku}`}
                                    </p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 <div className="text-right">
                                    <p className="text-sm font-medium">
                                       ${product.price.toFixed(2)}
                                       {product.compare_price && (
                                          <span className="ml-2 text-xs text-muted-foreground line-through">
                                             ${product.compare_price.toFixed(2)}
                                          </span>
                                       )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                       Stock: {product.stock}
                                    </p>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Badge variant={stockStatus.variant}>
                                       {stockStatus.label}
                                    </Badge>
                                    {!product.is_active && (
                                       <Badge variant="outline">Draft</Badge>
                                    )}
                                 </div>
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                       <Button variant="ghost" size="icon">
                                          <MoreHorizontal className="h-4 w-4" />
                                       </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                       <DropdownMenuItem asChild>
                                          <Link href={`/admin/products/${product.id}/edit`}>
                                             <Pencil className="mr-2 h-4 w-4" />
                                             Edit
                                          </Link>
                                       </DropdownMenuItem>
                                       <DropdownMenuItem
                                          className="text-destructive"
                                          onClick={() => {
                                             setSelectedProduct(product);
                                             setIsDeleteDialogOpen(true);
                                          }}
                                       >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                       </DropdownMenuItem>
                                    </DropdownMenuContent>
                                 </DropdownMenu>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               )}
            </CardContent>
         </Card>

         {/* Delete Confirmation Dialog */}
         <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                  <AlertDialogDescription>
                     Are you sure you want to delete &quot;{selectedProduct?.name}&quot;?
                     This action cannot be undone.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={handleDelete}
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                     disabled={deleteMutation.isPending}
                  >
                     {deleteMutation.isPending ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Deleting...
                        </>
                     ) : (
                        "Delete"
                     )}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
}
