import { MOBILE_REGEX, EMAIL_REGEX, PINCODE_REGEX } from './auth.schema';
import type { AdminUpdateDealerFormValues } from '@/types/forms/admin-forms';

export interface DealerFormValues {
  businessName: string;
  slug?: string;
  dealerType: 'AUTHORIZED_PRIMARY' | 'AUTHORIZED_SECONDARY' | 'MULTI_BRAND' | 'USED_TRACTOR_ONLY';
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address: string;
  state: string;
  district: string;
  pincode?: string;
  serviceRadiusKm?: number;
  aboutDealer?: string;
}

export interface DealerGrievanceFormValues {
  grievanceType: 'PAYMENT_ISSUE' | 'FRAUD_REPORT' | 'SERVICE_DEFICIENCY' | 'INCORRECT_INFORMATION' | 'OTHER';
  title: string;
  description: string;
  attachments?: string[];
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

export function validateDealer(values: DealerFormValues): ValidationResult<DealerFormValues> {
  const errors: Partial<Record<keyof DealerFormValues, string>> = {};

  if (!values.businessName || values.businessName.trim().length < 3) {
    errors.businessName = 'Business name must be at least 3 characters';
  }

  if (!values.phone || !MOBILE_REGEX.test(values.phone.trim())) {
    errors.phone = 'Enter a valid 10-digit phone number';
  }

  if (values.email && !EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (!values.address || values.address.trim().length < 3) {
    errors.address = 'Address must be at least 3 characters';
  }

  if (!values.state || values.state.trim().length < 2) {
    errors.state = 'State is required';
  }

  if (!values.district || values.district.trim().length < 2) {
    errors.district = 'District is required';
  }

  if (values.pincode && !PINCODE_REGEX.test(values.pincode.trim())) {
    errors.pincode = 'Pincode must be 6 digits';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateAdminUpdateDealer(values: AdminUpdateDealerFormValues): ValidationResult<AdminUpdateDealerFormValues> {
  const errors: Partial<Record<keyof AdminUpdateDealerFormValues, string>> = {};

  if (values.businessName !== undefined && values.businessName.trim().length < 3) {
    errors.businessName = 'Business name must be at least 3 characters';
  }

  if (values.phone && !MOBILE_REGEX.test(values.phone.trim())) {
    errors.phone = 'Enter a valid 10-digit mobile number';
  }

  if (values.verificationStatus === 'REJECTED' && (!values.rejectionReason || !values.rejectionReason.trim())) {
    errors.rejectionReason = 'Rejection reason is mandatory when status is REJECTED';
  }

  if (values.serviceRadiusKm !== undefined && (values.serviceRadiusKm < 20 || values.serviceRadiusKm > 500)) {
    errors.serviceRadiusKm = 'Service radius must be between 20 km and 500 km';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateDealerGrievance(values: DealerGrievanceFormValues): ValidationResult<DealerGrievanceFormValues> {
  const errors: Partial<Record<keyof DealerGrievanceFormValues, string>> = {};

  if (!values.title || values.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters';
  }

  if (!values.description || values.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
