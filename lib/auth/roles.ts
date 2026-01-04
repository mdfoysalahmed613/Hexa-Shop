/**
 * Role Utilities
 *
 * Helper functions to check user authorization levels.
 * Roles are stored in Supabase app_metadata.role field.
 *
 * Role Hierarchy:
 * - admin: Full access (CRUD all resources)
 * - demo_admin: Limited write access (no deletes)
 * - user: Customer access (own data only)
 */

import { User } from "@supabase/supabase-js";

/**
 * Check if user has admin role
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.app_metadata?.role === "admin";
}

export function isDemoAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.app_metadata?.role === "demo_admin";
}

/**
 * Includes both real admins and demo admins.
 */
export function hasAdminAccess(user: User | null): boolean {
  return isAdmin(user) || isDemoAdmin(user);
}
