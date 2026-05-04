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
    console.log('Attempting login with credentials:', credentials);
    const response = await api.post('/auth/login', credentials);
    
    console.log('Raw login response:', response);
    
    if (!response) {
      throw new Error('No response from server');
    }
    
    // Handle different response structures
    let responseData = response.data;
    
    // If the response is nested under a 'data' property
    if (responseData && responseData.data) {
      responseData = responseData.data;
    }
    
    console.log('Processed login response data:', responseData);
    
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
    
    console.log('Login successful, user:', user.email);
    
    // Create the auth response with the expected format
    const authResponse: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        role: user.role || 'user',
        phone: user.phone
      }
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
    console.log('=== REGISTER REQUEST ===', userData);
    const response = await api.post<AuthResponse>('/auth/register', userData);
    
    console.log('=== REGISTER RAW RESPONSE ===', response);
    console.log('=== REGISTER RESPONSE DATA ===', response.data);
    
    if (!response.data) {
      console.error('No response data received');
      throw new Error('No response from server');
    }
    
    // Handle different response structures like login does
    let responseData: any = response.data;
    
    // If the response is nested under a 'data' property
    if (responseData && (responseData as any).data) {
      responseData = (responseData as any).data;
      console.log('=== REGISTER NESTED RESPONSE DATA ===', responseData);
    }
    
    // Check for token in different possible locations
    const token = (responseData as any).token || (responseData as any).access_token || (responseData as any).accessToken;
    const user = (responseData as any).user || (responseData as any).data?.user;
    
    console.log('=== REGISTER EXTRACTED TOKEN ===', token);
    console.log('=== REGISTER EXTRACTED USER ===', user);
    
    if (token && user) {
      // Store token and user data
      setToken(token);
      setUser(user);
      
      // Set default authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, user };
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
