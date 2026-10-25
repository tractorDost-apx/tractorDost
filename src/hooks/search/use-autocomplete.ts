'use client';

import { useState, useEffect } from 'react';
import { tractorAPI } from '@/lib/api/tractors';
import { useDebounce } from '@/hooks/ui/use-debounce';

export interface AutocompleteSuggestion {
  id: number | string;
  title: string;
  subtitle: string;
  slug: string;
  type: 'TRACTOR' | 'BRAND' | 'IMPLEMENT';
}

export function useAutocomplete(query: string, delay = 250) {
  const debouncedQuery = useDebounce(query, delay);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    async function fetchSuggestions() {
      setIsLoading(true);
      try {
        const res = await tractorAPI.getTractors({
          search: debouncedQuery.trim(),
          limit: 6,
        });

        const items = res.data?.tractors || res.data?.data || [];
        if (res.success && items.length > 0) {
          const list: AutocompleteSuggestion[] = items.map((t: any) => ({
            id: t.id,
            title: `${t.brand?.name || ''} ${t.modelName}`.trim(),
            subtitle: `${t.hp ? `${t.hp} HP` : ''} • ${t.driveType === 'FOUR_WD' ? '4WD' : '2WD'}`,
            slug: `/tractors/${t.slug}`,
            type: 'TRACTOR',
          }));
          setSuggestions(list);
        }
      } catch (_) {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSuggestions();
  }, [debouncedQuery]);

  return { suggestions, isLoading };
}
