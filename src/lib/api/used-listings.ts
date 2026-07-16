import { apiClient } from './axios/axios';
import { ConditionGrade, ListingStatus, UrgencyLevel, UsedTractorListing } from './usedTractors';

export const usedTractorListingAPI = {
  // Public & Authenticated Endpoints
  getAllListings: async (params?: any) => {
    try {
      const response = await apiClient.get('/used-listings/getAll', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch used listings',
      };
    }
  },

  getListingById: async (id: number | string) => {
    try {
      const response = await apiClient.get(`/used-listings/get/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch listing details',
      };
    }
  },

  createListing: async (data: Partial<UsedTractorListing>) => {
    try {
      const response = await apiClient.post('/used-listings/create', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create listing',
      };
    }
  },

  updateListing: async (id: number | string, data: Partial<UsedTractorListing>) => {
    try {
      const response = await apiClient.patch(`/used-listings/update/${id}`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update listing',
      };
    }
  },

  deleteListing: async (id: number | string) => {
    try {
      const response = await apiClient.delete(`/used-listings/delete/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete listing',
      };
    }
  },

  // Admin Endpoints
  adminUpdateListingStatus: async (
    id: number | string,
    data: {
      listingStatus?: ListingStatus;
      isCertified?: boolean;
      boostType?: string;
      featuredUntil?: string;
      rejectionReason?: string;
    }
  ) => {
    try {
      const response = await apiClient.patch(`/used-listings/${id}/admin`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update listing status',
      };
    }
  },

  // Enquiry (Leads) Endpoints
  getListingEnquiries: async (listingId: number | string) => {
    try {
      const response = await apiClient.get(`/used-tractor-enquiries/getAllEnquiries`, {
        params: { listingId },
      });
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch leads' };
    }
  },

  // Documents Endpoints
  getListingDocuments: async (listingId: number | string) => {
    try {
      const response = await apiClient.get(`/used-tractor-documents/getAllDocuments`, {
        params: { listingId },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch documents',
      };
    }
  },
};
