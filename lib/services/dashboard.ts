"use server";

/**
 * ============================================================================
 * Dashboard Service
 * ============================================================================
 *
 * Purpose:
 * This service provides aggregated statistics and data for the admin dashboard.
 * It fetches real-time data from Supabase to display key business metrics.
 *
 * Usage:
 * - Import `getDashboardStats` in server components or via hooks
 * - Data includes: revenue, orders, products, customers, recent orders, top products
 *
 * Security:
 * - All functions require admin access (checked via hasAdminAccess)
 * - Uses server-side Supabase client for secure data fetching
 *
 * ============================================================================
 */

import { createClient } from "@/lib/supabase/server";
import { adminAuthClient } from "@/lib/supabase/supabase-admin";
import { hasAdminAccess } from "@/lib/auth/roles";

// ============================================================================
// Types
// ============================================================================

/**
 * Dashboard statistics summary
 * Displayed in the stats cards at the top of the dashboard
 */
export interface DashboardStats {
  /** Total revenue from non-cancelled orders */
  totalRevenue: number;
  /** Revenue change percentage compared to last month */
  revenueChange: number;

  /** Total number of orders */
  totalOrders: number;
  /** Orders change percentage compared to last month */
  ordersChange: number;

  /** Total number of products in catalog */
  totalProducts: number;
  /** Number of products currently in stock */
  productsInStock: number;

  /** Total number of registered customers */
  totalCustomers: number;
  /** Customers change percentage compared to last month */
  customersChange: number;
}

/**
 * Recent order item for dashboard display
 * Shows condensed order info in the recent orders list
 */
export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  status: "processing" | "delivered" | "cancelled";
  createdAt: string;
}

/**
 * Top selling product for dashboard display
 * Shows products ranked by total sales quantity
 */
export interface TopProduct {
  id: string;
  name: string;
  totalSales: number;
  totalRevenue: number;
  currentStock: number;
}

/**
 * Complete dashboard data structure
 * Returned by getDashboardData for dashboard page rendering
 */
export interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

interface DashboardResult {
  ok: boolean;
  error?: string;
  data?: DashboardData;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate percentage change between two values
 * Returns 0 if previous value is 0 to avoid division by zero
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

/**
 * Get date range for current month (from 1st to now)
 */
function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start, end: now };
}

/**
 * Get date range for previous month (full month)
 */
function getPreviousMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  return { start, end };
}

// ============================================================================
// Main Dashboard Data Function
// ============================================================================

/**
 * Fetch all dashboard data in a single call
 *
 * This function aggregates multiple data sources to build the complete
 * dashboard view. It's optimized to make parallel database queries
 * where possible to minimize latency.
 *
 * @returns Dashboard data including stats, recent orders, and top products
 */
