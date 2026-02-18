import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface AirportResult {
  type: "airport";
  value: string;
  airportId?: string;
}

interface CityResult {
  type: "city";
  value: string;
  trigger: string;
  content: AirportResult[];
}

export type SearchResult = CityResult | AirportResult;

const DEBOUNCE_DELAY = 400; // milliseconds

export const useSearchDestinationsWithDebounce = (searchQuery: string) => {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
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
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    results: data || [],
    isLoading: isLoading || (isFetching && debouncedQuery !== searchQuery),
    isFetching,
    error,
  };
};
