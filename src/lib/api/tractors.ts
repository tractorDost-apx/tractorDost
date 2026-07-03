import { apiClient } from './axios/axios';
import { Brand } from './brands';

// Enums matching the backend Prisma schema
export enum LaunchStatus {
  LATEST = 'LATEST',
  UPCOMING = 'UPCOMING',
  DISCONTINUED = 'DISCONTINUED',
  POPULAR = 'POPULAR'
}

export enum FuelType {
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  CNG = 'CNG',
  PETROL = 'PETROL'
}

export enum DriveType {
  TWO_WD = 'TWO_WD',
  FOUR_WD = 'FOUR_WD'
}

export enum EmissionNorm {
  TREM_III = 'TREM_III',
  TREM_IV = 'TREM_IV',
  TREM_V = 'TREM_V'
}

export interface Tractor {
  id: number;
  brandId: number;
  modelName: string;
  slug: string;
  modelCode?: string | null;
  launchStatus: LaunchStatus;
  fuelType: FuelType;
  driveType: DriveType;
  emissionNorm?: EmissionNorm | null;
  isActive: boolean;
  isFeatured: boolean;
  viewsCount: number;
  leadsCount: number;
  expectedLaunchDate?: string | null;
  
  exShowroomPriceMin?: number | null;
  exShowroomPriceMax?: number | null;
  offerPrice?: number | null;
  financeAvailable: boolean;
  
  hp?: number | null;
  
  overview?: string | null;
  whyBuy?: string | null;
  expertReview?: string | null;
  brochurePdf?: string | null;
  videoUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  pros?: any | null;
  metaKeywords?: string | null;
  
  createdAt: string;
  updatedAt: string;
  
  brand?: Brand;
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

export const tractorAPI = {
  /**
   * Fetch all tractors with pagination, search and filters
   */
  getAllTractors: async (params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    brandId?: number;
    launchStatus?: string;
  }) => {
    const response = await apiClient.get<PaginatedResponse<Tractor>>('/tractor/getAll', { params });
    return response.data;
  },

  /**
   * Fetch a single tractor by ID
   */
  getTractorById: async (id: number) => {
    const response = await apiClient.get<{ success: boolean; data: Tractor }>(`/tractor/getById/${id}`);
    return response.data;
  },

  /**
   * Create a new tractor
   * (Expects JSON data initially. If we upload brochure, we might use FormData, but let's assume JSON first based on standard Prisma routes unless it's a multipart route)
   */
  createTractor: async (data: Partial<Tractor>) => {
    const response = await apiClient.post<{ success: boolean; data: Tractor }>('/tractor/create', data);
    return response.data;
  },

  /**
   * Update an existing tractor
   */
  updateTractor: async (id: number, data: Partial<Tractor>) => {
    const response = await apiClient.put<{ success: boolean; data: Tractor }>(`/tractor/update/${id}`, data);
    return response.data;
  },

  /**
   * Delete a tractor
   */
  deleteTractor: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean; data: Tractor }>(`/tractor/delete/${id}`);
    return response.data;
  }
};
