import { apiClient } from './axios/axios';
import { ServiceCenter } from '@/types/models/dealer';

export interface CreateServiceCenterPayload {
  serviceName: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsapp?: string;
  emergencyPhone?: string;
  supportedBrands: number[];
  servicesAvailable: string[];
  hasPickupService: boolean;
  hasEmergencySupport: boolean;
  sparePartsAvailable: boolean;
  is24x7: boolean;
  workingHours?: Record<string, string>;
}

export interface UpdateServiceCenterPayload extends Partial<CreateServiceCenterPayload> {
  isActive?: boolean;
}

export interface ServiceCenterResponse {
  success: boolean;
  message: string;
  data: ServiceCenter;
}

export interface NearbyServiceCenter {
  serviceCenterId: number;
  dealerId: number;
  dealerName: string;
  serviceName: string;
  address: string;
  state: string;
  district: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  emergencyPhone?: string;
  supportedBrands: string[];
  servicesAvailable: string[];
  hasPickupService: boolean;
  hasEmergencySupport: boolean;
  is24x7: boolean;
  distanceKm: number;
  rating: number;
  reviewsCount: number;
  workingHours: string;
  isActive: boolean;
}

export interface NearbyServiceCentersResponse {
  success: boolean;
  message: string;
  data: {
    userLocation: { latitude: number; longitude: number };
    searchRadius: number;
    resultCount: number;
    serviceCenters: NearbyServiceCenter[];
  };
}

export const serviceCenterAPI = {
  /**
   * Get service center by dealer ID
   * GET /serviceCenter/dealers/:dealerId/service-center
   */
  getServiceCenterByDealer: async (dealerId: number): Promise<ServiceCenterResponse> => {
    const response = await apiClient.get<ServiceCenterResponse>(
      `/serviceCenter/dealers/${dealerId}/service-center`
    );
    return response.data;
  },

  /**
   * Get nearby service centers
   * GET /serviceCenter/service-centers/nearby
   */
  getNearbyServiceCenters: async (params: {
    latitude: number;
    longitude: number;
    radius?: number;
    brand?: number;
    service?: string;
    limit?: number;
  }): Promise<NearbyServiceCentersResponse> => {
    const response = await apiClient.get<NearbyServiceCentersResponse>(
      `/serviceCenter/service-centers/nearby`,
      { params }
    );
    return response.data;
  },

  /**
   * Admin: Create service center for a dealer
   * POST /serviceCenter/admin/dealers/:dealerId/service-center
   */
  createServiceCenter: async (
    dealerId: number,
    payload: CreateServiceCenterPayload
  ): Promise<ServiceCenterResponse> => {
    const response = await apiClient.post<ServiceCenterResponse>(
      `/serviceCenter/admin/dealers/${dealerId}/service-center`,
      payload
    );
    return response.data;
  },

  /**
   * Admin: Update service center for a dealer
   * PATCH /serviceCenter/admin/dealers/:dealerId/service-center
   */
  updateServiceCenter: async (
    dealerId: number,
    payload: UpdateServiceCenterPayload
  ): Promise<ServiceCenterResponse> => {
    const response = await apiClient.patch<ServiceCenterResponse>(
      `/serviceCenter/admin/dealers/${dealerId}/service-center`,
      payload
    );
    return response.data;
  },

  /**
   * Admin: Delete service center for a dealer
   * DELETE /serviceCenter/admin/dealers/:dealerId/service-center
   */
  deleteServiceCenter: async (dealerId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/serviceCenter/admin/dealers/${dealerId}/service-center`
    );
    return response.data;
  },
};
