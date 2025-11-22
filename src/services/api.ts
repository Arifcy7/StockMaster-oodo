import axios from 'axios';
import { auth } from './firebase';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - redirecting to login');
      // You might want to redirect to login page here
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Test connection function
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Connection test failed:', error);
    throw error;
  }
};

// Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  unit: string;
  status: string;
  location: string;
  reorder_level?: number;
  supplier?: string;
  cost_price?: number;
  selling_price?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  location: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Operation {
  id: string;
  type: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
  title: string;
  description: string;
  status: string;
  timestamp: string;
}

export interface Receipt {
  id: string;
  receipt_id: string;
  supplier: string;
  items: Array<{
    product_id: string;
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
  }>;
  total_items: number;
  total_value: number;
  status: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  products: {
    total: number;
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
    trend?: {
      value: string;
      is_positive: boolean;
    };
  };
  operations: {
    pending_receipts: number;
    pending_deliveries: number;
    internal_transfers: number;
    pending_adjustments: number;
  };
  activity: {
    products_added_today: number;
    orders_processed_today: number;
    stock_movements_week: number;
  };
  alerts: Array<{
    type: string;
    message: string;
    priority: string;
    timestamp: string;
  }>;
  recent_activity: Array<{
    id: string;
    user: string;
    action: string;
    details: string;
    timestamp: string;
  }>;
}

// API Services

// Products API
export const productsApi = {
  getAll: (params?: { search?: string; category?: string; status?: string; location?: string }) => 
    api.get<{ products: Product[]; total: number }>('/products', { params }),
  
  getById: (id: string) => 
    api.get<{ product: Product }>(`/products/${id}`),
  
  create: (data: Partial<Product>) => 
    api.post<{ message: string; product: Product }>('/products', data),
  
  update: (id: string, data: Partial<Product>) => 
    api.put<{ message: string; product: Product }>(`/products/${id}`, data),
  
  delete: (id: string) => 
    api.delete<{ message: string }>(`/products/${id}`),
  
  getCategories: () => 
    api.get<{ categories: string[] }>('/products/categories'),
  
  getLocations: () => 
    api.get<{ locations: string[] }>('/products/locations'),
};

// Operations API
export const operationsApi = {
  // Receipts
  getReceipts: () => 
    api.get<{ receipts: Receipt[]; total: number }>('/operations/receipts'),
  
  createReceipt: (data: Partial<Receipt>) => 
    api.post<{ message: string; receipt: Receipt }>('/operations/receipts', data),
  
  // Deliveries
  getDeliveries: () => 
    api.get('/operations/deliveries'),
  
  createDelivery: (data: any) => 
    api.post('/operations/deliveries', data),
  
  // Transfers
  getTransfers: () => 
    api.get('/operations/transfers'),
  
  createTransfer: (data: any) => 
    api.post('/operations/transfers', data),
  
  // Adjustments
  getAdjustments: () => 
    api.get('/operations/adjustments'),
  
  createAdjustment: (data: any) => 
    api.post('/operations/adjustments', data),
  
  // Stock movements
  getMovements: (params?: { product_id?: string; type?: string; limit?: number }) => 
    api.get('/operations/movements', { params }),
  
  // Status updates
  updateStatus: (type: string, id: string, status: string) => 
    api.put(`/operations/${type}/${id}/status`, { status }),
};

// Users API
export const usersApi = {
  getAll: (params?: { role?: string; department?: string; status?: string }) => 
    api.get<{ users: User[]; total: number }>('/users', { params }),
  
  getById: (id: string) => 
    api.get<{ user: User }>(`/users/${id}`),
  
  create: (data: Partial<User>) => 
    api.post<{ message: string; user: User }>('/users', data),
  
  update: (id: string, data: Partial<User>) => 
    api.put<{ message: string; user: User }>(`/users/${id}`, data),
  
  delete: (id: string) => 
    api.delete<{ message: string }>(`/users/${id}`),
  
  getDepartments: () => 
    api.get<{ departments: string[] }>('/users/departments'),
  
  getRoles: () => 
    api.get<{ roles: Array<{ value: string; label: string; description: string }> }>('/users/roles'),
  
  getActivity: (id: string) => 
    api.get(`/users/activity/${id}`),
};

// Auth API
export const authApi = {
  register: (data: { 
    firebase_uid: string; 
    name: string; 
    email: string; 
    role: string; 
    department?: string; 
    phone?: string; 
    location?: string; 
  }) => 
    api.post<{ message: string; user: User }>('/auth/register', data),
  
  getProfile: () => 
    api.get<User>('/auth/profile'),
  
  updateProfile: (data: Partial<User>) => 
    api.put<{ message: string; user: User }>('/auth/update-profile', data),
  
  getUsers: () => 
    api.get<{ users: User[] }>('/auth/users'),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => 
    api.get<DashboardStats>('/dashboard/stats'),
  
  getChartData: (type: 'stock_levels' | 'operations_trend' | 'category_distribution') => 
    api.get('/dashboard/chart-data', { params: { type } }),
  
  getLowStockProducts: (limit?: number) => 
    api.get<{ products: Product[] }>('/dashboard/low-stock', { params: { limit } }),
  
  getRecentOperations: (limit?: number) => 
    api.get<{ operations: Operation[] }>('/dashboard/recent-operations', { params: { limit } }),
  
  getPerformanceMetrics: (period: 'day' | 'week' | 'month') => 
    api.get('/dashboard/performance', { params: { period } }),
};

// Health check
export const healthApi = {
  check: () => api.get('/health'),
};

// Convenience functions for common API calls
export const getDashboardData = () => dashboardApi.getStats();
export const getProducts = () => productsApi.getAll();

export default api;