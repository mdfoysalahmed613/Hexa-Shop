"use server";

/**
 * Orders Service
 *
 * Server Actions for order management and checkout.
 * Handles order creation, status updates, and statistics.
 *
 * Functions:
 * - createOrder(input) - Create order from checkout
 * - getOrders() - List all orders (admin)
 * - getOrder(id) - Get single order with items
 * - getMyOrders() - Get current user's orders
 * - updateOrderStatus(id, status) - Update order status (admin)
 * - updatePaymentStatus(id, status) - Update payment status (admin)
 * - deleteOrder(id) - Delete order (admin only)
 * - getOrderStats() - Get aggregated statistics
 *
 * Order Flow: processing → delivered | cancelled
 */

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { hasAdminAccess, isAdmin } from "@/lib/auth/roles";

// ============================================================================
// Types
// ============================================================================

export type OrderStatus = "processing" | "delivered" | "cancelled";

export type PaymentStatus = "paid" | "unpaid";

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;

  // Customer info
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;

  // Shipping address
  shipping_address_line: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;

  // Totals
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;

  // Status
  order_status: OrderStatus;
  payment_status: PaymentStatus;

  // Notes
  customer_notes: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Relations
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string | null;

  product_name: string;
  variant_name: string | null;
  product_image_url: string | null;

  unit_price: number;
  quantity: number;
  total_price: number;

  created_at: string;
}

export interface CheckoutInput {
  customer_email: string;
  customer_name: string;
  customer_phone?: string;

  shipping_address_line: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country?: string;

  customer_notes?: string;

  items: {
    variant_id: string;
    product_name: string;
    variant_name: string | null;
    product_image_url: string | null;
    unit_price: number;
    quantity: number;
  }[];
}

interface ActionResult {
  ok: boolean;
  error?: string;
}

interface CreateOrderResult extends ActionResult {
  order?: Order;
}

interface GetOrdersResult extends ActionResult {
  data?: Order[];
}

interface GetOrderResult extends ActionResult {
  data?: Order;
}

// ============================================================================
// Customer Actions
// ============================================================================

/**
 * Create a new order (checkout)
 */
