'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useApi } from '@/hooks/useApi';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função auxiliar para normalizar o role
function normalizeRole(role: string): 'admin' | 'user' {
  const normalizedRole = role.toLowerCase();
  return normalizedRole === 'admin' ? 'admin' : 'user';
}

function decodeJwt(token: string): {
  email: string;
  sub: number;
  name: string;
  role: 'admin' | 'user';
} | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );
    const rawParsed = JSON.parse(jsonPayload) as {
      email: string;
      sub: number;
      name: string;
      role: string;
    };

    // Normaliza o role antes de retornar
    const parsed = {
      ...rawParsed,
      role: normalizeRole(rawParsed.role),
    };
    return parsed;
  } catch (e) {
    console.error('Erro ao decodificar JWT:', e);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pegando apenas o 'post' do seu hook
  const { post } = useApi({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData) as User;
          setUser(parsedUser);
        } catch (error) {
          console.error('Erro ao parsear dados do usuário:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // ETAPA 1: Obter o token
      const loginResponse = await post<{ access_token: string }>(
        '/api/auth/login',
        {
          email,
          password,
        },
      );
      const { access_token } = loginResponse.data;

      if (!access_token) {
        console.error('API de login não retornou um access_token');
        return false;
      }

      // Salva o token imediatamente
      localStorage.setItem('auth_token', access_token);

      // ETAPA 2: Decodificar o token para obter dados do usuário
      const decodedPayload = decodeJwt(access_token);

      if (
        !decodedPayload ||
        !decodedPayload.sub ||
        !decodedPayload.email ||
        !decodedPayload.name ||
        !decodedPayload.role
      ) {
        console.error(
          'Payload do JWT inválido ou não contém as informações necessárias',
        );
        localStorage.removeItem('auth_token'); // Limpa token inválido
        return false;
      }
      const partialUser: User = {
        id: decodedPayload.sub.toString(),
        email: decodedPayload.email,
        name: decodedPayload.name,
        role: decodedPayload.role,
      };

      setUser(partialUser);
      localStorage.setItem('user_data', JSON.stringify(partialUser));
      localStorage.setItem('authenticated', 'true');

      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      // Limpa o token se qualquer etapa falhar
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);

    try {
      // Endpoint suposto: /api/auth/forgot-password
      await post('/api/auth/forgot-password', { email });
      console.log('Solicitação de recuperação enviada para:', email);
      return true;
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      return true; // Mantendo a lógica de segurança
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('authenticated');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    forgotPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
