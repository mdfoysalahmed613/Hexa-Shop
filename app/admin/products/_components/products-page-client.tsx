"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   Package,
   Plus,
   MoreHorizontal,
   Pencil,
   Trash2,
   Loader2,
   AlertTriangle,
   CheckCircle2,
   XCircle,
   Power,
} from "lucide-react";
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
import { useProducts, useDeleteProduct, useToggleProductStatus } from "@/hooks/use-products";
import { StatsCards } from "@/components/shared/stats-cards";
import { DataTable } from "@/components/ui/data-table";
import type { Product } from "@/lib/services/products";

// ============================================================================
// Helper Functions
// ============================================================================

function getTotalStock(product: Product): number {
   if (!product.variants || product.variants.length === 0) return 0;
   return product.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
}

function getPriceDisplay(product: Product): { min: number; max: number } | null {
   if (!product.variants || product.variants.length === 0) return null;
   const prices = product.variants.map((v) => v.price);
   return { min: Math.min(...prices), max: Math.max(...prices) };
}

function getStockStatus(stock: number): {
   label: string;
   variant: "default" | "secondary" | "destructive";
} {
   if (stock === 0) return { label: "Out of Stock", variant: "destructive" };
   if (stock <= 10) return { label: "Low Stock", variant: "secondary" };
   return { label: "In Stock", variant: "default" };
}

// ============================================================================
// Component
// ============================================================================

export function ProductsPageClient() {
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

   const { data: products = [], isLoading } = useProducts();
   const deleteMutation = useDeleteProduct();
   const toggleMutation = useToggleProductStatus();

   // Stats
   const stats = useMemo(() => {
      const lowStock = products.filter((p) => {
         const stock = getTotalStock(p);
         return stock > 0 && stock <= 10;
      }).length;
      const outOfStock = products.filter((p) => getTotalStock(p) === 0).length;
      const active = products.filter((p) => p.is_active).length;

      return {
         total: products.length,
         active,
         lowStock,
         outOfStock,
      };
   }, [products]);

   const handleDelete = async () => {
      if (!selectedProduct) return;
      await deleteMutation.mutateAsync(selectedProduct.id);
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
   };

   // Build stats items
   const statsItems = useMemo(
      () => [
         {
            label: "Total Products",
            value: stats.total,
            icon: Package,
            color: "default" as const,
         },
         {
            label: "Active",
            value: stats.active,
            icon: CheckCircle2,
            color: "success" as const,
         },
         {
            label: "Low Stock",
            value: stats.lowStock,
            icon: AlertTriangle,
            color: "warning" as const,
         },
         {
            label: "Out of Stock",
            value: stats.outOfStock,
            icon: XCircle,
            color: "danger" as const,
         },
      ],
      [stats]
   );

   // Columns definition
   const columns: ColumnDef<Product>[] = useMemo(
      () => [
         {
            accessorKey: "name",
            header: "Product",
            cell: ({ row }) => {
               const product = row.original;
               return (
                  <div className="flex items-center gap-3">
                     <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted flex-shrink-0">
                        {product.primary_image?.url ? (
                           <Image
                              src={product.primary_image.url}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                           />
                        ) : (
                           <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                           </div>
                        )}
                     </div>
                     <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                           {product.category_name}
                        </p>
                     </div>
                  </div>
               );
            },
         },
         {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => {
               const priceDisplay = getPriceDisplay(row.original);
               if (!priceDisplay) {
                  return <span className="text-muted-foreground">No price</span>;
               }
               if (priceDisplay.min === priceDisplay.max) {
                  return <span className="font-medium">${priceDisplay.min.toFixed(2)}</span>;
               }
               return (
                  <span className="font-medium">
                     ${priceDisplay.min.toFixed(2)} - ${priceDisplay.max.toFixed(2)}
                  </span>
               );
            },
         },
         {
            accessorKey: "stock",
            header: "Stock",
            cell: ({ row }) => {
               const totalStock = getTotalStock(row.original);
               const stockStatus = getStockStatus(totalStock);
               return (
                  <div className="flex items-center gap-2">
                     <span>{totalStock}</span>
                     <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                  </div>
               );
            },
         },
         {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => {
               return row.original.is_active ? (
                  <Badge variant="default">Active</Badge>
               ) : (
                  <Badge variant="outline">Draft</Badge>
               );
            },
         },
         {
            id: "actions",
            header: "",
            cell: ({ row }) => {
               const product = row.original;
               return (
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
                           onClick={() => toggleMutation.mutate(product.id)}
                           disabled={toggleMutation.isPending}
                        >
                           <Power className="mr-2 h-4 w-4" />
                           {product.is_active ? "Deactivate" : "Activate"}
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
               );
            },
         },
      ],
      [toggleMutation]
   );

   return (
      <div className="flex flex-1 flex-col gap-6 p-6">
         {/* Header */}
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

         {/* Stats Cards */}
         <StatsCards stats={statsItems} isLoading={isLoading} />

         {/* Products Table */}
         <Card>
            <CardHeader>
               <CardTitle>All Products ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
               {isLoading ? (
                  <div className="space-y-4">
                     {[...Array(5)].map((_, i) => (
                        <div
                           key={i}
                           className="flex items-center justify-between rounded-lg border p-4"
                        >
                           <div className="flex items-center gap-4">
                              <Skeleton className="h-12 w-12 rounded-lg" />
                              <div className="space-y-2">
                                 <Skeleton className="h-4 w-40" />
                                 <Skeleton className="h-3 w-24" />
                              </div>
                           </div>
                           <Skeleton className="h-6 w-20" />
                        </div>
                     ))}
                  </div>
               ) : (
                  <DataTable columns={columns} data={products} pageSize={10} />
               )}
            </CardContent>
         </Card>

         {/* Delete Confirmation Dialog */}
         <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
         >
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                  <AlertDialogDescription>
                     Are you sure you want to delete &quot;{selectedProduct?.name}
                     &quot;? This action cannot be undone.
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
