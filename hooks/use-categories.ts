import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  publishAllDraftCategories,
  hideEmptyCategories,
  deleteEmptyCategories,
} from "@/lib/services/categories";
import { toast } from "sonner";
import type { Category } from "@/components/admin/categories";

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

export function usePublishAllDraftCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await publishAllDraftCategories();
      if (!result.ok) {
        throw new Error(result.error || "Failed to publish categories");
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success(`Published ${result.count} draft categories!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useHideEmptyCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await hideEmptyCategories();
      if (!result.ok) {
        throw new Error(result.error || "Failed to hide categories");
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success(`Hidden ${result.count} empty categories!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteEmptyCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await deleteEmptyCategories();
      if (!result.ok) {
        throw new Error(result.error || "Failed to delete categories");
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success(`Deleted ${result.count} empty categories!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
