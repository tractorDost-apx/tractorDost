'use client';

import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { useApiQuery } from '@/hooks/ui/use-api-query';

/** A single listing; owners and staff also receive non-live listings */
export function useUsedListing(id: number | string) {
  return useApiQuery(() => usedTractorListingAPI.getListingById(id), [id]);
}
