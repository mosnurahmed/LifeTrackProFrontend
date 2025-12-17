/**
 * Category API Endpoints
 */

import client from '../client';

export interface Category {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;

  monthlyBudget?: number;
  order: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  monthlyBudget?: number;
}

export const categoryApi = {
  getAll: async () => {
    const response = await client.get('/categories');
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

  delete: async (id: string, confirm: boolean = true) => {
    const response = await client.delete(`/categories/${id}?confirm=${confirm}`);
    return response.data;
  },

  reorder: async (categoryIds: string[]) => {
    const response = await client.put('/categories/reorder', { categoryIds });
    return response.data;
  },

  createDefaults: async () => {
    const response = await client.post('/categories/default');
    return response.data;
  },

  getStats: async (id: string) => {
    const response = await client.get(`/categories/${id}/stats`);
    return response.data;
  }
};