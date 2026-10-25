import type { Language } from '@/types/enums/roles';

export interface SendOtpFormValues {
  mobile: string;
}

export interface VerifyOtpFormValues {
  mobile: string;
  otp: string;
}

export interface RegisterUserFormValues {
  mobile: string;
  fullName: string;
  email?: string;
  state?: string;
  district?: string;
  villageCity?: string;
  pincode?: string;
  preferredLanguage?: Language;
  sellerType?: 'individual' | 'dealer';
}

export interface UpdateProfileFormValues {
  fullName?: string;
  email?: string;
  state?: string;
  district?: string;
  villageCity?: string;
  pincode?: string;
  preferredLanguage?: Language;
  preferredBrand?: string;
  farmingType?: string;
  landSize?: number;
  budgetRange?: string;
  sellerType?: 'individual' | 'dealer';
  aadhaarRef?: string;
  panRef?: string;
}

export interface AuthState {
  token: string | null;
  user: {
    id: number;
    mobile: string;
    fullName?: string;
    role: string;
    kycStatus?: string;
  } | null;
  isAuthenticated: boolean;
}
