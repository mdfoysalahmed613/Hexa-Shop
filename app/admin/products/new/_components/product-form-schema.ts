import { z } from "zod";

// Product form schema based on products table structure
// Note: price, stock, compare_price are in products_variants table
export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Name must be less than 200 characters"),
  description: z
    .string()
    .max(10000, "Description must be less than 10000 characters")
    .optional()
    .nullable(),
  category: z.string().min(1, "Category is required"),
  is_active: z.boolean(),
  images: z.array(z.custom<File>()).optional(),
  existing_image_ids: z.array(z.string()).optional(),
  deleted_image_ids: z.array(z.string()).optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

export const defaultProductFormValues: ProductFormData = {
  name: "",
  description: "",
  category: "",
  is_active: true,
  images: [],
  existing_image_ids: [],
  deleted_image_ids: [],
};
