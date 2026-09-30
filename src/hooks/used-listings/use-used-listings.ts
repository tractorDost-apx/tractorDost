'use client';

import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { useApiQuery } from '@/hooks/ui/use-api-query';
import type { ListingStatus } from '@/types/models/used-listing';

/** The logged-in seller's own listings (every status), paginated */
export function useMyUsedListings(params: {
  listingStatus?: ListingStatus;
  page: number;
  limit?: number;
}) {
  const { listingStatus, page, limit = 12 } = params;
  return useApiQuery(
    () => usedTractorListingAPI.getMyListings({ listingStatus, page, limit }),
    [listingStatus, page, limit]
  );
}
