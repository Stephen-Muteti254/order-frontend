import api from './api';
import { Product, PaginatedResponse } from '@/types';

export interface ProductFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const productsApi = {
  getProducts: async (filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> => {
    const res = await api.get('/products', { params: filters });
    return res.data;
  },

  createProduct: async (payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await api.post('/products', payload);
    return res.data;
  },

  updateProduct: async (id: string | number, payload: Partial<Omit<Product, 'id'>>) => {
    const res = await api.put(`/products/${id}`, payload);
    return res.data;
  },

  deleteProduct: async (id: string | number) => {
    await api.delete(`/products/${id}`);
  },
};
