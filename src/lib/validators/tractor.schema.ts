import type { FuelType } from '@/types/enums/fuel-types';

export interface CreateTractorFormValues {
  brandId: number;
  familyId?: number;
  modelName: string;
  slug?: string;
  modelCode?: string;
  launchStatus?: 'UPCOMING' | 'LATEST' | 'POPULAR' | 'DISCONTINUED';
  fuelType: FuelType;
  driveType: 'TWO_WD' | 'FOUR_WD';
  emissionNorm?: 'TREM_III' | 'TREM_IV' | 'TREM_V';
  hp: number;
  exShowroomPriceMin?: number;
  exShowroomPriceMax?: number;
  offerPrice?: number;
  overview?: string;
  whyBuy?: string;
  expertReview?: string;
  brochurePdf?: string;
  videoUrl?: string;
  categoryIds: number[];
  isActive?: boolean;
  isFeatured?: boolean;
  financeAvailable?: boolean;
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

export function validateTractor(values: CreateTractorFormValues): ValidationResult<CreateTractorFormValues> {
  const errors: Partial<Record<keyof CreateTractorFormValues, string>> = {};

  if (!values.brandId || values.brandId <= 0) {
    errors.brandId = 'Tractor Brand is required';
  }

  if (!values.modelName || values.modelName.trim().length < 2) {
    errors.modelName = 'Model name must be at least 2 characters';
  }

  if (!values.driveType || !['TWO_WD', 'FOUR_WD'].includes(values.driveType)) {
    errors.driveType = 'Drive type must be TWO_WD or FOUR_WD';
  }

  if (!values.hp || values.hp <= 0 || values.hp > 1000) {
    errors.hp = 'Horsepower (HP) must be between 1 and 1000';
  }

  if (values.categoryIds && values.categoryIds.length === 0) {
    errors.categoryIds = 'Select at least one category';
  }

  if (
    values.exShowroomPriceMin !== undefined &&
    values.exShowroomPriceMax !== undefined &&
    values.exShowroomPriceMin > values.exShowroomPriceMax
  ) {
    errors.exShowroomPriceMin = 'Minimum price cannot exceed maximum price';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export interface TractorFilterParams {
  search?: string;
  brandId?: number;
  familyId?: number;
  fuelType?: FuelType;
  driveType?: 'TWO_WD' | 'FOUR_WD';
  launchStatus?: string;
  hpMin?: number;
  hpMax?: number;
  priceMin?: number;
  priceMax?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export function sanitizeTractorFilter(params: Record<string, unknown>): TractorFilterParams {
  const result: TractorFilterParams = {};

  if (params.search && typeof params.search === 'string') result.search = params.search.trim();
  if (params.brandId !== undefined && params.brandId !== '') result.brandId = Number(params.brandId);
  if (params.familyId !== undefined && params.familyId !== '') result.familyId = Number(params.familyId);
  if (params.fuelType && typeof params.fuelType === 'string') result.fuelType = params.fuelType as FuelType;
  if (params.driveType && typeof params.driveType === 'string') result.driveType = params.driveType as 'TWO_WD' | 'FOUR_WD';
  if (params.launchStatus && typeof params.launchStatus === 'string') result.launchStatus = params.launchStatus;

  if (params.hpMin !== undefined && params.hpMin !== '') result.hpMin = Number(params.hpMin);
  if (params.hpMax !== undefined && params.hpMax !== '') result.hpMax = Number(params.hpMax);
  if (params.priceMin !== undefined && params.priceMin !== '') result.priceMin = Number(params.priceMin);
  if (params.priceMax !== undefined && params.priceMax !== '') result.priceMax = Number(params.priceMax);

  if (params.isActive !== undefined) {
    result.isActive = params.isActive === true || params.isActive === 'true';
  }

  if (params.page !== undefined) result.page = Math.max(1, Number(params.page) || 1);
  if (params.limit !== undefined) result.limit = Math.min(100, Math.max(1, Number(params.limit) || 10));

  return result;
}
