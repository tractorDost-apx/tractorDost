import { apiClient } from './axios/axios';
import { toErrorResult, toResult } from './axios/result';
import type { ApiResult } from '@/types/api/responses';
import type { InspectionStatus, MetaPage, UsedInspection } from '@/types/models/used-listing';

export interface InspectionListParams {
  listingId?: number;
  status?: InspectionStatus;
  inspectorId?: number;
  isCertified?: 'true' | 'false';
  page?: number;
  limit?: number;
}

/**
 * Inspection responses embed the listing as stored (askingPrice arrives as a
 * string there), so the nested listing is left loosely typed for callers.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InspectionWithListing = UsedInspection & { listing: any };

export const usedTractorInspectionAPI = {
  /** Admin only. Listings get a PENDING inspection automatically on creation. */
  createInspection: async (data: {
    listingId: number;
    inspectorId?: number;
  }): Promise<ApiResult<UsedInspection>> => {
    try {
      const response = await apiClient.post('/used-tractor-inspections/createInspection', data);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to create inspection request');
    }
  },

  /** Staff only; agents always get just their own assignments */
  getAllInspections: async (
    params?: InspectionListParams
  ): Promise<ApiResult<MetaPage<InspectionWithListing>>> => {
    try {
      const response = await apiClient.get('/used-tractor-inspections/getAllInspections', {
        params,
      });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch inspections');
    }
  },

  getInspectionById: async (id: number | string): Promise<ApiResult<InspectionWithListing>> => {
    try {
      const response = await apiClient.get(`/used-tractor-inspections/getInspection/${id}`);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to fetch inspection details');
    }
  },

  /** Admin only; the inspection must be PENDING */
  assignInspector: async (
    id: number | string,
    inspectorId: number
  ): Promise<ApiResult<UsedInspection>> => {
    try {
      const response = await apiClient.patch(`/used-tractor-inspections/assignInspector/${id}`, {
        inspectorId,
      });
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to assign inspector');
    }
  },

  /** FormData: engineScore, tyreScore, hydraulicsScore, bodyScore, clutchScore, inspectorNotes?, report? (file) */
  submitInspectionReport: async (
    id: number | string,
    formData: FormData
  ): Promise<ApiResult<UsedInspection>> => {
    try {
      const response = await apiClient.patch(
        `/used-tractor-inspections/submitInspectionReport/${id}`,
        formData
      );
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to submit inspection report');
    }
  },

  /** Admin only; the inspection must be REPORT_UPLOADED. Also marks the listing certified. */
  certifyInspection: async (id: number | string): Promise<ApiResult<UsedInspection>> => {
    try {
      const response = await apiClient.patch(`/used-tractor-inspections/certifyInspection/${id}`);
      return toResult(response);
    } catch (error) {
      return toErrorResult(error, 'Failed to certify tractor');
    }
  },
};
