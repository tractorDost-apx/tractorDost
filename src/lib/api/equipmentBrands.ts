import { apiClient } from './axios/axios';

export interface EquipmentBrand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
  logoId?: string | null;
  country?: string | null;
  isActive: boolean;
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

export const equipmentBrandAPI = {
  /**
   * Fetch all equipment brands with pagination and search
   */
  getAllEquipmentBrands: async (params?: { page?: number; limit?: number; search?: string; isActive?: string }) => {
    const response = await apiClient.get<PaginatedResponse<EquipmentBrand>>('/equipment-brands/getAllEquipmentBrands', { params });
    return response.data;
  },

  /**
   * Fetch a single equipment brand by ID
   */
  getEquipmentBrandById: async (id: number) => {
    const response = await apiClient.get<{ success: boolean; data: EquipmentBrand }>(`/equipment-brands/getEquipmentBrandById/${id}`);
    return response.data;
  },

  /**
   * Create a new equipment brand
   * Uses FormData to handle logo uploads
   */
  createEquipmentBrand: async (data: FormData) => {
    const response = await apiClient.postForm<{ success: boolean; data: EquipmentBrand }>(
      '/equipment-brands/createEquipmentBrand',
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Update an existing equipment brand
   * Uses FormData to handle logo uploads
   */
  updateEquipmentBrand: async (id: number, data: FormData) => {
    const response = await apiClient.patchForm<{ success: boolean; data: EquipmentBrand }>(
      `/equipment-brands/${id}`,
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  /**
   * Toggle the active status of an equipment brand
   */
  toggleEquipmentBrandActive: async (id: number) => {
    const response = await apiClient.patch<{ success: boolean; data: EquipmentBrand }>(`/equipment-brands/${id}/toggle-active`);
    return response.data;
  },

  /**
   * Delete an equipment brand
   */
  deleteEquipmentBrand: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean; data: null }>(`/equipment-brands/${id}`);
    return response.data;
  }
};
