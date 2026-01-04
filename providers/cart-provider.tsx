"use client";

/**
 * Cart Provider
 *
 * Manages shopping cart state across the application using React Context.
 * Persists cart items to localStorage for session continuity.
 *
 * Usage:
 * - Wrap app with <CartProvider> in root layout
 * - Access cart via useCart() hook in any client component
 * - Exposes: items, addItem, removeItem, updateQuantity, clearCart, subtotal
 */

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

// Helper to get initial cart from localStorage (runs once on mount)
function getInitialCart(): CartItem[] {
   if (typeof window === "undefined") return [];
   try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
         return JSON.parse(stored);
      }
   } catch {
      console.error("Failed to parse cart from localStorage");
   }
   return [];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
   const [items, setItems] = useState<CartItem[]>(getInitialCart);
   const [isOpen, setIsOpen] = useState(false);

   // Persist cart to localStorage
   useEffect(() => {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
   }, [items]);

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
