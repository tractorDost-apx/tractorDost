import { apiClient } from './axios/axios';
import { toErrorResult, toResult } from './axios/result';
import type { ApiResult } from '@/types/api/responses';
import type { DocType, MetaPage, UsedDocument } from '@/types/models/used-listing';

export interface DocumentListParams {
  listingId?: number;
  docType?: DocType;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

export const usedTractorDocumentAPI = {
  /**
   * multipart/form-data with fields: document (file), listingId, docType.
   * Allowed for the listing's seller, admins and the assigned inspector.
   * JPEG, PNG or PDF, max 5MB.
   */
  uploadDocument: async (formData: FormData): Promise<ApiResult<UsedDocument>> => {
    try {
      const response = await apiClient.post('/used-tractor-documents/uploadTractorDocs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to upload document');
    }
  },

  /** Staff see all documents; sellers must pass a listingId they own */
  getAllDocuments: async (
    params?: DocumentListParams
  ): Promise<ApiResult<MetaPage<UsedDocument>>> => {
    try {
      const response = await apiClient.get('/used-tractor-documents/getAllTractorDocs', { params });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch documents');
    }
  },

  /** Public tractor photos of a live listing (never RC/insurance/NOC) */
  getPublicDocuments: async (listingId: number | string): Promise<ApiResult<UsedDocument[]>> => {
    try {
      const response = await apiClient.get(
        `/used-tractor-documents/getPublicTractorDocs/${listingId}`
      );
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch photos');
    }
  },

  getDocumentById: async (id: number | string): Promise<ApiResult<UsedDocument>> => {
    try {
      const response = await apiClient.get(`/used-tractor-documents/getTractorDocs/${id}`);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch document details');
    }
  },

  /** Owner only: re-classify a document */
  updateDocumentType: async (
    id: number | string,
    docType: DocType
  ): Promise<ApiResult<UsedDocument>> => {
    try {
      const response = await apiClient.patch(`/used-tractor-documents/updateTractorDocs/${id}`, {
        docType,
      });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to update document');
    }
  },

  /** Admin only: stamps verifiedAt (the backend has no reject action) */
  verifyDocument: async (id: number | string): Promise<ApiResult<UsedDocument>> => {
    try {
      const response = await apiClient.patch(`/used-tractor-documents/verifyTractorDocs/${id}`);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to verify document');
    }
  },

  /** Owner only; the backend answers 204 No Content */
  deleteDocument: async (id: number | string): Promise<ApiResult<null>> => {
    try {
      const response = await apiClient.delete(`/used-tractor-documents/deleteTractorDocs/${id}`);
      return toResult(response, 'Document deleted');
    } catch (error) {
      return toErrorResult(error, 'Failed to delete document');
    }
  },
};
