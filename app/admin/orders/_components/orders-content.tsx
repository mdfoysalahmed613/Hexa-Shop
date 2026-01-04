"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
   ShoppingCart,
   Eye,
   Package,
   Clock,
   CheckCircle,
   XCircle,
   DollarSign,
   Loader2,
   RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
   useOrders,
   useOrderStats,
   type Order,
   type OrderStatus,
   type PaymentStatus,
} from "@/hooks/use-orders";
import { StatsCards } from "@/components/shared/stats-cards";
import { DataTable } from "@/components/ui/data-table";

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusIcon(status: OrderStatus) {
   switch (status) {
      case "processing":
         return <Package className="h-4 w-4" />;
      case "delivered":
         return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
         return <XCircle className="h-4 w-4" />;
      default:
         return <ShoppingCart className="h-4 w-4" />;
   }
}

function getStatusVariant(
   status: OrderStatus
): "default" | "secondary" | "destructive" | "outline" {
   switch (status) {
      case "delivered":
         return "default";
      case "processing":
         return "secondary";
      case "cancelled":
         return "destructive";
      default:
         return "outline";
   }
}

function getPaymentStatusVariant(
   status: PaymentStatus
): "default" | "secondary" | "destructive" | "outline" {
   switch (status) {
      case "paid":
         return "default";
      case "unpaid":
         return "outline";
      default:
         return "secondary";
   }
}

// ============================================================================
// Component
// ============================================================================

export function OrdersContent() {
   const { data: orders = [], isLoading, refetch, isRefetching } = useOrders();
   const { data: stats, isLoading: statsLoading } = useOrderStats();

   // Build stats items
   const statsItems = useMemo(
      () => [
         {
            label: "Total Orders",
            value: stats?.total_orders ?? 0,
            icon: ShoppingCart,
            color: "default" as const,
         },
         {
            label: "Processing",
            value: stats?.processing_orders ?? 0,
            icon: Clock,
            color: "warning" as const,
         },
         {
            label: "Delivered",
            value: stats?.delivered_orders ?? 0,
            icon: CheckCircle,
            color: "success" as const,
         },
         {
            label: "Total Revenue",
            value: `$${(stats?.total_revenue ?? 0).toFixed(2)}`,
            icon: DollarSign,
            color: "success" as const,
         },
      ],
      [stats]
   );

   // Columns definition
   const columns: ColumnDef<Order>[] = useMemo(
      () => [
         {
            accessorKey: "order_number",
            header: "Order",
            cell: ({ row }) => {
               const order = row.original;
               return (
                  <div className="flex items-center gap-2">
                     {getStatusIcon(order.order_status)}
                     <span className="font-mono text-sm">{order.order_number}</span>
                  </div>
               );
            },
         },
         {
            accessorKey: "customer_name",
            header: "Customer",
            cell: ({ row }) => {
               const order = row.original;
               return (
                  <div>
                     <p className="font-medium">{order.customer_name}</p>
                     <p className="text-xs text-muted-foreground">
                        {order.customer_email}
                     </p>
                  </div>
               );
            },
         },
         {
            accessorKey: "order_status",
            header: "Status",
            cell: ({ row }) => (
               <Badge variant={getStatusVariant(row.original.order_status)}>
                  {row.original.order_status}
               </Badge>
            ),
         },
         {
            accessorKey: "payment_status",
            header: "Payment",
            cell: ({ row }) => (
               <Badge variant={getPaymentStatusVariant(row.original.payment_status)}>
                  {row.original.payment_status}
               </Badge>
            ),
         },
         {
            accessorKey: "total",
            header: "Total",
            cell: ({ row }) => (
               <span className="font-medium text-right">
                  ${row.original.total.toFixed(2)}
               </span>
            ),
         },
         {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) =>
               format(new Date(row.original.created_at), "MMM d, yyyy"),
         },
         {
            id: "actions",
            header: "",
            cell: ({ row }) => (
               <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/orders/${row.original.id}`}>
                     <Eye className="h-4 w-4" />
                  </Link>
               </Button>
            ),
         },
      ],
      []
   );

   return (
      <div className="flex flex-1 flex-col gap-6 p-6">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
               <p className="text-muted-foreground">
                  Manage and track customer orders
               </p>
            </div>
            <Button
               variant="outline"
               size="sm"
               onClick={() => refetch()}
               disabled={isRefetching}
            >
               <RefreshCw
                  className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
               />
               Refresh
            </Button>
         </div>

         {/* Stats Cards */}
         <StatsCards stats={statsItems} isLoading={statsLoading} />

         {/* Orders Table */}
         <Card>
            <CardHeader>
               <CardTitle>All Orders ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
               {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                     <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
               ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                     <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                     <h3 className="text-lg font-semibold">No orders found</h3>
                     <p className="text-sm text-muted-foreground">
                        Orders will appear here when customers make purchases
                     </p>
                  </div>
               ) : (
                  <DataTable columns={columns} data={orders} pageSize={10} />
               )}
            </CardContent>
         </Card>
      </div>
   );
}
