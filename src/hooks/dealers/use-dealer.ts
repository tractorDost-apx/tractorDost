'use client';

import { useState, useEffect, useCallback } from 'react';
import { dealerAPI, Dealer } from '@/lib/api/dealers';

export function useDealer(id?: number) {
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDealer = useCallback(async () => {
    if (!id || id <= 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await dealerAPI.getDealerById(id);
      if (res.success && res.data) {
        setDealer(res.data);
      } else {
        setError(res.message || 'Dealer not found');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to fetch dealer details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDealer();
  }, [fetchDealer]);

  return { dealer, isLoading, error, refetch: fetchDealer };
}
