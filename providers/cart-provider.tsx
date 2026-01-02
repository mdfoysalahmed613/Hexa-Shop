"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Product, ProductVariant } from "@/lib/services/products";

// ============================================================================
// Types
// ============================================================================

export interface CartItem {
   id: string; // unique cart item id (product_id + variant_id)
   productId: string;
   variantId: string;
   name: string;
   price: number;
   comparePrice: number | null;
   quantity: number;
   stock: number;
   image: string | null;
   variantName: string | null;
}

interface CartContextType {
   items: CartItem[];
   isOpen: boolean;
   itemCount: number;
   subtotal: number;
   openCart: () => void;
   closeCart: () => void;
   toggleCart: () => void;
   addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
   removeItem: (itemId: string) => void;
   updateQuantity: (itemId: string, quantity: number) => void;
   clearCart: () => void;
   getItemQuantity: (productId: string, variantId: string) => number;
}

// ============================================================================
// Context
// ============================================================================

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "hexa-shop-cart";

// ============================================================================
// Provider
// ============================================================================

export function CartProvider({ children }: { children: React.ReactNode }) {
   const [items, setItems] = useState<CartItem[]>([]);
   const [isOpen, setIsOpen] = useState(false);
   const [isHydrated, setIsHydrated] = useState(false);

   // Hydrate cart from localStorage
   useEffect(() => {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
         try {
            const parsed = JSON.parse(stored);
            setItems(parsed);
         } catch {
            console.error("Failed to parse cart from localStorage");
         }
      }
      setIsHydrated(true);
   }, []);

   // Persist cart to localStorage
   useEffect(() => {
      if (isHydrated) {
         localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      }
   }, [items, isHydrated]);

   const openCart = useCallback(() => setIsOpen(true), []);
   const closeCart = useCallback(() => setIsOpen(false), []);
   const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

   const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
   const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

   const addItem = useCallback(
      (product: Product, variant: ProductVariant, quantity: number = 1) => {
         const itemId = `${product.id}-${variant.id}`;

         setItems((prev) => {
            const existing = prev.find((item) => item.id === itemId);

            if (existing) {
               // Update quantity if item exists
               const newQuantity = Math.min(existing.quantity + quantity, variant.stock);
               return prev.map((item) =>
                  item.id === itemId ? { ...item, quantity: newQuantity } : item
               );
            }

            // Add new item
            const newItem: CartItem = {
               id: itemId,
               productId: product.id,
               variantId: variant.id,
               name: product.name,
               price: variant.price,
               comparePrice: variant.compare_price,
               quantity: Math.min(quantity, variant.stock),
               stock: variant.stock,
               image: product.primary_image?.url || null,
               variantName: variant.variant_name || null,
            };

            return [...prev, newItem];
         });

         setIsOpen(true); // Open cart when item is added
      },
      []
   );

   const removeItem = useCallback((itemId: string) => {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
   }, []);

   const updateQuantity = useCallback((itemId: string, quantity: number) => {
      if (quantity <= 0) {
         setItems((prev) => prev.filter((item) => item.id !== itemId));
         return;
      }

      setItems((prev) =>
         prev.map((item) =>
            item.id === itemId
               ? { ...item, quantity: Math.min(quantity, item.stock) }
               : item
         )
      );
   }, []);

   const clearCart = useCallback(() => {
      setItems([]);
   }, []);

   const getItemQuantity = useCallback(
      (productId: string, variantId: string) => {
         const itemId = `${productId}-${variantId}`;
         const item = items.find((i) => i.id === itemId);
         return item?.quantity || 0;
      },
      [items]
   );

   return (
      <CartContext.Provider
         value={{
            items,
            isOpen,
            itemCount,
            subtotal,
            openCart,
            closeCart,
            toggleCart,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            getItemQuantity,
         }}
      >
         {children}
      </CartContext.Provider>
   );
}

// ============================================================================
// Hook
// ============================================================================

export function useCart() {
   const context = useContext(CartContext);
   if (!context) {
      throw new Error("useCart must be used within a CartProvider");
   }
   return context;
}
