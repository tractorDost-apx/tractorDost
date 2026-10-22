import { apiClient } from './axios/axios';

export type ReviewTargetType = 'DEALER' | 'SERVICE_CENTER' | 'SHOWROOM';

export interface ReviewUser {
  id: number;
  fullName: string | null;
}

export interface Review {
  id: number;
  targetType: ReviewTargetType;
  targetId: number;
  userId: number;
  overallRating: number;
  serviceQuality?: number | null;
  responseTime?: number | null;
  afterSalesSupport?: number | null;
  mechanicQuality?: number | null;
  priceFairness?: number | null;
  turnaroundTime?: number | null;
  headline?: string | null;
  body?: string | null;
  isVerified: boolean;
  isApproved: boolean;
  approvedAt?: string | null;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  user?: ReviewUser;
}

export interface ReviewMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateReviewPayload {
  overallRating: number;
  serviceQuality?: number;
  responseTime?: number;
  afterSalesSupport?: number;
  mechanicQuality?: number;
  priceFairness?: number;
  turnaroundTime?: number;
  headline?: string;
  body?: string;
}

export type UpdateReviewPayload = Partial<CreateReviewPayload>;

export interface AdminUpdateReviewPayload extends UpdateReviewPayload {
  isApproved?: boolean;
}

export interface AdminReviewListParams {
  page?: number;
  limit?: number;
  approved?: boolean;
  targetType?: ReviewTargetType;
  targetId?: number;
}

export const reviewsAPI = {
  /**
   * Approved reviews for a target (public)
   * GET /reviews/:targetType/:targetId
   */
  getReviews: async (
    targetType: ReviewTargetType,
    targetId: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ success: boolean; message: string; data: Review[]; meta: ReviewMeta }> => {
    const response = await apiClient.get(`/reviews/${targetType}/${targetId}`, { params });
    return response.data;
  },

  /**
   * Logged-in user's own review for a target
   * GET /reviews/:targetType/:targetId/my-review
   */
  getMyReview: async (
    targetType: ReviewTargetType,
    targetId: number
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    const response = await apiClient.get(`/reviews/${targetType}/${targetId}/my-review`);
    return response.data;
  },

  /**
   * Submit a review (published immediately; only after a real service/lead)
   * POST /reviews/:targetType/:targetId
   */
  createReview: async (
    targetType: ReviewTargetType,
    targetId: number,
    payload: CreateReviewPayload
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    const response = await apiClient.post(`/reviews/${targetType}/${targetId}`, payload);
    return response.data;
  },

  /**
   * Edit own review
   * PATCH /reviews/:reviewId
   */
  updateReview: async (
    reviewId: number,
    payload: UpdateReviewPayload
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    const response = await apiClient.patch(`/reviews/${reviewId}`, payload);
    return response.data;
  },

  /**
   * Delete own review
   * DELETE /reviews/:reviewId
   */
  deleteReview: async (reviewId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  /**
   * Mark a review as helpful
   * POST /reviews/:reviewId/helpful
   */
  markHelpful: async (
    reviewId: number
  ): Promise<{ success: boolean; message: string; data: { id: number; helpfulCount: number } }> => {
    const response = await apiClient.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },

  /**
   * ADMIN: list all reviews (optionally filtered by approval status)
   * GET /reviews/admin/list
   */
  adminListReviews: async (
    params?: AdminReviewListParams
  ): Promise<{ success: boolean; message: string; data: Review[]; meta: ReviewMeta }> => {
    const response = await apiClient.get('/reviews/admin/list', { params });
    return response.data;
  },

  /**
   * ADMIN: edit content and/or approval status of any review, at any time
   * PATCH /reviews/admin/:reviewId
   */
  adminUpdateReview: async (
    reviewId: number,
    payload: AdminUpdateReviewPayload
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    const response = await apiClient.patch(`/reviews/admin/${reviewId}`, payload);
    return response.data;
  },

  /**
   * ADMIN: approve or reject a review
   * PATCH /reviews/admin/:reviewId/approve
   */
  adminSetApproval: async (
    reviewId: number,
    approve: boolean
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    const response = await apiClient.patch(`/reviews/admin/${reviewId}/approve`, { approve });
    return response.data;
  },

  /**
   * ADMIN: delete any review
   * DELETE /reviews/admin/:reviewId
   */
  adminDeleteReview: async (reviewId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/reviews/admin/${reviewId}`);
    return response.data;
  },
};
