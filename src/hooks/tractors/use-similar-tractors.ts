'use client';

import { useState, useEffect } from 'react';
import { tractorAPI, Tractor } from '@/lib/api/tractors';

export function useSimilarTractors(hp?: number, currentTractorId?: number, limit = 4) {
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!hp) return;
    async function loadSimilar() {
      setIsLoading(true);
      try {
        const hpMin = Math.max(15, (hp || 40) - 5);
        const hpMax = (hp || 40) + 5;
        const res = await tractorAPI.getTractors({ hpMin, hpMax, limit: limit + 1 });
        if (res.success && res.data) {
          const items = res.data.tractors || res.data.data || [];
          const filtered = items.filter((t: any) => t.id !== currentTractorId).slice(0, limit);
          setTractors(filtered);
        }
      } catch (_) {
        // Soft fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadSimilar();
  }, [hp, currentTractorId, limit]);

  return { tractors, isLoading };
}
