import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getCurrentUser, login, logout, register } from '../services/auth/auth.service';
import type { AuthResponse } from '../services/auth/auth.service';
import { getToken } from '../utils/auth';

type User = AuthResponse['user'];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  refetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<AuthResponse>;
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
    } catch (err: any) {
      console.error('Error fetching current user:', err);
      
      // Don't set error for 401 (unauthorized) - this is expected when not logged in
      if (err.response?.status !== 401) {
        setError('Error al obtener información del usuario');
      }
      
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

  const handleRegister = async (userData: any): Promise<AuthResponse> => {
    try {
      setError(null);
      const authResponse = await register(userData);
      setUser(authResponse.user);
      return authResponse;
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || 'Error al registrarse');
      throw err;
    }
  };

  useEffect(() => {
    // Only fetch current user if token exists
    const token = getToken();
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isLoading: loading,
    error,
    refetchUser: fetchCurrentUser,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
