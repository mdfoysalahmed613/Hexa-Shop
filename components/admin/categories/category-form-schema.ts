import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  is_active: z.boolean(),
  image: z.instanceof(File).optional().nullable(),
  existingImage: z.string().optional().nullable(),
});

export type CategoryFormData = {
  name: string;
  description?: string;
  is_active: boolean;
  image?: File | null;
  existingImage?: string | null;
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  product_count: number;
  is_active: boolean;
}