export async function getDashboardData(): Promise<DashboardResult> {
  try {
    const supabase = await createClient();

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    const currentMonth = getCurrentMonthRange();
    const previousMonth = getPreviousMonthRange();

    // ========================================================================
    // Parallel Data Fetching
    // ========================================================================
    // Fetch all required data in parallel for optimal performance

    const [
      ordersResult,
      productsResult,
      customersResult,
      previousMonthOrdersResult,
    ] = await Promise.all([
      // All orders with items
      supabase
        .from("orders")
        .select(
          `
          id,
          order_number,
          customer_name,
          total,
          order_status,
          created_at,
          items:order_items(product_name, quantity, unit_price)
        `
        )
        .order("created_at", { ascending: false }),

      // All products with variants
      supabase.from("products").select(`
          id,
          name,
          variants:products_variants(stock, is_active)
        `),

      // Customer count from admin auth
      adminAuthClient.listUsers({ page: 1, perPage: 1000 }),

      // Previous month orders for comparison
      supabase
        .from("orders")
        .select("id, total, order_status, created_at")
        .gte("created_at", previousMonth.start.toISOString())
        .lte("created_at", previousMonth.end.toISOString()),
    ]);

    // Handle errors
    if (ordersResult.error) {
      console.error("Orders fetch error:", ordersResult.error);
      return { ok: false, error: "Failed to fetch orders" };
    }

    if (productsResult.error) {
      console.error("Products fetch error:", productsResult.error);
      return { ok: false, error: "Failed to fetch products" };
    }

    const orders = ordersResult.data || [];
    const products = productsResult.data || [];
    const customers = customersResult.data?.users || [];
    const previousOrders = previousMonthOrdersResult.data || [];

    // ========================================================================
    // Calculate Statistics
    // ========================================================================

    // Current month orders
    const currentMonthOrders = orders.filter(
      (o) =>
        new Date(o.created_at) >= currentMonth.start &&
        new Date(o.created_at) <= currentMonth.end
    );

    // Revenue calculations (exclude cancelled orders)
    const currentRevenue = currentMonthOrders
      .filter((o) => o.order_status !== "cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const previousRevenue = previousOrders
      .filter((o) => o.order_status !== "cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Order counts
    const currentOrderCount = currentMonthOrders.length;
    const previousOrderCount = previousOrders.length;

    // Product stats
    const totalProducts = products.length;
    const productsInStock = products.filter((p) => {
      const variants = p.variants || [];
      return variants.some(
        (v: { stock: number; is_active: boolean }) => v.stock > 0 && v.is_active
      );
    }).length;

    // Customer stats (compare with customers created in previous month)
    const totalCustomers = customers.length;
    const currentMonthCustomers = customers.filter(
      (c) =>
        new Date(c.created_at) >= currentMonth.start &&
        new Date(c.created_at) <= currentMonth.end
    ).length;
    const previousMonthCustomers = customers.filter(
      (c) =>
        new Date(c.created_at) >= previousMonth.start &&
        new Date(c.created_at) <= previousMonth.end
    ).length;

    // ========================================================================
    // Build Stats Object
    // ========================================================================

    const stats: DashboardStats = {
      totalRevenue: currentRevenue,
      revenueChange: calculatePercentageChange(currentRevenue, previousRevenue),

      totalOrders: orders.length,
      ordersChange: calculatePercentageChange(
        currentOrderCount,
        previousOrderCount
      ),

      totalProducts,
      productsInStock,

      totalCustomers,
      customersChange: calculatePercentageChange(
        currentMonthCustomers,
        previousMonthCustomers
      ),
    };

    // ========================================================================
    // Recent Orders (Last 5)
    // ========================================================================

    const recentOrders: RecentOrder[] = orders.slice(0, 5).map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      amount: order.total || 0,
      status: order.order_status as "processing" | "delivered" | "cancelled",
      createdAt: order.created_at,
    }));

    // ========================================================================
    // Top Products (By Sales Volume)
    // ========================================================================

    // Aggregate sales from order items
    const productSales = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    for (const order of orders) {
      if (order.order_status === "cancelled") continue;
      const items = order.items || [];
      for (const item of items) {
        // We need to match by product name since we don't have product_id in order_items
        const existing = productSales.get(item.product_name) || {
          name: item.product_name,
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quantity || 0;
        existing.revenue += (item.unit_price || 0) * (item.quantity || 0);
        productSales.set(item.product_name, existing);
      }
    }

    // Convert to array and sort by quantity
    const sortedProducts = Array.from(productSales.entries())
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 4);

    // Match with current product data for stock info
    const topProducts: TopProduct[] = sortedProducts.map(
      ([productName, sales]) => {
        const product = products.find((p) => p.name === productName);
        const currentStock = product
          ? (product.variants || []).reduce(
              (sum: number, v: { stock: number; is_active: boolean }) =>
                v.is_active ? sum + v.stock : sum,
              0
            )
          : 0;

        return {
          id: product?.id || productName,
          name: productName,
          totalSales: sales.quantity,
          totalRevenue: sales.revenue,
          currentStock,
        };
      }
    );

    // ========================================================================
    // Return Complete Dashboard Data
    // ========================================================================

    return {
      ok: true,
      data: {
        stats,
        recentOrders,
        topProducts,
      },
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Dashboard data fetch error:", e);
    return { ok: false, error: message };
  }
}
