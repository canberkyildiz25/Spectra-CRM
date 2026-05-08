// API Service for Customers
import api from '@/shared/api';
import { ICustomer, ApiResponse } from '@/shared/types';

export const customerApi = {
  async getAll(page = 1, limit = 10) {
    const response = await api.get<ApiResponse<{ customers: ICustomer[]; total: number }>>('/customers', {
      params: { page, limit }
    });
    return response.data.data;
  },

  async getById(id: string) {
    const response = await api.get<ApiResponse<ICustomer>>(`/customers/${id}`);
    return response.data.data;
  },

  async create(customer: ICustomer) {
    const response = await api.post<ApiResponse<ICustomer>>('/customers', customer);
    return response.data.data;
  },

  async update(id: string, customer: Partial<ICustomer>) {
    const response = await api.put<ApiResponse<ICustomer>>(`/customers/${id}`, customer);
    return response.data.data;
  },

  async delete(id: string) {
    await api.delete(`/customers/${id}`);
  }
};
