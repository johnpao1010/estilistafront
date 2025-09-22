import api from '../../api/axios';
import { setToken, setUser } from '../../utils/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { token, user } = response.data;
    
    // Store token and user data
    setToken(token);
    setUser(user);
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    const { token, user } = response.data;
    
    // Store token and user data
    setToken(token);
    setUser(user);
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<AuthResponse['user']> => {
  try {
    const response = await api.get<AuthResponse>('/auth/me');
    return response.data.user;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    throw error;
  }
};

export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Si tu backend tiene un endpoint para logout, puedes descomentar la siguiente línea
    // await api.post('/auth/logout');
    
    // Limpiar el token y los datos del usuario del almacenamiento local
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
    // Asegurarse de limpiar el almacenamiento local incluso si hay un error
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    throw error;
  }
};
