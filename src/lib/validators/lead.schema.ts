import type { LeadFormValues, DetailAccessLeadFormValues, LoanApplicationFormValues, CallLogFormValues } from '@/types/forms/lead-forms';
import { MOBILE_REGEX, EMAIL_REGEX } from './auth.schema';

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

export function validateLead(values: LeadFormValues): ValidationResult<LeadFormValues> {
  const errors: Partial<Record<keyof LeadFormValues, string>> = {};

  if (!values.name || values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!values.mobile || !MOBILE_REGEX.test(values.mobile.trim())) {
    errors.mobile = 'Enter a valid 10-digit mobile number';
  }

  if (values.email && !EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (values.budget !== undefined && (isNaN(values.budget) || values.budget <= 0)) {
    errors.budget = 'Budget must be a positive number';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateDetailAccessLead(values: DetailAccessLeadFormValues): ValidationResult<DetailAccessLeadFormValues> {
  const errors: Partial<Record<keyof DetailAccessLeadFormValues, string>> = {};

  if (!values.targetType || !['TRACTOR', 'IMPLEMENT'].includes(values.targetType)) {
    errors.targetType = 'Target type must be TRACTOR or IMPLEMENT';
  }

  if (!values.targetId || values.targetId <= 0) {
    errors.targetId = 'Target ID is required';
  }

  if (values.mobile && !MOBILE_REGEX.test(values.mobile.trim())) {
    errors.mobile = 'Enter a valid 10-digit mobile number';
  }

  if (values.email && !EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  // Latitude and Longitude should both be present or both undefined
  const hasLat = values.latitude !== undefined && values.latitude !== null;
  const hasLng = values.longitude !== undefined && values.longitude !== null;
  if (hasLat !== hasLng) {
    errors.latitude = 'Share both latitude and longitude, or neither';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateLoanApplication(values: LoanApplicationFormValues): ValidationResult<LoanApplicationFormValues> {
  const errors: Partial<Record<keyof LoanApplicationFormValues, string>> = {};

  if (!values.name || values.name.trim().length < 2) {
    errors.name = 'Full name is required';
  }

  if (!values.mobile || !MOBILE_REGEX.test(values.mobile.trim())) {
    errors.mobile = 'Enter a valid 10-digit mobile number';
  }

  if (!values.state || !values.state.trim()) {
    errors.state = 'State is required';
  }

  if (!values.district || !values.district.trim()) {
    errors.district = 'District is required';
  }

  if (!values.loanAmount || isNaN(values.loanAmount) || values.loanAmount < 50000) {
    errors.loanAmount = 'Minimum loan amount is ₹50,000';
  }

  if (!values.tenureYears || isNaN(values.tenureYears) || values.tenureYears < 1 || values.tenureYears > 7) {
    errors.tenureYears = 'Tenure must be between 1 and 7 years';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateCallLog(values: CallLogFormValues): ValidationResult<CallLogFormValues> {
  const errors: Partial<Record<keyof CallLogFormValues, string>> = {};

  const validOutcomes = ['answered', 'no_answer', 'callback', 'wrong_number'];
  if (!values.outcome || !validOutcomes.includes(values.outcome)) {
    errors.outcome = 'Select a valid call outcome';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
