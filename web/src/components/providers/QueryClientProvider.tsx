"use client";

import React, { useState } from "react";
import {
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
} from "@tanstack/react-query";

export const QueryClientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
};
