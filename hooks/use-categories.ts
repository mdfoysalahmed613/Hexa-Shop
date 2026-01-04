/**
 * Categories Hooks
 *
 * TanStack Query hooks for category data fetching and mutations.
 * Provides automatic cache invalidation and toast notifications.
 *
 * Hooks:
 * - useCategories() - Fetch all categories
 * - useCategory(id) - Fetch single category by ID
 * - useAddCategory() - Create category mutation
 * - useUpdateCategory() - Update category mutation
 * - useDeleteCategory() - Delete category mutation
 * - useToggleCategoryStatus() - Toggle active/inactive
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  getCategory,
  addCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  type Category,
} from "@/lib/services/categories";
import { toast } from "sonner";

export const CATEGORIES_QUERY_KEY = ["categories"] as const;

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const result = await getCategories();
      if (!result.ok) {
        throw new Error(result.error || "Failed to fetch categories");
      }
      return result.data as Category[];
    },
  });
}

export function useCategory(id: string | null) {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const result = await getCategory(id);
      if (!result.ok) {
        throw new Error(result.error || "Failed to fetch category");
      }
      return result.data as Category;
    },
    enabled: !!id,
  });
}

export function useAddCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await addCategory(formData);
      if (!result.ok) {
        throw new Error(result.error || "Failed to create category");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }) => {
      const result = await updateCategory(id, formData);
      if (!result.ok) {
        throw new Error(result.error || "Failed to update category");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCategory(id);
      if (!result.ok) {
        throw new Error(result.error || "Failed to delete category");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useToggleCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleCategoryStatus(id);
      if (!result.ok) {
        throw new Error(result.error || "Failed to toggle category status");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category status updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
