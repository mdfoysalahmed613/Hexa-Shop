"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth/roles";

interface AddCategoryResult {
  ok: boolean;
  error?: string;
  categoryId?: string;
}

/**
 * Converts a string to a URL-friendly slug
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a number if the slug already exists
 */
async function generateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  baseName: string
): Promise<string> {
  const baseSlug = generateSlug(baseName);

  // Check if base slug exists
  const { data: existing } = await supabase
    .from("categories")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  if (!existing || existing.length === 0) {
    return baseSlug;
  }

  // Find existing slugs that match the pattern
  const existingSlugs = new Set(existing.map((c) => c.slug));

  // If exact match doesn't exist, use base slug
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  // Find the next available number
  let counter = 1;
  let newSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.has(newSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
}

export async function addCategory(
  formData: FormData
): Promise<AddCategoryResult> {
  try {
    const supabase = await createClient();

    // Check admin role (demo_admin cannot modify)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!isAdmin(user)) {
      return { ok: false, error: "Only admin users can create categories" };
    }

    // Extract form data
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as File | null;
    const isActiveStr = formData.get("is_active") as string;
    const is_active = isActiveStr === "true";

    // Validate required fields
    if (!name || name.trim() === "") {
      return { ok: false, error: "Category name is required" };
    }

    // Generate unique slug from name
    const slug = await generateUniqueSlug(supabase, name);

    let imageUrl: string | null = null;

    // Upload image to Supabase Storage if provided
    if (image && image.size > 0) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${slug}-${Date.now()}.${fileExt}`;
      const filePath = `${slug}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("category-images")
        .upload(filePath, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return { ok: false, error: `Failed to upload image: ${image.name}` };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("category-images")
        .getPublicUrl(filePath);

      imageUrl = urlData.publicUrl;
    }

    // Insert category into database
    const categoryData = {
      name,
      slug,
      description: description || null,
      image: imageUrl,
      is_active,
    };

    const { data: category, error: insertError } = await supabase
      .from("categories")
      .insert([categoryData])
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return { ok: false, error: "Failed to create category" };
    }

    // Revalidate the categories page cache
    revalidatePath("/admin/products/categories");

    return { ok: true, categoryId: category.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Add category error:", e);
    return {
      ok: false,
      error: message,
    };
  }
}

interface UpdateCategoryResult {
  ok: boolean;
  error?: string;
}

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<UpdateCategoryResult> {
  try {
    const supabase = await createClient();

    // Check admin role (demo_admin cannot modify)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!isAdmin(user)) {
      return { ok: false, error: "Only admin users can update categories" };
    }

    // Extract form data
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as File | null;
    const imageUrl = formData.get("image_url") as string | null;
    const isActiveStr = formData.get("is_active") as string;
    const is_active = isActiveStr === "true";

    // Validate required fields
    if (!name || name.trim() === "") {
      return { ok: false, error: "Category name is required" };
    }

    // Generate slug from name
    const slug = generateSlug(name);

    // Check if slug already exists for a different category
    const { data: existingSlug } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .single();

    if (existingSlug) {
      return { ok: false, error: "A category with this name already exists" };
    }

    let finalImageUrl: string | null = imageUrl;

    // Upload new image if provided
    if (image && image.size > 0) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${slug}-${Date.now()}.${fileExt}`;
      const filePath = `${slug}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("category-images")
        .upload(filePath, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return { ok: false, error: `Failed to upload image: ${image.name}` };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("category-images")
        .getPublicUrl(filePath);

      finalImageUrl = urlData.publicUrl;
    }

    // Update category
    const categoryData = {
      name,
      slug,
      description: description || null,
      image: finalImageUrl,
      is_active,
    };

    const { error: updateError } = await supabase
      .from("categories")
      .update(categoryData)
      .eq("id", id);

    if (updateError) {
      console.error("Update error:", updateError);
      return { ok: false, error: "Failed to update category" };
    }

    revalidatePath("/admin/products/categories");

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Update category error:", e);
    return { ok: false, error: message };
  }
}

