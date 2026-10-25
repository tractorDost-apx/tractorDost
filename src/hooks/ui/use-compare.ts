'use client';

import { useLocalStorage } from './use-local-storage';
import { useCallback } from 'react';

export interface CompareItem {
  id: number;
  slug: string;
  modelName: string;
  brandName: string;
  hp?: number;
  price?: number;
  imageUrl?: string;
}

const STORAGE_KEY = 'td_compare_items';
const MAX_COMPARE = 4;

export function useCompare() {
  const [items, setItems] = useLocalStorage<CompareItem[]>(STORAGE_KEY, []);

  const addToCompare = useCallback(
    (item: CompareItem): boolean => {
      if (items.some((i) => i.id === item.id || i.slug === item.slug)) {
        return false;
      }
      if (items.length >= MAX_COMPARE) {
        return false;
      }
      setItems((prev) => [...prev, item]);
      return true;
    },
    [items, setItems]
  );

  const removeFromCompare = useCallback(
    (idOrSlug: number | string) => {
      setItems((prev) => prev.filter((i) => i.id !== idOrSlug && i.slug !== idOrSlug));
    },
    [setItems]
  );

  const clearCompare = useCallback(() => {
    setItems([]);
  }, [setItems]);

  const isInCompare = useCallback(
    (idOrSlug: number | string): boolean => {
      return items.some((i) => i.id === idOrSlug || i.slug === idOrSlug);
    },
    [items]
  );

  return {
    compareItems: items,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    count: items.length,
    isFull: items.length >= MAX_COMPARE,
  };
}
