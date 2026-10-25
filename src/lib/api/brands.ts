import { apiClient } from './axios/axios';

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
  logoId?: string | null;
  country?: string | null;
  foundedYear?: number | null;
  aboutBrand?: string | null;
  totalModels: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const brandAPI = {
  /**
   * Fetch all brands with pagination and search
   */
  getAllBrands: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: string;
    isFeatured?: string;
  }) => {
    const response = await apiClient.get<PaginatedResponse<Brand>>('/brand/get-all-brand', {
      params,
    });
    return response.data;
  },

  /** Alias for getAllBrands */
  getBrands: async (params?: { page?: number; limit?: number; search?: string; isActive?: string; isFeatured?: string }) => {
    return brandAPI.getAllBrands(params);
  },

  /**
   * Fetch a single brand by ID
   */
  getBrandById: async (id: number) => {
    const response = await apiClient.get<{ success: boolean; data: Brand }>(
      `/brand/get-brand/${id}`
    );
    return response.data;
  },

  /**
   * Create a new brand
   * Uses FormData because it handles file uploads (logo)
   */
  createBrand: async (data: FormData) => {
    const response = await apiClient.postForm<{ success: boolean; data: Brand }>(
      '/brand/create-brand',
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Update an existing brand
   * Uses FormData because it handles file uploads (logo)
   */
  updateBrand: async (id: number, data: FormData) => {
    const response = await apiClient.putForm<{ success: boolean; data: Brand }>(
      `/brand/update-brand/${id}`,
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Delete a brand
   */
  deleteBrand: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean; data: Brand }>(
      `/brand/delete-brand/${id}`
    );
    return response.data;
  },
};
