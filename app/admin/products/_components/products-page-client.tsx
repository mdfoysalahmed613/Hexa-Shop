"use client";

/**
 * Products Page Client
 *
 * Admin products management with data table and statistics.
 * Provides CRUD operations for product catalog.
 *
 * Features:
 * - Product statistics cards (total, active, out of stock)
 * - Searchable/sortable data table with product images
 * - Quick actions: edit, toggle status, delete
 * - Delete confirmation dialog
 * - Filtering by category, status, price range, stock
 * - Empty state for no products
 */

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
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
   Search,
   Filter,
   X,
   ArrowUpDown,
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
import { useCategories } from "@/hooks/use-categories";
import { StatsCards } from "@/components/shared/stats-cards";
import { DataTable } from "@/components/ui/data-table";
import type { Product } from "@/lib/services/products";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

// ============================================================================
// Types
// ============================================================================

interface ProductFilters {
   search: string;
   category: string;
   status: string;
   stockStatus: string;
   priceRange: [number, number];
}

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

const defaultFilters: ProductFilters = {
   search: "",
   category: "all",
   status: "all",
   stockStatus: "all",
   priceRange: [0, 10000],
};

export function ProductsPageClient() {
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
   const [filters, setFilters] = useState<ProductFilters>(defaultFilters);

   const { data: products = [], isLoading } = useProducts();
   const { data: categories = [] } = useCategories();
   const deleteMutation = useDeleteProduct();
   const toggleMutation = useToggleProductStatus();

   // Calculate max price for slider
   const maxPrice = useMemo(() => {
      if (products.length === 0) return 10000;
      const prices = products.flatMap(p => p.variants?.map(v => v.price) ?? []);
      return Math.max(...prices, 10000);
   }, [products]);

   // Filter products based on all filters
   const filteredProducts = useMemo(() => {
      return products.filter((product) => {
         // Search filter
         if (filters.search) {
            const query = filters.search.toLowerCase();
            const name = product.name.toLowerCase();
            const category = product.category_name?.toLowerCase() || "";
            if (!name.includes(query) && !category.includes(query)) {
               return false;
            }
         }

         // Category filter
         if (filters.category !== "all" && product.category_id !== filters.category) {
            return false;
         }

         // Status filter
         if (filters.status !== "all") {
            if (filters.status === "active" && !product.is_active) return false;
            if (filters.status === "draft" && product.is_active) return false;
         }

         // Stock status filter
         const totalStock = getTotalStock(product);
         if (filters.stockStatus !== "all") {
            if (filters.stockStatus === "in_stock" && totalStock <= 10) return false;
            if (filters.stockStatus === "low_stock" && (totalStock === 0 || totalStock > 10)) return false;
            if (filters.stockStatus === "out_of_stock" && totalStock !== 0) return false;
         }

         // Price range filter
         const priceDisplay = getPriceDisplay(product);
         if (priceDisplay) {
            if (priceDisplay.min < filters.priceRange[0] || priceDisplay.max > filters.priceRange[1]) {
               return false;
            }
         }

         return true;
      });
   }, [products, filters]);

   // Check if any filters are active
   const hasActiveFilters = useMemo(() => {
      return (
         filters.category !== "all" ||
         filters.status !== "all" ||
         filters.stockStatus !== "all" ||
         filters.priceRange[0] !== 0 ||
         filters.priceRange[1] !== maxPrice
      );
   }, [filters, maxPrice]);

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
            id: "price",
            accessorFn: (row) => {
               const priceDisplay = getPriceDisplay(row);
               return priceDisplay ? priceDisplay.min : 0;
            },
            header: ({ column }) => (
               <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  className="-ml-4"
               >
                  Price
                  <ArrowUpDown className="ml-2 h-4 w-4" />
               </Button>
            ),
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
            id: "stock",
            accessorFn: (row) => getTotalStock(row),
            header: ({ column }) => (
               <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  className="-ml-4"
               >
                  Stock
                  <ArrowUpDown className="ml-2 h-4 w-4" />
               </Button>
            ),
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

         <h1 className="text-lg font-semibold ">
            All Products ({filteredProducts.length})
         </h1>
         {/* Products Table */}
         <Card>
            <CardHeader>
               <div className="flex items-center justify-between gap-3">
                  <InputGroup className="max-w-lg">
                     <InputGroupInput
                        value={filters.search}
                        placeholder="Search products..."
                        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                     />
                     <InputGroupAddon>
                        <Search />
                     </InputGroupAddon>
                  </InputGroup>

                  {/* Filters Popover - Top Right */}
                  <Popover>
                     <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                           <Filter className="h-4 w-4" />
                           Filters
                           {hasActiveFilters && (
                              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                                 !
                              </Badge>
                           )}
                        </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-80" align="end">
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <h4 className="font-medium">Filters</h4>
                              {hasActiveFilters && (
                                 <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFilters({ ...defaultFilters, search: filters.search, priceRange: [0, maxPrice] })}
                                    className="h-8 px-2 text-xs"
                                 >
                                    <X className="mr-1 h-3 w-3" />
                                    Clear
                                 </Button>
                              )}
                           </div>

                           {/* Category Filter */}
                           <div className="space-y-2">
                              <Label>Category</Label>
                              <Select
                                 value={filters.category}
                                 onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                              >
                                 <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                       <SelectItem key={cat.id} value={cat.id}>
                                          {cat.name}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           </div>

                           {/* Status Filter */}
                           <div className="space-y-2">
                              <Label>Status</Label>
                              <Select
                                 value={filters.status}
                                 onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                              >
                                 <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>

                           {/* Stock Status Filter */}
                           <div className="space-y-2">
                              <Label>Stock Availability</Label>
                              <Select
                                 value={filters.stockStatus}
                                 onValueChange={(value) => setFilters((prev) => ({ ...prev, stockStatus: value }))}
                              >
                                 <SelectTrigger>
                                    <SelectValue placeholder="All Stock" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="all">All Stock</SelectItem>
                                    <SelectItem value="in_stock">In Stock</SelectItem>
                                    <SelectItem value="low_stock">Low Stock</SelectItem>
                                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>

                           {/* Price Range Filter */}
                           <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                 <Label>Price Range</Label>
                                 <span className="text-sm text-muted-foreground">
                                    ${filters.priceRange[0]} - ${filters.priceRange[1]}
                                 </span>
                              </div>
                              <Slider
                                 value={filters.priceRange}
                                 min={0}
                                 max={maxPrice}
                                 step={10}
                                 onValueChange={(value) => setFilters((prev) => ({ ...prev, priceRange: value as [number, number] }))}
                                 className="py-2"
                              />
                           </div>
                        </div>
                     </PopoverContent>
                  </Popover>
               </div>
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
                  <DataTable columns={columns} data={filteredProducts} pageSize={10} />
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
