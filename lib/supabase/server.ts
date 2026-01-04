/**
 * Supabase Server Client
 *
 * Creates a Supabase client for Server Components and Route Handlers.
 * IMPORTANT: Always await createClient() inside each function - never cache at module scope.
 *
 * This pattern is required for:
 * - Proper cookie handling in SSR
 * - Fluid compute compatibility (Vercel)
 * - Correct session management per request
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
