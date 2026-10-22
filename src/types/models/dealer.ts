export type DealerType =
  'BRAND_DEALER' | 'USED_DEALER' | 'SERVICE_CENTER' | 'IMPLEMENT_DEALER' | 'TYRE_DEALER';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface DealerBrand {
  id: number;
  dealerId: number;
  brandId: number;
  isPrimary: boolean;
  brand: {
    id: number;
    name: string;
    logoUrl?: string | null;
  };
}

export interface DealerInventory {
  id: number;
  dealerId: number;
  tractorId?: number | null;
  customModel?: string | null;
  stockCount: number;
  expectedArrival?: string | null;
  isAvailable: boolean;
  updatedAt: string;
}

export interface Showroom {
  id: number;
  dealerId: number;
  brandId?: number | null;
  showroomName: string;
  slug: string;
  address: string;
  state: string;
  district: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  email?: string | null;
  workingHours?: any;
  totalArea?: string | null;
  parkingAvailable: boolean;
  testDriveAvailable: boolean;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ServiceCenter {
  id: number;
  dealerId: number;
  serviceName: string;
  slug: string;
  address: string;
  state: string;
  district: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone: string;
  whatsapp?: string | null;
  emergencyPhone?: string | null;
  supportedBrands?: any;
  servicesAvailable?: any;
  hasPickupService: boolean;
  hasEmergencySupport: boolean;
  sparePartsAvailable: boolean;
  is24x7: boolean;
  workingHours?: any;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface Review {
  id: number;
  targetType: string;
  targetId: number;
  userId: number;
  overallRating: number;
  serviceQuality?: number | null;
  responseTime?: number | null;
  afterSalesSupport?: number | null;
  priceFairness?: number | null;
  headline?: string | null;
  body?: string | null;
  isApproved: boolean;
  createdAt: string;
}

export interface Grievance {
  id: number;
  userId: number;
  dealerId?: number | null;
  grievanceType: string;
  title: string;
  description: string;
  status: 'SUBMITTED' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED' | 'CLOSED';
  referenceNo: string;
  attachments?: any;
  resolutionNotes?: string | null;
  createdAt: string;
}

export interface Dealer {
  id: number;
  userId?: number | null;
  businessName: string;
  slug: string;
  dealerType: DealerType;
  gstNumber?: string | null;
  panNumber?: string | null;

  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;

  address: string;
  state: string;
  district: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  serviceRadiusKm?: number | null;

  workingHours?: any;
  serviceAreas?: any;

  verificationStatus: VerificationStatus;
  isCertified: boolean;
  certifiedAt?: string | null;
  isActive: boolean;
  rejectionReason?: string | null;

  rating: number;
  reviewsCount: number;
  complaintsCount: number;

  aboutDealer?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;

  createdAt: string;
  updatedAt: string;

  brands?: DealerBrand[];
  inventory?: DealerInventory[];
  showroom?: Showroom | null;
  serviceCenter?: ServiceCenter | null;
  grievances?: Grievance[];

  // Virtual flags for UI compatibility
  hasShowroom?: boolean;
  hasServiceCenter?: boolean;
}

export interface DealerProfileSummary {
  dealerId: number;
  businessName: string;
  dealerType: DealerType;
  overallRating: number;
  reviewsCount: number;
  ratingBreakdown: {
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    fiveStar: number;
  };
  positivePercentage?: number;
  subscores?: {
    serviceQuality?: number | null;
    responseTime?: number | null;
    afterSalesSupport?: number | null;
    priceFairness?: number | null;
  };
  grievanceStats: {
    totalGrievances: number;
    resolved: number;
    pending: number;
    escalated: number;
    resolutionRate: string;
    resolutionPercentage?: number;
    healthStatus?: 'PERFECT' | 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION';
    avgResolutionDays?: number | null;
  };
  recentReviews: Array<{
    id: number;
    userId: number;
    rating: number;
    headline?: string | null;
    body?: string | null;
    isApproved: boolean;
    createdAt: string;
  }>;
  certificationStatus: VerificationStatus;
  certifiedAt?: string | null;
  phone?: string | null;
  state: string;
  district: string;
  address: string;
}

export interface GetDealersQueryParams {
  search?: string;
  state?: string;
  district?: string;
  pincode?: string;
  brandId?: number;
  dealerType?: DealerType;
  verificationStatus?: VerificationStatus;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedDealersResponse {
  success: boolean;
  message: string;
  data: {
    data: Dealer[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  total?: number;
}

export interface CreateDealerPayload {
  // User primary fields
  mobile: number;
  fullName?: string;
  preferredLanguage?: 'EN' | 'HI' | 'TE' | 'TA' | 'KN' | 'MR' | 'GU' | 'BN' | 'PB' | 'ML';
  preferredBrand?: string;
  farmingType?: string;
  landSize?: number;
  budgetRange?: string;

  // Dealer primary fields
  businessName: string;
  slug: string;
  dealerType: DealerType;
  gstNumber?: string;
  panNumber?: string;

  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;

  address: string;
  state: string;
  district: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm?: number;

  workingHours?: any;
  serviceAreas?: any;

  verificationStatus?: VerificationStatus;
  isCertified?: boolean;
  certifiedAt?: string;
  isActive?: boolean;
  rejectionReason?: string;

  rating?: number;
  reviewsCount?: number;
  complaintsCount?: number;

  aboutDealer?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateDealerPayload {
  businessName?: string;
  slug?: string;
  dealerType?: DealerType;
  gstNumber?: string;
  panNumber?: string;

  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;

  address?: string;
  state?: string;
  district?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm?: number;

  workingHours?: any;
  serviceAreas?: any;

  aboutDealer?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateDealerAdminPayload {
  businessName?: string;
  slug?: string;
  dealerType?: DealerType;
  phone?: string;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  address?: string;
  state?: string;
  district?: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  serviceRadiusKm?: number | null;
  workingHours?: any;
  serviceAreas?: any;
  verificationStatus?: VerificationStatus;
  isCertified?: boolean;
  certificationReason?: string | null;
  rejectionReason?: string | null;
  isActive?: boolean;
  aboutDealer?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  brandIds?: number[];
  primaryBrandId?: number | null;
}
