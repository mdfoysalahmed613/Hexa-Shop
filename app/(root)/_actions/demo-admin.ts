"use server";

import { adminAuthClient } from "@/lib/supabase/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function becomeDemoAdmin() {
  try {
    // Get the current user from server context
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        ok: false,
        error: userError?.message || "User not authenticated",
      };
    }

    // Use Supabase Admin API to update app_metadata.role
    const { error } = await adminAuthClient.updateUserById(user.id, {
      app_metadata: { role: "demo_admin" },
    });

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    // Revalidate paths to update UI with new role
    revalidatePath("/", "layout");

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return {
      ok: false,
      error: message,
    };
  }
}
