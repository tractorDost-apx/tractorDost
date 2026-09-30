'use client';

import { useState } from 'react';
import { usedTractorEnquiryAPI } from '@/lib/api/used-enquiries';
import type { LeadStatus } from '@/types/models/used-listing';

/** Move a used-tractor enquiry to its next status (seller of the listing, or staff) */
export function useLeadStatusUpdate() {
  const [pendingId, setPendingId] = useState<number | null>(null);

  const updateStatus = async (id: number, status: LeadStatus) => {
    setPendingId(id);
    try {
      return await usedTractorEnquiryAPI.updateEnquiryStatus(id, status);
    } finally {
      setPendingId(null);
    }
  };

  return { pendingId, updateStatus };
}
