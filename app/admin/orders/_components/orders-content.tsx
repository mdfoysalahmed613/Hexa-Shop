"use client";

/**
 * Orders Content
 *
 * Admin orders management page with data table and statistics.
 * Displays all orders with filtering, sorting, and quick actions.
 *
 * Features:
 * - Order statistics cards (total, processing, delivered, revenue)
 * - Searchable/sortable data table with row selection
 * - Bulk actions for selected orders
 * - Status badges with icons
 * - Row actions with dropdown menu (3-dot button)
 */

import { useState, useMemo, useCallback } from "react";
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
   Search,
   MoreHorizontal,
   Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
   useOrders,
   useOrderStats,
   useUpdateOrderStatus,
   useUpdatePaymentStatus,
   useDeleteOrder,
   useBulkUpdateOrderStatus,
   useBulkUpdatePaymentStatus,
   useBulkDeleteOrders,
   type Order,
   type OrderStatus,
   type PaymentStatus,
} from "@/hooks/use-orders";
import { StatsCards } from "@/components/shared/stats-cards";
import { DataTable } from "@/components/ui/data-table";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

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
): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" {
   switch (status) {
      case "delivered":
         return "success";
      case "processing":
         return "warning";
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

   // Search state
   const [searchQuery, setSearchQuery] = useState("");

   // Selected rows state
   const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

   // Mutations
   const updateOrderStatus = useUpdateOrderStatus();
   const updatePaymentStatus = useUpdatePaymentStatus();
   const deleteOrder = useDeleteOrder();
   const bulkUpdateOrderStatus = useBulkUpdateOrderStatus();
   const bulkUpdatePaymentStatus = useBulkUpdatePaymentStatus();
   const bulkDeleteOrders = useBulkDeleteOrders();

   // Row selection handler
   const handleRowSelectionChange = useCallback((rows: Order[]) => {
      setSelectedOrders(rows);
   }, []);

   // Bulk action handlers
   const handleBulkStatusUpdate = useCallback((status: OrderStatus) => {
      const ids = selectedOrders.map(o => o.id);
      bulkUpdateOrderStatus.mutate({ ids, order_status: status }, {
         onSuccess: () => setSelectedOrders([]),
      });
   }, [selectedOrders, bulkUpdateOrderStatus]);

   const handleBulkPaymentUpdate = useCallback((status: PaymentStatus) => {
      const ids = selectedOrders.map(o => o.id);
      bulkUpdatePaymentStatus.mutate({ ids, payment_status: status }, {
         onSuccess: () => setSelectedOrders([]),
      });
   }, [selectedOrders, bulkUpdatePaymentStatus]);

   const handleBulkDelete = useCallback(() => {
      const ids = selectedOrders.map(o => o.id);
      bulkDeleteOrders.mutate(ids, {
         onSuccess: () => setSelectedOrders([]),
      });
   }, [selectedOrders, bulkDeleteOrders]);

   // Filter orders by search query
   const filteredOrders = useMemo(() => {
      if (!searchQuery) return orders;
      const query = searchQuery.toLowerCase();
      return orders.filter((order) => {
         const orderNumber = order.order_number.toLowerCase();
         const customerName = order.customer_name?.toLowerCase() || "";
         const customerEmail = order.customer_email?.toLowerCase() || "";
         return (
            orderNumber.includes(query) ||
            customerName.includes(query) ||
            customerEmail.includes(query)
         );
      });
   }, [orders, searchQuery]);

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
            id: "select",
            header: ({ table }) => (
               <Checkbox
                  checked={
                     table.getIsAllPageRowsSelected() ||
                     (table.getIsSomePageRowsSelected() && "indeterminate")
                  }
                  onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                  aria-label="Select all"
               />
            ),
            cell: ({ row }) => (
               <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  aria-label="Select row"
               />
            ),
            enableSorting: false,
            enableHiding: false,
         },
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
            cell: ({ row }) => {
               const order = row.original;
               return (
                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                           <MoreHorizontal className="h-4 w-4" />
                           <span className="sr-only">Open menu</span>
                        </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                           <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuItem
                           onClick={() => updateOrderStatus.mutate({ id: order.id, order_status: "processing" })}
                           disabled={order.order_status === "processing"}
                        >
                           <Package className="mr-2 h-4 w-4" />
                           Mark Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem
                           onClick={() => updateOrderStatus.mutate({ id: order.id, order_status: "delivered" })}
                           disabled={order.order_status === "delivered"}
                        >
                           <CheckCircle className="mr-2 h-4 w-4" />
                           Mark Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem
                           onClick={() => updateOrderStatus.mutate({ id: order.id, order_status: "cancelled" })}
                           disabled={order.order_status === "cancelled"}
                        >
                           <XCircle className="mr-2 h-4 w-4" />
                           Mark Cancelled
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Payment</DropdownMenuLabel>
                        <DropdownMenuItem
                           onClick={() => updatePaymentStatus.mutate({ id: order.id, payment_status: "paid" })}
                           disabled={order.payment_status === "paid"}
                        >
                           <DollarSign className="mr-2 h-4 w-4" />
                           Mark Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem
                           onClick={() => updatePaymentStatus.mutate({ id: order.id, payment_status: "unpaid" })}
                           disabled={order.payment_status === "unpaid"}
                        >
                           <DollarSign className="mr-2 h-4 w-4" />
                           Mark Unpaid
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                           className="text-destructive focus:text-destructive"
                           onClick={() => deleteOrder.mutate(order.id)}
                        >
                           <Trash2 className="mr-2 h-4 w-4" />
                           Delete Order
                        </DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu>
               );
            },
         },
      ],
      [updateOrderStatus, updatePaymentStatus, deleteOrder]
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
         <h1 className="text-lg font-semibold ">
            All Orders ({filteredOrders.length})
         </h1>
         {/* Orders Table */}
         <Card>
            <CardContent className="pt-6">
               {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                     <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
               ) : filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                     <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                     <h3 className="text-lg font-semibold">
                        {searchQuery ? "No orders found" : "No orders yet"}
                     </h3>
                     <p className="text-sm text-muted-foreground">
                        {searchQuery
                           ? "Try adjusting your search."
                           : "Orders will appear here when customers make purchases"}
                     </p>
                     {searchQuery && (
                        <Button
                           variant="outline"
                           onClick={() => setSearchQuery("")}
                           className="mt-4"
                        >
                           Clear Search
                        </Button>
                     )}
                  </div>
               ) : (
                  <DataTable
                     columns={columns}
                     data={filteredOrders}
                     pageSize={10}
                     enableRowSelection
                     onRowSelectionChange={handleRowSelectionChange}
                     searchBar={
                        <InputGroup className="max-w-lg">
                           <InputGroupInput
                              value={searchQuery}
                              placeholder="Search by order #, customer..."
                              onChange={(e) => setSearchQuery(e.target.value)}
                           />
                           <InputGroupAddon>
                              <Search />
                           </InputGroupAddon>
                        </InputGroup>
                     }
                     bulkActionsToolbar={
                        <>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <Button variant="outline" size="sm">
                                    <Package className="mr-2 h-4 w-4" />
                                    Update Status
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                 <DropdownMenuItem onClick={() => handleBulkStatusUpdate("processing")}>
                                    <Package className="mr-2 h-4 w-4" />
                                    Mark Processing
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => handleBulkStatusUpdate("delivered")}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark Delivered
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => handleBulkStatusUpdate("cancelled")}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Mark Cancelled
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <Button variant="outline" size="sm">
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Update Payment
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                 <DropdownMenuItem onClick={() => handleBulkPaymentUpdate("paid")}>
                                    Mark Paid
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => handleBulkPaymentUpdate("unpaid")}>
                                    Mark Unpaid
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                           <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleBulkDelete}
                           >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                           </Button>
                        </>
                     }
                  />
               )}
            </CardContent>
         </Card>
      </div>
   );
}
