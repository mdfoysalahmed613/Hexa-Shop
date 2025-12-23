import { z } from "zod";

// 2MB file size limit for image uploads
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  is_active: z.boolean(),
  image: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine(
      (file) => !file || file.size <= MAX_IMAGE_SIZE,
      "Image must be less than 2MB"
    ),
});

export type CategoryFormData = {
  name: string;
  description?: string;
  is_active: boolean;
  image?: File | null;
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
