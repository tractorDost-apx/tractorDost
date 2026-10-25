import type { AdminUpdateListingFormValues } from '@/types/forms/admin-forms';
import type { ListingStatus } from '@/types/enums/statuses';

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

export function validateAdminUpdateListing(values: AdminUpdateListingFormValues): ValidationResult<AdminUpdateListingFormValues> {
  const errors: Partial<Record<keyof AdminUpdateListingFormValues, string>> = {};

  if (values.listingStatus === ('REJECTED' as ListingStatus) && (!values.rejectionReason || values.rejectionReason.trim().length < 10)) {
    errors.rejectionReason = 'Rejection reason must be at least 10 characters';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export interface ListingFilterParams {
  search?: string;
  state?: string;
  district?: string;
  tractorBrand?: string;
  tractorModel?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  ownership?: number;
  conditionGrade?: string;
  isCertified?: boolean;
  financeAvailable?: boolean;
  rcAvailable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'year_desc' | 'hours_asc';
}

export function sanitizeListingFilter(params: Record<string, unknown>): ListingFilterParams {
  const result: ListingFilterParams = {};

  if (params.search && typeof params.search === 'string') result.search = params.search.trim();
  if (params.state && typeof params.state === 'string') result.state = params.state.trim();
  if (params.district && typeof params.district === 'string') result.district = params.district.trim();
  if (params.tractorBrand && typeof params.tractorBrand === 'string') result.tractorBrand = params.tractorBrand.trim();
  if (params.tractorModel && typeof params.tractorModel === 'string') result.tractorModel = params.tractorModel.trim();

  if (params.priceMin !== undefined && params.priceMin !== '') result.priceMin = Number(params.priceMin);
  if (params.priceMax !== undefined && params.priceMax !== '') result.priceMax = Number(params.priceMax);
  if (params.yearMin !== undefined && params.yearMin !== '') result.yearMin = Number(params.yearMin);
  if (params.yearMax !== undefined && params.yearMax !== '') result.yearMax = Number(params.yearMax);
  if (params.ownership !== undefined && params.ownership !== '') result.ownership = Number(params.ownership);

  if (params.isCertified !== undefined) {
    result.isCertified = params.isCertified === true || params.isCertified === 'true';
  }
  if (params.financeAvailable !== undefined) {
    result.financeAvailable = params.financeAvailable === true || params.financeAvailable === 'true';
  }
  if (params.rcAvailable !== undefined) {
    result.rcAvailable = params.rcAvailable === true || params.rcAvailable === 'true';
  }

  if (params.page !== undefined) result.page = Math.max(1, Number(params.page) || 1);
  if (params.limit !== undefined) result.limit = Math.min(100, Math.max(1, Number(params.limit) || 20));

  return result;
}
