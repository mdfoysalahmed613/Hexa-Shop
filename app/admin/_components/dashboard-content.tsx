"use client";

/**
 * ============================================================================
 * Dashboard Content Component (dashboard-content.tsx)
 * ============================================================================
 *
 * Purpose:
 * Client component that renders the admin dashboard with real-time data.
 * Handles data fetching, loading states, and error display.
 *
 * Usage:
 * - Imported by the admin dashboard page (app/admin/page.tsx)
 * - Uses useDashboardData hook for data fetching
 * - Displays stats cards, recent orders, and top products
 *
 * Architecture:
 * - Client component ("use client") to enable TanStack Query hooks
 * - Separates data fetching logic from server component page
 * - Provides skeleton loading states for better UX
 *
 * ============================================================================
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
   Users,
   Package,
   ShoppingCart,
   DollarSign,
   ArrowUpRight,
   AlertCircle,
   Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useDashboardData } from "@/hooks/use-dashboard";
import { formatDistanceToNow } from "date-fns";
import { StatsCards, type StatItem } from "@/components/shared/stats-cards";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(dateString: string): string {
   return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

// ============================================================================
// Loading Skeleton Components
// ============================================================================

/**
 * Skeleton for recent orders list during loading
 */
function RecentOrdersSkeleton() {
   return (
      <div className="space-y-4">
         {[...Array(4)].map((_, i) => (
            <div
               key={i}
               className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
               <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
               </div>
               <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
               </div>
            </div>
         ))}
      </div>
   );
}

/**
 * Skeleton for top products list during loading
 */
function TopProductsSkeleton() {
   return (
      <div className="space-y-4">
         {[...Array(4)].map((_, i) => (
            <div
               key={i}
               className="flex items-start gap-3 border-b pb-4 last:border-0 last:pb-0"
            >
               <Skeleton className="h-8 w-8 rounded-full" />
               <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
               </div>
               <Skeleton className="h-4 w-16" />
            </div>
         ))}
      </div>
   );
}

// ============================================================================
// Main Dashboard Content Component
// ============================================================================

