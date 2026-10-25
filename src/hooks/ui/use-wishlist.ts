'use client';

import { useLocalStorage } from './use-local-storage';
import { useCallback } from 'react';

export interface WishlistItem {
  id: number;
  type: 'TRACTOR' | 'USED_TRACTOR' | 'IMPLEMENT';
  title: string;
  slug: string;
  brand?: string;
  price?: number;
  imageUrl?: string;
  addedAt: string;
}

const STORAGE_KEY = 'td_wishlist_items';

export function useWishlist() {
  const [items, setItems] = useLocalStorage<WishlistItem[]>(STORAGE_KEY, []);

  const toggleWishlist = useCallback(
    (item: Omit<WishlistItem, 'addedAt'>) => {
      setItems((prev) => {
        const exists = prev.some((i) => i.id === item.id && i.type === item.type);
        if (exists) {
          return prev.filter((i) => !(i.id === item.id && i.type === item.type));
        } else {
          return [...prev, { ...item, addedAt: new Date().toISOString() }];
        }
      });
    },
    [setItems]
  );

  const isInWishlist = useCallback(
    (id: number, type: 'TRACTOR' | 'USED_TRACTOR' | 'IMPLEMENT' = 'TRACTOR'): boolean => {
      return items.some((i) => i.id === id && i.type === type);
    },
    [items]
  );

  const removeFromWishlist = useCallback(
    (id: number, type: 'TRACTOR' | 'USED_TRACTOR' | 'IMPLEMENT' = 'TRACTOR') => {
      setItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
    },
    [setItems]
  );

  return {
    wishlistItems: items,
    toggleWishlist,
    isInWishlist,
    removeFromWishlist,
    count: items.length,
  };
}
