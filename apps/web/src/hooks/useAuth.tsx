'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants';
import type { User, LoginResponse, JWTPayload } from '@/types';
import { normalizeRole, decodeJwt } from '@/utils/helpers';
import { logger } from '@/utils/logger';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { post } = useApi({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      const tokenExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

      if (token && userData) {
        // Check if token is expired
        if (tokenExpiry) {
          const expiryTime = Number.parseInt(tokenExpiry, 10);
          const currentTime = Date.now();

          if (currentTime >= expiryTime) {
            logger.auth('Token expired, clearing auth data');
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
            localStorage.removeItem(STORAGE_KEYS.AUTHENTICATED);
            setUser(null);
            setIsLoading(false);
            return;
          }
        }

        try {
          const parsedUser = JSON.parse(userData) as User;
          setUser(parsedUser);
          logger.auth('User restored from localStorage', {
            userId: parsedUser.id,
          });
        } catch (error) {
          logger.error('Error parsing user data:', error);
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
          localStorage.removeItem(STORAGE_KEYS.AUTHENTICATED);
          setUser(null);
        }
      } else {
        // No auth data, ensure user is null
        setUser(null);
      }

      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (e.g., when another tab logs out or token is cleared)
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === STORAGE_KEYS.AUTH_TOKEN ||
        e.key === STORAGE_KEYS.USER_DATA
      ) {
        if (e.newValue) {
          // Auth data was added/updated, re-check
          checkAuth();
        } else {
          // Auth data was removed
          logger.auth('Auth data removed, logging out');
          setUser(null);
        }
      }
    };

    // Listen for custom event when auth is cleared by 401 handler
    const handleAuthCleared = () => {
      logger.auth('Auth cleared event received - redirecting to login');
      setUser(null);

      // Redirect to login page after clearing auth
      if (globalThis.window !== undefined) {
        // Small delay to ensure state is updated
        setTimeout(() => {
          globalThis.window.location.href = '/login';
        }, 100);
      }
    };

    globalThis.window.addEventListener('storage', handleStorageChange);
    globalThis.window.addEventListener('auth-cleared', handleAuthCleared);

    return () => {
      globalThis.window.removeEventListener('storage', handleStorageChange);
      globalThis.window.removeEventListener('auth-cleared', handleAuthCleared);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    logger.auth('Login attempt', { email });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${API_ENDPOINTS.AUTH.LOGIN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include', // Include HttpOnly cookies
        },
      );

      if (!response.ok) {
        logger.error('Login API returned error');
        return false;
      }

      const { access_token, expires_in } =
        (await response.json()) as LoginResponse;

      if (!access_token) {
        logger.error('Login API did not return access token');
        return false;
      }

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access_token);

      // Store token expiration time (current time + expires_in seconds)
      // Default to 1 hour (3600 seconds) if not provided
      const expiresInSeconds = expires_in || 3600;
      const expiryTime = Date.now() + expiresInSeconds * 1000;
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());

      logger.info('Token will expire at', {
        expiryTime: new Date(expiryTime).toISOString(),
        expiresInSeconds,
      });

      const decodedPayload = decodeJwt<JWTPayload>(access_token);

      if (
        !decodedPayload?.sub ||
        !decodedPayload?.email ||
        !decodedPayload?.name ||
        !decodedPayload?.role
      ) {
        logger.error('Invalid JWT payload or missing required information');
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
        return false;
      }

      const authenticatedUser: User = {
        id: decodedPayload.sub.toString(),
        email: decodedPayload.email,
        name: decodedPayload.name,
        role: normalizeRole(decodedPayload.role),
      };

      setUser(authenticatedUser);
      localStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(authenticatedUser),
      );
      localStorage.setItem(STORAGE_KEYS.AUTHENTICATED, 'true');

      logger.auth('Login successful', {
        userId: authenticatedUser.id,
        role: authenticatedUser.role,
      });

      return true;
    } catch (error) {
      logger.error('Login error:', error);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(
    async (email: string) => {
      setIsLoading(true);
      logger.auth('Forgot password request', { email });

      try {
        await post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
        logger.auth('Password recovery request sent', { email });
      } catch (error) {
        logger.error('Forgot password error:', error);
      } finally {
        setIsLoading(false);
      }
      return true;
    },
    [post],
  );

  const logout = useCallback(async () => {
    logger.auth('User logout', { userId: user?.id });

    // Call backend to revoke refresh token
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${API_ENDPOINTS.AUTH.LOGOUT}`,
        {
          method: 'POST',
          credentials: 'include', // Send HttpOnly cookie
        },
      );
    } catch (error) {
      logger.error('Logout API error (non-critical):', error);
      // Continue with local cleanup even if API fails
    }

    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.AUTHENTICATED);
  }, [user?.id]);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      forgotPassword,
      logout,
    }),
    [user, isLoading, login, forgotPassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
