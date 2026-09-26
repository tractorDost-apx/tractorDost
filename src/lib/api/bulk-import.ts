import type { AxiosProgressEvent } from 'axios';
import { apiClient } from './axios/axios';
import type { BulkImportResponse, ImportProgress, ImportReport } from '@/types/api/bulk-import';

export const uploadPercent = (cb?: (percent: number) => void) => (e: AxiosProgressEvent) => {
  if (cb && e.total) cb(Math.round((e.loaded / e.total) * 100));
};

/** The three calls of the two-step Excel import, as used by useBulkImport. */
export interface BulkImportApi<R extends ImportReport = ImportReport> {
  /** Step 1 — test the file. Read-only on the server; a passed report carries the previewToken step 2 requires. */
  preview: (
    file: File,
    options?: { signal?: AbortSignal; onUploadProgress?: (percent: number) => void },
  ) => Promise<BulkImportResponse<R>>;
  /** Step 2 — insert a file that passed step 1 (all-or-nothing). importId makes progress pollable. */
  commit: (
    file: File,
    options: { previewToken: string; importId?: string; onUploadProgress?: (percent: number) => void },
  ) => Promise<BulkImportResponse<R>>;
  progress: (importId: string, signal?: AbortSignal) => Promise<{ success: boolean; data: ImportProgress }>;
}

/** Builds the client for an import mounted at `${base}/preview`, `${base}` and `${base}/progress/:importId`. */
export function createBulkImportApi<R extends ImportReport = ImportReport>(base: string): BulkImportApi<R> {
  return {
    preview: async (file, options = {}) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post<BulkImportResponse<R>>(`${base}/preview`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: options.signal,
        onUploadProgress: uploadPercent(options.onUploadProgress),
      });
      return response.data;
    },
    commit: async (file, options) => {
      const formData = new FormData();
      // Fields before the file, so the server has them when the upload is parsed.
      formData.append('previewToken', options.previewToken);
      if (options.importId) formData.append('importId', options.importId);
      formData.append('file', file);
      const response = await apiClient.post<BulkImportResponse<R>>(base, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: uploadPercent(options.onUploadProgress),
      });
      return response.data;
    },
    progress: async (importId, signal) => {
      const response = await apiClient.get<{ success: boolean; data: ImportProgress }>(`${base}/progress/${importId}`, { signal });
      return response.data;
    },
  };
}
