"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useState } from "react";
import {
   ArrowLeft,
   Package,
   User,
   MapPin,
   CreditCard,
   XCircle,
   FileText,
   Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Field, FieldLabel } from "@/components/ui/field";
import {
   useOrder,
   useUpdateOrderStatus,
   useUpdatePaymentStatus,
   type OrderStatus,
   type PaymentStatus,
} from "@/hooks/use-orders";

// ============================================================================
// Helper Functions
// ============================================================================

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

export function OrderDetailContent() {
   const params = useParams();
   const router = useRouter();
   const orderId = params.id as string;

   const { data: order, isLoading, error } = useOrder(orderId);
   const updateStatusMutation = useUpdateOrderStatus();
   const updatePaymentMutation = useUpdatePaymentStatus();

   // Local state for editable fields
   const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
   const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);

   // Derive current values
   const currentOrderStatus = orderStatus ?? order?.order_status ?? "processing";
   const currentPaymentStatus = paymentStatus ?? order?.payment_status ?? "unpaid";

   const handleStatusUpdate = () => {
      if (order && currentOrderStatus !== order.order_status) {
         updateStatusMutation.mutate({
            id: order.id,
            order_status: currentOrderStatus as OrderStatus,
         });
      }
   };

   const handlePaymentStatusUpdate = () => {
      if (order && currentPaymentStatus !== order.payment_status) {
         updatePaymentMutation.mutate({
            id: order.id,
            payment_status: currentPaymentStatus as PaymentStatus,
         });
      }
   };

   if (isLoading) {
      return (
         <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex items-center gap-4">
               <Skeleton className="h-10 w-10" />
               <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
               <Skeleton className="h-64" />
               <Skeleton className="h-64" />
               <Skeleton className="h-64" />
            </div>
         </div>
      );
   }

   if (error || !order) {
      return (
         <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <XCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-semibold">Order not found</h2>
            <Button onClick={() => router.push("/admin/orders")}>
               <ArrowLeft className="mr-2 h-4 w-4" />
               Back to Orders
            </Button>
         </div>
      );
   }

   return (
      <div className="flex flex-1 flex-col gap-6 p-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <Button variant="ghost" size="icon" asChild>
                  <Link href="/admin/orders">
                     <ArrowLeft className="h-4 w-4" />
                  </Link>
               </Button>
               <div>
                  <div className="flex items-center gap-3">
                     <h1 className="text-2xl font-bold tracking-tight font-mono">
                        {order.order_number}
                     </h1>
                     <Badge variant={getStatusVariant(order.order_status)}>
                        {order.order_status}
                     </Badge>
                     <Badge variant={getPaymentStatusVariant(order.payment_status)}>
                        {order.payment_status}
                     </Badge>
                  </div>
                  <p className="text-muted-foreground">
                     Placed on{" "}
                     {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
               </div>
            </div>
         </div>

         <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
               {/* Order Items */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order Items
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {order.items?.map((item) => (
                              <TableRow key={item.id}>
                                 <TableCell>
                                    <div className="flex items-center gap-3">
                                       <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                                          {item.product_image_url ? (
                                             <Image
                                                src={item.product_image_url}
                                                alt={item.product_name}
                                                width={48}
                                                height={48}
                                                className="object-cover"
                                             />
                                          ) : (
                                             <Package className="h-5 w-5 text-muted-foreground" />
                                          )}
                                       </div>
                                       <div>
                                          <p className="font-medium">{item.product_name}</p>
                                          {item.variant_name && (
                                             <p className="text-sm text-muted-foreground">
                                                {item.variant_name}
                                             </p>
                                          )}
                                       </div>
                                    </div>
                                 </TableCell>
                                 <TableCell className="text-right">
                                    ${item.unit_price.toFixed(2)}
                                 </TableCell>
                                 <TableCell className="text-right">{item.quantity}</TableCell>
                                 <TableCell className="text-right font-medium">
                                    ${item.total_price.toFixed(2)}
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>

                     <Separator className="my-4" />

                     {/* Order Totals */}
                     <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                           <span className="text-muted-foreground">Subtotal</span>
                           <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-muted-foreground">Shipping</span>
                           <span>
                              {order.shipping_cost === 0 ? (
                                 <span className="text-green-600">Free</span>
                              ) : (
                                 `$${order.shipping_cost.toFixed(2)}`
                              )}
                           </span>
                        </div>
                        {order.discount_amount > 0 && (
                           <div className="flex justify-between text-green-600">
                              <span>Discount</span>
                              <span>-${order.discount_amount.toFixed(2)}</span>
                           </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-medium text-base">
                           <span>Total</span>
                           <span>${order.total.toFixed(2)}</span>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Customer Notes */}
               {order.customer_notes && (
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <FileText className="h-5 w-5" />
                           Customer Notes
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                           {order.customer_notes}
                        </p>
                     </CardContent>
                  </Card>
               )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
               {/* Customer Info */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Customer
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                     <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-muted-foreground">{order.customer_email}</p>
                        {order.customer_phone && (
                           <p className="text-muted-foreground">{order.customer_phone}</p>
                        )}
                     </div>
                  </CardContent>
               </Card>

               {/* Shipping Address */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Shipping Address
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                     <p>{order.shipping_address_line1}</p>
                     <p>
                        {order.shipping_city}, {order.shipping_postal_code}
                     </p>
                     <p>{order.shipping_country}</p>
                  </CardContent>
               </Card>

               {/* Order Actions */}
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Order Actions
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {/* Order Status */}
                     <Field>
                        <FieldLabel>Order Status</FieldLabel>
                        <div className="flex gap-2">
                           <Select
                              value={currentOrderStatus}
                              onValueChange={(value) =>
                                 setOrderStatus(value as OrderStatus)
                              }
                           >
                              <SelectTrigger className="flex-1">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="processing">Processing</SelectItem>
                                 <SelectItem value="delivered">Delivered</SelectItem>
                                 <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                           </Select>
                           <Button
                              size="sm"
                              onClick={handleStatusUpdate}
                              disabled={
                                 currentOrderStatus === order.order_status ||
                                 updateStatusMutation.isPending
                              }
                           >
                              {updateStatusMutation.isPending ? (
                                 <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                 "Update"
                              )}
                           </Button>
                        </div>
                     </Field>

                     {/* Payment Status */}
                     <Field>
                        <FieldLabel>Payment Status</FieldLabel>
                        <div className="flex gap-2">
                           <Select
                              value={currentPaymentStatus}
                              onValueChange={(value) =>
                                 setPaymentStatus(value as PaymentStatus)
                              }
                           >
                              <SelectTrigger className="flex-1">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="unpaid">Unpaid</SelectItem>
                                 <SelectItem value="paid">Paid</SelectItem>
                              </SelectContent>
                           </Select>
                           <Button
                              size="sm"
                              onClick={handlePaymentStatusUpdate}
                              disabled={
                                 currentPaymentStatus === order.payment_status ||
                                 updatePaymentMutation.isPending
                              }
                           >
                              {updatePaymentMutation.isPending ? (
                                 <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                 "Update"
                              )}
                           </Button>
                        </div>
                     </Field>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
   );
}
