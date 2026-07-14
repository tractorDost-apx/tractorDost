import { apiClient } from './axios/axios';

export interface EnquiryData {
  tractorId?: number;
  listingId?: number;
  enquiryType: string;
  name: string;
  mobile: string;
  email?: string;
  message?: string;
  offerPrice?: number;
}

export const usedTractorEnquiryAPI = {
  createEnquiry: async (data: EnquiryData) => {
    try {
      const response = await apiClient.post('/used-tractor-enquiries/createEnquiry', data);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to submit enquiry' };
    }
  },

  getAllEnquiries: async (params?: any) => {
    try {
      const response = await apiClient.get('/used-tractor-enquiries/getAllEnquiries', { params });
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch enquiries' };
    }
  },

  getMyEnquiries: async () => {
    try {
      const response = await apiClient.get('/used-tractor-enquiries/getMyEnquiries');
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch your enquiries' };
    }
  },

  getMyListingEnquiries: async () => {
    try {
      const response = await apiClient.get('/used-tractor-enquiries/getMyListingEnquiries');
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch enquiries for your listings' };
    }
  },

  getEnquiryById: async (id: number | string) => {
    try {
      const response = await apiClient.get(`/used-tractor-enquiries/getEnquiry/${id}`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch enquiry details' };
    }
  },

  updateEnquiryStatus: async (id: number | string, status: string, notes?: string) => {
    try {
      const response = await apiClient.patch(`/used-tractor-enquiries/updateEnquiryStatus/${id}`, { status, notes });
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to update enquiry status' };
    }
  },
  
  deleteEnquiry: async (id: number | string) => {
    try {
      const response = await apiClient.delete(`/used-tractor-enquiries/deleteEnquiry/${id}`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete enquiry' };
    }
  }
};
