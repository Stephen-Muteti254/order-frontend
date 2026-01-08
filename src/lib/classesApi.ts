import api from '@/lib/api';

export interface Class {
  id: string;
  name: string;
}

export interface ClassFilters {
  page: number;
  page_size: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

export const classesApi = {
  getClasses: async (
    filters: ClassFilters
  ): Promise<PaginatedResponse<Class>> => {
    const res = await api.get('/classes', { params: filters });
    return res.data;
  },

  createClass: async (payload: { name: string }) => {
    const res = await api.post('/classes', payload);
    return res.data as Class;
  },

  updateClass: async (id: string, payload: { name: string }) => {
    const res = await api.put(`/classes/${id}`, payload);
    return res.data as Class;
  },

  deleteClass: async (id: string) => {
    await api.delete(`/classes/${id}`);
  },
};
