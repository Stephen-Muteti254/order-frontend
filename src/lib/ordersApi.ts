// lib/ordersApi.ts
import api from './api';
import { Order, PaginatedResponse, Client, Product } from '@/types';

export interface OrderFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  clientId?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
}

export const ordersApi = {
  getOrders: async (filters: OrderFilters = {}): Promise<PaginatedResponse<Order>> => {
    const res = await api.get('/orders', { params: filters });
    return res.data;
  },

  createOrder: async (payload: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await api.post('/orders', payload);
    return res.data;
  },

  updateOrder: async (id: string | number, payload: Partial<Omit<Order, 'id'>>) => {
    const res = await api.put(`/orders/${id}`, payload);
    return res.data;
  },

  deleteOrder: async (id: string | number) => {
    await api.delete(`/orders/${id}`);
  },

  getAllClients: async () => {
    const res = await api.get('/clients');
    return res.data as Client[];
  },

  getAllProducts: async () => {
    const res = await api.get('/products');
    return res.data as Product[];
  },

  // --- Classes ---
  getClasses: async () => {
    const res = await api.get('/meta/classes');
    return res.data as { id: string; name: string }[];
  },

  addClass: async (payload: { name: string }) => {
    const res = await api.post('/meta/classes', payload);
    return res.data as { id: string; name: string };
  },

  // --- Genres ---
  getGenres: async () => {
    const res = await api.get('/meta/genres');
    return res.data as { id: string; name: string }[];
  },

  addGenre: async (payload: { name: string }) => {
    const res = await api.post('/meta/genres', payload);
    return res.data as { id: string; name: string };
  },
};
