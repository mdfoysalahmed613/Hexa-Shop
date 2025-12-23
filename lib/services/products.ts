"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface AddProductResult {
  ok: boolean;
  error?: string;
  productId?: string;
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
    .from("products")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  if (!existing || existing.length === 0) {
    return baseSlug;
  }

  // Find existing slugs that match the pattern
  const existingSlugs = new Set(existing.map((p) => p.slug));

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

export async function addProduct(
  formData: FormData
): Promise<AddProductResult> {
  try {
    const supabase = await createClient();

    // Extract form data
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const comparePriceStr = formData.get("compare_price") as string;
    const compare_price = comparePriceStr ? parseFloat(comparePriceStr) : null;
    const category = formData.get("category") as string;
    const stock = parseInt(formData.get("stock") as string);
    const sku = formData.get("sku") as string;
    const is_active = formData.get("is_active") === "true";
    const images = formData.getAll("images") as File[];

    // Validate required fields
    if (!name || !category) {
      return { ok: false, error: "Missing required fields" };
    }

    if (!price || price < 1) {
      return { ok: false, error: "Price must be at least 1" };
    }

    if (images.length === 0) {
      return { ok: false, error: "At least one image is required" };
    }

    // Generate unique slug from name
    const slug = await generateUniqueSlug(supabase, name);

    // Upload images to Supabase Storage
    const imageUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const fileExt = image.name.split(".").pop();
      const fileName = `${slug}-${i + 1}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
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
        .from("product-images")
        .getPublicUrl(filePath);

      imageUrls.push(urlData.publicUrl);
    }

    // Insert product into database
    const productData = {
      name,
      slug,
      description: description || null,
      price,
      compare_price,
      category,
      stock,
      sku: sku || null,
      images: imageUrls,
      primary_image: imageUrls[0],
      is_active,
    };

    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert([productData])
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return { ok: false, error: "Failed to create product" };
    }

    // Revalidate the products page cache
    revalidatePath("/admin/products");

    return { ok: true, productId: product.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Add product error:", e);
    return {
      ok: false,
      error: message,
    };
  }
}
