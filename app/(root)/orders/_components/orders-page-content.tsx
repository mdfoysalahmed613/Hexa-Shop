"use client";

/**
 * Orders Page Content (Client Component)
 *
 * Displays the current user's order history.
 * Requires authentication.
 */

import { useMyOrders } from "@/hooks/use-orders";
import { useUser } from "@/providers/user-provider";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ShoppingBag, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Order, OrderStatus } from "@/lib/services/orders";

function getStatusBadgeVariant(status: OrderStatus): "default" | "secondary" | "destructive" | "outline" {
   switch (status) {
      case "pending":
         return "secondary";
      case "processing":
         return "default";
      case "shipped":
         return "default";
      case "delivered":
         return "outline";
      case "cancelled":
         return "destructive";
      default:
         return "secondary";
   }
}

function getStatusIcon(status: OrderStatus) {
   switch (status) {
      case "pending":
         return <Clock className="h-3 w-3" />;
      case "processing":
         return <Package className="h-3 w-3" />;
      case "shipped":
         return <Truck className="h-3 w-3" />;
      case "delivered":
         return <CheckCircle className="h-3 w-3" />;
      case "cancelled":
         return <XCircle className="h-3 w-3" />;
      default:
         return null;
   }
}

function formatDate(dateString: string) {
   return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
   });
}

function formatCurrency(amount: number) {
   return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
   }).format(amount);
}

function OrderCard({ order }: { order: Order }) {
   return (
      <Card>
         <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
               <div>
                  <CardTitle className="text-lg font-semibold">
                     Order #{order.order_number}
                  </CardTitle>
                  <CardDescription>
                     Placed on {formatDate(order.created_at)}
                  </CardDescription>
               </div>
               <div className="flex flex-col items-end gap-2">
                  <Badge variant={getStatusBadgeVariant(order.order_status)} className="flex items-center gap-1">
                     {getStatusIcon(order.order_status)}
                     <span className="capitalize">{order.order_status}</span>
                  </Badge>
               </div>
            </div>
         </CardHeader>
         <CardContent>
            {/* Order Items */}
            <div className="space-y-3">
               {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                     <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted">
                        {item.product_image_url ? (
                           <Image
                              src={item.product_image_url}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                           />
                        ) : (
                           <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                           </div>
                        )}
                     </div>
                     <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                           Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                        </p>
                     </div>
                     <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.total_price)}</p>
                     </div>
                  </div>
               ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 border-t pt-4">
               <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
               </div>
               {order.shipping_cost > 0 && (
                  <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground">Shipping</span>
                     <span>{formatCurrency(order.shipping_cost)}</span>
                  </div>
               )}
               {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                     <span>Discount</span>
                     <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
               )}
               <div className="mt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
               </div>
            </div>

            {/* Shipping Address */}
            <div className="mt-4 border-t pt-4">
               <p className="text-sm font-medium">Shipping Address</p>
               <p className="text-sm text-muted-foreground">
                  {order.customer_name}<br />
                  {order.shipping_address_line}<br />
                  {order.shipping_city}, {order.shipping_postal_code}<br />
                  {order.shipping_country}
               </p>
            </div>
         </CardContent>
      </Card>
   );
}

function OrdersSkeleton() {
   return (
      <div className="space-y-4">
         {[1, 2, 3].map((i) => (
            <Card key={i}>
               <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                     <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-32" />
                     </div>
                     <Skeleton className="h-6 w-24" />
                  </div>
               </CardHeader>
               <CardContent>
                  <div className="space-y-3">
                     {[1, 2].map((j) => (
                        <div key={j} className="flex items-center gap-4">
                           <Skeleton className="h-16 w-16 rounded-md" />
                           <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-3 w-24" />
                           </div>
                           <Skeleton className="h-4 w-16" />
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         ))}
      </div>
   );
}

function EmptyOrders() {
   return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
         <ShoppingBag className="h-16 w-16 text-muted-foreground" />
         <h2 className="mt-4 text-xl font-semibold">No orders yet</h2>
         <p className="mt-2 text-muted-foreground">
            You haven&apos;t placed any orders yet. Start shopping to see your orders here.
         </p>
         <Button asChild className="mt-6">
            <Link href="/products">Browse Products</Link>
         </Button>
      </div>
   );
}

function NotAuthenticated() {
   return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
         <ShoppingBag className="h-16 w-16 text-muted-foreground" />
         <h2 className="mt-4 text-xl font-semibold">Sign in to view your orders</h2>
         <p className="mt-2 text-muted-foreground">
            Please sign in to view your order history.
         </p>
         <Button asChild className="mt-6">
            <Link href="/auth">Sign In</Link>
         </Button>
      </div>
   );
}

export function OrdersPageContent() {
   const { user, isLoading: userLoading } = useUser();
   const { data: orders, isLoading: ordersLoading, error } = useMyOrders();

   const isLoading = userLoading || ordersLoading;

   return (
      <>
         {isLoading ? (
            <OrdersSkeleton />
         ) : !user ? (
            <NotAuthenticated />
         ) : error ? (
            <Card>
               <CardContent className="py-8 text-center">
                  <p className="text-destructive">Failed to load orders. Please try again.</p>
               </CardContent>
            </Card>
         ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
               {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
               ))}
            </div>
         ) : (
            <EmptyOrders />
         )}
      </>
   );
}
