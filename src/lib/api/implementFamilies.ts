import { apiClient } from './axios/axios';

export interface ImplementFamilyBrand {
  id: number;
  name: string;
  slug: string;
}

export interface LinkedImplement {
  id: number;
  modelName: string;
  slug: string;
  category?: {
    id: number;
    name: string;
  };
  brand?: {
    id: number;
    name: string;
  };
  compatibleTractors?: Array<{
    id: number;
  }>;
}

export interface ImplementFamily {
  id: number;
  brandId: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  logoId?: string | null;
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt: string;
  updatedAt: string;
  brand?: ImplementFamilyBrand;
  implements?: LinkedImplement[];
}

export interface CreateImplementFamilyInput {
  brandId: number;
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  logoId?: string;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateImplementFamilyInput {
  brandId?: number;
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  logoId?: string;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  isActive?: boolean;
}

export interface GetAllImplementFamiliesParams {
  page?: number;
  limit?: number;
  brandId?: number;
  isActive?: boolean | string;
  search?: string;
}

export interface PaginatedImplementFamiliesResponse {
  success: boolean;
  message: string;
  data: {
    data: ImplementFamily[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export const implementFamilyAPI = {
  /**
   * Fetch implement families with filtering, search and pagination
   */
  getAllImplementFamilies: async (params?: GetAllImplementFamiliesParams) => {
    const response = await apiClient.get<PaginatedImplementFamiliesResponse>(
      '/implement-families',
      { params }
    );
    return response.data;
  },

  /**
   * Fetch a single implement family by ID
   */
  getImplementFamilyById: async (id: number) => {
    const response = await apiClient.get<{ success: boolean; data: ImplementFamily }>(
      `/implement-families/${id}`
    );
    return response.data;
  },

  /**
   * Create a new implement family
   */
  createImplementFamily: async (data: CreateImplementFamilyInput) => {
    const response = await apiClient.post<{ success: boolean; data: ImplementFamily }>(
      '/implement-families',
      data
    );
    return response.data;
  },

  /**
   * Update an existing implement family
   */
  updateImplementFamily: async (id: number, data: UpdateImplementFamilyInput) => {
    const response = await apiClient.patch<{ success: boolean; data: ImplementFamily }>(
      `/implement-families/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete an implement family
   */
  deleteImplementFamily: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean; data: null }>(
      `/implement-families/${id}`
    );
    return response.data;
  },
};

