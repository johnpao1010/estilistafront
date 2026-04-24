import api from '../../api/axios';

export interface Service {
  id: string; // UUID as string
  name: string;
  description?: string;
  duration: number; // in minutes
  price: string; // price as string from API
  is_active: boolean; // matches API response
  created_at: string; // matches API response
  updated_at: string; // matches API response
  deleted_at?: string | null; // matches API response
}

export interface CreateServiceData {
  name: string;
  description?: string;
  duration: number;
  price: number;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  isActive?: boolean;
}

export const getAllServices = async (): Promise<Service[]> => {
  try {
    const response = await api.get('/services');
    
    if (!response.data || !response.data.data || !response.data.data.services) {
      throw new Error('Invalid API response structure');
    }
    
    return response.data.data.services;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const getServiceById = async (id: number): Promise<Service> => {
  try {
    const response = await api.get<Service>(`/services/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching service with id ${id}:`, error);
    throw error;
  }
};

export const createService = async (data: CreateServiceData): Promise<Service> => {
  try {
    const response = await api.post<Service>('/services', data);
    return response.data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

export const updateService = async (id: number, data: UpdateServiceData): Promise<Service> => {
  try {
    const response = await api.put<Service>(`/services/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating service with id ${id}:`, error);
    throw error;
  }
};

export const deleteService = async (id: number): Promise<void> => {
  try {
    await api.delete(`/services/${id}`);
  } catch (error) {
    console.error(`Error deleting service with id ${id}:`, error);
    throw error;
  }
};
