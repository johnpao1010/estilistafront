import api from '../../api/axios';

export type BusinessRole = 'owner' | 'admin' | 'employee';

export interface Business {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logo_url?: string | null;
  timezone: string;
  opening_time: string;
  closing_time: string;
  role?: BusinessRole;
}

export const getMyBusinesses = async (): Promise<Business[]> => {
  const response = await api.get('/businesses/mine');
  return response.data?.data?.businesses ?? [];
};

export const getAllBusinesses = async (): Promise<Business[]> => {
  const response = await api.get('/businesses');
  return response.data?.data?.businesses ?? [];
};
