import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { authStorage } from '../../features/auth/authStorage';

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export const http = axios.create({
  baseURL,
});

http.interceptors.request.use((config) => {
  const auth = authStorage.get();
  if (auth?.tokens?.accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${auth.tokens.accessToken}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    const requestUrl = originalRequest?.url ?? '';
    const isAuthEndpoint = requestUrl.includes('/api/auth/');

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      authStorage.clear();
      return Promise.reject(error);
    }

    const auth = authStorage.get();
    if (!auth?.tokens?.refreshToken) {
      authStorage.clear();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = http
        .post('/api/auth/refresh-token', { refreshToken: auth.tokens.refreshToken })
        .then((res) => {
          const data = res.data?.data;
          const newAccessToken: string | undefined = data?.tokens?.accessToken;
          const newRefreshToken: string | undefined = data?.tokens?.refreshToken;

          if (!newAccessToken || !newRefreshToken) {
            return null;
          }

          authStorage.set({
            user: data.user,
            tokens: {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
              expiresIn: data?.tokens?.expiresIn,
              tokenType: data?.tokens?.tokenType,
            },
          });

          return newAccessToken;
        })
        .catch(() => {
          authStorage.clear();
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const newAccessToken = await refreshPromise;

    if (!newAccessToken) {
      authStorage.clear();
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

    return http.request(originalRequest);
  }
);
