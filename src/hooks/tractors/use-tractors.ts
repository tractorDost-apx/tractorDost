'use client';

import { useState, useEffect, useCallback } from 'react';
import { tractorAPI, Tractor, TractorFilter } from '@/lib/api/tractors';

export function useTractors(initialFilters: TractorFilter = {}) {
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [filters, setFilters] = useState<TractorFilter>(initialFilters);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const fetchTractors = useCallback(async (currentFilters: TractorFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await tractorAPI.getTractors(currentFilters);
      if (res.success && res.data) {
        setTractors(res.data.tractors || res.data.data || []);
        setPagination({
          page: res.data.pagination?.page || 1,
          limit: res.data.pagination?.limit || 12,
          total: res.data.pagination?.total || 0,
          totalPages: res.data.pagination?.totalPages || 1,
        });
      } else {
        setError(res.message || 'Failed to fetch tractors');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Network error fetching tractors');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTractors(filters);
  }, [filters, fetchTractors]);

  const updateFilters = (newFilters: Partial<TractorFilter>) => {
    setFilters((prev: TractorFilter) => ({ ...prev, ...newFilters, page: newFilters.page ?? 1 }));
  };

  const refetch = () => fetchTractors(filters);

  return {
    tractors,
    isLoading,
    error,
    pagination,
    filters,
    updateFilters,
    refetch,
  };
}
