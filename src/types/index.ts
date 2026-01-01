export interface Client {
  id: string;
  clientId: string;
  clientName: string;
  institution: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  productId: string;
  name: string;
  pricePerUnit: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderId: string;
  clientId: string;
  productId: string;
  orderClass: string;
  week: string;
  genre: string;
  pagesOrSlides: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  product?: Product;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client?: Client;
  orders: Order[];
  totalAmount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  clientId?: string;
  productId?: string;
}
