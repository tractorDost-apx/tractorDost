import React from 'react';
import type { LeadStatus, ListingStatus } from '@/types/models/used-listing';
import { LISTING_STATUS_LABELS, LISTING_STATUS_STYLES } from '@/lib/constants/listing-statuses';
import { LEAD_STATUS_LABELS, LEAD_STATUS_STYLES } from '@/lib/constants/lead-statuses';

const BASE =
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold whitespace-nowrap';

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span className={`${BASE} ${LISTING_STATUS_STYLES[status]}`}>
      {LISTING_STATUS_LABELS[status]}
    </span>
  );
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`${BASE} ${LEAD_STATUS_STYLES[status]}`}>{LEAD_STATUS_LABELS[status]}</span>
  );
}
