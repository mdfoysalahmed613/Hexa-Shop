"use client";

/**
 * Checkout Page Client
 *
 * Full-page checkout flow with order summary and shipping form.
 * Displays order confirmation after successful submission.
 *
 * Layout:
 * - Left: Shipping form (pre-filled from user session)
 * - Right: Order summary (cart items, totals)
 *
 * Flow:
 * 1. User fills shipping details
 * 2. Form validates via Zod schema
 * 3. Order created via useCreateOrder mutation
 * 4. Success screen with order number
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
   Loader2,
   ShoppingBag,
   Check,
   Package,
   ArrowLeft,
   MapPin,
   User,
   CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/providers/cart-provider";
import { useUser } from "@/providers/user-provider";
import { useCreateOrder, type CheckoutInput } from "@/hooks/use-orders";

// ============================================================================
// Schema
// ============================================================================

const checkoutSchema = z.object({
   customer_name: z.string().min(1, "Name is required"),
   customer_email: z.string().email("Valid email is required"),
   customer_phone: z.string().optional(),
   shipping_address_line: z.string().min(1, "Address is required"),
   shipping_city: z.string().min(1, "City is required"),
   shipping_postal_code: z.string().min(1, "Postal code is required"),
   shipping_country: z.string().min(1, "Country is required"),
   customer_notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ============================================================================
// Component
// ============================================================================

export function CheckoutPageClient() {
   const { items, subtotal, clearCart } = useCart();
   const { user } = useUser();
   const createOrderMutation = useCreateOrder();
   const [orderComplete, setOrderComplete] = useState(false);
   const [orderNumber, setOrderNumber] = useState<string | null>(null);

   const {
      control,
      handleSubmit,
   } = useForm<CheckoutFormData>({
      resolver: zodResolver(checkoutSchema),
      defaultValues: {
         customer_name: user?.user_metadata?.full_name || "",
         customer_email: user?.email || "",
         customer_phone: "",
         shipping_address_line: "",
         shipping_city: "",
         shipping_postal_code: "",
         shipping_country: "BD",
         customer_notes: "",
      },
   });

   const onSubmit = async (data: CheckoutFormData) => {
      const orderInput: CheckoutInput = {
         ...data,
         items: items.map((item) => ({
            variant_id: item.variantId,
            product_name: item.name,
            product_image_url: item.image,
            unit_price: item.price,
            quantity: item.quantity,
         })),
      };

      const order = await createOrderMutation.mutateAsync(orderInput);
      setOrderNumber(order.order_number);
      setOrderComplete(true);
      clearCart();
   };

   // Empty cart state
   if (items.length === 0 && !orderComplete) {
      return (
         <div className="container max-w-4xl mx-auto py-12 px-4">
            <div className="flex flex-col items-center justify-center gap-4 py-16">
               <div className="rounded-full bg-muted p-6">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground" />
               </div>
               <div className="text-center">
                  <h2 className="text-xl font-semibold">Your cart is empty</h2>
                  <p className="text-muted-foreground mt-2">
                     Add items to your cart to proceed with checkout.
                  </p>
               </div>
               <Button asChild className="mt-4">
                  <Link href="/products">
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Continue Shopping
                  </Link>
               </Button>
            </div>
         </div>
      );
   }

   // Order success state
   if (orderComplete) {
      return (
         <div className="container max-w-4xl mx-auto py-12 px-4">
            <div className="flex flex-col items-center justify-center py-16 text-center">
               <div className="rounded-full bg-green-100 p-6 dark:bg-green-900/30">
                  <Check className="h-12 w-12 text-green-600 dark:text-green-400" />
               </div>
               <h2 className="mt-6 text-2xl font-bold">Order Placed Successfully!</h2>
               <p className="mt-3 text-muted-foreground max-w-md">
                  Thank you for your order. We&apos;ll send you an email confirmation with your order details.
               </p>
               <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="text-xl font-mono font-bold">{orderNumber}</p>
               </div>
               <div className="flex gap-4 mt-8">
                  <Button variant="outline" asChild>
                     <Link href="/products">
                        <Package className="mr-2 h-4 w-4" />
                        Continue Shopping
                     </Link>
                  </Button>
                  <Button asChild>
                     <Link href="/">Back to Home</Link>
                  </Button>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
         {/* Header */}
         <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
               <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
               </Link>
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground mt-1">
               Complete your order by filling in the details below.
            </p>
         </div>

         <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid lg:grid-cols-3 gap-8">
               {/* Left Column - Form */}
               <div className="lg:col-span-2 space-y-6">
                  {/* Contact Information */}
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <User className="h-5 w-5" />
                           Contact Information
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                           <Controller
                              control={control}
                              name="customer_name"
                              render={({ field, fieldState }) => (
                                 <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="customer_name">
                                       Full Name <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                       id="customer_name"
                                       placeholder="John Doe"
                                       {...field}
                                       aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                       <FieldError errors={[fieldState.error]} />
                                    )}
                                 </Field>
                              )}
                           />
                           <Controller
                              control={control}
                              name="customer_email"
                              render={({ field, fieldState }) => (
                                 <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="customer_email">
                                       Email <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                       id="customer_email"
                                       type="email"
                                       placeholder="john@example.com"
                                       {...field}
                                       aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                       <FieldError errors={[fieldState.error]} />
                                    )}
                                 </Field>
                              )}
                           />
                        </div>
                        <Controller
                           control={control}
                           name="customer_phone"
                           render={({ field }) => (
                              <Field>
                                 <FieldLabel htmlFor="customer_phone">
                                    Phone (Optional)
                                 </FieldLabel>
                                 <Input
                                    id="customer_phone"
                                    type="tel"
                                    placeholder="+880 1XXX-XXXXXX"
                                    {...field}
                                 />
                              </Field>
                           )}
                        />
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
                     <CardContent className="space-y-4">
                        <Controller
                           control={control}
                           name="shipping_address_line"
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel htmlFor="shipping_address_line">
                                    Street Address <span className="text-destructive">*</span>
                                 </FieldLabel>
                                 <Input
                                    id="shipping_address_line"
                                    placeholder="123 Main Street, Apt 4B"
                                    {...field}
                                    aria-invalid={fieldState.invalid}
                                 />
                                 {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                 )}
                              </Field>
                           )}
                        />
                        <div className="grid gap-4 sm:grid-cols-3">
                           <Controller
                              control={control}
                              name="shipping_city"
                              render={({ field, fieldState }) => (
                                 <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="shipping_city">
                                       City <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                       id="shipping_city"
                                       placeholder="Dhaka"
                                       {...field}
                                       aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                       <FieldError errors={[fieldState.error]} />
                                    )}
                                 </Field>
                              )}
                           />
                           <Controller
                              control={control}
                              name="shipping_postal_code"
                              render={({ field, fieldState }) => (
                                 <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="shipping_postal_code">
                                       Postal Code <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input
                                       id="shipping_postal_code"
                                       placeholder="1205"
                                       {...field}
                                       aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                       <FieldError errors={[fieldState.error]} />
                                    )}
                                 </Field>
                              )}
                           />
                           <Controller
                              control={control}
                              name="shipping_country"
                              render={({ field }) => (
                                 <Field>
                                    <FieldLabel htmlFor="shipping_country">Country</FieldLabel>
                                    <Input
                                       id="shipping_country"
                                       placeholder="Bangladesh"
                                       {...field}
                                    />
                                 </Field>
                              )}
                           />
                        </div>
                     </CardContent>
                  </Card>

                  {/* Order Notes */}
                  <Card>
                     <CardHeader>
                        <CardTitle>Order Notes (Optional)</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <Controller
                           control={control}
                           name="customer_notes"
                           render={({ field }) => (
                              <Field>
                                 <Textarea
                                    id="customer_notes"
                                    placeholder="Any special instructions for your order..."
                                    rows={4}
                                    {...field}
                                 />
                              </Field>
                           )}
                        />
                     </CardContent>
                  </Card>

                  {/* Payment Note */}
                  <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                           <CreditCard className="h-5 w-5" />
                           Payment Information
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-amber-700 dark:text-amber-300 text-sm">
                           This is a demo project. No real payment will be processed.
                           Your order will be placed directly with &quot;Cash on Delivery&quot; payment method.
                        </p>
                     </CardContent>
                  </Card>
               </div>

               {/* Right Column - Order Summary */}
               <div className="lg:col-span-1">
                  <Card className="sticky top-4">
                     <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        {/* Cart Items */}
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                           {items.map((item) => (
                              <div key={item.id} className="flex gap-3">
                                 <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted flex-shrink-0">
                                    {item.image ? (
                                       <Image
                                          src={item.image}
                                          alt={item.name}
                                          fill
                                          className="object-cover"
                                       />
                                    ) : (
                                       <div className="flex h-full w-full items-center justify-center">
                                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                       </div>
                                    )}
                                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                       {item.quantity}
                                    </div>
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{item.name}</p>
                                    {(item.size || item.color) && (
                                       <p className="text-xs text-muted-foreground">
                                          {[item.size, item.color].filter(Boolean).join(" / ")}
                                       </p>
                                    )}
                                    <p className="text-sm font-medium mt-1">
                                       ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                 </div>
                              </div>
                           ))}
                        </div>

                        <Separator />

                        {/* Totals */}
                        <div className="space-y-2 text-sm">
                           <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span>${subtotal.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-muted-foreground">Shipping</span>
                              <span className="text-green-600">Free</span>
                           </div>
                           <Separator />
                           <div className="flex justify-between text-base font-semibold">
                              <span>Total</span>
                              <span>${subtotal.toFixed(2)}</span>
                           </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                           type="submit"
                           size="lg"
                           className="w-full"
                           disabled={createOrderMutation.isPending || items.length === 0}
                        >
                           {createOrderMutation.isPending ? (
                              <>
                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                 Processing...
                              </>
                           ) : (
                              <>
                                 Place Order (${subtotal.toFixed(2)})
                              </>
                           )}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                           By placing your order, you agree to our Terms of Service and Privacy Policy.
                        </p>
                     </CardContent>
                  </Card>
               </div>
            </div>
         </form>
      </div>
   );
}
