import { apiClient } from './axios/axios';
import { User } from '@/types/models/user';

export const authAPI = {
  requestOtp: async (mobile: string) => {
    // mobile must be a number as per backend schema (min 1000000000)
    const response = await apiClient.post('/auth/login', { mobile: Number(mobile) });
    return response.data;
  },

  verifyOtp: async (otp: string) => {
    const response = await apiClient.post('/auth/verify-otp', { otp });
    return response.data;
  },

  getMe: async (): Promise<{ success: boolean; data: User | null }> => {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return { success: false, data: null };
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error('Failed to logout from backend', error.message);
      }
    }
    
    // Clear any client-accessible cookies just in case
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    return Promise.resolve();
  }
};
