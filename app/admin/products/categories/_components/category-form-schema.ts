import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable(),
  is_active: z.boolean(),
  parent_id: z.string().optional().nullable(),
  image: z.custom<File>().optional().nullable(),
  image_url: z.string().optional().nullable(),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

export const defaultCategoryFormValues: CategoryFormData = {
  name: "",
  description: "",
  is_active: true,
  parent_id: null,
  image: null,
  image_url: null,
};
