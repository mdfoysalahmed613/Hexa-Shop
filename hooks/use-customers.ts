/**
 * Customers Hooks
 *
 * TanStack Query hooks for customer data fetching and mutations (admin only).
 * Customers are fetched from Supabase Auth user list.
 *
 * Hooks:
 * - useCustomers() - Fetch all customers
 * - useCustomer(id) - Fetch single customer by ID
 * - useMakeAdmin() - Make a user an admin
 * - useDeleteCustomer() - Delete a customer
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomers,
  getCustomerById,
  makeUserAdmin,
  deleteCustomer,
} from "@/lib/services/customers";
import type { Customer } from "@/lib/services/customers";
import { toast } from "sonner";

export const CUSTOMERS_QUERY_KEY = ["customers"] as const;

export function useCustomers() {
  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEY,
    queryFn: async () => {
      const result = await getCustomers();
      if (!result.ok) throw new Error(result.error);
      return result.data as Customer[];
    },
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const result = await getCustomerById(id);
      if (!result.ok) throw new Error(result.error);
      return result.data as Customer;
    },
    enabled: !!id,
  });
}

// ============================================================================
// Mutations
// ============================================================================

export function useMakeAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await makeUserAdmin(userId);
      if (!result.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
      toast.success("User promoted to admin successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await deleteCustomer(userId);
      if (!result.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
