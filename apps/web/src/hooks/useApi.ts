'use client';

import { useState, useCallback, useRef } from 'react';
import { STORAGE_KEYS, API_ENDPOINTS } from '@/constants';
import { logger } from '@/utils/logger';
import { RefreshTokenResponse } from '@/types';

interface ApiConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  onUnauthorized?: () => void; // Callback for 401 responses
}

interface ApiResponsePayload {
  message?: string;
  [key: string]: any;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// Global flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  for (const callback of refreshSubscribers) {
    callback(token);
  }
  refreshSubscribers = [];
}

export function useApi(config?: ApiConfig) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRefreshingRef = useRef(false);

  const baseURL = config?.baseURL || process.env.NEXT_PUBLIC_API_URL || '/api';
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...config?.headers,
  };

  /**
   * Attempt to refresh the access token using the refresh token cookie
   */
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      logger.auth('Attempting to refresh access token');

      const response = await fetch(`${baseURL}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HttpOnly cookies
      });

      if (!response.ok) {
        throw new Error('Refresh token is invalid or expired');
      }

      const { access_token, expires_in } =
        (await response.json()) as RefreshTokenResponse;

      if (!access_token) {
        throw new Error('No access token in refresh response');
      }

      // Update tokens in localStorage
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access_token);

      if (expires_in) {
        const expiryTime = Date.now() + expires_in * 1000;
        localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
      }

      logger.auth('Access token refreshed successfully');
      return access_token;
    } catch (error) {
      logger.error('Failed to refresh access token:', error);
      return null;
    }
  };

  /**
   * Clear all authentication data and redirect to login
   */
  const clearAuthAndRedirect = () => {
    logger.auth('Clearing auth data and redirecting to login');

    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.AUTHENTICATED);

    if (globalThis.window !== undefined) {
      sessionStorage.setItem('session_expired', 'true');
      globalThis.window.dispatchEvent(new Event('auth-cleared'));
    }

    if (config?.onUnauthorized) {
      config.onUnauthorized();
    }
  };

  const makeRequest = useCallback(
    async <T = any>(
      endpoint: string,
      options: RequestInit = {},
      isRetry = false,
    ): Promise<ApiResponse<T>> => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        const response = await fetch(`${baseURL}${endpoint}`, {
          ...options,
          credentials: 'include',
          headers: {
            ...defaultHeaders,
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
          },
        });

        // Handle 401 after retry - give up
        if (response.status === 401 && isRetry) {
          clearAuthAndRedirect();
          throw new Error(
            'Sua sessão expirou. Você será redirecionado para o login.',
          );
        }

        // Handle 401 first time - attempt refresh
        if (response.status === 401) {
          logger.auth('401 Unauthorized - attempting token refresh', {
            endpoint,
          });

          // Wait if another request is already refreshing
          if (isRefreshing) {
            logger.auth('Waiting for ongoing refresh to complete');
            return new Promise((resolve, reject) => {
              subscribeTokenRefresh(() => {
                makeRequest<T>(endpoint, options, true).then(resolve, reject);
              });
            });
          }

          // Perform the refresh
          isRefreshing = true;
          isRefreshingRef.current = true;

          const newToken = await refreshAccessToken();

          if (newToken) {
            onTokenRefreshed(newToken);
            isRefreshing = false;
            isRefreshingRef.current = false;
            logger.auth('Retrying original request with new token');
            return await makeRequest<T>(endpoint, options, true);
          }

          // Refresh failed
          isRefreshing = false;
          isRefreshingRef.current = false;
          clearAuthAndRedirect();
          throw new Error(
            'Sua sessão expirou. Você será redirecionado para o login.',
          );
        }

        // Some responses (204 No Content) have an empty body and calling
        // response.json() will throw. Handle that gracefully by attempting
        // to parse JSON only when present.
        let data: ApiResponsePayload | null = null;
        try {
          // Only try to parse JSON when content-type indicates JSON
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            data = (await response.json()) as ApiResponsePayload;
          } else {
            // No JSON body
            data = null;
          }
        } catch {
          // Failed to parse JSON — treat as no body
          data = null;
        }

        if (!response.ok) {
          const message =
            (data && data.message) || `HTTP error! status: ${response.status}`;
          throw new Error(message);
        }

        return {
          data: data as unknown as T,
          status: response.status,
          message: data?.message,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [baseURL, defaultHeaders, config],
  );

  const get = useCallback(
    <T = any>(endpoint: string) => makeRequest<T>(endpoint, { method: 'GET' }),
    [makeRequest],
  );

  const post = useCallback(
    <T = any>(endpoint: string, data?: any) =>
      makeRequest<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    [makeRequest],
  );

  const put = useCallback(
    <T = any>(endpoint: string, data?: any) =>
      makeRequest<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    [makeRequest],
  );

  const del = useCallback(
    <T = any>(endpoint: string) =>
      makeRequest<T>(endpoint, { method: 'DELETE' }),
    [makeRequest],
  );

  return {
    isLoading,
    error,
    get,
    post,
    put,
    delete: del,
    makeRequest,
  };
}
