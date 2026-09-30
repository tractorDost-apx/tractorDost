import { apiClient } from './axios/axios';

export interface ListingBoost {
  id: number;
  listingId: number;
  userId: number;
  boostType: 'STANDARD_BOOST' | 'PREMIUM_BOOST';
  startDate: string;
  endDate: string;
  isActive: boolean;
  paymentId: string | null;
  amount: number;
  createdAt: string;
  listing?: any; // You can type this with UsedTractorListing if needed
}

export interface BoostPricing {
  id: number;
  boostType: string;
  durationDays: number;
  price: number;
  isActive: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const listingBoostAPI = {
  // Fetch pricing config
  getBoostPricing: async () => {
    const response = await apiClient.get<ApiResponse<BoostPricing[]>>('/listing-boosts/pricing');
    return response.data;
  },

  // Admin/Agent fetch all boosts
  getAllBoosts: async (params?: { page?: number; limit?: number; isActive?: boolean }) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ListingBoost>>>(
      '/listing-boosts/',
      { params }
    );
    return response.data;
  },

  // Admin deactivate a boost
  deactivateBoost: async (id: number) => {
    const response = await apiClient.patch<ApiResponse<any>>(`/listing-boosts/${id}/deactivate`);
    return response.data;
  },
};
