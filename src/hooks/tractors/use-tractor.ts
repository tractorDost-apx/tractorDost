'use client';

import { useState, useEffect, useCallback } from 'react';
import { tractorAPI, Tractor } from '@/lib/api/tractors';

export function useTractor(slugOrId?: string | number) {
  const [tractor, setTractor] = useState<Tractor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTractor = useCallback(async () => {
    if (!slugOrId) return;
    setIsLoading(true);
    setError(null);
    try {
      let res;
      if (typeof slugOrId === 'number' || /^\d+$/.test(String(slugOrId))) {
        res = await tractorAPI.getTractorById(Number(slugOrId));
      } else {
        res = await tractorAPI.getTractorBySlug(String(slugOrId));
      }

      if (res.success && res.data) {
        setTractor(res.data);
      } else {
        setError((res as any).message || 'Tractor not found');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to fetch tractor details');
    } finally {
      setIsLoading(false);
    }
  }, [slugOrId]);

  useEffect(() => {
    fetchTractor();
  }, [fetchTractor]);

  return { tractor, isLoading, error, refetch: fetchTractor };
}
