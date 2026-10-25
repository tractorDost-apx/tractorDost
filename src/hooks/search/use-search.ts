'use client';

import { useState, useCallback } from 'react';
import { tractorAPI, Tractor } from '@/lib/api/tractors';

export function useSearch() {
  const [results, setResults] = useState<Tractor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || !query.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await tractorAPI.getTractors({ search: query.trim(), limit: 20 });
      if (res.success && res.data) {
        setResults(res.data.tractors || res.data.data || []);
      } else {
        setError(res.message || 'Search returned no results');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Error executing search');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, isLoading, error, search, clear };
}
