import { z } from "zod";

export const productImageSchema = z.object({
  file: z.instanceof(File),
  preview: z.string(),
});

export type ProductImage = z.infer<typeof productImageSchema>;

export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only (e.g., classic-white-t-shirt)"
    ),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be at least 0"),
  category: z.string().min(1, "Category is required"),
  stock: z.number().min(0, "Stock must be at least 0"),
  sku: z.string().optional(),
  images: z.array(productImageSchema).min(1, "At least one image is required"),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

export const defaultProductFormValues: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  category: "",
  stock: 0,
  sku: "",
  images: [],
};

/**
 * Converts a string to a URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}
