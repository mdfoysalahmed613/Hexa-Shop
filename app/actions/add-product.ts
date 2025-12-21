"use server";

import { createClient } from "@/lib/supabase/server";
import { adminAuthClient } from "@/lib/supabase/supabase-admin";
import { revalidatePath } from "next/cache";

// Create admin client with service role for server-side operations

interface AddProductResult {
  ok: boolean;
  error?: string;
  productId?: string;
}

export async function addProduct(
  formData: FormData
): Promise<AddProductResult> {
  try {
    const supabase = await createClient();

    // Extract form data
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const stock = parseInt(formData.get("stock") as string);
    const sku = formData.get("sku") as string;
    const images = formData.getAll("images") as File[];

    // Validate required fields
    if (!name || !slug || !category) {
      return { ok: false, error: "Missing required fields" };
    }

    if (images.length === 0) {
      return { ok: false, error: "At least one image is required" };
    }

    // Check if slug already exists
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingProduct) {
      return { ok: false, error: "A product with this slug already exists" };
    }

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
      category,
      stock,
      sku: sku || null,
      images: imageUrls,
      primary_image: imageUrls[0],
      status: stock > 0 ? "active" : "out_of_stock",
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
