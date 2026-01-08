"use client";

/**
 * Checkout Dialog
 *
 * Modal form for completing orders. Collects shipping info and processes payment.
 * Shows order confirmation on success with order number.
 *
 * Features:
 * - Pre-fills user email/name from auth session
 * - Validates required shipping fields via Zod schema
 * - Shows order summary with items and totals
 * - Displays success state with order number
 * - Clears cart on successful order
 */

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CreditCard, Check, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
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
   shipping_address_line2: z.string().optional(),
   shipping_city: z.string().min(1, "City is required"),
   shipping_state: z.string().min(1, "State is required"),
   shipping_postal_code: z.string().min(1, "Postal code is required"),
   shipping_country: z.string().min(1, "Country is required"),
   customer_notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ============================================================================
// Component
// ============================================================================

interface CheckoutDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
   const { items, subtotal, clearCart, closeCart } = useCart();
   const { user } = useUser();
   const createOrderMutation = useCreateOrder();
   const [orderComplete, setOrderComplete] = useState(false);
   const [orderNumber, setOrderNumber] = useState<string | null>(null);

   const {
      control,
      handleSubmit,
      reset,
   } = useForm<CheckoutFormData>({
      resolver: zodResolver(checkoutSchema),
      defaultValues: {
         customer_name: user?.user_metadata?.full_name || "",
         customer_email: user?.email || "",
         customer_phone: "",
         shipping_address_line: "",
         shipping_address_line2: "",
         shipping_city: "",
         shipping_state: "",
         shipping_postal_code: "",
         shipping_country: "US",
         customer_notes: "",
      },
   });

   const onSubmit = async (data: CheckoutFormData) => {
      const orderInput: CheckoutInput = {
         ...data,
         items: items.map((item) => ({
            product_id: item.productId,
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

   const handleClose = () => {
      onOpenChange(false);
      if (orderComplete) {
         setOrderComplete(false);
         setOrderNumber(null);
         reset();
         closeCart();
      }
   };

   // Order success screen
   if (orderComplete) {
      return (
         <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
               <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                     <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold">Order Placed!</h2>
                  <p className="mt-2 text-muted-foreground">
                     Thank you for your order. Your order number is:
                  </p>
                  <p className="mt-2 text-lg font-mono font-bold">{orderNumber}</p>
                  <p className="mt-4 text-sm text-muted-foreground">
                     We&apos;ll send you an email confirmation with your order details.
                  </p>
                  <Button className="mt-6" onClick={handleClose}>
                     <Package className="mr-2 h-4 w-4" />
                     Continue Shopping
                  </Button>
               </div>
            </DialogContent>
         </Dialog>
      );
   }

   return (
      <Dialog open={open} onOpenChange={handleClose}>
         <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Checkout
               </DialogTitle>
               <DialogDescription>
                  Complete your order by filling in your details below.
               </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
               {/* Order Summary */}
               <div className="rounded-lg border p-4 bg-muted/50">
                  <h3 className="font-medium mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                     {items.map((item) => {
                        const variantLabel = [item.size, item.color].filter(Boolean).join(" / ");
                        return (
                           <div key={item.id} className="flex justify-between">
                              <span className="text-muted-foreground">
                                 {item.name} {variantLabel ? `(${variantLabel})` : ""} x{" "}
                                 {item.quantity}
                              </span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                           </div>
                        );
                     })}
                     <Separator className="my-2" />
                     <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>${subtotal.toFixed(2)}</span>
                     </div>
                  </div>
               </div>

               {/* Contact Information */}
               <div className="space-y-4">
                  <h3 className="font-medium">Contact Information</h3>
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
                           <FieldLabel htmlFor="customer_phone">Phone (Optional)</FieldLabel>
                           <Input
                              id="customer_phone"
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              {...field}
                           />
                        </Field>
                     )}
                  />
               </div>

               {/* Shipping Address */}
               <div className="space-y-4">
                  <h3 className="font-medium">Shipping Address</h3>
                  <Controller
                     control={control}
                     name="shipping_address_line"
                     render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                           <FieldLabel htmlFor="shipping_address_line">
                              Address Line 1 <span className="text-destructive">*</span>
                           </FieldLabel>
                           <Input
                              id="shipping_address_line"
                              placeholder="123 Main Street"
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
                     name="shipping_address_line2"
                     render={({ field }) => (
                        <Field>
                           <FieldLabel htmlFor="shipping_address_line2">
                              Address Line 2 (Optional)
                           </FieldLabel>
                           <Input
                              id="shipping_address_line2"
                              placeholder="Apt 4B"
                              {...field}
                           />
                        </Field>
                     )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
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
                                 placeholder="New York"
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
                        name="shipping_state"
                        render={({ field, fieldState }) => (
                           <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="shipping_state">
                                 State <span className="text-destructive">*</span>
                              </FieldLabel>
                              <Input
                                 id="shipping_state"
                                 placeholder="NY"
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
                  <div className="grid gap-4 sm:grid-cols-2">
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
                                 placeholder="10001"
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
                                 placeholder="US"
                                 {...field}
                              />
                           </Field>
                        )}
                     />
                  </div>
               </div>

               {/* Order Notes */}
               <div className="space-y-4">
                  <h3 className="font-medium">Order Notes (Optional)</h3>
                  <Controller
                     control={control}
                     name="customer_notes"
                     render={({ field }) => (
                        <Field>
                           <Textarea
                              id="customer_notes"
                              placeholder="Any special instructions for your order..."
                              rows={3}
                              {...field}
                           />
                        </Field>
                     )}
                  />
               </div>

               {/* Submit */}
               <div className="flex gap-3">
                  <Button
                     type="button"
                     variant="outline"
                     className="flex-1"
                     onClick={handleClose}
                  >
                     Cancel
                  </Button>
                  <Button
                     type="submit"
                     className="flex-1"
                     disabled={createOrderMutation.isPending || items.length === 0}
                  >
                     {createOrderMutation.isPending ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Processing...
                        </>
                     ) : (
                        <>
                           <CreditCard className="mr-2 h-4 w-4" />
                           Place Order (${subtotal.toFixed(2)})
                        </>
                     )}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
}
