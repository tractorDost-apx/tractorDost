import { apiClient } from './axios/axios';
import { toErrorResult, toResult } from './axios/result';
import type { ApiResult } from '@/types/api/responses';
import type {
  AdminListingUpdate,
  CreateListingInput,
  ListingFilters,
  ListingPage,
  ListingStatus,
  MetaPage,
  UsedDocument,
  UsedEnquiry,
  UsedTractorListing,
} from '@/types/models/used-listing';

export const usedTractorListingAPI = {
  /** Public browse; staff also see non-ACTIVE listings */
  getAllListings: async (
    params?: ListingFilters
  ): Promise<ApiResult<ListingPage<UsedTractorListing>>> => {
    try {
      const response = await apiClient.get('/used-listings/getAll', { params });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch used listings');
    }
  },

  getListingById: async (id: number | string): Promise<ApiResult<UsedTractorListing>> => {
    try {
      const response = await apiClient.get(`/used-listings/get/${id}`);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch listing details');
    }
  },

  /** Logged-in seller's own listings, every status */
  getMyListings: async (params?: {
    listingStatus?: ListingStatus;
    page?: number;
    limit?: number;
  }): Promise<ApiResult<ListingPage<UsedTractorListing>>> => {
    try {
      const response = await apiClient.get('/used-listings/my', { params });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch your listings');
    }
  },

  /** Listing details cannot be edited after this call; photos go through the documents API */
  createListing: async (data: CreateListingInput): Promise<ApiResult<UsedTractorListing>> => {
    try {
      const response = await apiClient.post('/used-listings/create', data);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to create listing');
    }
  },

  /** Owner/admin visibility switch: false hides a live listing, true re-publishes it */
  setListingActive: async (
    id: number | string,
    isActive: boolean
  ): Promise<ApiResult<UsedTractorListing>> => {
    try {
      const response = await apiClient.patch(`/used-listings/${id}/active`, { isActive });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to update listing visibility');
    }
  },

  /** Soft delete: the listing moves to EXPIRED */
  deleteListing: async (id: number | string): Promise<ApiResult<null>> => {
    try {
      const response = await apiClient.delete(`/used-listings/delete/${id}`);
      return toResult(response, 'Listing deleted');
    } catch (error) {
      return toErrorResult(error, 'Failed to delete listing');
    }
  },

  // Admin Endpoints
  adminUpdateListingStatus: async (
    id: number | string,
    data: AdminListingUpdate
  ): Promise<ApiResult<UsedTractorListing>> => {
    try {
      const response = await apiClient.patch(`/used-listings/${id}/admin`, data);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to update listing status');
    }
  },

  // Enquiry (Leads) Endpoints — staff view of one listing's enquiries
  getListingEnquiries: async (
    listingId: number | string
  ): Promise<ApiResult<MetaPage<UsedEnquiry>>> => {
    try {
      const response = await apiClient.get('/used-tractor-enquiries/getAllEnquiries', {
        params: { listingId },
      });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch leads');
    }
  },

  // Documents Endpoints
  getListingDocuments: async (
    listingId: number | string
  ): Promise<ApiResult<MetaPage<UsedDocument>>> => {
    try {
      const response = await apiClient.get('/used-tractor-documents/getAllTractorDocs', {
        params: { listingId, limit: 50 },
      });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch documents');
    }
  },
};
