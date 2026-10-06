export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  fullName?: string | null;
  mobile: number | string;
  email?: string | null;
  roleId: number;
  role: Role;
  profilePhoto?: string | null;
  profileId?: string | null;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isActive: boolean;
  preferredLanguage?: string;
  state?: string | null;
  district?: string | null;
  villageCity?: string | null;
  pincode?: string | null;
  preferredBrand?: string | null;
  farmingType?: string | null;
  landSize?: number | null;
  budgetRange?: string | null;
  sellerType?: string | null;
  aadhaarRef?: string | null;
  panRef?: string | null;
  kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt?: string;
  updatedAt?: string;
  dealer?: any;
}

