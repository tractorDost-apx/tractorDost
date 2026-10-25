import type { SendOtpFormValues, VerifyOtpFormValues, RegisterUserFormValues, UpdateProfileFormValues } from '@/types/forms/auth-forms';

export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const OTP_REGEX = /^\d{4,6}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PINCODE_REGEX = /^\d{6}$/;

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

export function validateSendOtp(values: SendOtpFormValues): ValidationResult<SendOtpFormValues> {
  const errors: Partial<Record<keyof SendOtpFormValues, string>> = {};
  if (!values.mobile || !values.mobile.trim()) {
    errors.mobile = 'Mobile number is required';
  } else if (!MOBILE_REGEX.test(values.mobile.trim())) {
    errors.mobile = 'Enter a valid 10-digit Indian mobile number';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateVerifyOtp(values: VerifyOtpFormValues): ValidationResult<VerifyOtpFormValues> {
  const errors: Partial<Record<keyof VerifyOtpFormValues, string>> = {};
  if (!values.mobile || !MOBILE_REGEX.test(values.mobile.trim())) {
    errors.mobile = 'Valid 10-digit mobile number is required';
  }
  if (!values.otp || !OTP_REGEX.test(values.otp.trim())) {
    errors.otp = 'Enter a valid OTP code';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateRegisterUser(values: RegisterUserFormValues): ValidationResult<RegisterUserFormValues> {
  const errors: Partial<Record<keyof RegisterUserFormValues, string>> = {};
  if (!values.fullName || values.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }
  if (!values.mobile || !MOBILE_REGEX.test(values.mobile.trim())) {
    errors.mobile = 'Enter a valid 10-digit mobile number';
  }
  if (values.email && !EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }
  if (values.pincode && !PINCODE_REGEX.test(values.pincode.trim())) {
    errors.pincode = 'Pincode must be 6 digits';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateUpdateProfile(values: UpdateProfileFormValues): ValidationResult<UpdateProfileFormValues> {
  const errors: Partial<Record<keyof UpdateProfileFormValues, string>> = {};
  if (values.fullName !== undefined && values.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }
  if (values.email && !EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }
  if (values.pincode && !PINCODE_REGEX.test(values.pincode.trim())) {
    errors.pincode = 'Pincode must be 6 digits';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}
