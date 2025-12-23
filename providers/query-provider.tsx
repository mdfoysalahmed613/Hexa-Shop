"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
   const [queryClient] = useState(
      () =>
         new QueryClient({
            defaultOptions: {
               queries: {
                  // staleTime: 60 * 1000, // Data stays fresh for 1 minute
                  // gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
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
