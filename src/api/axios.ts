import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { getToken, removeToken } from '../utils/auth';
import { config } from '../config/environments';

const API_BASE_URL = config.apiUrl;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
try {
  api.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If unauthorized and not already retried
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Clear auth data and redirect to login
        removeToken();
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }
  );
} catch (error) {
  console.error('Error setting up axios interceptors:', error);
}

export default api;
