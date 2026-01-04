/**
 * Orders Hooks
 *
 * TanStack Query hooks for order data fetching and mutations.
 * Provides admin order management and customer order history.
 *
 * Hooks:
 * - useOrders() - Fetch all orders (admin)
 * - useOrder(id) - Fetch single order by ID
 * - useMyOrders() - Fetch current user's orders
 * - useOrderStats() - Fetch order statistics (admin)
 * - useCreateOrder() - Create order (checkout)
 * - useUpdateOrderStatus() - Update order status (admin)
 * - useUpdatePaymentStatus() - Update payment status (admin)
 * - useDeleteOrder() - Delete order (admin only)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  getOrder,
  getMyOrders,
  getOrderStats,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  type Order,
  type OrderStatus,
  type PaymentStatus,
  type OrderStats,
  type CheckoutInput,
} from "@/lib/services/orders";
import { toast } from "sonner";

export const ORDERS_QUERY_KEY = ["orders"] as const;
export const ORDER_STATS_QUERY_KEY = ["order-stats"] as const;

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch all orders (admin)
 */
export function useOrders() {
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: async () => {
      const result = await getOrders();
      if (!result.ok) {
        throw new Error(result.error || "Failed to fetch orders");
      }
      return result.data as Order[];
    },
  });
}

/**
 * Hook to fetch a single order (admin)
 */
export function useOrder(id: string | null) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const result = await getOrder(id);
      if (!result.ok) {
        throw new Error(result.error || "Failed to fetch order");
      }
      return result.data as Order;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch current user's orders
 */
export function useMyOrders() {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, "my"],
    queryFn: async () => {
      const result = await getMyOrders();
      if (!result.ok) {
        throw new Error(result.error || "Failed to fetch orders");
      }
      return result.data as Order[];
    },
  });
}

/**
 * Hook to fetch order statistics (admin)
 */
export function useOrderStats() {
  return useQuery({
    queryKey: ORDER_STATS_QUERY_KEY,
    queryFn: async () => {
      const result = await getOrderStats();
      if (!result.ok) {
        throw new Error(result.error || "Failed to fetch order stats");
      }
      return result.data as OrderStats;
    },
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to create a new order (checkout)
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CheckoutInput) => {
      const result = await createOrder(input);
      if (!result.ok) {
        throw new Error(result.error || "Failed to create order");
      }
      return result.order as Order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDER_STATS_QUERY_KEY });
      toast.success(`Order ${order.order_number} created successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook to update order status (admin)
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      order_status,
    }: {
      id: string;
      order_status: OrderStatus;
    }) => {
      const result = await updateOrderStatus(id, order_status);
      if (!result.ok) {
        throw new Error(result.error || "Failed to update order status");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDER_STATS_QUERY_KEY });
      toast.success("Order status updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook to update payment status (admin)
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payment_status,
    }: {
      id: string;
      payment_status: PaymentStatus;
    }) => {
      const result = await updatePaymentStatus(id, payment_status);
      if (!result.ok) {
        throw new Error(result.error || "Failed to update payment status");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      toast.success("Payment status updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Hook to delete an order (admin only)
 */
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteOrder(id);
      if (!result.ok) {
        throw new Error(result.error || "Failed to delete order");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDER_STATS_QUERY_KEY });
      toast.success("Order deleted!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Re-export types for convenience
export type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  OrderStats,
  CheckoutInput,
} from "@/lib/services/orders";
