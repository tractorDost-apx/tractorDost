'use client';

import { useState } from 'react';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import type { ApiResult } from '@/types/api/responses';

/**
 * Seller actions on an existing listing. Listing details are immutable after
 * creation, so the only actions are toggling visibility and removing it.
 */
export function useListingActions() {
  const [pendingId, setPendingId] = useState<number | null>(null);

  const run = async <T>(id: number, call: () => Promise<ApiResult<T>>): Promise<ApiResult<T>> => {
    setPendingId(id);
    try {
      return await call();
    } finally {
      setPendingId(null);
    }
  };

  return {
    pendingId,
    setActive: (id: number, isActive: boolean) =>
      run(id, () => usedTractorListingAPI.setListingActive(id, isActive)),
    remove: (id: number) => run(id, () => usedTractorListingAPI.deleteListing(id)),
  };
}
