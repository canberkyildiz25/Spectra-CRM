// Client API - Global reusable functions
import { ICustomer, IOpportunity, ITask, IUser, LoginRequest, AuthResponse } from '@/shared/types';
import api from '@/shared/api';

// Auth
export const authApi = {
  async login(credentials: LoginRequest) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Customers
export const customersApi = {
  async getAll() {
    const response = await api.get('/customers');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  async create(data: ICustomer) {
    const response = await api.post('/customers', data);
    return response.data;
  },

  async update(id: string, data: Partial<ICustomer>) {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  }
};

// Opportunities
export const opportunitiesApi = {
  async getAll() {
    const response = await api.get('/opportunities');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/opportunities/${id}`);
    return response.data;
  },

  async create(data: IOpportunity) {
    const response = await api.post('/opportunities', data);
    return response.data;
  },

  async update(id: string, data: Partial<IOpportunity>) {
    const response = await api.put(`/opportunities/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/opportunities/${id}`);
    return response.data;
  }
};

// Tasks
export const tasksApi = {
  async getAll() {
    const response = await api.get('/tasks');
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  async create(data: ITask) {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  async update(id: string, data: Partial<ITask>) {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
};
