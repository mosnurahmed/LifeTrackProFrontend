/**
 * Expense API Endpoints - Complete with Daily Stats
 */

import client from '../client';
import { Category } from './categories';

export interface Expense {
  _id: string;
  userId: string;
  categoryId: any;
  category: Category;
  amount: number;
  description?: string;
  date: string;
  paymentMethod?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  tags?: string[];
  receiptImage?: string;
  isRecurring?: boolean;
  recurringConfig?: {
    interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  categoryId: string;
  amount: number;
  description?: string;
  date: string;
  paymentMethod?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  tags?: string[];
  receiptImage?: string;
  isRecurring?: boolean;
  recurringConfig?: {
    interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: string;
  };
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
  paymentMethod?: string;
  tags?: string[];
  sortBy?: 'date' | 'amount' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export const expenseApi = {
  // Get all expenses with filters
  getAll: (filters?: ExpenseFilters) => 
    client.get('/expenses', { params: filters }),

  // Get single expense
  getById: (id: string) => 
    client.get(`/expenses/${id}`),

  // Create expense
  create: (data: CreateExpenseData) => 
    client.post('/expenses', data),

  // Update expense
  update: (id: string, data: Partial<CreateExpenseData>) =>
    client.put(`/expenses/${id}`, data),

  // Delete expense
  delete: (id: string) => 
    client.delete(`/expenses/${id}`),

  // Bulk delete expenses
  bulkDelete: (ids: string[]) => 
    client.post('/expenses/bulk-delete', { ids }),

  // Duplicate expense
  duplicate: (id: string) => 
    client.post(`/expenses/${id}/duplicate`),

  // Get expenses by category
  getByCategory: (categoryId: string, filters?: ExpenseFilters) =>
    client.get(`/expenses/category/${categoryId}`, { params: filters }),

  // Get expenses by date range
  getByDateRange: (startDate: string, endDate: string, filters?: ExpenseFilters) =>
    client.get('/expenses/date-range', {
      params: { startDate, endDate, ...filters },
    }),

  // Get monthly expenses
  getMonthly: (year: number, month: number) =>
    client.get(`/expenses/monthly/${year}/${month}`),

  // Get yearly expenses
  getYearly: (year: number) => 
    client.get(`/expenses/yearly/${year}`),

  // Search expenses
  search: (query: string, filters?: ExpenseFilters) =>
    client.get('/expenses/search', {
      params: { q: query, ...filters },
    }),

  // Get recent expenses
  getRecent: (limit: number = 10) =>
    client.get(`/expenses/recent/${limit}`),

  // ✅ Get statistics
  getStats: () => 
    client.get('/expenses/stats'),

  // ✅ Get daily expenses (NEW - ADDED)
  getDaily: (days: number = 30) =>
    client.get('/expenses/daily', { params: { days } }),

  // Get category stats
  getCategoryStats: (period?: 'week' | 'month' | 'year') =>
    client.get('/expenses/stats/categories', {
      params: { period },
    }),

  // Export expenses
  export: (format: 'csv' | 'pdf', filters?: ExpenseFilters) =>
    client.get('/expenses/export', {
      params: { format, ...filters },
      responseType: 'blob',
    }),

  // Upload receipt
  uploadReceipt: (expenseId: string, file: any) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return client.post(`/expenses/${expenseId}/receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Delete receipt
  deleteReceipt: (expenseId: string, attachmentId: string) =>
    client.delete(`/expenses/${expenseId}/receipt/${attachmentId}`),
};

export default expenseApi;