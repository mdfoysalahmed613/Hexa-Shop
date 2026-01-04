"use server";

/**
 * Purpose:
 * Provides server-side functions to manage customer (user) data
 * from Supabase Auth for the admin dashboard.
 *
 * Usage:
 * - getCustomers: Fetches a list of all customers
 * - getCustomerById: Fetches details of a single customer by ID
 *
 * Features:
 * - Requires admin access for data retrieval
 * - Maps Supabase Auth user data to Customer interface
 *
 * ============================================================================
 */
import { createClient } from "@/lib/supabase/server";
import { adminAuthClient } from "@/lib/supabase/supabase-admin";
import { hasAdminAccess, isAdmin } from "@/lib/auth/roles";

export interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

interface GetCustomersResult {
  ok: boolean;
  data?: Customer[];
  error?: string;
  total?: number;
}

interface GetCustomerResult {
  ok: boolean;
  data?: Customer;
  error?: string;
}

/**
 * Fetch all customers (users) from Supabase Auth
 * Requires admin access
 */
export async function getCustomers(): Promise<GetCustomersResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasAdminAccess(user)) {
    return { ok: false, error: "Admin access required" };
  }

  try {
    // Use admin client to list all users
    const { data, error } = await adminAuthClient.listUsers({
      page: 1,
      perPage: 1000, // Get all users, pagination handled client-side
    });

    if (error) {
      console.error("Error fetching customers:", error);
      return { ok: false, error: error.message };
    }

    const customers: Customer[] = data.users.map((u) => ({
      id: u.id,
      email: u.email || "",
      full_name: u.user_metadata?.full_name || u.user_metadata?.name || null,
      avatar_url: u.user_metadata?.avatar_url || null,
      role: u.app_metadata?.role || "user",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at || null,
      email_confirmed_at: u.email_confirmed_at || null,
    }));

    return { ok: true, data: customers, total: customers.length };
  } catch (err) {
    console.error("Unexpected error fetching customers:", err);
    return { ok: false, error: "Failed to fetch customers" };
  }
}

/**
 * Fetch a single customer by ID
 */
export async function getCustomerById(id: string): Promise<GetCustomerResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasAdminAccess(user)) {
    return { ok: false, error: "Admin access required" };
  }

  try {
    const { data, error } = await adminAuthClient.getUserById(id);

    if (error) {
      console.error("Error fetching customer:", error);
      return { ok: false, error: error.message };
    }

    if (!data.user) {
      return { ok: false, error: "Customer not found" };
    }

    const customer: Customer = {
      id: data.user.id,
      email: data.user.email || "",
      full_name:
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        null,
      avatar_url: data.user.user_metadata?.avatar_url || null,
      role: data.user.app_metadata?.role || "user",
      created_at: data.user.created_at,
      last_sign_in_at: data.user.last_sign_in_at || null,
      email_confirmed_at: data.user.email_confirmed_at || null,
    };

    return { ok: true, data: customer };
  } catch (err) {
    console.error("Unexpected error fetching customer:", err);
    return { ok: false, error: "Failed to fetch customer" };
  }
}

// ============================================================================
// Admin Actions
// ============================================================================

interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Make a user an admin
 * Only full admins can perform this action (not demo_admin)
 */
export async function makeUserAdmin(userId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only full admin can make others admin
  if (!user || user.app_metadata?.role !== "admin") {
    return { ok: false, error: "Only admin users can perform this action" };
  }

  try {
    // First check the target user's current role
    const { data: targetUser, error: fetchError } =
      await adminAuthClient.getUserById(userId);

    if (fetchError || !targetUser.user) {
      return { ok: false, error: "User not found" };
    }

    const currentRole = targetUser.user.app_metadata?.role;
    if (currentRole === "admin") {
      return { ok: false, error: "User is already an admin" };
    }

    // Update the user's role to admin
    const { error } = await adminAuthClient.updateUserById(userId, {
      app_metadata: { role: "admin" },
    });

    if (error) {
      console.error("Error making user admin:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    console.error("Unexpected error making user admin:", err);
    return { ok: false, error: "Failed to make user admin" };
  }
}

/**
 * Delete a user
 * Only full admins can delete users (not demo_admin)
 * Cannot delete admin or demo_admin users
 */
export async function deleteCustomer(userId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only full admin can delete users
  if (!user || !isAdmin(user)) {
    return { ok: false, error: "Only admin users can delete users" };
  }

  // Prevent self-deletion
  if (user.id === userId) {
    return { ok: false, error: "Cannot delete your own account" };
  }

  try {
    // First check the target user's current role
    const { data: targetUser, error: fetchError } =
      await adminAuthClient.getUserById(userId);

    if (fetchError || !targetUser.user) {
      return { ok: false, error: "User not found" };
    }

    const targetRole = targetUser.user.app_metadata?.role;
    if (targetRole === "admin") {
      return { ok: false, error: "Cannot delete admins" };
    }

    // Delete the user
    const { error } = await adminAuthClient.deleteUser(userId);

    if (error) {
      console.error("Error deleting user:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    console.error("Unexpected error deleting user:", err);
    return { ok: false, error: "Failed to delete user" };
  }
}
