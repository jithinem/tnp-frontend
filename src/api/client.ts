import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string | null> | null = null;

export const setAuthToken = (token?: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

const clearAuthState = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  setAuthToken(undefined);

  const isAdminRoute = window.location.pathname.startsWith('/admin');
  window.location.assign(isAdminRoute ? '/admin/login' : '/login');
};

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await api.post('/auth/refresh-token');
    const newAccessToken = response?.data?.data?.accessToken ?? null;

    if (!newAccessToken) {
      clearAuthState();
      return null;
    }

    localStorage.setItem('accessToken', newAccessToken);
    setAuthToken(newAccessToken);

    return newAccessToken;
  } catch {
    clearAuthState();
    return null;
  }
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { __retry?: boolean; __retryWithRefresh?: boolean }) | undefined;
    const status = error.response?.status;
    const url = String(original?.url ?? '');

    if (!status || !original || url.includes('/auth/refresh-token')) {
      return Promise.reject(error);
    }

    if (status === 401 && !original.__retryWithRefresh) {
      original.__retryWithRefresh = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken()
          .catch(() => {
            clearAuthState();
            return null;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        const newAccessToken = await refreshPromise;
        if (!newAccessToken) {
          clearAuthState();
          return Promise.reject(error);
        }

        if (original.headers) {
          original.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(original);
      } catch {
        clearAuthState();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
