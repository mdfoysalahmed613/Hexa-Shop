import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProduct,
  getProductBySlug,
  searchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
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

export function useProductBySlug(slug: string | null) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, "slug", slug],
    queryFn: async () => {
      if (!slug) return null;
      const result = await getProductBySlug(slug);
      if (!result.ok) {
        throw new Error(result.error || "Failed to fetch product");
      }
      return result.data as Product;
    },
    enabled: !!slug,
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

export function useSearchProducts(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, "search", query],
    queryFn: async () => {
      const result = await searchProducts(query);
      if (!result.ok) {
        throw new Error(result.error || "Failed to search products");
      }
      return result.data as Product[];
    },
    enabled: enabled && query.trim().length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useToggleProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleProductStatus(id);
      if (!result.ok) {
        throw new Error(result.error || "Failed to toggle product status");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.success("Product status updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
