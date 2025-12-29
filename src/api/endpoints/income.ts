/**
 * Income API Endpoints - Updated for Unified Category System
 */

import client from '../client';

export interface Income {
  _id: string;
  userId: string;
  categoryId: any;
  category?: any;
  source: string;
  amount: number;
  date: string;
  description?: string;
  isRecurring: boolean;
  recurringConfig?: {
    interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: string;
  };
  paymentMethod?: 'cash' | 'card' | 'mobile_banking' | 'bank_transfer';
  tags?: string[];
  receiptImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeData {
  categoryId: string;
  source: string;
  amount: number;
  date?: string;
  description?: string;
  isRecurring?: boolean;
  recurringConfig?: {
    interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: string;
  };
  paymentMethod?: 'cash' | 'card' | 'mobile_banking' | 'bank_transfer';
  tags?: string[];
  receiptImage?: string;
}

export interface IncomeStats {
  thisMonth: {
    total: number;
    count: number;
  };
  lastMonth: {
    total: number;
    count: number;
  };
  allTime: {
    total: number;
    count: number;
  };
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    total: number;
    count: number;
  }>;
  comparison: {
    percentageChange: number;
  };
}

export const incomeApi = {
  /**
   * Get all incomes
   */
  getAll: (params?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }) => client.get('/income', { params }),

  /**
   * Get single income
   */
  getById: (id: string) => client.get(`/income/${id}`),

  /**
   * Create income
   */
  create: (data: CreateIncomeData) => client.post('/income', data),

  /**
   * Update income
   */
  update: (id: string, data: Partial<CreateIncomeData>) =>
    client.put(`/income/${id}`, data),

  /**
   * Delete income
   */
  delete: (id: string) => client.delete(`/income/${id}`),

  /**
   * ✅ NEW: Bulk delete incomes
   */
  bulkDelete: (incomeIds: string[]) =>
    client.post('/income/bulk-delete', { incomeIds }),

  /**
   * Get statistics
   */
  getStats: () => client.get('/income/stats'),

  /**
   * Get daily incomes (for charts)
   */
  getDaily: (days: number = 30) => client.get(`/income/daily?days=${days}`),
};

export default incomeApi;