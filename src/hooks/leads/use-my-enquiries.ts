'use client';

import { usedTractorEnquiryAPI } from '@/lib/api/used-enquiries';
import { useApiQuery } from '@/hooks/ui/use-api-query';
import type { LeadStatus } from '@/types/models/used-listing';

/** Enquiries the logged-in buyer has sent on used listings */
export function useMyEnquiries(params: { status?: LeadStatus; page: number; limit?: number }) {
  const { status, page, limit = 10 } = params;
  return useApiQuery(
    () => usedTractorEnquiryAPI.getMyEnquiries({ status, page, limit }),
    [status, page, limit]
  );
}

/** Enquiries received on the logged-in seller's listings (optionally one listing) */
export function useReceivedEnquiries(params: {
  listingId?: number;
  status?: LeadStatus;
  page: number;
  limit?: number;
}) {
  const { listingId, status, page, limit = 10 } = params;
  return useApiQuery(
    () => usedTractorEnquiryAPI.getMyListingEnquiries({ listingId, status, page, limit }),
    [listingId, status, page, limit]
  );
}
