'use client';

import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { useApiQuery } from '@/hooks/ui/use-api-query';
import type { ListingFilters, ListingStatus } from '@/types/models/used-listing';

/** Staff grid: every filter, sort and page is applied by the server; re-runs when `params` change */
export function useAdminUsedListings(params: ListingFilters) {
  return useApiQuery(() => usedTractorListingAPI.getAllListings(params), [params]);
}

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
