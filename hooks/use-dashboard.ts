/**
 * ============================================================================
 * Dashboard Hook (use-dashboard.ts)
 * ============================================================================
 *
 * Purpose:
 * Provides React Query hooks for fetching and caching admin dashboard data.
 * Uses TanStack Query for automatic caching, refetching, and loading states.
 *
 * Usage:
 * ```tsx
 * const { data, isLoading, error } = useDashboardData();
 * ```
 *
 * Features:
 * - Automatic caching with 5-minute stale time
 * - Loading and error states included
 * - Automatic refetch on window focus
 *
 * ============================================================================
 */

import { useQuery } from "@tanstack/react-query";
import { getDashboardData, type DashboardData } from "@/lib/services/dashboard";

// ============================================================================
// Query Keys
// ============================================================================

/**
 * Query key for dashboard data
 * Used for cache invalidation and identification
 */
export const DASHBOARD_QUERY_KEY = ["dashboard"] as const;

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch complete dashboard data
 *
 * Fetches aggregated statistics, recent orders, and top products
 * for the admin dashboard overview page.
 *
 * @returns Query result with dashboard data, loading state, and error
 *
 * @example
 * ```tsx
 * function DashboardPage() {
 *   const { data, isLoading, error } = useDashboardData();
 *
 *   if (isLoading) return <DashboardSkeleton />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return <Dashboard stats={data.stats} />;
 * }
 * ```
 */
export function useDashboardData() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: async () => {
      const result = await getDashboardData();
      if (!result.ok) {
        throw new Error(result.error || "Failed to fetch dashboard data");
      }
      return result.data as DashboardData;
    },
    // Dashboard data is relatively fresh, refetch every 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep data in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
  });
}
