import api from '@/lib/api';
import { Client } from '@/types';

export interface ClientFilters {
  page: number;
  page_size: number;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

export const clientsApi = {
  getClients: async (
    filters: ClientFilters
  ): Promise<PaginatedResponse<Client>> => {
    const res = await api.get('/clients', { params: filters });
    return res.data;
  },

  createClient: async (payload: Omit<Client, 'id'>) => {
    const res = await api.post('/clients', payload);
    return res.data;
  },

  updateClient: async (id: number, payload: Omit<Client, 'id'>) => {
    const res = await api.put(`/clients/${id}`, payload);
    return res.data;
  },

  deleteClient: async (id: number) => {
    await api.delete(`/clients/${id}`);
  },
};
