"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
   Package,
   Plus,
   Search,
   MoreHorizontal,
   Pencil,
   Trash2,
   Loader2,
   AlertTriangle,
   CheckCircle2,
   XCircle,
   X,
   ChevronLeft,
   ChevronRight,
   ChevronsLeft,
   ChevronsRight,
} from "lucide-react";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
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
import { useCategories } from "@/hooks/use-categories";
import { StatsCards } from "@/components/shared/stats-cards";
import type { Product } from "@/lib/services/products";

type StatusFilter = "all" | "active" | "inactive";
type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;
type ItemsPerPage = (typeof ITEMS_PER_PAGE_OPTIONS)[number];

// Helper to get total stock from variants
function getTotalStock(product: Product): number {
   if (!product.variants || product.variants.length === 0) return 0;
   return product.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
}

// Helper to get price range or single price from variants
function getPriceDisplay(product: Product): { min: number; max: number } | null {
   if (!product.variants || product.variants.length === 0) return null;
   const prices = product.variants.map((v) => v.price);
   return { min: Math.min(...prices), max: Math.max(...prices) };
}

// Helper to get compare price from first variant
function getComparePrice(product: Product): number | null {
   if (!product.variants || product.variants.length === 0) return null;
   return product.variants[0].compare_price;
}

function getStockStatus(stock: number): {
   label: string;
   variant: "default" | "secondary" | "destructive";
} {
   if (stock === 0) return { label: "Out of Stock", variant: "destructive" };
   if (stock <= 10) return { label: "Low Stock", variant: "secondary" };
   return { label: "In Stock", variant: "default" };
}

