"use client";
import { useQuery } from "@tanstack/react-query";

export const useCustomQuery = (url: string) => {
  const {
    data,
    isLoading,
    error,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: [url],
    queryFn: async () => {
      const res = await fetch(url);

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.message || "Failed to fetch data");
      }

      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep data in memory for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch when reconnecting to network
  });

  return {
    data,
    isLoading,
    error,
    isError,
    isSuccess,
  };
};
