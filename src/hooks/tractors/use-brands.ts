'use client';

import { useState, useEffect } from 'react';
import { brandAPI, Brand } from '@/lib/api/brands';

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBrands() {
      setIsLoading(true);
      try {
        const res = await brandAPI.getBrands();
        if (res.success && res.data) {
          const brandList = (res.data as any).data || (res.data as any).brands || (Array.isArray(res.data) ? res.data : []);
          setBrands(brandList);
        } else {
          setError(res.message || 'Failed to load brands');
        }
      } catch (err: unknown) {
        setError((err as Error).message || 'Network error fetching brands');
      } finally {
        setIsLoading(false);
      }
    }
    loadBrands();
  }, []);

  return { brands, isLoading, error };
}
