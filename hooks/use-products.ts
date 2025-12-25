import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  type Product,
} from "@/lib/services/products";
import { toast } from "sonner";

export const PRODUCTS_QUERY_KEY = ["products"] as const;

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: async () => {
      const result = await getProducts();
      if (!result.ok) {
        throw new Error(result.error || "Failed to fetch products");
      }
      return result.data as Product[];
    },
  });
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const result = await getProduct(id);
      if (!result.ok) {
        throw new Error(result.error || "Failed to fetch product");
      }
      return result.data as Product;
    },
    enabled: !!id,
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await addProduct(formData);
      if (!result.ok) {
        throw new Error(result.error || "Failed to create product");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.success("Product created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }) => {
      const result = await updateProduct(id, formData);
      if (!result.ok) {
        throw new Error(result.error || "Failed to update product");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.success("Product updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteProduct(id);
      if (!result.ok) {
        throw new Error(result.error || "Failed to delete product");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.success("Product deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
