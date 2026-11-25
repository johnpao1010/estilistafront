import api from '../../api/axios';

export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  service?: Service;
  user?: User;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
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
  id: string;
  first_name: string;
  last_name: string;
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
  userId?: string;
  serviceId?: string;
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
  serviceId?: string;
  employeeId?: string;
  appointmentDate?: string;
  startTime?: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
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

// Obtener agenda del empleado
export const getEmployeeSchedule = async (employeeId: string, startDate?: string, endDate?: string): Promise<Appointment[]> => {
  try {
    const params = new URLSearchParams();
    params.append('employee_id', employeeId);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/appointments/employee?${params}`);
    return response.data.data.appointments || [];
  } catch (error) {
    console.error('Error fetching employee schedule:', error);
    throw error;
  }
};

export const getAllAppointments = async (params: AppointmentQueryParams = {}): Promise<PaginatedResponse<Appointment>> => {
  try {
    const response = await api.get('/appointments', { params });
    
    // Handle nested response structure like employee endpoint
    if (response.data && response.data.data && response.data.data.appointments) {
      return {
        data: response.data.data.appointments,
        total: response.data.results || response.data.data.appointments.length,
        page: 1,
        limit: response.data.data.appointments.length,
        totalPages: 1
      };
    }
    
    // Handle direct PaginatedResponse structure
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const getAppointmentById = async (id: string): Promise<Appointment> => {
  try {
    const response = await api.get(`/appointments/${id}`);
    return response.data?.data?.appointment ?? response.data;
  } catch (error) {
    console.error(`Error fetching appointment with id ${id}:`, error);
    throw error;
  }
};

export const updateAppointment = async (id: string, data: UpdateAppointmentData): Promise<Appointment> => {
  try {
    const response = await api.patch(`/appointments/${id}`, {
      service_id: data.serviceId,
      employee_id: data.employeeId,
      appointment_date: data.appointmentDate,
      start_time: data.startTime,
      status: data.status,
      notes: data.notes,
    });
    return response.data?.data?.appointment ?? response.data;
  } catch (error) {
    console.error(`Error updating appointment with id ${id}:`, error);
    throw error;
  }
};

export const cancelAppointment = async (id: string): Promise<void> => {
  try {
    await api.delete(`/appointments/${id}/cancel`);
  } catch (error) {
    console.error(`Error cancelling appointment with id ${id}:`, error);
    throw error;
  }
};

export const getAvailableSlots = async (serviceId: string, date: string, employeeId?: string): Promise<TimeSlot[]> => {
  try {
    const response = await api.get(`/appointments/available-slots`, {
      params: { service_id: serviceId, employee_id: employeeId, date },
    });
    return response.data?.data?.available_slots ?? [];
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    throw error;
  }
};
