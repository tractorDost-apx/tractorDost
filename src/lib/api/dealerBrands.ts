import { apiClient } from './axios/axios';

export interface AssignedDealerBrand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
  country?: string | null;
  foundedYear?: number | null;
  aboutBrand?: string | null;
  totalModels?: number;
  isActive?: boolean;
  isPrimary: boolean;
}

export interface GetDealerBrandsResponse {
  success: boolean;
  message: string;
  data: {
    dealerId: number;
    brands: AssignedDealerBrand[];
  };
}

export interface AddDealerBrandsPayload {
  brandIds: number[];
  isPrimary?: boolean;
}

export interface ReplaceDealerBrandsPayload {
  brandIds: number[];
  primaryBrandId?: number;
}

export const dealerBrandAPI = {
  /**
   * Get brands assigned to a specific dealer
   * GET /dealerBrand/dealers/:dealerId/brands
   */
  getDealerBrands: async (dealerId: number): Promise<GetDealerBrandsResponse> => {
    const response = await apiClient.get<GetDealerBrandsResponse>(
      `/dealerBrand/dealers/${dealerId}/brands`
    );
    return response.data;
  },

  /**
   * Admin: Add brands to a dealer
   * POST /dealerBrand/admin/dealers/:dealerId/brands
   */
  addBrandsToDealerAdmin: async (
    dealerId: number,
    payload: AddDealerBrandsPayload
  ): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await apiClient.post<{ success: boolean; message: string; data: any }>(
      `/dealerBrand/admin/dealers/${dealerId}/brands`,
      payload
    );
    return response.data;
  },

  /**
   * Admin: Replace all assigned brands for a dealer
   * PATCH /dealerBrand/admin/dealers/:dealerId/brands
   */
  replaceDealerBrands: async (
    dealerId: number,
    payload: ReplaceDealerBrandsPayload
  ): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await apiClient.patch<{ success: boolean; message: string; data: any }>(
      `/dealerBrand/admin/dealers/${dealerId}/brands`,
      payload
    );
    return response.data;
  },

  /**
   * Admin: Remove a specific brand from a dealer
   * DELETE /dealerBrand/admin/dealers/:dealerId/brands/:brandId
   */
  removeBrandFromDealer: async (
    dealerId: number,
    brandId: number
  ): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await apiClient.delete<{ success: boolean; message: string; data: any }>(
      `/dealerBrand/admin/dealers/${dealerId}/brands/${brandId}`
    );
    return response.data;
  },
};
