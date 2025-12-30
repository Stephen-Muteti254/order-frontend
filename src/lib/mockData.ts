import { Client, Product, Order, PaginatedResponse, FilterParams } from '@/types';

// Mock data generators
const generateClients = (count: number): Client[] => {
  const institutions = ['Harvard University', 'MIT', 'Stanford', 'Yale', 'Princeton', 'Columbia', 'Oxford', 'Cambridge'];
  return Array.from({ length: count }, (_, i) => ({
    id: `client-${i + 1}`,
    clientId: `CLT-${String(i + 1).padStart(4, '0')}`,
    clientName: `Client ${i + 1}`,
    institution: institutions[i % institutions.length],
    phone: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    email: `client${i + 1}@example.com`,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};

const generateProducts = (count: number): Product[] => {
  const products = [
    { name: 'Essay', price: 15 },
    { name: 'Research Paper', price: 20 },
    { name: 'Thesis Chapter', price: 25 },
    { name: 'Dissertation', price: 30 },
    { name: 'PowerPoint Presentation', price: 10 },
    { name: 'Poster', price: 50 },
    { name: 'Case Study', price: 18 },
    { name: 'Lab Report', price: 12 },
  ];
  return products.slice(0, count).map((p, i) => ({
    id: `product-${i + 1}`,
    productId: `PRD-${String(i + 1).padStart(4, '0')}`,
    name: p.name,
    pricePerUnit: p.price,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};

const mockClients = generateClients(50);
const mockProducts = generateProducts(8);

const generateOrders = (count: number): Order[] => {
  const classes = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'PhD'];
  const genres = ['Academic', 'Technical', 'Creative', 'Business', 'Scientific'];
  return Array.from({ length: count }, (_, i) => {
    const client = mockClients[i % mockClients.length];
    const product = mockProducts[i % mockProducts.length];
    const pages = Math.floor(Math.random() * 20) + 1;
    return {
      id: `order-${i + 1}`,
      orderId: `ORD-${String(i + 1).padStart(5, '0')}`,
      clientId: client.id,
      productId: product.id,
      orderClass: classes[i % classes.length],
      week: `Week ${Math.floor(Math.random() * 52) + 1}`,
      genre: genres[i % genres.length],
      pagesOrSlides: pages,
      totalCost: product.pricePerUnit * pages,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      client,
      product,
    };
  });
};

const mockOrders = generateOrders(100);

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Filter and paginate helper
function filterAndPaginate<T extends { createdAt: string }>(
  data: T[],
  params: FilterParams,
  searchFields: (keyof T)[]
): PaginatedResponse<T> {
  let filtered = [...data];

  // Search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && value.toLowerCase().includes(searchLower);
      })
    );
  }

  // Date filters
  if (params.startDate) {
    filtered = filtered.filter(item => new Date(item.createdAt) >= new Date(params.startDate!));
  }
  if (params.endDate) {
    filtered = filtered.filter(item => new Date(item.createdAt) <= new Date(params.endDate!));
  }

  // Sorting
  if (params.sortBy) {
    filtered.sort((a, b) => {
      const aVal = a[params.sortBy as keyof T];
      const bVal = b[params.sortBy as keyof T];
      const comparison = String(aVal).localeCompare(String(bVal));
      return params.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // Pagination
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const start = (page - 1) * pageSize;
  const paginatedData = filtered.slice(start, start + pageSize);

  return {
    data: paginatedData,
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize),
  };
}

// Mock API functions
export const mockApi = {
  // Clients
  async getClients(params: FilterParams): Promise<PaginatedResponse<Client>> {
    await delay(300);
    return filterAndPaginate(mockClients, params, ['clientName', 'institution', 'email', 'clientId']);
  },

  async getClient(id: string): Promise<Client | undefined> {
    await delay(200);
    return mockClients.find(c => c.id === id);
  },

  async createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    await delay(300);
    const newClient: Client = {
      ...data,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockClients.unshift(newClient);
    return newClient;
  },

  async updateClient(id: string, data: Partial<Client>): Promise<Client> {
    await delay(300);
    const index = mockClients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client not found');
    mockClients[index] = { ...mockClients[index], ...data, updatedAt: new Date().toISOString() };
    return mockClients[index];
  },

  async deleteClient(id: string): Promise<void> {
    await delay(300);
    const index = mockClients.findIndex(c => c.id === id);
    if (index !== -1) mockClients.splice(index, 1);
  },

  // Products
  async getProducts(params: FilterParams): Promise<PaginatedResponse<Product>> {
    await delay(300);
    return filterAndPaginate(mockProducts, params, ['name', 'productId']);
  },

  async getProduct(id: string): Promise<Product | undefined> {
    await delay(200);
    return mockProducts.find(p => p.id === id);
  },

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    await delay(300);
    const newProduct: Product = {
      ...data,
      id: `product-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProducts.unshift(newProduct);
    return newProduct;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    await delay(300);
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    mockProducts[index] = { ...mockProducts[index], ...data, updatedAt: new Date().toISOString() };
    return mockProducts[index];
  },

  async deleteProduct(id: string): Promise<void> {
    await delay(300);
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) mockProducts.splice(index, 1);
  },

  // Orders
  async getOrders(params: FilterParams & { clientId?: string; productId?: string }): Promise<PaginatedResponse<Order>> {
    await delay(300);
    let filtered = [...mockOrders];
    
    if (params.clientId) {
      filtered = filtered.filter(o => o.clientId === params.clientId);
    }
    if (params.productId) {
      filtered = filtered.filter(o => o.productId === params.productId);
    }
    
    return filterAndPaginate(filtered, params, ['orderId', 'orderClass', 'genre', 'week']);
  },

  async getOrder(id: string): Promise<Order | undefined> {
    await delay(200);
    return mockOrders.find(o => o.id === id);
  },

  async createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'totalCost' | 'client' | 'product'>): Promise<Order> {
    await delay(300);
    const client = mockClients.find(c => c.id === data.clientId);
    const product = mockProducts.find(p => p.id === data.productId);
    const totalCost = product ? product.pricePerUnit * data.pagesOrSlides : 0;
    
    const newOrder: Order = {
      ...data,
      id: `order-${Date.now()}`,
      totalCost,
      client,
      product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockOrders.unshift(newOrder);
    return newOrder;
  },

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    await delay(300);
    const index = mockOrders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');
    
    const order = mockOrders[index];
    const product = data.productId 
      ? mockProducts.find(p => p.id === data.productId) 
      : order.product;
    const pages = data.pagesOrSlides ?? order.pagesOrSlides;
    const totalCost = product ? product.pricePerUnit * pages : order.totalCost;
    
    mockOrders[index] = { 
      ...order, 
      ...data, 
      totalCost,
      product,
      client: data.clientId ? mockClients.find(c => c.id === data.clientId) : order.client,
      updatedAt: new Date().toISOString() 
    };
    return mockOrders[index];
  },

  async deleteOrder(id: string): Promise<void> {
    await delay(300);
    const index = mockOrders.findIndex(o => o.id === id);
    if (index !== -1) mockOrders.splice(index, 1);
  },

  // Invoice/Report data
  async getInvoiceData(params: { clientId: string; startDate: string; endDate: string }): Promise<Order[]> {
    await delay(400);
    return mockOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return (
        order.clientId === params.clientId &&
        orderDate >= new Date(params.startDate) &&
        orderDate <= new Date(params.endDate)
      );
    });
  },

  // Get all clients for dropdowns
  async getAllClients(): Promise<Client[]> {
    await delay(200);
    return mockClients;
  },

  // Get all products for dropdowns
  async getAllProducts(): Promise<Product[]> {
    await delay(200);
    return mockProducts;
  },
};
