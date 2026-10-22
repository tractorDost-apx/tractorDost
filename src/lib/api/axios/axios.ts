import axios, { AxiosError, AxiosResponse } from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  withCredentials: true,
});

// Add a request interceptor to attach the Bearer token from cookies or localStorage
apiClient.interceptors.request.use(
  (config) => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      let token: string | null = null;
      const cookies = document.cookie.split(';');
      const accessTokenCookie = cookies.find((c) => c.trim().startsWith('accessToken='));
      if (accessTokenCookie) {
        token = accessTokenCookie.trim().substring('accessToken='.length);
      }
      if (!token) {
        try {
          token = localStorage.getItem('accessToken');
        } catch (_) {}
      }
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise: Promise<boolean> | null = null;

// Bypasses apiClient (and its own interceptors) so a failed refresh can never recurse.
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const res = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
    if (res.data?.data?.accessToken && typeof window !== 'undefined') {
      try {
        localStorage.setItem('accessToken', res.data.data.accessToken);
        document.cookie = `accessToken=${res.data.data.accessToken}; path=/; max-age=900; SameSite=Lax`;
      } catch (_) {}
    }
    return true;
  } catch {
    return false;
  }
};

apiClient.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const url = originalRequest?.url || '';
    // These endpoints 401 for reasons unrelated to an expired access token
    // (bad credentials, or the refresh endpoint itself) — never retry them.
    const skipRefresh =
      url.includes('/auth/login') ||
      url.includes('/auth/verify-otp') ||
      url.includes('/auth/refresh');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !skipRefresh
    ) {
      originalRequest._retry = true;

      // Coalesce concurrent 401s into a single refresh call
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const refreshed = await refreshPromise;

      if (refreshed) {
        return apiClient(originalRequest);
      }
    }

    // No refresh possible (or already retried once) — session is genuinely gone.
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);
