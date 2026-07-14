import axios, { AxiosError, AxiosResponse } from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  withCredentials: true,
});

// Add a request interceptor to attach the Bearer token from cookies
apiClient.interceptors.request.use(
  (config) => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      const accessTokenCookie = cookies.find(c => c.trim().startsWith('accessToken='));
      if (accessTokenCookie) {
        const token = accessTokenCookie.trim().substring('accessToken='.length);
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // If 401 Unauthorized, dispatch logout event
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);
