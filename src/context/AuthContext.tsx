import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { login as loginService, register as registerService, getCurrentUser, logout as logoutService, updatePassword as updatePasswordService, type AuthResponse } from '../services/auth/auth.service';
import { getToken, removeToken, setUser as setStoredUser, removeUser } from '../utils/auth';
import api from '../api/axios';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<AuthResponse>;
  logout: () => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check if user is logged in on initial load
  const { data: userData } = useQuery<AuthResponse['user'] | null>({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<AuthResponse['user'] | null> => {
      // Only try to get user if we have a token
      const token = getToken();
      if (!token) return null;
      
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          // Update the auth header with the stored token
          const token = getToken();
          if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
          return currentUser;
        }
        return null;
      } catch (error) {
        console.error('Error getting current user:', error);
        removeToken();
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update user state when userData changes
  useEffect(() => {
    if (userData) {
      const user: User = {
        ...userData,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUser(user);
      setStoredUser(user);
      setUser(null);
    }
    setIsLoading(false);
  }, [userData]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('AuthContext: Attempting login with:', { email });
      const response = await loginService({ email, password });
      
      if (!response || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      console.log('AuthContext: Login successful, user:', response.user.email);
      
      // Update user state
      const userData = {
        ...response.user,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setUser(userData);
      setStoredUser(userData);
      
      // Invalidate queries to refresh any cached data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      return response;
    } catch (error: any) {
      console.error('AuthContext: Login failed:', error);
      // Clear any partial auth state on error
      setUser(null);
      removeUser();
      throw error; // Re-throw to be handled by the component
    }
  }, [queryClient]);

  const register = useCallback(async (registerData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthResponse> => {
    try {
      console.log('AuthContext: Attempting registration with:', { email: registerData.email });
      const response = await registerService(registerData);
      
      if (!response || !response.user || !response.token) {
        throw new Error('Invalid response from server');
      }
      
      console.log('AuthContext: Registration successful, user:', response.user.email);
      
      // Update user state
      const userData = {
        ...response.user,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setUser(userData);
      setStoredUser(userData);
      
      // Invalidate queries to refresh any cached data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      return response;
    } catch (error: any) {
      console.error('AuthContext: Registration failed:', error);
      // Clear any partial auth state on error
      setUser(null);
      removeUser();
      throw error; // Re-throw to be handled by the component
    }
  }, [queryClient]);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
    removeUser();
    queryClient.clear();
  }, [queryClient]);

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await updatePasswordService(currentPassword, newPassword);
    } catch (error) {
      console.error('Failed to update password:', error);
      throw error;
    }
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updatePassword,
  }), [user, isLoading, login, register, logout, updatePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
