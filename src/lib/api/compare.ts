import { apiClient } from './axios/axios';
import { Tractor } from './tractors';

export interface CompareFrequencyRecord {
  tractorLeft: Tractor;
  tractorRight: Tractor;
  frequency: number;
}

export interface CompareFrequencyResponse {
  success: boolean;
  message: string;
  data: {
    records: CompareFrequencyRecord[];
    meta: {
      total: number;
      page: number;
      limit: number;
    };
  };
}

export interface CompareHistoryRecord {
  id: number;
  userId: number;
  tractorLeftId: number;
  tractorRightId: number;
  shareUrl: string | null;
  createdAt: string;
  user?: {
    id: number;
    fullName: string | null;
    mobile: string;
  } | null;
  tractorLeft: Tractor;
  tractorRight: Tractor;
}

export interface CompareHistoryResponse {
  success: boolean;
  message: string;
  data: {
    records: CompareHistoryRecord[];
    meta: {
      total: number;
      page: number;
      limit: number;
    };
  };
}

export const compareAPI = {
  /**
   * Fetch frequency of tractor comparisons
   */
  getFrequencyOfCompare: async (params?: { page?: number; limit?: number; search?: string; sort?: string }) => {
    const response = await apiClient.get<CompareFrequencyResponse>('/compare/frequency-of-compare', { params });
    return response.data;
  },

  /**
   * Compare multiple tractors by IDs
   */
  compareTractors: async (ids: number[], state?: string) => {
    const params: any = { ids: ids.join(',') };
    if (state) params.state = state;
    
    const response = await apiClient.get<{ success: boolean; data: Tractor[] }>('/compare/comparing', { params });
    return response.data;
  },

  /**
   * Fetch all individual comparison history logs (for admin)
   */
  getAllCompareHistory: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get<CompareHistoryResponse>('/compare/history', { params });
    return response.data;
  },
};
