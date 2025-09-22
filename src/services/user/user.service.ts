import api from '../../api/axios';

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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  role?: string;
  active?: boolean;
  search?: string;
}

export const getAllUsers = async (params: UserQueryParams = {}): Promise<PaginatedResponse<User>> => {
  try {
    const response = await api.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id: number): Promise<User> => {
  try {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    throw error;
  }
};

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export const updateUser = async (id: number, userData: UpdateUserData): Promise<User> => {
  try {
    const response = await api.put<User>(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await api.delete(`/users/${id}`);
  } catch (error) {
    console.error(`Error deleting user with id ${id}:`, error);
    throw error;
  }
};

export const deactivateUser = async (id: number): Promise<void> => {
  try {
    await api.put(`/users/${id}/deactivate`);
  } catch (error) {
    console.error(`Error deactivating user with id ${id}:`, error);
    throw error;
  }
};

export const reactivateUser = async (id: number): Promise<void> => {
  try {
    await api.put(`/users/${id}/reactivate`);
  } catch (error) {
    console.error(`Error reactivating user with id ${id}:`, error);
    throw error;
  }
};