export function DashboardContent() {
   const { data, isLoading, error } = useDashboardData();

   // ========================================================================
   // Error State
   // ========================================================================
   if (error) {
      return (
         <div className="flex flex-1 flex-col gap-4 p-6">
            <Card className="border-destructive">
               <CardContent className="flex items-center gap-4 py-8">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <div>
                     <h2 className="text-lg font-semibold">
                        Failed to load dashboard
                     </h2>
                     <p className="text-sm text-muted-foreground">
                        {error instanceof Error
                           ? error.message
                           : "An unexpected error occurred"}
                     </p>
                  </div>
               </CardContent>
            </Card>
         </div>
      );
   }

   // ========================================================================
   // Stats Configuration
   // ========================================================================
   // Build stats array from real data (or use placeholder during loading)
   const stats: StatItem[] = data
      ? [
         {
            label: "Total Revenue",
            value: `$${data.stats.totalRevenue}`,
            icon: DollarSign,
            color: "success" as const,
         },
         {
            label: "Orders",
            value: data.stats.totalOrders,
            icon: ShoppingCart,
            color: "info" as const,
         },
         {
            label: "Products",
            value: data.stats.totalProducts,
            icon: Package,
            color: "warning" as const,
         },
         {
            label: "Customers",
            value: data.stats.totalCustomers,
            icon: Users,
            color: "default" as const,
         },
      ]
      : [];

   // ========================================================================
   // Render
   // ========================================================================
   return (
      <div className="flex flex-1 flex-col gap-4 p-6">
         {/* Page Header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
               <p className="text-muted-foreground">
                  Overview of your store&apos;s state and performance.
               </p>
            </div>
            <Button asChild>
               <Link href="/admin/products/new">< Plus className="mr-2 h-4 w-4" /> Add Product</Link>
            </Button>
         </div>

         {/* ================================================================== */}
         {/* Stats Grid - Key Business Metrics */}
         {/* ================================================================== */}
         <StatsCards stats={stats} isLoading={isLoading} />

         {/* ================================================================== */}
         {/* Main Content Grid - Orders & Top Products */}
         {/* ================================================================== */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Orders Card */}
            <Card className="col-span-4">
               <CardHeader>
                  <div className="flex items-center justify-between">
                     <CardTitle>Recent Orders</CardTitle>
                     <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/orders">
                           View All
                           <ArrowUpRight className="ml-1 h-4 w-4" />
                        </Link>
                     </Button>
                  </div>
               </CardHeader>
               <CardContent>
                  {isLoading ? (
                     <RecentOrdersSkeleton />
                  ) : data?.recentOrders.length === 0 ? (
                     <p className="text-sm text-muted-foreground text-center py-8">
                        No orders yet
                     </p>
                  ) : (
                     <div className="space-y-4">
                        {data?.recentOrders.map((order) => (
                           <div
                              key={order.id}
                              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                           >
                              <div className="space-y-1">
                                 <p className="text-sm font-medium">
                                    {order.customerName}
                                 </p>
                                 <div className="flex items-center gap-2">
                                    <p className="text-xs text-muted-foreground">
                                       #{order.orderNumber}
                                    </p>
                                    <Badge
                                       variant={
                                          order.status === "delivered"
                                             ? "success"
                                             : order.status === "processing"
                                                ? "warning"
                                                : order.status === "cancelled"
                                                   ? "destructive"
                                                   : "outline"
                                       }
                                    >
                                       {order.status}
                                    </Badge>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-sm font-medium">
                                    {order.amount}
                                 </p>
                                 <p className="text-xs text-muted-foreground">
                                    {formatRelativeTime(order.createdAt)}
                                 </p>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </CardContent>
            </Card>

            {/* Top Products Card */}
            <Card className="col-span-3">
               <CardHeader>
                  <CardTitle>Top Products</CardTitle>
               </CardHeader>
               <CardContent>
                  {isLoading ? (
                     <TopProductsSkeleton />
                  ) : data?.topProducts.length === 0 ? (
                     <p className="text-sm text-muted-foreground text-center py-8">
                        No sales data yet
                     </p>
                  ) : (
                     <div className="space-y-4">
                        {data?.topProducts.map((product, index) => (
                           <div
                              key={product.id}
                              className="flex items-start gap-3 border-b pb-4 last:border-0 last:pb-0"
                           >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                 {index + 1}
                              </div>
                              <div className="flex-1 space-y-1">
                                 <p className="text-sm font-medium leading-none">
                                    {product.name}
                                 </p>
                                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{product.totalSales} sales</span>
                                    <span>•</span>
                                    <span>Stock: {product.currentStock}</span>
                                 </div>
                              </div>
                              <div className="text-sm font-medium">
                                 {product.totalRevenue}
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </CardContent>
            </Card>
         </div>

         {/* ================================================================== */}
         {/* Quick Actions - Navigation Cards */}
         {/* ================================================================== */}
         <div className="grid gap-4 md:grid-cols-3">
            <Link href="/admin/products">
               <Card className="cursor-pointer transition-colors hover:bg-accent">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Manage Products
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="text-sm text-muted-foreground">
                        Add, edit, or remove products from your inventory
                     </p>
                  </CardContent>
               </Card>
            </Link>
            <Link href="/admin/orders">
               <Card className="cursor-pointer transition-colors hover:bg-accent">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        View Orders
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="text-sm text-muted-foreground">
                        Process and manage customer orders
                     </p>
                  </CardContent>
               </Card>
            </Link>
            <Link href="/admin/customers">
               <Card className="cursor-pointer transition-colors hover:bg-accent">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Manage Customers
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="text-sm text-muted-foreground">
                        View and manage customer accounts
                     </p>
                  </CardContent>
               </Card>
            </Link>
         </div>
      </div>
   );
}
