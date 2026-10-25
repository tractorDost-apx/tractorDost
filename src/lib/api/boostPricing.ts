import { apiClient } from './axios/axios';

export type BoostType = 'FEATURED' | 'HOMEPAGE_BOOST' | 'URGENT_BADGE' | 'TOP_OF_SEARCH';

export interface BoostPricingRecord {
  id: number;
  boostType: BoostType;
  price: number;
  durationDays: number;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoostPricingListResponse {
  data: BoostPricingRecord[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const boostPricingAPI = {
  getAll: async (params?: { search?: string; isActive?: boolean; page?: number; limit?: number }) => {
    const res = await apiClient.get('/boost-pricing/getAllBoostPricing', { params });
    return res.data;
  },

  getById: async (id: number) => {
    const res = await apiClient.get(`/boost-pricing/getBoostPricingById/${id}`);
    return res.data;
  },

  create: async (data: {
    boostType: BoostType;
    price: number;
    durationDays: number;
    description?: string;
    isActive?: boolean;
  }) => {
    const res = await apiClient.post('/boost-pricing/createBoostPricing', data);
    return res.data;
  },

  update: async (
    id: number,
    data: {
      price?: number;
      durationDays?: number;
      description?: string;
      isActive?: boolean;
    }
  ) => {
    const res = await apiClient.patch(`/boost-pricing/updateBoostPricing/${id}`, data);
    return res.data;
  },

  toggleStatus: async (id: number, isActive: boolean) => {
    const res = await apiClient.patch(`/boost-pricing/toggleBoostPricingStatus/${id}`, { isActive });
    return res.data;
  },

  delete: async (id: number) => {
    const res = await apiClient.delete(`/boost-pricing/deleteBoostPricing/${id}`);
    return res.data;
  },
};
