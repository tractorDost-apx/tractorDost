import { apiClient } from './axios/axios';

export interface CreateServiceBookingPayload {
  name: string;
  mobile: string;
  tractorBrand: string;
  tractorModel: string;
  serviceType: string;
  description: string;
  preferredDate: string; // ISO date string
  address: string;
  latitude: number;
  longitude: number;
  notes?: string;
}

export interface ServiceBookingItem {
  bookingId: number;
  serviceCenterName: string;
  dealerName: string;
  tractorBrand: string;
  tractorModel: string;
  serviceType: string;
  preferredDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string | null;
  createdAt: string;
}

export interface MyServiceBookingsResponse {
  success: boolean;
  message: string;
  data: {
    userId: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
    };
    filters: { status: string | null };
    bookings: ServiceBookingItem[];
  };
}

export const serviceBookingAPI = {
  /**
   * Create a service/repair booking for a specific service center
   * POST /serviceBooking/service-centers/:serviceCenterId/bookings
   */
  createBooking: async (
    serviceCenterId: number,
    payload: CreateServiceBookingPayload
  ): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await apiClient.post(
      `/serviceBooking/service-centers/${serviceCenterId}/bookings`,
      payload
    );
    return response.data;
  },

  /**
   * Customer: Get my service bookings
   * GET /serviceBooking/dashboard/my-service-bookings
   */
  getMyBookings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
  }): Promise<MyServiceBookingsResponse> => {
    const response = await apiClient.get<MyServiceBookingsResponse>(
      `/serviceBooking/dashboard/my-service-bookings`,
      { params }
    );
    return response.data;
  },
};