export function ProductsPageClient() {
   const [searchQuery, setSearchQueryState] = useState("");
   const [statusFilter, setStatusFilterState] = useState<StatusFilter>("all");
   const [stockFilter, setStockFilterState] = useState<StockFilter>("all");
   const [categoryFilter, setCategoryFilterState] = useState<string>("all");
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

   // Pagination state
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(10);

   const { data: products = [], isLoading } = useProducts();
   const { data: categories = [] } = useCategories();
   const deleteMutation = useDeleteProduct();

   // Wrapper setters that also reset page
   const setSearchQuery = useCallback((value: string) => {
      setSearchQueryState(value);
      setCurrentPage(1);
   }, []);

   const setStatusFilter = useCallback((value: StatusFilter) => {
      setStatusFilterState(value);
      setCurrentPage(1);
   }, []);

   const setStockFilter = useCallback((value: StockFilter) => {
      setStockFilterState(value);
      setCurrentPage(1);
   }, []);

   const setCategoryFilter = useCallback((value: string) => {
      setCategoryFilterState(value);
      setCurrentPage(1);
   }, []);

   // Filter products
   const filteredProducts = useMemo(() => {
      return products.filter((product) => {
         // Search filter
         const query = searchQuery.toLowerCase();
         const matchesSearch =
            searchQuery === "" ||
            product.name.toLowerCase().includes(query) ||
            product.slug.toLowerCase().includes(query) ||
            product.category_name?.toLowerCase().includes(query);

         // Status filter
         const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && product.is_active) ||
            (statusFilter === "inactive" && !product.is_active);

         // Stock filter - calculate from variants
         const totalStock = getTotalStock(product);
         const matchesStock =
            stockFilter === "all" ||
            (stockFilter === "in-stock" && totalStock > 10) ||
            (stockFilter === "low-stock" && totalStock > 0 && totalStock <= 10) ||
            (stockFilter === "out-of-stock" && totalStock === 0);

         // Category filter
         const matchesCategory =
            categoryFilter === "all" ||
            product.category_id === categoryFilter ||
            product.category === categoryFilter;

         return matchesSearch && matchesStatus && matchesStock && matchesCategory;
      });
   }, [products, searchQuery, statusFilter, stockFilter, categoryFilter]);

   // Pagination calculations
   const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const endIndex = startIndex + itemsPerPage;
   const paginatedProducts = useMemo(() => {
      return filteredProducts.slice(startIndex, endIndex);
   }, [filteredProducts, startIndex, endIndex]);

   // Stats - calculate from variants
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

   const clearFilters = () => {
      setSearchQueryState("");
      setStatusFilterState("all");
      setStockFilterState("all");
      setCategoryFilterState("all");
      setCurrentPage(1);
   };

   const handleItemsPerPageChange = (value: string) => {
      setItemsPerPage(parseInt(value) as ItemsPerPage);
      setCurrentPage(1);
   };

   const hasActiveFilters =
      searchQuery !== "" ||
      statusFilter !== "all" ||
      stockFilter !== "all" ||
      categoryFilter !== "all";

   // Build stats items for reusable component
   const statsItems = useMemo(() => [
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
   ], [stats]);

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
            <CardHeader className="border-b">
               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>All Products</CardTitle>

                  {/* Search & Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                     <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                           value={searchQuery}
                           placeholder="Search products..."
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="pl-9"
                        />
                     </div>

                     {/* Status Filter */}
                     <Select
                        value={statusFilter}
                        onValueChange={(value) =>
                           setStatusFilter(value as StatusFilter)
                        }
                     >
                        <SelectTrigger className="w-32">
                           <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="all">All Status</SelectItem>
                           <SelectItem value="active">Active</SelectItem>
                           <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                     </Select>

                     {/* Stock Filter */}
                     <Select
                        value={stockFilter}
                        onValueChange={(value) =>
                           setStockFilter(value as StockFilter)
                        }
                     >
                        <SelectTrigger className="w-36">
                           <SelectValue placeholder="Stock" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="all">All Stock</SelectItem>
                           <SelectItem value="in-stock">In Stock</SelectItem>
                           <SelectItem value="low-stock">Low Stock</SelectItem>
                           <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                        </SelectContent>
                     </Select>

                     {/* Category Filter */}
                     <Select
                        value={categoryFilter}
                        onValueChange={setCategoryFilter}
                     >
                        <SelectTrigger className="w-40">
                           <SelectValue placeholder="Category" />
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

                     {hasActiveFilters && (
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={clearFilters}
                           className="h-9 gap-1 text-xs"
                        >
                           <X className="h-3 w-3" />
                           Clear
                        </Button>
                     )}
                  </div>
               </div>
            </CardHeader>

            <CardContent className="p-0">
               {/* Results Count & Items Per Page */}
               <div className="flex items-center justify-between border-b px-6 py-3">
                  {isLoading ? (
                     <Skeleton className="h-4 w-40" />
                  ) : (
                     <p className="text-sm text-muted-foreground">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                           {filteredProducts.length > 0 ? startIndex + 1 : 0}
                        </span>{" "}
                        -{" "}
                        <span className="font-medium text-foreground">
                           {Math.min(endIndex, filteredProducts.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                           {filteredProducts.length}
                        </span>{" "}
                        products
                     </p>
                  )}
                  <div className="flex items-center gap-2">
                     <span className="text-sm text-muted-foreground">Per page:</span>
                     <Select
                        value={itemsPerPage.toString()}
                        onValueChange={handleItemsPerPageChange}
                     >
                        <SelectTrigger className="h-8 w-20">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option.toString()}>
                                 {option}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               {/* Products List */}
               <div className="p-4">
                  {isLoading ? (
                     <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                           <div
                              key={i}
                              className="flex items-center justify-between rounded-lg border p-4"
                           >
                              <div className="flex items-center gap-4">
                                 <Skeleton className="h-14 w-14 rounded-lg" />
                                 <div className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-24" />
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
                     <div className="flex flex-col items-center justify-center py-12">
                        <div className="rounded-full bg-muted p-4">
                           <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">
                           {hasActiveFilters ? "No products found" : "No products yet"}
                        </h3>
                        <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                           {hasActiveFilters
                              ? "Try adjusting your filters to find what you're looking for."
                              : "Get started by adding your first product."}
                        </p>
                        {hasActiveFilters ? (
                           <Button
                              variant="outline"
                              onClick={clearFilters}
                              className="mt-4"
                           >
                              Clear Filters
                           </Button>
                        ) : (
                           <Button asChild className="mt-4">
                              <Link href="/admin/products/new">
                                 <Plus className="mr-2 h-4 w-4" />
                                 Add Product
                              </Link>
                           </Button>
                        )}
                     </div>
                  ) : (
                     <div className="space-y-3">
                        {paginatedProducts.map((product) => {
                           const totalStock = getTotalStock(product);
                           const stockStatus = getStockStatus(totalStock);
                           const priceDisplay = getPriceDisplay(product);
                           const comparePrice = getComparePrice(product);
                           const hasVariants = product.variants && product.variants.length > 1;

                           return (
                              <div
                                 key={product.id}
                                 className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                              >
                                 <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 overflow-hidden rounded-lg bg-muted">
                                       {product.primary_image?.url ? (
                                          <Image
                                             src={product.primary_image.url}
                                             alt={product.name}
                                             width={56}
                                             height={56}
                                             className="h-full w-full object-cover"
                                          />
                                       ) : (
                                          <div className="flex h-full w-full items-center justify-center">
                                             <Package className="h-6 w-6 text-muted-foreground" />
                                          </div>
                                       )}
                                    </div>
                                    <div className="space-y-1">
                                       <p className="font-medium">{product.name}</p>
                                       <p className="text-sm text-muted-foreground">
                                          {product.category_name}
                                       </p>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-4">
                                    <div className="text-right">
                                       {priceDisplay ? (
                                          <p className="font-medium">
                                             {priceDisplay.min === priceDisplay.max ? (
                                                <>
                                                   ${priceDisplay.min.toFixed(2)}
                                                   {comparePrice && (
                                                      <span className="ml-2 text-sm text-muted-foreground line-through">
                                                         ${comparePrice.toFixed(2)}
                                                      </span>
                                                   )}
                                                </>
                                             ) : (
                                                <>${priceDisplay.min.toFixed(2)} - ${priceDisplay.max.toFixed(2)}</>
                                             )}
                                          </p>
                                       ) : (
                                          <p className="font-medium text-muted-foreground">No price</p>
                                       )}
                                       <p className="text-sm text-muted-foreground">
                                          {hasVariants
                                             ? `${product.variants?.length} variant(s) • Stock: ${totalStock}`
                                             : `Stock: ${totalStock}`}
                                       </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                       <Badge variant={stockStatus.variant}>
                                          {stockStatus.label}
                                       </Badge>
                                       {hasVariants && (
                                          <Badge variant="secondary">Variants</Badge>
                                       )}
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
               </div>

               {/* Pagination Controls */}
               {filteredProducts.length > 0 && totalPages > 1 && (
                  <div className="flex items-center justify-between border-t px-6 py-4">
                     <p className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                     </p>
                     <div className="flex items-center gap-1">
                        <Button
                           variant="outline"
                           size="icon"
                           className="h-8 w-8"
                           disabled={currentPage === 1}
                           onClick={() => setCurrentPage(1)}
                        >
                           <ChevronsLeft className="h-4 w-4" />
                           <span className="sr-only">First page</span>
                        </Button>
                        <Button
                           variant="outline"
                           size="icon"
                           className="h-8 w-8"
                           disabled={currentPage === 1}
                           onClick={() => setCurrentPage((p) => p - 1)}
                        >
                           <ChevronLeft className="h-4 w-4" />
                           <span className="sr-only">Previous page</span>
                        </Button>

                        {/* Page Number Buttons */}
                        <div className="flex items-center gap-1">
                           {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter((page) => {
                                 // Show first, last, current, and adjacent pages
                                 return (
                                    page === 1 ||
                                    page === totalPages ||
                                    Math.abs(page - currentPage) <= 1
                                 );
                              })
                              .reduce<(number | "ellipsis")[]>((acc, page, idx, arr) => {
                                 if (idx > 0) {
                                    const prevPage = arr[idx - 1];
                                    if (page - prevPage > 1) {
                                       acc.push("ellipsis");
                                    }
                                 }
                                 acc.push(page);
                                 return acc;
                              }, [])
                              .map((item, idx) =>
                                 item === "ellipsis" ? (
                                    <span
                                       key={`ellipsis-${idx}`}
                                       className="px-2 text-muted-foreground"
                                    >
                                       …
                                    </span>
                                 ) : (
                                    <Button
                                       key={item}
                                       variant={currentPage === item ? "default" : "outline"}
                                       size="icon"
                                       className="h-8 w-8"
                                       onClick={() => setCurrentPage(item)}
                                    >
                                       {item}
                                    </Button>
                                 )
                              )}
                        </div>

                        <Button
                           variant="outline"
                           size="icon"
                           className="h-8 w-8"
                           disabled={currentPage === totalPages}
                           onClick={() => setCurrentPage((p) => p + 1)}
                        >
                           <ChevronRight className="h-4 w-4" />
                           <span className="sr-only">Next page</span>
                        </Button>
                        <Button
                           variant="outline"
                           size="icon"
                           className="h-8 w-8"
                           disabled={currentPage === totalPages}
                           onClick={() => setCurrentPage(totalPages)}
                        >
                           <ChevronsRight className="h-4 w-4" />
                           <span className="sr-only">Last page</span>
                        </Button>
                     </div>
                  </div>
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
