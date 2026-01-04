"use client";

/**
 * Cart Sheet
 *
 * Slide-out panel displaying shopping cart contents.
 * Shows cart items with quantity controls, pricing, and checkout link.
 *
 * Features:
 * - Empty cart state with "Continue Shopping" CTA
 * - Per-item quantity increment/decrement (respects stock limits)
 * - Item removal with confirmation
 * - Subtotal calculation
 * - Links to full checkout page
 */

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
   Sheet,
   SheetContent,
   SheetHeader,
   SheetTitle,
   SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/providers/cart-provider";

export function CartSheet() {
   const {
      items,
      isOpen,
      closeCart,
      itemCount,
      subtotal,
      updateQuantity,
      removeItem,
      clearCart,
   } = useCart();

   return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
         <SheetContent className="flex flex-col w-full sm:max-w-lg">
            <SheetHeader className="space-y-2.5 pr-6">
               <SheetTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Shopping Cart ({itemCount})
               </SheetTitle>
            </SheetHeader>

            {items.length === 0 ? (
               <div className="flex flex-1 flex-col items-center justify-center gap-4">
                  <div className="rounded-full bg-muted p-6">
                     <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                     <h3 className="font-semibold">Your cart is empty</h3>
                     <p className="text-sm text-muted-foreground">
                        Add items to your cart to see them here.
                     </p>
                  </div>
                  <Button onClick={closeCart} asChild>
                     <Link href="/products">Continue Shopping</Link>
                  </Button>
               </div>
            ) : (
               <>
                  {/* Cart Items */}
                  <div className="flex-1 overflow-y-auto py-4">
                     <div className="space-y-4">
                        {items.map((item) => (
                           <div key={item.id} className="flex gap-4">
                              {/* Product Image */}
                              <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted flex-shrink-0">
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
                              </div>

                              {/* Product Details */}
                              <div className="flex flex-1 flex-col gap-1">
                                 <div className="flex items-start justify-between">
                                    <div>
                                       <h4 className="font-medium leading-tight line-clamp-1">
                                          {item.name}
                                       </h4>
                                       {item.variantName && (
                                          <p className="text-xs text-muted-foreground">
                                             {item.variantName}
                                          </p>
                                       )}
                                    </div>
                                    <Button
                                       variant="ghost"
                                       size="icon"
                                       className="h-8 w-8 -mr-2"
                                       onClick={() => removeItem(item.id)}
                                    >
                                       <X className="h-4 w-4" />
                                    </Button>
                                 </div>

                                 <div className="flex items-center justify-between mt-auto">
                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-1">
                                       <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() =>
                                             updateQuantity(item.id, item.quantity - 1)
                                          }
                                       >
                                          <Minus className="h-3 w-3" />
                                       </Button>
                                       <span className="w-8 text-center text-sm font-medium">
                                          {item.quantity}
                                       </span>
                                       <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-8 w-8"
                                          disabled={item.quantity >= item.stock}
                                          onClick={() =>
                                             updateQuantity(item.id, item.quantity + 1)
                                          }
                                       >
                                          <Plus className="h-3 w-3" />
                                       </Button>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right">
                                       <p className="font-medium">
                                          ${(item.price * item.quantity).toFixed(2)}
                                       </p>
                                       {item.quantity > 1 && (
                                          <p className="text-xs text-muted-foreground">
                                             ${item.price.toFixed(2)} each
                                          </p>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <Separator />

                  {/* Footer with Totals */}
                  <SheetFooter className="flex-col gap-4 sm:flex-col">
                     <div className="space-y-2 w-full">
                        <div className="flex items-center justify-between text-sm">
                           <span className="text-muted-foreground">Subtotal</span>
                           <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                           <span className="text-muted-foreground">Shipping</span>
                           <span className="text-green-600">Free</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between font-medium">
                           <span>Total</span>
                           <span>${subtotal.toFixed(2)}</span>
                        </div>
                     </div>

                     <div className="flex flex-col gap-2 w-full">
                        <Button size="lg" className="w-full" asChild onClick={closeCart}>
                           <Link href="/checkout">Proceed to Checkout</Link>
                        </Button>
                        <Button
                           variant="outline"
                           size="lg"
                           className="w-full"
                           onClick={closeCart}
                           asChild
                        >
                           <Link href="/products">Continue Shopping</Link>
                        </Button>
                     </div>

                     <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={clearCart}
                     >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear Cart
                     </Button>
                  </SheetFooter>
               </>
            )}
         </SheetContent>
      </Sheet>
   );
}
