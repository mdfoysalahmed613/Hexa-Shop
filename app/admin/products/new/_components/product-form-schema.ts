import { z } from "zod";

// ============================================================================
// Variant Schema (products_variants table)
// ============================================================================

export const variantFormSchema = z.object({
  id: z.string().optional(), // For editing existing variants
  price: z
    .number("Price is required")
    .min(0, "Price must be at least 0"),
  compare_price: z
    .number()
    .min(0, "Compare price must be positive")
    .nullable()
    .optional(),
  stock: z
    .number("Stock is required")
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  is_active: z.boolean(),
  // Attributes as key-value pairs (e.g., { "Color": "Red", "Size": "M" })
  attributes: z.record(z.string(), z.string()).optional().nullable(),
});

export type VariantFormData = z.infer<typeof variantFormSchema>;

// ============================================================================
// Image Schema (product_images table)
// ============================================================================

export const imageFormSchema = z.object({
  id: z.string().optional(), // For existing images
  file: z.custom<File>().optional(), // For new uploads
  image_path: z.string().optional(), // URL for existing images
  is_primary: z.boolean(),
});

export type ImageFormData = z.infer<typeof imageFormSchema>;

// ============================================================================
// Product Form Schema (products table + relations)
// ============================================================================

export const productFormSchema = z
  .object({
    // Product basic info (products table)
    name: z
      .string()
      .min(1, "Product name is required")
      .max(200, "Name must be less than 200 characters"),
    description: z
      .string()
      .max(10000, "Description must be less than 10000 characters")
      .optional()
      .nullable(),
    category_id: z.string().min(1, "Category is required"),
    is_active: z.boolean(),

    // Variants (products_variants table)
    variants: z
      .array(variantFormSchema)
      .min(1, "At least one variant is required"),

    // Images (product_images table)
    images: z.array(z.custom<File>()).optional(),
    existing_images: z.array(imageFormSchema).optional(),
    deleted_image_ids: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // Ensure compare_price >= price for each variant
      return data.variants.every((variant) => {
        if (
          variant.compare_price !== null &&
          variant.compare_price !== undefined
        ) {
          return variant.compare_price >= variant.price;
        }
        return true;
      });
    },
    {
      message: "Compare price must be greater than or equal to price",
      path: ["variants"],
    }
  );

export type ProductFormData = z.infer<typeof productFormSchema>;

// ============================================================================
// Default Values
// ============================================================================

export const defaultVariant: VariantFormData = {
  price: 0,
  compare_price: null,
  stock: 0,
  is_active: true,
  attributes: null,
};

export const defaultProductFormValues: ProductFormData = {
  name: "",
  description: "",
  category_id: "",
  is_active: true,
  variants: [defaultVariant],
  images: [],
  existing_images: [],
  deleted_image_ids: [],
};
