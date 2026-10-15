import { apiClient } from './axios/axios';
import { toErrorResult, toResult } from './axios/result';
import type { ApiResult } from '@/types/api/responses';
import type {
  CreateEnquiryInput,
  LeadNote,
  LeadStatus,
  MetaPage,
  UsedEnquiry,
} from '@/types/models/used-listing';

export interface EnquiryListParams {
  listingId?: number;
  status?: LeadStatus;
  page?: number;
  limit?: number;
}

export interface AdminEnquiryListParams extends EnquiryListParams {
  mobile?: string;
  buyerId?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'name' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export const usedTractorEnquiryAPI = {
  /** Sent as JSON: the backend validates listingId as a number */
  createEnquiry: async (data: CreateEnquiryInput): Promise<ApiResult<UsedEnquiry>> => {
    try {
      const response = await apiClient.post('/used-tractor-enquiries/createEnquiry', data);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to submit enquiry');
    }
  },

  getAllEnquiries: async (
    params?: AdminEnquiryListParams
  ): Promise<ApiResult<MetaPage<UsedEnquiry>>> => {
    try {
      const response = await apiClient.get('/used-tractor-enquiries/getAllEnquiries', { params });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch enquiries');
    }
  },

  /** Enquiries the logged-in buyer has sent */
  getMyEnquiries: async (
    params?: Omit<EnquiryListParams, 'listingId'>
  ): Promise<ApiResult<MetaPage<UsedEnquiry>>> => {
    try {
      const response = await apiClient.get('/used-tractor-enquiries/getMyEnquiries', { params });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch your enquiries');
    }
  },

  /** Enquiries received on the logged-in seller's listings */
  getMyListingEnquiries: async (
    params?: EnquiryListParams
  ): Promise<ApiResult<MetaPage<UsedEnquiry>>> => {
    try {
      const response = await apiClient.get('/used-tractor-enquiries/getMyListingEnquiries', {
        params,
      });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch enquiries for your listings');
    }
  },

  getEnquiryById: async (id: number | string): Promise<ApiResult<UsedEnquiry>> => {
    try {
      const response = await apiClient.get(`/used-tractor-enquiries/getEnquiry/${id}`);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch enquiry details');
    }
  },

  /** Staff, or the seller who owns the listing */
  updateEnquiryStatus: async (
    id: number | string,
    status: LeadStatus
  ): Promise<ApiResult<UsedEnquiry>> => {
    try {
      const response = await apiClient.patch(`/used-tractor-enquiries/updateEnquiryStatus/${id}`, {
        status,
      });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to update enquiry status');
    }
  },

  /** Admin only; the backend answers 204 No Content */
  deleteEnquiry: async (id: number | string): Promise<ApiResult<null>> => {
    try {
      const response = await apiClient.delete(`/used-tractor-enquiries/deleteEnquiry/${id}`);
      return toResult(response, 'Enquiry deleted');
    } catch (error) {
      return toErrorResult(error, 'Failed to delete enquiry');
    }
  },

  /** Notes on a CRM lead, newest first */
  getLeadNotes: async (params: {
    leadId?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResult<MetaPage<LeadNote>>> => {
    try {
      const response = await apiClient.get('/used-tractor-enquiries/getAllLeadNote', { params });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch lead notes');
    }
  },

  createLeadNote: async (leadId: number, noteText: string): Promise<ApiResult<LeadNote>> => {
    try {
      const response = await apiClient.post('/used-tractor-enquiries/createLeadNote', {
        leadId,
        noteText,
      });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to add note');
    }
  },

  getLeadNoteById: async (id: number | string): Promise<ApiResult<LeadNote>> => {
    try {
      const response = await apiClient.get(`/used-tractor-enquiries/getLeadNote/${id}`);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch lead note');
    }
  },

  updateLeadNote: async (id: number, noteText: string): Promise<ApiResult<LeadNote>> => {
    try {
      const response = await apiClient.patch(`/used-tractor-enquiries/updateLeadNote/${id}`, {
        noteText,
      });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to update note');
    }
  },
};
