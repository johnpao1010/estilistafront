import api from '../../api/axios';

export interface Employee {
  id: string; // UUID as string
  first_name: string; // matches API response
  last_name: string; // matches API response
  email: string;
  phone?: string;
  role: string; // role field from users API
  is_active: boolean; // matches API response
  created_at: string; // matches API response
  updated_at: string; // matches API response
  deleted_at?: string | null; // matches API response
  deletedAt?: string | null; // additional field
}

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  isActive?: boolean;
}

export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await api.get('/users/by-role?role=employee');
    
    if (!response.data?.data?.users) {
      throw new Error('Invalid API response structure');
    }
    
    return response.data.data.users;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

export const getEmployeeById = async (id: string): Promise<Employee> => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching employee with id ${id}:`, error);
    throw error;
  }
};

export const createEmployee = async (data: CreateEmployeeData): Promise<Employee> => {
  try {
    const response = await api.post('/users', data);
    return response.data;
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

export const updateEmployee = async (id: string, data: UpdateEmployeeData): Promise<Employee> => {
  try {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating employee with id ${id}:`, error);
    throw error;
  }
};

export const deleteEmployee = async (id: string): Promise<void> => {
  try {
    await api.delete(`/users/${id}`);
  } catch (error) {
    console.error(`Error deleting employee with id ${id}:`, error);
    throw error;
  }
};
