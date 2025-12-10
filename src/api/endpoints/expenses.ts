/**
 * Expense API Endpoints
 */

import client from '../client';

export interface Expense {
  _id: string;
  userId: string;
  categoryId: string;
  amount: number;
  description?: string;
  date: string;
  paymentMethod?: string;
  location?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  categoryId: string;
  amount: number;
  description?: string;
  date: string;
  paymentMethod?: string;
  location?: string;
  tags?: string[];
}

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export const expenseApi = {
  // Get all expenses
  getAll: async (filters?: ExpenseFilters) => {
    const response = await client.get('/expenses', { params: filters });
    return response.data;
  },

  // Get single expense
  getById: async (id: string) => {
    const response = await client.get(`/expenses/${id}`);
    return response.data;
  },

  // Create expense
  create: async (data: CreateExpenseData) => {
    const response = await client.post('/expenses', data);
    return response.data;
  },

  // Update expense
  update: async (id: string, data: Partial<CreateExpenseData>) => {
    const response = await client.put(`/expenses/${id}`, data);
    return response.data;
  },

  // Delete expense
  delete: async (id: string) => {
    const response = await client.delete(`/expenses/${id}`);
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await client.get('/expenses/stats/summary');
    return response.data;
  }
};