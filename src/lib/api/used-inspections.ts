import { apiClient } from './axios/axios';

export const usedTractorInspectionAPI = {
  createInspection: async (data: any) => {
    try {
      const response = await apiClient.post('/used-tractor-inspections/createInspection', data);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to create inspection request' };
    }
  },

  getAllInspections: async (params?: any) => {
    try {
      const response = await apiClient.get('/used-tractor-inspections/getAllInspections', { params });
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch inspections' };
    }
  },

  getInspectionById: async (id: number | string) => {
    try {
      const response = await apiClient.get(`/used-tractor-inspections/getInspection/${id}`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch inspection details' };
    }
  },

  assignInspector: async (id: number | string, inspectorId: number) => {
    try {
      const response = await apiClient.patch(`/used-tractor-inspections/assignInspector/${id}`, { inspectorId });
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to assign inspector' };
    }
  },

  submitInspectionReport: async (id: number | string, formData: FormData) => {
    try {
      const response = await apiClient.patch(`/used-tractor-inspections/submitInspectionReport/${id}`, formData);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to submit inspection report' };
    }
  },
  
  certifyInspection: async (id: number | string, isCertified: boolean) => {
    try {
      const response = await apiClient.patch(`/used-tractor-inspections/certifyInspection/${id}`, { isCertified });
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to certify tractor' };
    }
  }
};
