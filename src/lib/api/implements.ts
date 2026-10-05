import { apiClient } from './axios/axios';
import { createBulkImportApi } from './bulk-import';
import type { ImplementImportReport } from '@/types/api/implement-import';
import { EquipmentBrand } from './equipmentBrands';
import { ImplementCategory } from './implementCategories';

export interface ImplementFamilySummary {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface Implement {
  id: number;
  categoryId: number;
  brandId?: number | null;
  familyId?: number | null;
  modelName: string;
  slug: string;
  implementType?: string | null;
  length?: number | null;
  height?: number | null;
  width?: number | null;
  engineHp?: number | null;
  engineType?: string | null;
  displacement?: string | null;
  cylinders?: number | null;
  coolingSystem?: string | null;
  tractorHPMin?: number | null;
  tractorHPMax?: number | null;
  compatibleHpMin?: number | null;
  compatibleHpMax?: number | null;
  transmissionType?: string | null;
  numberOfSpeeds?: number | null;
  ptoInputSpeedRpm?: number | null;
  travellingSpeed?: number | null;
  tyreSize?: string | null;
  wheelbaseMm?: number | null;
  groundClearanceMm?: number | null;
  steeringType?: string | null;
  brakes?: string | null;
  fuelTankCapacityL?: number | null;
  workingWidthFt?: number | null;
  weightKg?: number | null;
  usageType?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  description?: string | null;
  brochureUrl?: string | null;
  brochureId?: string | null;
  videoUrl?: string | null;
  videoId?: string | null;
  videoThumbnailUrl?: string | null;
  videoThumbnailId?: string | null;
  additionalSpecs?: Record<string, any> | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;

  category?: ImplementCategory;
  brand?: EquipmentBrand;
  family?: ImplementFamilySummary | null;
  compatibleTractors?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T[];
    totalCount?: number;
    currentPage?: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const implementAPI = {
  /**
   * Fetch all implements with pagination, search, and filters
   */
  getAllImplements: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    brandId?: number;
    categoryId?: number;
    familyId?: number;
    hpMin?: number;
    hpMax?: number;
    priceMin?: number;
    priceMax?: number;
    usageType?: string;
    sortBy?: 'newest' | 'priceLowHigh' | 'priceHighLow' | 'modelName';
    isActive?: string;
  }) => {
    const response = await apiClient.get<PaginatedResponse<Implement>>(
      '/implements/getAllImplement',
      { params }
    );
    return response.data;
  },

  /**
   * Fetch a single implement by ID or slug
   */
  getImplementById: async (id: number | string) => {
    const response = await apiClient.get<{ success: boolean; data: Implement }>(
      `/implements/${id}`
    );
    return response.data;
  },

  /**
   * Create a new implement
   * Uses FormData because it handles file uploads (brochure, video, videoThumbnail)
   */
  createImplement: async (data: FormData) => {
    const response = await apiClient.postForm<{ success: boolean; data: Implement }>(
      '/implements',
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Update an existing implement
   * Uses FormData because it handles file uploads
   */
  updateImplement: async (id: number, data: FormData) => {
    const response = await apiClient.patchForm<{ success: boolean; data: Implement }>(
      `/implements/${id}`,
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Delete an implement
   */
  deleteImplement: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean; data: null }>(`/implements/${id}`);
    return response.data;
  },

  /**
   * Update compatible tractors
   */
  updateCompatibleTractors: async (id: number, tractorIds: number[]) => {
    const response = await apiClient.put<{ success: boolean; data: any }>(
      `/implements/${id}/compatible-tractors`,
      { tractorIds }
    );
    return response.data;
  },

  /**
   * Excel bulk import: preview (read-only test) → import (requires the preview's token) → progress
   */
  bulkImport: createBulkImportApi<ImplementImportReport>('/implements/import'),
};

export { type EquipmentBrand } from './equipmentBrands';
export { type ImplementCategory } from './implementCategories';
