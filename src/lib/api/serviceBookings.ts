import { apiClient } from './axios/axios';

export type ServiceBookingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

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
  serviceCenterId?: number;
  dealerId?: number;
  serviceCenterName: string;
  dealerName: string;
  tractorBrand: string;
  tractorModel: string;
  serviceType: string;
  preferredDate: string;
  status: ServiceBookingStatus;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string | null;
  createdAt: string;
}

export interface AdminServiceBookingItem {
  bookingId: number;
  name: string;
  mobile: string;
  tractorBrand: string;
  tractorModel: string;
  serviceType: string;
  preferredDate: string;
  status: ServiceBookingStatus;
  notes?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  address?: string | null;
  createdAt: string;
}

export interface AdminServiceBookingDetail {
  bookingId: number;
  serviceCenterId: number;
  serviceCenterName: string;
  dealerId: number;
  dealerName: string;
  userId?: number | null;
  name: string;
  mobile: string;
  tractorBrand: string;
  tractorModel: string;
  serviceType: string;
  description: string;
  preferredDate: string;
  status: ServiceBookingStatus;
  notes?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminServiceBookingsResponse {
  success: boolean;
  message: string;
  data: {
    serviceCenterId: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
    };
    filters: { status: string | null };
    bookings: AdminServiceBookingItem[];
  };
}

export interface AdminServiceBookingDetailResponse {
  success: boolean;
  message: string;
  data: AdminServiceBookingDetail;
}

export interface UpdateBookingStatusPayload {
  status: ServiceBookingStatus;
  notes?: string;
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

  /**
   * Admin/Dealer: Get service bookings for a service center
   * GET /serviceBooking/admin/service-centers/:serviceCenterId/bookings
   */
  getAdminBookings: async (
    serviceCenterId: number,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      sortBy?: string;
    }
  ): Promise<AdminServiceBookingsResponse> => {
    const response = await apiClient.get<AdminServiceBookingsResponse>(
      `/serviceBooking/admin/service-centers/${serviceCenterId}/bookings`,
      { params }
    );
    return response.data;
  },

  /**
   * Admin/Dealer: Get single service booking detail
   * GET /serviceBooking/admin/service-centers/:serviceCenterId/bookings/:bookingId
   */
  getAdminBookingDetail: async (
    serviceCenterId: number,
    bookingId: number
  ): Promise<AdminServiceBookingDetailResponse> => {
    const response = await apiClient.get<AdminServiceBookingDetailResponse>(
      `/serviceBooking/admin/service-centers/${serviceCenterId}/bookings/${bookingId}`
    );
    return response.data;
  },

  /**
   * Admin/Dealer: Update status and notes of a service booking
   * PATCH /serviceBooking/admin/service-centers/:serviceCenterId/bookings/:bookingId
   */
  updateBookingStatus: async (
    serviceCenterId: number,
    bookingId: number,
    payload: UpdateBookingStatusPayload
  ): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await apiClient.patch(
      `/serviceBooking/admin/service-centers/${serviceCenterId}/bookings/${bookingId}`,
      payload
    );
    return response.data;
  },

  /**
   * Admin/Dealer: Cancel a service booking
   * DELETE /serviceBooking/admin/service-centers/:serviceCenterId/bookings/:bookingId
   */
  cancelBooking: async (
    serviceCenterId: number,
    bookingId: number,
    cancellationReason?: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(
      `/serviceBooking/admin/service-centers/${serviceCenterId}/bookings/${bookingId}`,
      { data: { cancellationReason } }
    );
    return response.data;
  },
};

