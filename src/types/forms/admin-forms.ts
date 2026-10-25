import type { VerificationStatus, ListingStatus } from '@/types/enums/statuses';

export interface AdminUpdateUserFormValues {
  fullName?: string;
  email?: string;
  state?: string;
  district?: string;
  villageCity?: string;
  pincode?: string;
  isActive?: boolean;
  roleId?: number;
  sellerType?: 'individual' | 'dealer';
  activeListingLimit?: number;
  kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface AdminUpdateListingFormValues {
  listingStatus?: ListingStatus;
  rejectionReason?: string;
  isCertified?: boolean;
  featuredUntil?: string;
  boostType?: 'TOP_SEARCH' | 'HOMEPAGE_FEATURED' | 'VERIFIED_BADGE' | null;
  expiresAt?: string;
}

export interface AdminUpdateDealerFormValues {
  businessName?: string;
  phone?: string;
  email?: string;
  address?: string;
  state?: string;
  district?: string;
  pincode?: string;
  verificationStatus?: VerificationStatus;
  isCertified?: boolean;
  certificationReason?: string;
  rejectionReason?: string;
  serviceRadiusKm?: number;
  isActive?: boolean;
}

export interface AdminBannerFormValues {
  title: string;
  imageUrl: string;
  redirectUrl?: string;
  displayOrder: number;
  isActive: boolean;
  bannerType: 'HERO_SLIDER' | 'CATEGORY_BANNER' | 'POPUP';
  startDate?: string;
  endDate?: string;
}

export interface AdminBrandFormValues {
  name: string;
  slug: string;
  logoUrl?: string;
  isPopular?: boolean;
  displayOrder?: number;
  website?: string;
}
