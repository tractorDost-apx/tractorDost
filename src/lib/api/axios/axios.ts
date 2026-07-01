import axios, { AxiosError, AxiosResponse } from 'axios';
// import { siteConfig } from "@/config/site";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  withCredentials: true, // for httpOnly JWT cookies
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await apiClient.post('/auth/refresh');
      return apiClient(error.config!);
    }
    return Promise.reject(error);
  }
);