interface DeleteCategoryResult {
  ok: boolean;
  error?: string;
}

export async function deleteCategory(
  id: string
): Promise<DeleteCategoryResult> {
  try {
    const supabase = await createClient();

    // Check admin role (demo_admin cannot modify)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!isAdmin(user)) {
      return { ok: false, error: "Only admin users can delete categories" };
    }

    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return { ok: false, error: "Failed to delete category" };
    }

    revalidatePath("/admin/products/categories");

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Delete category error:", e);
    return { ok: false, error: message };
  }
}

interface BulkActionResult {
  ok: boolean;
  error?: string;
  count?: number;
}

export async function publishAllDraftCategories(): Promise<BulkActionResult> {
  try {
    const supabase = await createClient();

    // Check admin role (demo_admin cannot modify)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!isAdmin(user)) {
      return { ok: false, error: "Only admin users can publish categories" };
    }

    const { data, error } = await supabase
      .from("categories")
      .update({ is_active: true })
      .eq("is_active", false)
      .select("id");

    if (error) {
      console.error("Publish error:", error);
      return { ok: false, error: "Failed to publish categories" };
    }

    revalidatePath("/admin/products/categories");

    return { ok: true, count: data?.length || 0 };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Publish categories error:", e);
    return { ok: false, error: message };
  }
}

export async function hideEmptyCategories(): Promise<BulkActionResult> {
  try {
    const supabase = await createClient();

    // Check admin role (demo_admin cannot modify)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!isAdmin(user)) {
      return { ok: false, error: "Only admin users can hide categories" };
    }

    // Get categories with 0 products using a subquery
    const { data: allCategories, error: fetchError } = await supabase
      .from("categories")
      .select("id, products(id)");

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return { ok: false, error: "Failed to fetch categories" };
    }

    const emptyCategories =
      allCategories?.filter((c) => !c.products || c.products.length === 0) ||
      [];

    if (emptyCategories.length === 0) {
      return { ok: true, count: 0 };
    }

    const ids = emptyCategories.map((c) => c.id);

    const { error: updateError } = await supabase
      .from("categories")
      .update({ is_active: false })
      .in("id", ids);

    if (updateError) {
      console.error("Update error:", updateError);
      return { ok: false, error: "Failed to hide empty categories" };
    }

    revalidatePath("/admin/products/categories");

    return { ok: true, count: emptyCategories.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Hide empty categories error:", e);
    return { ok: false, error: message };
  }
}

export async function deleteEmptyCategories(): Promise<BulkActionResult> {
  try {
    const supabase = await createClient();

    // Check admin role (demo_admin cannot modify)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!isAdmin(user)) {
      return { ok: false, error: "Only admin users can delete categories" };
    }

    // Get categories with 0 products using a subquery
    const { data: allCategories, error: fetchError } = await supabase
      .from("categories")
      .select("id, products(id)");

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return { ok: false, error: "Failed to fetch categories" };
    }

    const emptyCategories =
      allCategories?.filter((c) => !c.products || c.products.length === 0) ||
      [];

    if (emptyCategories.length === 0) {
      return { ok: true, count: 0 };
    }

    const ids = emptyCategories.map((c) => c.id);

    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .in("id", ids);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return { ok: false, error: "Failed to delete empty categories" };
    }

    revalidatePath("/admin/products/categories");

    return { ok: true, count: emptyCategories.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Delete empty categories error:", e);
    return { ok: false, error: message };
  }
}

export async function getCategories() {
  try {
    const supabase = await createClient();

    // Fetch categories with product count via JOIN
    const { data, error } = await supabase
      .from("categories")
      .select("*, products(id)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      return { ok: false, error: "Failed to fetch categories", data: [] };
    }

    // Transform data to include product_count
    const categoriesWithCount = (data || []).map((category) => ({
      ...category,
      product_count: category.products?.length || 0,
      products: undefined, // Remove products array from response
    }));

    return { ok: true, data: categoriesWithCount };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Get categories error:", e);
    return { ok: false, error: message, data: [] };
  }
}
