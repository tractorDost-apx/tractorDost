import { ListingStatus, type DocType } from '@/types/models/used-listing';

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  [ListingStatus.DRAFT]: 'Draft',
  [ListingStatus.PENDING_APPROVAL]: 'Under Review',
  [ListingStatus.ACTIVE]: 'Live',
  [ListingStatus.PAUSED]: 'Inactive',
  [ListingStatus.SOLD]: 'Sold',
  [ListingStatus.EXPIRED]: 'Removed / Expired',
  [ListingStatus.REJECTED]: 'Rejected',
};

export const LISTING_STATUS_STYLES: Record<ListingStatus, string> = {
  [ListingStatus.DRAFT]: 'bg-foreground/5 text-muted border-border/50',
  [ListingStatus.PENDING_APPROVAL]: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
  [ListingStatus.ACTIVE]: 'bg-lime-400/10 text-lime-400 border-lime-400/30',
  [ListingStatus.PAUSED]: 'bg-foreground/5 text-muted border-border/50',
  [ListingStatus.SOLD]: 'bg-violet-400/10 text-violet-300 border-violet-400/30',
  [ListingStatus.EXPIRED]: 'bg-foreground/5 text-muted border-border/50',
  [ListingStatus.REJECTED]: 'bg-red-500/10 text-red-400 border-red-500/30',
};

/** Seller tabs on "My Listings" */
export const MY_LISTING_TABS: { label: string; status?: ListingStatus }[] = [
  { label: 'All' },
  { label: 'Live', status: ListingStatus.ACTIVE },
  { label: 'Under Review', status: ListingStatus.PENDING_APPROVAL },
  { label: 'Inactive', status: ListingStatus.PAUSED },
  { label: 'Rejected', status: ListingStatus.REJECTED },
  { label: 'Removed', status: ListingStatus.EXPIRED },
];

/** Photo slots shown publicly in the listing gallery */
export const PHOTO_DOC_TYPES: { value: DocType; label: string }[] = [
  { value: 'FRONT_VIEW', label: 'Front View' },
  { value: 'LEFT_VIEW', label: 'Left Side' },
  { value: 'RIGHT_VIEW', label: 'Right Side' },
  { value: 'REAR_VIEW', label: 'Rear View' },
  { value: 'DASHBOARD_VIEW', label: 'Dashboard' },
  { value: 'TYRE_VIEW', label: 'Tyres' },
  { value: 'TRACTOR_IMAGE', label: 'Other Photo' },
];

/** Private papers: visible only to the seller and staff */
export const PRIVATE_DOC_TYPES: { value: DocType; label: string }[] = [
  { value: 'RC_COPY', label: 'RC Copy' },
  { value: 'INSURANCE_COPY', label: 'Insurance Copy' },
  { value: 'LOAN_NOC', label: 'Loan NOC' },
  { value: 'OTHER_DOCUMENT', label: 'Other Document' },
];

const DOC_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  [...PHOTO_DOC_TYPES, ...PRIVATE_DOC_TYPES].map((d) => [d.value, d.label])
);

/** Label for a docType; legacy free-text values are shown as-is */
export function docTypeLabel(docType: string): string {
  return DOC_TYPE_LABELS[docType] ?? docType;
}

export function isPhotoDocType(docType: string): boolean {
  return PHOTO_DOC_TYPES.some((d) => d.value === docType);
}

export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
export const ALLOWED_DOCUMENT_MIME = ['image/jpeg', 'image/png', 'application/pdf'];
