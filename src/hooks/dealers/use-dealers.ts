'use client';

import { useState, useEffect, useCallback } from 'react';
import { dealerAPI, Dealer, GetDealersQueryParams } from '@/lib/api/dealers';

export function useDealers(initialParams: GetDealersQueryParams = {}) {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [params, setParams] = useState<GetDealersQueryParams>(initialParams);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchDealers = useCallback(async (currentParams: GetDealersQueryParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await dealerAPI.getAllDealers(currentParams);
      if (res.success && res.data) {
        setDealers(res.data.dealers || res.data.data || []);
        setPagination({
          page: res.data.currentPage || res.data.pagination?.page || 1,
          limit: res.data.pagination?.limit || 10,
          total: res.data.totalCount || res.data.pagination?.total || 0,
          totalPages: res.data.totalPages || res.data.pagination?.totalPages || 1,
        });
      } else {
        setError(res.message || 'Failed to fetch dealers');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Network error fetching dealers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDealers(params);
  }, [params, fetchDealers]);

  const updateParams = (newParams: Partial<GetDealersQueryParams>) => {
    setParams((prev) => ({ ...prev, ...newParams, page: newParams.page ?? 1 }));
  };

  const refetch = () => fetchDealers(params);

  return { dealers, isLoading, error, pagination, params, updateParams, refetch };
}
