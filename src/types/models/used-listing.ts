// Types for the used tractor marketplace, mirroring BACKEND/prisma/schema.prisma
// and the response shapes of BACKEND/src/module/usedMarketplace.

export enum ConditionGrade {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export enum ListingStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  SOLD = 'SOLD',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
}

export enum UrgencyLevel {
  FIFTEEN_DAYS = 'FIFTEEN_DAYS',
  THIRTY_DAYS = 'THIRTY_DAYS',
  NO_RUSH = 'NO_RUSH',
}

export type LoanClearanceStatus = 'CLEAR' | 'UNDER_HYPOTHECATION';

export type LeadStatus =
  | 'NEW'
  | 'ATTEMPTED'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'INTERESTED'
  | 'DEALER_ASSIGNED'
  | 'CONVERTED'
  | 'LOST'
  | 'SPAM';

export type InspectionStatus =
  'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'REPORT_UPLOADED' | 'CERTIFIED';

export type DocType =
  | 'FRONT_VIEW'
  | 'LEFT_VIEW'
  | 'RIGHT_VIEW'
  | 'REAR_VIEW'
  | 'DASHBOARD_VIEW'
  | 'TYRE_VIEW'
  | 'TRACTOR_IMAGE'
  | 'RC_COPY'
  | 'INSURANCE_COPY'
  | 'LOAN_NOC'
  | 'OTHER_DOCUMENT';

export type ListingSortBy = 'newest' | 'price_asc' | 'price_desc' | 'year_desc' | 'hours_asc';

export interface ListingMedia {
  id: number;
  url: string;
  mediaType: string;
}

export interface UsedInspection {
  id: number;
  listingId: number;
  inspectorId: number | null;
  status: InspectionStatus;
  engineScore: number | null;
  tyreScore: number | null;
  hydraulicsScore: number | null;
  bodyScore: number | null;
  clutchScore: number | null;
  overallScore: number | null;
  reportUrl: string | null;
  inspectorNotes: string | null;
  inspectedAt: string | null;
  certifiedBy: number | null;
  certifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * A used tractor listing. Card responses (getAll, my) carry a subset of these
 * fields, detail responses (get/:id) carry all of them; hence the optionals.
 * `isActive` is derived by the backend: true only when listingStatus is ACTIVE.
 */
export interface UsedTractorListing {
  id: number;
  sellerId?: number;
  tractorId?: number | null;

  tractorBrand: string;
  tractorModel: string;
  yearOfManufacture: number;
  ownership: number;
  hoursUsed: number | null;
  conditionGrade: ConditionGrade;

  askingPrice: number;
  negotiable: boolean;
  estimatedMarketPrice?: number | null;
  financeAvailable: boolean;

  listingStatus: ListingStatus;
  isActive?: boolean;
  urgency: UrgencyLevel;
  isCertified: boolean;
  certifiedAt?: string | null;
  featuredUntil?: string | null;
  boostType?: string | null;
  listingQualityScore?: number | null;

  tyreCondition?: ConditionGrade | null;
  engineConditionPct?: number | null;
  hydraulicsCondition?: ConditionGrade | null;
  clutchCondition?: ConditionGrade | null;
  bodyCondition?: ConditionGrade | null;

  rcAvailable: boolean;
  insuranceValidity?: string | null;
  loanClearanceStatus?: LoanClearanceStatus;

  state: string;
  district: string;
  villageCity: string | null;
  pincode?: string | null;

  viewsCount: number;
  leadCount?: number;

  description?: string | null;
  majorRepairs?: string | null;

  rejectionReason?: string | null;
  expiresAt?: string | null;
  publishedAt?: string | null;
  soldAt?: string | null;
  createdAt: string;
  updatedAt?: string;

  seller?: { id: number; fullName: string | null; maskedMobile?: string };
  media?: ListingMedia[];
  inspections?: UsedInspection[];
}

/** Body accepted by POST /used-listings/create */
export interface CreateListingInput {
  tractorBrand: string;
  tractorModel: string;
  yearOfManufacture: number;
  ownership: number;
  askingPrice: number;
  state: string;
  district: string;
  conditionGrade?: ConditionGrade;
  negotiable?: boolean;
  financeAvailable?: boolean;
  hoursUsed?: number;
  urgency?: UrgencyLevel;
  tractorId?: number;
  dealerInventoryId?: number;
  description?: string;
  majorRepairs?: string;
  tyreCondition?: ConditionGrade;
  engineConditionPct?: number;
  hydraulicsCondition?: ConditionGrade;
  clutchCondition?: ConditionGrade;
  bodyCondition?: ConditionGrade;
  rcAvailable?: boolean;
  insuranceValidity?: string;
  loanClearanceStatus?: LoanClearanceStatus;
  villageCity?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

/** Query accepted by GET /used-listings/getAll */
export interface ListingFilters {
  search?: string;
  state?: string;
  district?: string;
  tractorBrand?: string;
  ownership?: number;
  maxHours?: number;
  rcAvailable?: boolean;
  loanClearanceStatus?: LoanClearanceStatus;
  sortBy?: ListingSortBy;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  conditionGrade?: ConditionGrade;
  isCertified?: boolean;
  financeAvailable?: boolean;
  urgency?: UrgencyLevel;
  listingStatus?: ListingStatus;
  page?: number;
  limit?: number;
}

export interface AdminListingUpdate {
  listingStatus?: ListingStatus;
  rejectionReason?: string;
  isCertified?: boolean;
  featuredUntil?: string;
  boostType?: string | null;
  expiresAt?: string;
}

export interface UsedDocument {
  id: number;
  listingId: number;
  docType: DocType | string; // legacy rows may hold free-text values
  url: string;
  documentId: string | null;
  verifiedAt: string | null;
  createdAt: string;
  listing?: { id: number; tractorBrand: string; tractorModel: string; sellerId: number };
}

export interface UsedEnquiry {
  id: number;
  listingId: number;
  buyerId: number | null;
  name: string;
  mobile: string;
  message: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: number;
    tractorBrand: string;
    tractorModel: string;
    listingStatus: ListingStatus;
    sellerId?: number;
    askingPrice?: number;
  };
}

export interface CreateEnquiryInput {
  listingId: number;
  name: string;
  mobile: string;
  message?: string;
}

/** Pagination shape: { data, total, page, limit, totalPages } (listings) */
export interface ListingPage<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Pagination shape: { data, meta } (enquiries, documents, inspections) */
export interface MetaPage<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
