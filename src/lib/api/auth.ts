import { apiClient } from './axios/axios';
import { User } from '@/types/models/user';

export const authAPI = {
  requestOtp: async (mobile: string) => {
    // mobile must be a number as per backend schema (min 1000000000)
    const response = await apiClient.post('/auth/login', { mobile: Number(mobile) });
    const token = response.data?.data?.mtToken || response.data?.mtToken;
    if (token && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('mtToken', token);
      } catch (_) {}
    }
    return response.data;
  },

  /** Alias for requestOtp accepting either string or object */
  sendOtp: async (param: string | { mobile: string }) => {
    const mobile = typeof param === 'string' ? param : param.mobile;
    return authAPI.requestOtp(mobile);
  },

  verifyOtp: async (param: string | { otp: string; mobile?: string }) => {
    const otp = typeof param === 'string' ? param : param.otp;
    let mtToken: string | undefined;
    if (typeof window !== 'undefined') {
      try {
        mtToken = sessionStorage.getItem('mtToken') || undefined;
      } catch (_) {}
    }
    const response = await apiClient.post('/auth/verify-otp', { otp, mtToken });
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('mtToken');
      } catch (_) {}
    }
    return response.data;
  },

  refresh: async () => {
    const response = await apiClient.post('/auth/refresh');
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

    // Clear any client-accessible cookies and localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('accessToken');
      } catch (_) {}
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    return Promise.resolve();
  },
};
