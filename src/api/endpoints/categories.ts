/**
 * Category API Endpoints - Updated for Unified Category
 */

import client from '../client';

export interface Category {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both'; // ✅ NEW
  monthlyBudget?: number;
  monthlyIncome?: number; // ✅ NEW
  order: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both'; // ✅ Required
  monthlyBudget?: number;
  monthlyIncome?: number; // ✅ NEW
}

export const categoryApi = {
  // ✅ Updated: Can filter by type
  getAll: async (type?: 'expense' | 'income' | 'both') => {
    const params = type ? { type } : {};
    const response = await client.get('/categories', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await client.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryData) => {
    const response = await client.post('/categories', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateCategoryData>) => {
    const response = await client.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string, confirmed: boolean = false) => {
    const response = await client.delete(`/categories/${id}?confirmed=${confirmed}`);
    return response.data;
  },

  checkDeletion: async (id: string) => {
    const response = await client.get(`/categories/${id}/delete-check`);
    return response.data;
  },

  reorder: async (categoryOrders: Array<{ id: string; order: number }>) => {
    const response = await client.put('/categories/reorder', { categoryOrders });
    return response.data;
  },

  createDefaults: async () => {
    const response = await client.post('/categories/defaults');
    return response.data;
  },
};

export default categoryApi;