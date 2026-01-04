"use client";

/**
 * Query Provider
 *
 * Configures TanStack Query for client-side data fetching and caching.
 * Provides automatic cache management, background refetching, and devtools.
 *
 * Default Config:
 * - staleTime: 1 minute (data considered fresh)
 * - gcTime: 15 minutes (cache retention)
 * - refetchOnWindowFocus: disabled for stable UX
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
   const [queryClient] = useState(
      () =>
         new QueryClient({
            defaultOptions: {
               queries: {
                  staleTime: 60 * 1000, // Data stays fresh for 1 minute
                  gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
                  refetchOnWindowFocus: false,
               },
            },
         })
   );

   return (
      <QueryClientProvider client={queryClient}>
         <ReactQueryDevtools initialIsOpen={false} />
         {children}
      </QueryClientProvider>
   );
}
