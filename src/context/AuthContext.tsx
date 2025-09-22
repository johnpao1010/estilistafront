import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { login as loginService, register as registerService, getCurrentUser, logout as logoutService, updatePassword as updatePasswordService } from '../services/auth/auth.service';
import type { User } from '../services/user/user.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check if user is logged in on initial load
  const { isLoading: isLoadingUser } = useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<User | null> => {
      try {
        const userData = await getCurrentUser();
        // Map the auth user to the full User type with defaults
        const user: User = {
          ...userData,
          isActive: true, // Set default value if not provided
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return user;
      } catch (error) {
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Update user state when query completes
  useEffect(() => {
    if (!isLoadingUser) {
      const fetchUser = async () => {
        try {
          const userData = await queryClient.fetchQuery<User | null>({
            queryKey: ['currentUser'],
            queryFn: async (): Promise<User | null> => {
              try {
                const data = await getCurrentUser();
                return {
                  ...data,
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
              } catch (error) {
                return null;
              }
            }
          });
          setUser(userData);
        } catch (error) {
          setUser(null);
        }
      };
      fetchUser();
    }
  }, [isLoadingUser, queryClient]);

  useEffect(() => {
    if (!isLoadingUser) {
      setIsLoading(false);
    }
  }, [isLoadingUser]);

  const login = async (email: string, password: string) => {
    try {
      const { user: userData } = await loginService({ email, password });
      // Map the auth user to the full User type with defaults
      const user: User = {
        ...userData,
        isActive: true, // Set default value if not provided
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUser(user);
      // The token is already set in the axios interceptor
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (registerData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    try {
      const { user: userData } = await registerService(registerData);
      // Map the auth user to the full User type with defaults
      const user: User = {
        ...userData,
        isActive: true, // Set default value if not provided
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUser(user);
      // The token is already set in the axios interceptor
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    logoutService();
    setUser(null);
    queryClient.clear();
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await updatePasswordService(currentPassword, newPassword);
    } catch (error) {
      console.error('Failed to update password:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updatePassword,
  };

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
