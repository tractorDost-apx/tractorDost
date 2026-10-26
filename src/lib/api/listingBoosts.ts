import { apiClient } from './axios/axios';
import type { BoostType } from './boostPricing';

export type { BoostType };

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface ListingBoost {
  id: number;
  listingId: number;
  userId?: number;
  boostType: BoostType;
  startDate: string;
  endDate: string;
  isActive: boolean;
  amountPaid: number;
  paymentId?: number | null;
  createdAt: string;
  updatedAt?: string;
  listing?: {
    id: number;
    tractorBrand: string;
    tractorModel: string;
    askingPrice: number;
    yearOfManufacture: number;
    state: string;
    district: string;
    sellerId: number;
    media?: Array<{ url: string; isPrimary?: boolean }>;
  };
  payment?: {
    id: number;
    amount: number;
    status: PaymentStatus;
    gateway: string;
    gatewayOrderId?: string | null;
    gatewayPaymentId?: string | null;
  };
}

export interface BoostPricingItem {
  boostType: BoostType;
  pricePerDay: number;
  minDays: number;
  maxDays: number;
}

export interface InitiateBoostPayload {
  listingId: number;
  boostType: BoostType;
  durationDays: number;
}

export interface InitiateBoostResponseData {
  boostId: number;
  paymentId: number;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyBoostPaymentPayload {
  boostId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaginatedBoostsResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const listingBoostAPI = {
  /**
   * Fetch standard pricing rules for all boost types (public)
   * GET /listing-boosts/pricing
   */
  getBoostPricing: async () => {
    const response = await apiClient.get<ApiResponse<BoostPricingItem[]>>('/listing-boosts/pricing');
    return response.data;
  },

  /**
   * Seller: Fetch boosts purchased for their own listings
   * GET /listing-boosts/my-boosts
   */
  getMyBoosts: async (params?: {
    isActive?: 'true' | 'false' | boolean;
    boostType?: BoostType;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<PaginatedBoostsResponse<ListingBoost>>(
      '/listing-boosts/my-boosts',
      { params }
    );
    return response.data;
  },

  /**
   * Seller: Initiate a new boost order with Razorpay
   * POST /listing-boosts/initiate
   */
  initiateBoost: async (payload: InitiateBoostPayload) => {
    const response = await apiClient.post<ApiResponse<InitiateBoostResponseData>>(
      '/listing-boosts/initiate',
      payload
    );
    return response.data;
  },

  /**
   * Seller: Complete and verify payment to activate the boost
   * POST /listing-boosts/verify-payment
   */
  verifyPayment: async (payload: VerifyBoostPaymentPayload) => {
    const response = await apiClient.post<ApiResponse<ListingBoost>>(
      '/listing-boosts/verify-payment',
      payload
    );
    return response.data;
  },

  /**
   * Admin/Agent: Fetch all marketplace boosts with filtering
   * GET /listing-boosts/
   */
  getAllBoosts: async (params?: {
    listingId?: number;
    boostType?: BoostType;
    isActive?: 'true' | 'false' | boolean;
    paymentStatus?: PaymentStatus;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<PaginatedBoostsResponse<ListingBoost>>(
      '/listing-boosts/',
      { params }
    );
    return response.data;
  },

  /**
   * Fetch a single boost by ID
   * GET /listing-boosts/:id
   */
  getBoostById: async (id: number) => {
    const response = await apiClient.get<ApiResponse<ListingBoost>>(`/listing-boosts/${id}`);
    return response.data;
  },

  /**
   * Admin: Manually deactivate an active boost
   * PATCH /listing-boosts/:id/deactivate
   */
  deactivateBoost: async (id: number) => {
    const response = await apiClient.patch<ApiResponse<{ deactivated: boolean }>>(
      `/listing-boosts/${id}/deactivate`
    );
    return response.data;
  },
};

export const listingBoostsAPI = listingBoostAPI;


