import { z } from "zod";

export const productImageSchema = z.object({
  file: z.instanceof(File),
  preview: z.string(),
});

export type ProductImage = z.infer<typeof productImageSchema>;

export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().min(1, "Price must be at least 1"),
  compare_price: z
    .number()
    .min(0, "Compare price must be at least 0")
    .optional(),
  category: z.string().min(1, "Category is required"),
  stock: z.number().min(0, "Stock must be at least 0"),
  sku: z.string().optional(),
  is_active: z.boolean(), // Required - set default in defaultProductFormValues
  images: z.array(productImageSchema).min(1, "At least one image is required"),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

export const defaultProductFormValues: ProductFormData = {
  name: "",
  description: "",
  price: undefined as unknown as number, // Force user to enter price
  compare_price: undefined,
  category: "",
  stock: 0,
  sku: "",
  is_active: true,
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
