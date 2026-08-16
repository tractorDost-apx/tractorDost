import { apiClient } from './axios/axios';
import { Brand } from './brands';

export interface TractorFamily {
  id: number;
  brandId: number;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  logoUrl?: string | null;
  logoId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  tractorCount?: number;
  brand?: Brand;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedFamilyResponse {
  success: boolean;
  message: string;
  data: {
    items: TractorFamily[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export const tractorFamilyAPI = {
  /**
   * Fetch all tractor families for a specific brand with filters & pagination
   */
  getFamiliesByBrand: async (
    brandId: number,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: string;
      sortBy?: string;
      sortOrder?: string;
    }
  ) => {
    const response = await apiClient.get<PaginatedFamilyResponse>(
      `/tractor-families/brand/${brandId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Create a new tractor family
   * Uses FormData because it handles file uploads (logo)
   */
  createFamily: async (data: FormData) => {
    const response = await apiClient.post<{ success: boolean; data: TractorFamily }>(
      '/tractor-families',
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Update an existing tractor family
   * Uses FormData because it handles file uploads (logo)
   */
  updateFamily: async (id: number, data: FormData) => {
    const response = await apiClient.patch<{ success: boolean; data: TractorFamily }>(
      `/tractor-families/${id}`,
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Delete a tractor family
   */
  deleteFamily: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean; data: null }>(
      `/tractor-families/${id}`
    );
    return response.data;
  },
};
