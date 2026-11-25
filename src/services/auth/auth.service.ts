import api from '../../api/axios';
import { setToken, setUser, removeToken, removeUser, removeBusinessId } from '../../utils/auth';

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
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
  };
}

interface ApiUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  phone?: string;
}

const mapUser = (user: ApiUser): AuthResponse['user'] => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName || user.first_name || '',
  lastName: user.lastName || user.last_name || '',
  role: user.role || 'user',
  phone: user.phone,
});

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    if (!response) {
      throw new Error('No response from server');
    }
    
    // Handle different response structures
    let responseData = response.data;
    
    // If the response is nested under a 'data' property
    if (responseData && responseData.data) {
      responseData = responseData.data;
    }
    
    if (!responseData) {
      console.error('No data in response:', response);
      throw new Error('No data in server response');
    }
    
    // Check for token in different possible locations
    const token = responseData.token || responseData.access_token || responseData.accessToken;
    const user = responseData.user || responseData.data?.user;
    
    if (!token || !user) {
      console.error('Missing token or user in response:', responseData);
      throw new Error('Invalid response format: missing token or user data');
    }
    
    // Create the auth response with the expected format
    const authResponse: AuthResponse = {
      token,
      user: mapUser(user),
    };
    
    // Store token and user data
    setToken(authResponse.token);
    setUser(authResponse.user);
    
    // Set default authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${authResponse.token}`;
    
    return authResponse;
  } catch (error: any) {
    console.error('Login error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    
    let errorMessage = 'Error during login';
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        errorMessage = 'Credenciales inválidas';
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = `Error del servidor (${error.response.status})`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No se pudo conectar con el servidor';
    }
    
    throw new Error(errorMessage);
  }
};

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    
    if (!response.data) {
      throw new Error('No response from server');
    }
    
    // Handle different response structures like login does
    let responseData: any = response.data;
    
    // If the response is nested under a 'data' property
    if (responseData && (responseData as any).data) {
      responseData = (responseData as any).data;
    }
    
    // Check for token in different possible locations
    const token = (responseData as any).token || (responseData as any).access_token || (responseData as any).accessToken;
    const user = (responseData as any).user || (responseData as any).data?.user;
    
    if (token && user) {
      // Store token and user data
      const mappedUser = mapUser(user);
      setToken(token);
      setUser(mappedUser);
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, user: mappedUser };
    }
    
    console.error('Missing token or user in registration response:', responseData);
    throw new Error('Invalid response from server - missing token or user data');
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<AuthResponse['user']> => {
  try {
    const response = await api.get('/auth/me');
    const user = response.data?.data?.user ?? response.data?.user;
    if (!user) {
      throw new Error('Invalid response format: missing user data');
    }
    return mapUser(user);
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    throw error;
  }
};

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

const getApiErrorMessage = (error: any, fallback: string): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.request && !error.response) {
    return 'No se pudo conectar con el servidor';
  }
  return fallback;
};

export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return {
      message:
        response.data?.message
        || 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.',
    };
  } catch (error: any) {
    console.error('Forgot password error:', error);
    throw new Error(getApiErrorMessage(error, 'No se pudo enviar el enlace de recuperación'));
  }
};

export const resetPassword = async (data: ResetPasswordData): Promise<void> => {
  try {
    await api.post('/auth/reset-password', data);
  } catch (error: any) {
    console.error('Reset password error:', error);
    throw new Error(getApiErrorMessage(error, 'No se pudo actualizar la contraseña'));
  }
};

export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    await api.patch('/auth/update-password', { currentPassword, newPassword });
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
    removeToken();
    removeUser();
    removeBusinessId();
  } catch (error) {
    console.error('Logout error:', error);
    // Asegurarse de limpiar el almacenamiento local incluso si hay un error
    removeToken();
    removeUser();
    removeBusinessId();
    throw error;
  }
};
