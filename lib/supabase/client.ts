/**
 * Supabase Browser Client
 *
 * Creates a Supabase client for Client Components.
 * Uses browser-based auth with automatic session management.
 * Safe to call multiple times - internally cached by @supabase/ssr.
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
