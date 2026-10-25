export type UserStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'INACTIVE';
export type ListingStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SOLD' | 'EXPIRED' | 'PAUSED';

export type LeadStatus =
  | 'NEW'
  | 'ATTEMPTED'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'INTERESTED'
  | 'DEALER_ASSIGNED'
  | 'CONVERTED'
  | 'LOST'
  | 'SPAM'
  | 'IN_PROGRESS'
  | 'CLOSED';

export type LeadType =
  | 'GET_PRICE'
  | 'EMI_ENQUIRY'
  | 'LOAN'
  | 'INSURANCE'
  | 'USED_ENQUIRY'
  | 'SELL'
  | 'DEALER'
  | 'SERVICE'
  | 'CALLBACK'
  | 'BROCHURE'
  | 'COMPARE'
  | 'VALUATION'
  | 'TEST_DRIVE'
  | 'NEW_TRACTOR'
  | 'USED_TRACTOR'
  | 'IMPLEMENT'
  | 'TYRE'
  | 'FINANCE'
  | 'EXCHANGE'
  | 'RENTAL'
  | 'DETAIL_ACCESS';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type InspectionStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ServiceBookingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ContentStatus = 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

