'use client';

import { useState, useEffect } from 'react';
import { tractorAPI, Tractor, LaunchStatus } from '@/lib/api/tractors';

export function usePopularTractors(limit = 6) {
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPopular() {
      setIsLoading(true);
      try {
        const res = await tractorAPI.getTractors({
          launchStatus: LaunchStatus.POPULAR,
          limit,
        });
        if (res.success && res.data) {
          setTractors(res.data.tractors || res.data.data || []);
        } else {
          setError(res.message || 'Failed to fetch popular tractors');
        }
      } catch (err: unknown) {
        setError((err as Error).message || 'Network error fetching popular tractors');
      } finally {
        setIsLoading(false);
      }
    }
    loadPopular();
  }, [limit]);

  return { tractors, isLoading, error };
}
