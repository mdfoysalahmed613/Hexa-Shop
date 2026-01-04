/**
 * Supabase Admin Client
 *
 * Service role client for admin-only operations.
 * Bypasses Row Level Security - use with caution.
 *
 * Use Cases:
 * - Updating user app_metadata (role changes)
 * - Listing all auth users
 * - Admin user management
 *
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to client.
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Access auth admin api
export const adminAuthClient = supabase.auth.admin;
