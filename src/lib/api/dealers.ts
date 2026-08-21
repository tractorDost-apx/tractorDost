import { apiClient } from './axios/axios';
import {
  Dealer,
  DealerProfileSummary,
  GetDealersQueryParams,
  PaginatedDealersResponse,
  CreateDealerPayload,
  UpdateDealerPayload,
  UpdateDealerAdminPayload,
  Review,
  Grievance,
} from '@/types/models/dealer';

export * from '@/types/models/dealer';

export const dealerAPI = {
  /**
   * Get paginated list of dealers with filters & search
   * GET /dealers/getAllDealers
   */
  getAllDealers: async (params?: GetDealersQueryParams): Promise<PaginatedDealersResponse> => {
    const response = await apiClient.get<PaginatedDealersResponse>('/dealers/getAllDealers', {
      params,
    });
    return response.data;
  },

  /**
   * Get full dealer by ID including relations (brands, showroom, serviceCenter, inventory, grievances)
   * GET /dealers/getDealerById/:id
   */
  getDealerById: async (id: number): Promise<{ success: boolean; message: string; data: Dealer }> => {
    const response = await apiClient.get<{ success: boolean; message: string; data: Dealer }>(
      `/dealers/getDealerById/${id}`
    );
    return response.data;
  },

  /**
   * Get dealer profile summary metrics (ratings, breakdown, grievance stats, recent reviews)
   * GET /dealers/:dealerId/profile
   */
  getDealerProfile: async (
    dealerId: number
  ): Promise<{ success: boolean; message: string; data: DealerProfileSummary }> => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: DealerProfileSummary;
    }>(`/dealers/${dealerId}/profile`);
    return response.data;
  },

  /**
   * Create a new dealer (creates or links User and Dealer profile)
   * POST /dealers/createDealer
   */
  createDealer: async (
    payload: CreateDealerPayload
  ): Promise<{ success: boolean; message: string; data: { user: any; dealer: Dealer } }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { user: any; dealer: Dealer };
    }>('/dealers/createDealer', payload);
    return response.data;
  },

  /**
   * Update dealer details (Owner/Self-edit)
   * PATCH /dealers/updateDealerById/:id
   */
  updateDealerById: async (
    id: number,
    payload: UpdateDealerPayload
  ): Promise<{ success: boolean; message: string; data: Dealer }> => {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: Dealer;
    }>(`/dealers/updateDealerById/${id}`, payload);
    return response.data;
  },

  /**
   * Update dealer by Admin (Verification status, certified, active toggle, rejection reason)
   * PATCH /dealers/:dealerId
   */
  updateDealerByAdmin: async (
    dealerId: number,
    payload: UpdateDealerAdminPayload
  ): Promise<{ success: boolean; message: string; data: Dealer }> => {
    const response = await apiClient.patch<{
      success: boolean;
      message: string;
      data: Dealer;
    }>(`/dealers/${dealerId}`, payload);
    return response.data;
  },

  /**
   * Create a review for a dealer
   * POST /dealers/:dealerId/reviews
   */
  createDealerReview: async (
    dealerId: number,
    payload: {
      overallRating: number;
      serviceQuality?: number;
      responseTime?: number;
      afterSalesSupport?: number;
      priceFairness?: number;
      headline?: string;
      body?: string;
    }
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: Review;
    }>(`/dealers/${dealerId}/reviews`, payload);
    return response.data;
  },

  /**
   * Create a complaint for a dealer
   * POST /dealers/:dealerId/complaints
   */
  createDealerComplaint: async (
    dealerId: number,
    payload: {
      grievanceType: string;
      title: string;
      description: string;
      attachments?: string[];
    }
  ): Promise<{ success: boolean; message: string; data: Grievance }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: Grievance;
    }>(`/dealers/${dealerId}/complaints`, payload);
    return response.data;
  },
};
