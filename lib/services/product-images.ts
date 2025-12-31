"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { hasAdminAccess, isAdmin } from "@/lib/auth/roles";

// ============================================================================
// Types
// ============================================================================

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

interface ActionResult {
  ok: boolean;
  error?: string;
}

interface GetProductImagesResult extends ActionResult {
  data?: ProductImage[];
}

// ============================================================================
// Product Images
// ============================================================================

/**
 * Get all images for a product
 */
export async function getProductImages(
  productId: string
): Promise<GetProductImagesResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Fetch error:", error);
      return { ok: false, error: "Failed to fetch product images", data: [] };
    }

    return { ok: true, data: data || [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Get product images error:", e);
    return { ok: false, error: message, data: [] };
  }
}

/**
 * Get images for a specific variant
 */
export async function getVariantImages(
  variantId: string
): Promise<GetProductImagesResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("variant_id", variantId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Fetch error:", error);
      return { ok: false, error: "Failed to fetch variant images", data: [] };
    }

    return { ok: true, data: data || [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Get variant images error:", e);
    return { ok: false, error: message, data: [] };
  }
}

/**
 * Get primary image for a product
 */
export async function getPrimaryProductImage(
  productId: string
): Promise<ActionResult & { image?: ProductImage }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .eq("is_primary", true)
      .single();

    if (error) {
      // If no primary, get first image
      const { data: firstImage } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("display_order", { ascending: true })
        .limit(1)
        .single();

      return { ok: true, image: firstImage || undefined };
    }

    return { ok: true, image: data };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Get primary product image error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Add a new image to a product
 */
export async function addProductImage(
  productId: string,
  imageData: {
    url: string;
    alt_text?: string;
    is_primary?: boolean;
    display_order?: number;
    variant_id?: string;
  }
): Promise<ActionResult & { id?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    // If this is primary, unset other primaries first
    if (imageData.is_primary) {
      await supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", productId)
        .eq("is_primary", true);
    }

    const { data, error } = await supabase
      .from("product_images")
      .insert([
        {
          product_id: productId,
          variant_id: imageData.variant_id || null,
          url: imageData.url,
          alt_text: imageData.alt_text || null,
          is_primary: imageData.is_primary ?? false,
          display_order: imageData.display_order ?? 0,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Insert error:", error);
      return {
        ok: false,
        error: `Failed to add product image: ${error.message}`,
      };
    }

    revalidatePath("/admin/products");
    return { ok: true, id: data.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Add product image error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Update an image
 */
export async function updateProductImage(
  id: string,
  imageData: {
    alt_text?: string;
    is_primary?: boolean;
    display_order?: number;
    variant_id?: string | null;
  }
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    // Get current image to find product_id
    const { data: currentImage } = await supabase
      .from("product_images")
      .select("product_id")
      .eq("id", id)
      .single();

    if (!currentImage) {
      return { ok: false, error: "Image not found" };
    }

    // If setting as primary, unset other primaries first
    if (imageData.is_primary) {
      await supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", currentImage.product_id)
        .neq("id", id);
    }

    const updateData: Record<string, unknown> = {};
    if (imageData.alt_text !== undefined)
      updateData.alt_text = imageData.alt_text;
    if (imageData.is_primary !== undefined)
      updateData.is_primary = imageData.is_primary;
    if (imageData.display_order !== undefined)
      updateData.display_order = imageData.display_order;
    if (imageData.variant_id !== undefined)
      updateData.variant_id = imageData.variant_id;

    const { error } = await supabase
      .from("product_images")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      return { ok: false, error: "Failed to update image" };
    }

    revalidatePath("/admin/products");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Update product image error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Delete an image (admin only)
 */
export async function deleteProductImage(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!isAdmin(user)) {
      return { ok: false, error: "Only admin users can delete images" };
    }

    // Get image URL to delete from storage
    const { data: image } = await supabase
      .from("product_images")
      .select("url")
      .eq("id", id)
      .single();

    if (image?.url) {
      // Extract path from URL and delete from storage
      const pathMatch = image.url.match(/\/product-images\/(.+)$/);
      if (pathMatch) {
        await supabase.storage.from("product-images").remove([pathMatch[1]]);
      }
    }

    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return { ok: false, error: "Failed to delete image" };
    }

    revalidatePath("/admin/products");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Delete product image error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Upload image file and add to product
 */
export async function uploadProductImage(
  productId: string,
  file: File,
  options?: {
    is_primary?: boolean;
    variant_id?: string;
    alt_text?: string;
  }
): Promise<ActionResult & { url?: string; id?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    // Upload to storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { ok: false, error: `Failed to upload image: ${file.name}` };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    // Add to product_images table
    const result = await addProductImage(productId, {
      url: urlData.publicUrl,
      is_primary: options?.is_primary,
      variant_id: options?.variant_id,
      alt_text: options?.alt_text,
    });

    if (!result.ok) {
      // Cleanup: delete uploaded file
      await supabase.storage.from("product-images").remove([filePath]);
      return result;
    }

    return { ok: true, url: urlData.publicUrl, id: result.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Upload product image error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Reorder images
 */
export async function reorderProductImages(
  productId: string,
  imageIds: string[]
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    // Update each image's display_order
    for (let i = 0; i < imageIds.length; i++) {
      await supabase
        .from("product_images")
        .update({ display_order: i })
        .eq("id", imageIds[i])
        .eq("product_id", productId);
    }

    revalidatePath("/admin/products");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Reorder product images error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Set primary image
 */
export async function setPrimaryImage(
  productId: string,
  imageId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAdminAccess(user)) {
      return { ok: false, error: "Admin access required" };
    }

    // Unset all primaries for this product
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);

    // Set the new primary
    const { error } = await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", imageId)
      .eq("product_id", productId);

    if (error) {
      console.error("Update error:", error);
      return { ok: false, error: "Failed to set primary image" };
    }

    revalidatePath("/admin/products");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Set primary image error:", e);
    return { ok: false, error: message };
  }
}
