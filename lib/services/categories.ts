"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { hasAdminAccess, isAdmin } from "@/lib/auth/roles";

// ============================================================================
// Types
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  image_url: string | null;
  parent_id: string | null;
  created_at: string;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  product_count?: number;
}

interface ActionResult {
  ok: boolean;
  error?: string;
}

interface GetCategoriesResult extends ActionResult {
  data?: Category[];
}

interface GetCategoryResult extends ActionResult {
  data?: Category;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract storage path from Supabase public URL
 * URL format: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file.ext
 */
function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split("/storage/v1/object/public/");
    if (pathParts.length === 2) {
      // Remove bucket name from path
      const fullPath = pathParts[1];
      const bucketAndPath = fullPath.split("/");
      // Remove the first element (bucket name) and join the rest
      return bucketAndPath.slice(1).join("/");
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// Read Operations
// ============================================================================

export async function getCategories(): Promise<GetCategoriesResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select(
        `
        *,
        parent:categories!parent_id(id, name, slug)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching categories:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true, data: data as Category[] };
  } catch (error) {
    console.error("Unexpected error fetching categories:", error);
    return { ok: false, error: "Failed to fetch categories" };
  }
}

export async function getCategory(id: string): Promise<GetCategoryResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select(
        `
        *,
        parent:categories!parent_id(id, name, slug)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching category:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true, data: data as Category };
  } catch (error) {
    console.error("Unexpected error fetching category:", error);
    return { ok: false, error: "Failed to fetch category" };
  }
}

export async function getActiveCategories(): Promise<GetCategoriesResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching active categories:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true, data: data as Category[] };
  } catch (error) {
    console.error("Unexpected error fetching active categories:", error);
    return { ok: false, error: "Failed to fetch active categories" };
  }
}

// ============================================================================
// Write Operations
// ============================================================================

export async function addCategory(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Check admin access
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    // Extract form data
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const is_active = formData.get("is_active") === "true";
    const parent_id = formData.get("parent_id") as string | null;
    const imageFile = formData.get("image") as File | null;

    let image_url: string | null = null;

    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${name}/${name}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("category-images")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return { ok: false, error: "Failed to upload image" };
      }

      // Get public URL and store it
      const { data: urlData } = supabase.storage
        .from("category-images")
        .getPublicUrl(fileName);
      image_url = urlData.publicUrl;
    }

    // Insert category (slug is auto-generated by Supabase)
    const { error } = await supabase.from("categories").insert({
      name: name.trim(),
      description: description?.trim() || null,
      is_active,
      parent_id: parent_id || null,
      image_url,
    });

    if (error) {
      console.error("Error adding category:", error);
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin/products/categories");
    return { ok: true };
  } catch (error) {
    console.error("Unexpected error adding category:", error);
    return { ok: false, error: "Failed to add category" };
  }
}

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Check admin access
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    // Extract form data
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const is_active = formData.get("is_active") === "true";
    const parent_id = formData.get("parent_id") as string | null;
    const imageFile = formData.get("image") as File | null;
    const existingImageUrl = formData.get("image_url") as string | null;

    // Prevent category from being its own parent
    if (parent_id === id) {
      return { ok: false, error: "Category cannot be its own parent" };
    }

    let image_url: string | null = existingImageUrl;

    // Upload new image if provided
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${name}/${name}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("category-images")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return { ok: false, error: "Failed to upload image" };
      }

      // Delete old image from storage if exists
      if (existingImageUrl) {
        const oldStoragePath = extractStoragePath(existingImageUrl);
        if (oldStoragePath) {
          const { error: deleteError } = await supabase.storage
            .from("category-images")
            .remove([oldStoragePath]);

          if (deleteError) {
            console.error("Error deleting old image:", deleteError);
          }
        }
      }

      // Get public URL and store it
      const { data: urlData } = supabase.storage
        .from("category-images")
        .getPublicUrl(fileName);
      image_url = urlData.publicUrl;
    }

    // Update category
    const { error } = await supabase
      .from("categories")
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        is_active,
        parent_id: parent_id || null,
        image_url,
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating category:", error);
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin/products/categories");
    return { ok: true };
  } catch (error) {
    console.error("Unexpected error updating category:", error);
    return { ok: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Only full admin can delete
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!isAdmin(user)) {
      return { ok: false, error: "Only admin users can delete records" };
    }

    // Check if category has children
    const { data: children } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", id)
      .limit(1);

    if (children && children.length > 0) {
      return {
        ok: false,
        error:
          "Cannot delete category with subcategories. Delete or reassign subcategories first.",
      };
    }
    const { data: category } = await supabase
      .from("categories")
      .select("image_url")
      .eq("id", id)
      .single();

    // Delete category image from storage if exists
    if (category?.image_url) {
      const storagePath = extractStoragePath(category.image_url);
      if (storagePath) {
        const { error: deleteError } = await supabase.storage
          .from("category-images")
          .remove([storagePath]);

        if (deleteError) {
          console.error("Error deleting category image:", deleteError);
        }
      }
    }
    // Delete category (CASCADE will handle products)
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin/products/categories");
    return { ok: true };
  } catch (error) {
    console.error("Unexpected error deleting category:", error);
    return { ok: false, error: "Failed to delete category" };
  }
}

export async function toggleCategoryStatus(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Check admin access
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    // Get current status
    const { data: category, error: fetchError } = await supabase
      .from("categories")
      .select("is_active")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { ok: false, error: "Category not found" };
    }

    // Toggle status
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("id", id);

    if (error) {
      console.error("Error toggling category status:", error);
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin/products/categories");
    return { ok: true };
  } catch (error) {
    console.error("Unexpected error toggling category status:", error);
    return { ok: false, error: "Failed to toggle category status" };
  }
}
