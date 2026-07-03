import { apiClient } from './axios/axios';

export interface EquipmentBrand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
  country?: string;
  isActive: boolean;
}

export interface ImplementCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  parentId?: number;
  sortOrder: number;
  isActive: boolean;
  children?: ImplementCategory[];
  parent?: ImplementCategory;
}

export interface Implement {
  id: number;
  categoryId: number;
  brandId?: number;
  modelName: string;
  slug: string;
  compatibleHpMin?: number;
  compatibleHpMax?: number;
  workingWidthFt?: number;
  weightKg?: number;
  usageType?: string;
  priceMin?: number;
  priceMax?: number;
  description?: string;
  brochureUrl?: string;
  videoUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  category?: ImplementCategory;
  brand?: EquipmentBrand;
  media?: any[]; // For future use with polymorphic Media model
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    implements?: T[];
    categories?: T[];
    brands?: T[];
    data?: T[]; // fallback
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const implementAPI = {
  // Implements CRUD
  getAllImplements: async (params?: { page?: number; limit?: number; search?: string; brandId?: number; categoryId?: number }) => {
    const response = await apiClient.get<PaginatedResponse<Implement>>('/implements', { params });
    return response.data;
  },
  
  getImplementById: async (id: number) => {
    const response = await apiClient.get<{ success: boolean; data: Implement }>(`/implements/${id}`);
    return response.data;
  },
  
  createImplement: async (data: Partial<Implement>) => {
    const response = await apiClient.post<{ success: boolean; data: Implement }>('/implements', data);
    return response.data;
  },
  
  updateImplement: async (id: number, data: Partial<Implement>) => {
    const response = await apiClient.put<{ success: boolean; data: Implement }>(`/implements/${id}`, data);
    return response.data;
  },
  
  deleteImplement: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean; data: Implement }>(`/implements/${id}`);
    return response.data;
  },

  // Metadata Endpoints for Forms
  getAllImplementCategories: async () => {
    const response = await apiClient.get('/implement-categories');
    return response.data;
  },
  
  getAllEquipmentBrands: async () => {
    const response = await apiClient.get('/equipment-brands');
    return response.data;
  }
};
