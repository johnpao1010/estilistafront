import api from '../../api/axios';

export interface Appointment {
  id: number;
  userId: number;
  serviceId: number;
  service?: Service;
  user?: User;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string; // UUID as string
  name: string;
  description?: string;
  duration: number; // in minutes
  price: string; // price as string from API
  is_active: boolean; // matches API response
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AppointmentQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  status?: string;
  userId?: number;
  serviceId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface CreateAppointmentData {
  serviceId: string; // UUID as string
  employeeId: string; // UUID as string
  appointmentDate: string;
  startTime: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  appointmentDate?: string;
  startTime?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export const createAppointment = async (data: CreateAppointmentData): Promise<Appointment> => {
  try {
    const response = await api.post<Appointment>('/appointments', data);
    return response.data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const getAllAppointments = async (params: AppointmentQueryParams = {}): Promise<PaginatedResponse<Appointment>> => {
  try {
    const response = await api.get<PaginatedResponse<Appointment>>('/appointments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const getAppointmentById = async (id: number): Promise<Appointment> => {
  try {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching appointment with id ${id}:`, error);
    throw error;
  }
};

export const updateAppointment = async (id: number, data: UpdateAppointmentData): Promise<Appointment> => {
  try {
    const response = await api.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating appointment with id ${id}:`, error);
    throw error;
  }
};

export const cancelAppointment = async (id: number): Promise<void> => {
  try {
    await api.put(`/appointments/${id}/cancel`);
  } catch (error) {
    console.error(`Error cancelling appointment with id ${id}:`, error);
    throw error;
  }
};

export const getAvailableSlots = async (serviceId: number, date: string): Promise<TimeSlot[]> => {
  try {
    const response = await api.get<TimeSlot[]>(`/appointments/available-slots`, {
      params: { serviceId, date },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    throw error;
  }
};
