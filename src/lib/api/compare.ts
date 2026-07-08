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
    
    const response = await apiClient.get<{ success: boolean; data: Tractor[] }>('/compare', { params });
    return response.data;
  },
};
