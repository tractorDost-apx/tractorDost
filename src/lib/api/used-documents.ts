import { apiClient } from './axios/axios';

export const usedTractorDocumentAPI = {
  uploadDocument: async (formData: FormData) => {
    try {
      const response = await apiClient.post('/used-tractor-documents/uploadTractorDocs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to upload document' };
    }
  },

  getAllDocuments: async (params?: any) => {
    try {
      const response = await apiClient.get('/used-tractor-documents/getAllTractorDocs', { params });
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch documents' };
    }
  },

  getDocumentById: async (id: number | string) => {
    try {
      const response = await apiClient.get(`/used-tractor-documents/getTractorDocs/${id}`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch document details' };
    }
  },

  verifyDocument: async (id: number | string, status: string, rejectionReason?: string) => {
    try {
      const response = await apiClient.patch(`/used-tractor-documents/verifyTractorDocs/${id}`, { status, rejectionReason });
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to verify document' };
    }
  },

  deleteDocument: async (id: number | string) => {
    try {
      const response = await apiClient.delete(`/used-tractor-documents/deleteTractorDocs/${id}`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete document' };
    }
  }
};
