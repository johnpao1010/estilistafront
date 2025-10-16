import api from '../api/axios';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  last_login: string;
}

export interface ApiResponse<T> {
  status: string;
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  data: T;
}

export interface UsersResponse {
  users: User[];
}

export interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  is_active?: boolean;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  is_active?: boolean;
}

export const userService = {
  // Get all users
  async getUsers(): Promise<User[]> {
    const response = await api.get<ApiResponse<UsersResponse>>('/users');
    return response.data.data.users;
  },

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>(`/users/${id}`);
    return response.data.data.user;
  },

  // Create a new user
  async createUser(userData: CreateUserData): Promise<User> {
    const response = await api.post<ApiResponse<{ user: User }>>('/users', userData);
    return response.data.data.user;
  },

  // Update a user
  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const response = await api.put<ApiResponse<{ user: User }>>(`/users/${id}`, userData);
    return response.data.data.user;
  },

  // Delete a user
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }
};
