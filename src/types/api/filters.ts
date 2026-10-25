export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortParams<T extends string = string> {
  sortBy?: T;
  sortOrder?: 'asc' | 'desc';
}

export interface BaseCatalogFilter extends PaginationParams {
  search?: string;
  state?: string;
  district?: string;
}

export interface TractorFilterQuery extends BaseCatalogFilter {
  brandId?: number;
  familyId?: number;
  fuelType?: string;
  driveType?: 'TWO_WD' | 'FOUR_WD';
  hpMin?: number;
  hpMax?: number;
  priceMin?: number;
  priceMax?: number;
  isActive?: boolean;
}

export interface UsedListingFilterQuery extends BaseCatalogFilter {
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
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'year_desc' | 'hours_asc';
}

export interface DealerFilterQuery extends BaseCatalogFilter {
  dealerType?: string;
  verificationStatus?: string;
  isCertified?: boolean;
  isActive?: boolean;
}
