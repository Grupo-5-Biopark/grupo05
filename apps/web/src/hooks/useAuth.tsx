'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer' | 'editor';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const users = [
        {
          email: 'admin@biopark.com',
          password: '123456',
          user: {
            id: '1',
            name: 'Administrador BIOPARK',
            email: 'admin@biopark.com',
            role: 'admin' as const,
          },
        },
        {
          email: 'viewer@biopark.com',
          password: '123456',
          user: {
            id: '2',
            name: 'Visualizador BIOPARK',
            email: 'viewer@biopark.com',
            role: 'viewer' as const,
          },
        },
        {
          email: 'editor@biopark.com',
          password: '123456',
          user: {
            id: '3',
            name: 'Editor BIOPARK',
            email: 'editor@biopark.com',
            role: 'editor' as const,
          },
        },
      ];

      const foundUser = users.find(
        (u) => u.email === email && u.password === password,
      );

      if (foundUser) {
        const mockToken = 'biopark_jwt_token_' + Date.now();

        setUser(foundUser.user);
        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('user_data', JSON.stringify(foundUser.user));
        localStorage.setItem('authenticated', 'true');

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const registeredEmails = [
        'admin@biopark.com',
        'viewer@biopark.com',
        'editor@biopark.com',
      ];

      if (registeredEmails.includes(email)) {
        console.log('Email de recuperação enviado para:', email);
        return true;
      } else {
        console.log(
          'Email não encontrado, mas retornando true por segurança:',
          email,
        );
        return true;
      }
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      return false;
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
