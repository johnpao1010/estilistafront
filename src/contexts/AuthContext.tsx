import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getCurrentUser, login, logout } from '../services/auth/auth.service';
import type { AuthResponse } from '../services/auth/auth.service';

type User = AuthResponse['user'];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  refetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      console.log('=== CURRENT USER ===', currentUser);
    } catch (err) {
      console.error('Error fetching current user:', err);
      setError('Error al obtener información del usuario');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setError(null);
      const authResponse = await login({ email, password });
      setUser(authResponse.user);
      return authResponse;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      setUser(null);
      setError(null);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Error al cerrar sesión');
      throw err;
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isLoading: loading,
    error,
    refetchUser: fetchCurrentUser,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