export async function createOrder(
  input: CheckoutInput
): Promise<CreateOrderResult> {
  try {
    const supabase = await createClient();

    // Get current user (optional - guest checkout allowed)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Calculate totals
    const subtotal = input.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const shipping_cost = 0; // Free shipping for demo
    const discount_amount = 0; // No discounts for demo
    const total = subtotal + shipping_cost - discount_amount;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id || null,
        customer_email: input.customer_email,
        customer_name: input.customer_name,
        customer_phone: input.customer_phone || null,
        shipping_address_line: input.shipping_address_line,
        shipping_city: input.shipping_city,
        shipping_postal_code: input.shipping_postal_code,
        shipping_country: input.shipping_country || "BD",
        subtotal,
        shipping_cost,
        discount_amount,
        total,
        customer_notes: input.customer_notes || null,
        order_status: "processing",
        payment_status: "unpaid",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return { ok: false, error: "Failed to create order" };
    }

    // Create order items
    const orderItems = input.items.map((item) => ({
      order_id: order.id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      variant_name: item.variant_name,
      product_image_url: item.product_image_url,
      unit_price: item.unit_price,
      quantity: item.quantity,
      total_price: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
      // TODO: Consider rolling back the order
      return { ok: false, error: "Failed to create order items" };
    }

    // Update product variant stock
    for (const item of input.items) {
      const { error: stockError } = await supabase.rpc("decrement_stock", {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity,
      });

      if (stockError) {
        console.error("Stock update error:", stockError);
        // Continue anyway - stock update can be handled manually
      }
    }

    // Fetch the complete order with items
    const { data: completeOrder } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*)
      `
      )
      .eq("id", order.id)
      .single();

    revalidatePath("/admin/orders");

    return { ok: true, order: completeOrder as Order };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Create order error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Get orders for the current user
 */
export async function getMyOrders(): Promise<GetOrdersResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch orders error:", error);
      return { ok: false, error: "Failed to fetch orders" };
    }

    return { ok: true, data: data as Order[] };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Get my orders error:", e);
    return { ok: false, error: message };
  }
}

// ============================================================================
// Admin Actions
// ============================================================================

/**
 * Get all orders (admin only)
 */
export async function getOrders(): Promise<GetOrdersResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch orders error:", error);
      return { ok: false, error: "Failed to fetch orders" };
    }

    return { ok: true, data: data as Order[] };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Get orders error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Get a single order by ID (admin only)
 */
export async function getOrder(id: string): Promise<GetOrderResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Fetch order error:", error);
      return { ok: false, error: "Order not found" };
    }

    return { ok: true, data: data as Order };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Get order error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Update order status (admin only)
 */
export async function updateOrderStatus(
  id: string,
  order_status: OrderStatus
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    const { error } = await supabase
      .from("orders")
      .update({ order_status })
      .eq("id", id);

    if (error) {
      console.error("Update order status error:", error);
      return { ok: false, error: "Failed to update order status" };
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Update order status error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Update payment status (admin only)
 */
export async function updatePaymentStatus(
  id: string,
  payment_status: PaymentStatus
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    const { error } = await supabase
      .from("orders")
      .update({ payment_status })
      .eq("id", id);

    if (error) {
      console.error("Update payment status error:", error);
      return { ok: false, error: "Failed to update payment status" };
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Update payment status error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Bulk update order status (admin only)
 */
export async function bulkUpdateOrderStatus(
  ids: string[],
  order_status: OrderStatus
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    const { error } = await supabase
      .from("orders")
      .update({ order_status })
      .in("id", ids);

    if (error) {
      console.error("Bulk update order status error:", error);
      return { ok: false, error: "Failed to update order statuses" };
    }

    revalidatePath("/admin/orders");

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Bulk update order status error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Bulk update payment status (admin only)
 */
export async function bulkUpdatePaymentStatus(
  ids: string[],
  payment_status: PaymentStatus
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    const { error } = await supabase
      .from("orders")
      .update({ payment_status })
      .in("id", ids);

    if (error) {
      console.error("Bulk update payment status error:", error);
      return { ok: false, error: "Failed to update payment statuses" };
    }

    revalidatePath("/admin/orders");

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Bulk update payment status error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Bulk delete orders (admin only - full admin, not demo)
 */
export async function bulkDeleteOrders(ids: string[]): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Only full admin can delete
    if (!isAdmin(user)) {
      return { ok: false, error: "Only admin users can delete orders" };
    }

    const { error } = await supabase.from("orders").delete().in("id", ids);

    if (error) {
      console.error("Bulk delete orders error:", error);
      return { ok: false, error: "Failed to delete orders" };
    }

    revalidatePath("/admin/orders");

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Bulk delete orders error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Delete an order (admin only - full admin, not demo)
 */
export async function deleteOrder(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Only full admin can delete
    if (!isAdmin(user)) {
      return { ok: false, error: "Only admin users can delete orders" };
    }

    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) {
      console.error("Delete order error:", error);
      return { ok: false, error: "Failed to delete order" };
    }

    revalidatePath("/admin/orders");

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Delete order error:", e);
    return { ok: false, error: message };
  }
}

// ============================================================================
// Stats
// ============================================================================

export interface OrderStats {
  total_orders: number;
  processing_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  orders_today: number;
  revenue_today: number;
}

/**
 * Get order statistics (admin only)
 */
export async function getOrderStats(): Promise<{
  ok: boolean;
  error?: string;
  data?: OrderStats;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    // Get all orders for stats
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, order_status, total, created_at");

    if (error) {
      console.error("Fetch stats error:", error);
      return { ok: false, error: "Failed to fetch order stats" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats: OrderStats = {
      total_orders: orders?.length || 0,
      processing_orders:
        orders?.filter((o) => o.order_status === "processing").length || 0,
      delivered_orders:
        orders?.filter((o) => o.order_status === "delivered").length || 0,
      cancelled_orders:
        orders?.filter((o) => o.order_status === "cancelled").length || 0,
      total_revenue:
        orders
          ?.filter((o) => o.order_status !== "cancelled")
          .reduce((sum, o) => sum + (o.total || 0), 0) || 0,
      orders_today:
        orders?.filter((o) => new Date(o.created_at) >= today).length || 0,
      revenue_today:
        orders
          ?.filter(
            (o) =>
              new Date(o.created_at) >= today && o.order_status !== "cancelled"
          )
          .reduce((sum, o) => sum + (o.total || 0), 0) || 0,
    };

    return { ok: true, data: stats };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Get order stats error:", e);
    return { ok: false, error: message };
  }
}
