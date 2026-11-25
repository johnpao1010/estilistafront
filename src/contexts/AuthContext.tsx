import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getCurrentUser, login, logout, register } from '../services/auth/auth.service';
import type { AuthResponse } from '../services/auth/auth.service';
import { getBusinessId, getToken, removeBusinessId, setBusinessId } from '../utils/auth';
import { getAllBusinesses, getMyBusinesses, type Business } from '../services/business/business.service';

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
  businesses: Business[];
  currentBusiness: Business | null;
  selectBusiness: (businessId: string) => void;
  isBusinessAdmin: boolean;
  isEmployee: boolean;
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
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);

  const selectBusiness = (businessId: string) => {
    const business = businesses.find((item) => item.id === businessId);
    if (business) {
      setCurrentBusiness(business);
      setBusinessId(business.id);
    }
  };

  // Platform admins can manage every business; everyone else sees their memberships
  const loadBusinesses = async (currentUser: User | null) => {
    if (!currentUser) {
      setBusinesses([]);
      setCurrentBusiness(null);
      return;
    }
    try {
      const mine = await getMyBusinesses();
      let list = mine;
      if (currentUser.role === 'admin') {
        const all = await getAllBusinesses();
        const mineIds = new Set(mine.map((business) => business.id));
        list = [...mine, ...all.filter((business) => !mineIds.has(business.id)).map((business) => ({ ...business, role: 'admin' as const }))];
      }
      const stored = getBusinessId();
      const selected = list.find((business) => business.id === stored) ?? list[0] ?? null;
      setBusinesses(list);
      setCurrentBusiness(selected);
      if (selected) setBusinessId(selected.id);
      else removeBusinessId();
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setBusinesses([]);
      setCurrentBusiness(null);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = await getCurrentUser();
      await loadBusinesses(currentUser);
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
      await loadBusinesses(authResponse.user);
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
      setBusinesses([]);
      setCurrentBusiness(null);
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
      await loadBusinesses(authResponse.user);
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

  const isBusinessAdmin =
    user?.role === 'admin' || currentBusiness?.role === 'owner' || currentBusiness?.role === 'admin';

  const value: AuthContextType = {
    user,
    loading,
    isLoading: loading,
    error,
    refetchUser: fetchCurrentUser,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    businesses,
    currentBusiness,
    selectBusiness,
    isBusinessAdmin,
    isEmployee: !isBusinessAdmin && (user?.role === 'employee' || currentBusiness?.role === 'employee'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
