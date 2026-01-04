/**
 * ============================================================================
 * Admin Dashboard Page (app/admin/page.tsx)
 * ============================================================================
 *
 * Purpose:
 * Main entry point for the admin dashboard. Displays real-time business
 * metrics, recent orders, top-selling products, and quick navigation links.
 *
 * Architecture:
 * - Server Component page that renders the DashboardContent client component
 * - Data fetching is handled by the client component using TanStack Query
 * - This separation allows for server-side rendering of the page shell
 *   while enabling reactive data updates on the client
 *
 * Data Flow:
 * 1. Page renders → DashboardContent mounts
 * 2. DashboardContent calls useDashboardData hook
 * 3. Hook fetches data via getDashboardData server action
 * 4. Data is cached and displayed with loading states
 *
 * Related Files:
 * - app/admin/_components/dashboard-content.tsx (client component)
 * - hooks/use-dashboard.ts (TanStack Query hook)
 * - lib/services/dashboard.ts (server actions for data fetching)
 *
 * ============================================================================
 */

import { DashboardContent } from "./_components/dashboard-content";

export default function AdminDashboard() {
  return <DashboardContent />;
}
