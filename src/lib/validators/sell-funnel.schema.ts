import type { SellTractorFormValues, ValuationRequestFormValues, InspectionBookingFormValues } from '@/types/forms/sell-funnel';
import { MOBILE_REGEX } from './auth.schema';

const currentYear = new Date().getFullYear();

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

export function validateSellStep1(values: Partial<SellTractorFormValues>): ValidationResult<SellTractorFormValues> {
  const errors: Partial<Record<keyof SellTractorFormValues, string>> = {};

  if (!values.tractorBrand || values.tractorBrand.trim().length < 2) {
    errors.tractorBrand = 'Select or enter tractor brand';
  }
  if (!values.tractorModel || values.tractorModel.trim().length < 2) {
    errors.tractorModel = 'Enter tractor model';
  }
  if (!values.yearOfManufacture || values.yearOfManufacture < 1980 || values.yearOfManufacture > currentYear) {
    errors.yearOfManufacture = `Year of manufacture must be between 1980 and ${currentYear}`;
  }
  if (!values.ownership || values.ownership < 1 || values.ownership > 10) {
    errors.ownership = 'Ownership must be at least 1st owner';
  }
  if (values.hoursUsed !== undefined && values.hoursUsed < 0) {
    errors.hoursUsed = 'Hours used cannot be negative';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateSellStep2(values: Partial<SellTractorFormValues>): ValidationResult<SellTractorFormValues> {
  const errors: Partial<Record<keyof SellTractorFormValues, string>> = {};

  if (!values.askingPrice || values.askingPrice <= 0) {
    errors.askingPrice = 'Asking price must be greater than ₹0';
  }
  if (!values.state || values.state.trim().length < 2) {
    errors.state = 'State is required';
  }
  if (!values.district || values.district.trim().length < 2) {
    errors.district = 'District is required';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateSellFull(values: SellTractorFormValues): ValidationResult<SellTractorFormValues> {
  const step1 = validateSellStep1(values);
  const step2 = validateSellStep2(values);
  const errors: Partial<Record<keyof SellTractorFormValues, string>> = {
    ...step1.errors,
    ...step2.errors,
  };

  if (!values.conditionGrade) {
    errors.conditionGrade = 'Overall condition grade is required';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateValuationRequest(values: ValuationRequestFormValues): ValidationResult<ValuationRequestFormValues> {
  const errors: Partial<Record<keyof ValuationRequestFormValues, string>> = {};

  if (!values.tractorBrand || values.tractorBrand.trim().length < 2) {
    errors.tractorBrand = 'Brand is required';
  }
  if (!values.tractorModel || values.tractorModel.trim().length < 2) {
    errors.tractorModel = 'Model is required';
  }
  if (!values.yearOfManufacture || values.yearOfManufacture < 1980 || values.yearOfManufacture > currentYear) {
    errors.yearOfManufacture = 'Enter valid manufacturing year';
  }
  if (!values.mobile || !MOBILE_REGEX.test(values.mobile.trim())) {
    errors.mobile = 'Enter valid 10-digit mobile number';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateInspectionBooking(values: InspectionBookingFormValues): ValidationResult<InspectionBookingFormValues> {
  const errors: Partial<Record<keyof InspectionBookingFormValues, string>> = {};

  if (!values.listingId || values.listingId <= 0) {
    errors.listingId = 'Valid listing ID is required';
  }
  if (!values.preferredDate || !values.preferredDate.trim()) {
    errors.preferredDate = 'Inspection date is required';
  }
  if (!values.inspectionAddress || values.inspectionAddress.trim().length < 5) {
    errors.inspectionAddress = 'Enter inspection address (min 5 characters)';
  }
  if (!values.contactMobile || !MOBILE_REGEX.test(values.contactMobile.trim())) {
    errors.contactMobile = 'Enter valid 10-digit mobile number';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
