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
    // Clear cookies client-side since accessToken is not httpOnly
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    return Promise.resolve();
  }
};
