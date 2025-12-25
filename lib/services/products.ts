"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth/roles";

interface ActionResult {
  ok: boolean;
  error?: string;
}

interface AddProductResult extends ActionResult {
  productId?: string;
}

interface GetProductsResult extends ActionResult {
  data?: Product[];
}

interface GetProductResult extends ActionResult {
  data?: Product;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  category: string;
  category_name?: string;
  stock: number;
  sku: string | null;
  images: string[];
  primary_image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  baseName: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(baseName);

  // Check if base slug exists
  let query = supabase
    .from("products")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data: existing } = await query;

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

    // Check admin role (demo_admin cannot modify)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!isAdmin(user)) {
      return {
        ok: false,
        error: `Only admin users can create products. Current role: ${
          user?.app_metadata?.role || "none"
        }`,
      };
    }

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
      const filePath = `${slug}/${fileName}`;

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

/**
 * Get all products with optional filtering
 */
export async function getProducts(): Promise<GetProductsResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories:categories (
          name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      return { ok: false, error: "Failed to fetch products", data: [] };
    }

    // Transform data to include category_name
    const productsWithCategory = (data || []).map((product) => ({
      ...product,
      category_name: product.categories?.name || product.category,
      categories: undefined,
    }));

    return { ok: true, data: productsWithCategory };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Get products error:", e);
    return { ok: false, error: message, data: [] };
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(id: string): Promise<GetProductResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories:categories (
          name
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Fetch error:", error);
      return { ok: false, error: "Product not found" };
    }

    const product = {
      ...data,
      category_name: data.categories?.name || data.category,
      categories: undefined,
    };

    return { ok: true, data: product };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Get product error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Check admin role (demo_admin cannot modify)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!isAdmin(user)) {
      return { ok: false, error: "Only admin users can update products" };
    }

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
    const newImages = formData.getAll("images") as File[];
    const existingImagesJson = formData.get("existing_images") as string;
    const existingImages: string[] = existingImagesJson
      ? JSON.parse(existingImagesJson)
      : [];

    // Validate required fields
    if (!name || !category) {
      return { ok: false, error: "Missing required fields" };
    }

    if (!price || price < 1) {
      return { ok: false, error: "Price must be at least 1" };
    }

    // Generate slug from name (check for uniqueness excluding current product)
    const slug = await generateUniqueSlug(supabase, name, id);

    // Upload new images to Supabase Storage
    const newImageUrls: string[] = [];

    for (let i = 0; i < newImages.length; i++) {
      const image = newImages[i];
      if (image.size === 0) continue;

      const fileExt = image.name.split(".").pop();
      const fileName = `${slug}-${Date.now()}-${i + 1}.${fileExt}`;
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

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      newImageUrls.push(urlData.publicUrl);
    }

    // Combine existing and new images
    const allImages = [...existingImages, ...newImageUrls];

    if (allImages.length === 0) {
      return { ok: false, error: "At least one image is required" };
    }

    // Update product
    const productData = {
      name,
      slug,
      description: description || null,
      price,
      compare_price,
      category,
      stock,
      sku: sku || null,
      images: allImages,
      primary_image: allImages[0],
      is_active,
    };

    const { error: updateError } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id);

    if (updateError) {
      console.error("Update error:", updateError);
      return { ok: false, error: "Failed to update product" };
    }

    revalidatePath("/admin/products");

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Update product error:", e);
    return { ok: false, error: message };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Check admin role (demo_admin cannot modify)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!isAdmin(user)) {
      return { ok: false, error: "Only admin users can delete products" };
    }

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return { ok: false, error: "Failed to delete product" };
    }

    revalidatePath("/admin/products");

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Delete product error:", e);
    return { ok: false, error: message };
  }
}
