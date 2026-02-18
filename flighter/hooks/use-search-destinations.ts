import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface AirportResult {
  type: "airport";
  value: string;
}

interface CityResult {
  type: "city";
  value: string;
  trigger: string;
  content: AirportResult[];
}

export type SearchResult = CityResult | AirportResult;

export const useSearchDestinations = (searchQuery: string) => {
  // Debounce the query
  const debouncedQuery = useMemo(() => {
    return searchQuery;
  }, [searchQuery]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["search-destinations", debouncedQuery],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        return [];
      }

      const response = await fetch(
        `/api/search/destinations?q=${encodeURIComponent(debouncedQuery)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to search destinations");
      }

      return response.json();
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });

  return {
    results: data || [],
    isLoading,
    isFetching,
    error,
  };
};
