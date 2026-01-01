import { useQuery } from "@tanstack/react-query";
import { getCustomers, getCustomerById } from "@/lib/services/customers";
import type { Customer } from "@/lib/services/customers";

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
