/**
 * Expense React Query Hooks - Complete & Fixed
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import expenseApi, {
  ExpenseFilters,
  CreateExpenseData,
} from '../../api/endpoints/expenses';
import Toast from 'react-native-toast-message';

// Query keys
export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters: ExpenseFilters) => [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  stats: () => [...expenseKeys.all, 'stats'] as const,
  daily: (days: number) => [...expenseKeys.all, 'daily', days] as const,
  categoryStats: (period?: string) =>
    [...expenseKeys.all, 'categoryStats', period] as const,
  recent: (limit: number) => [...expenseKeys.all, 'recent', limit] as const,
  monthly: (year: number, month: number) =>
    [...expenseKeys.all, 'monthly', year, month] as const,
  yearly: (year: number) => [...expenseKeys.all, 'yearly', year] as const,
  category: (categoryId: string) =>
    [...expenseKeys.all, 'category', categoryId] as const,
};

// ✅ Get all expenses
export const useExpenses = (filters?: ExpenseFilters) => {
  return useQuery({
    queryKey: expenseKeys.list(filters || {}),
    queryFn: () => expenseApi.getAll(filters),
  });
};

// ✅ Get single expense
export const useExpense = (id: string) => {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => expenseApi.getById(id),
    select: (data) => data.data,
    enabled: !!id,
    
  });
};

// ✅ Get recent expenses
export const useRecentExpenses = (limit: number = 10) => {
  return useQuery({
    queryKey: expenseKeys.recent(limit),
    queryFn: () => expenseApi.getRecent(limit),
  });
};

// ✅ Get monthly expenses
export const useMonthlyExpenses = (year: number, month: number) => {
  return useQuery({
    queryKey: expenseKeys.monthly(year, month),
    queryFn: () => expenseApi.getMonthly(year, month),
  });
};

// ✅ Get expenses by category
export const useExpensesByCategory = (
  categoryId: string,
  filters?: ExpenseFilters,
) => {
  return useQuery({
    queryKey: expenseKeys.category(categoryId),
    queryFn: () => expenseApi.getByCategory(categoryId, filters),
    enabled: !!categoryId,
  });
};

// ✅ Get expense statistics
export const useExpenseStats = () => {
  return useQuery({
    queryKey: expenseKeys.stats(),
    queryFn: () => expenseApi.getStats(),
    select: (data) => data.data,
  });
};

// ✅ Get daily expenses (NEW - ADDED)
export const useDailyExpenses = (days: number = 30) => {
  return useQuery({
    queryKey: expenseKeys.daily(days),
    queryFn: () => expenseApi.getDaily(days),
    select: (data) => data.data,
  });
};

// ✅ Get category stats
export const useCategoryStats = (period?: 'week' | 'month' | 'year') => {
  return useQuery({
    queryKey: expenseKeys.categoryStats(period),
    queryFn: () => expenseApi.getCategoryStats(period),
  });
};

// Create expense
export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseData) => expenseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Expense added successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to add expense',
      });
    },
  });
};

// Update expense
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateExpenseData>;
    }) => expenseApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: expenseKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Expense updated successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to update expense',
      });
    },
  });
};

// Delete expense
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Expense deleted successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to delete expense',
      });
    },
  });
};

// Bulk delete expenses
export const useBulkDeleteExpenses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => expenseApi.bulkDelete(ids),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `${variables.length} expenses deleted successfully`,
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to delete expenses',
      });
    },
  });
};

// Duplicate expense
export const useDuplicateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Expense duplicated successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to duplicate expense',
      });
    },
  });
};

// Upload receipt
export const useUploadReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseId, file }: { expenseId: string; file: any }) =>
      expenseApi.uploadReceipt(expenseId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: expenseKeys.detail(variables.expenseId),
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Receipt uploaded successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to upload receipt',
      });
    },
  });
};

// Delete receipt
export const useDeleteReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      expenseId,
      attachmentId,
    }: {
      expenseId: string;
      attachmentId: string;
    }) => expenseApi.deleteReceipt(expenseId, attachmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: expenseKeys.detail(variables.expenseId),
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Receipt deleted successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to delete receipt',
      });
    },
  });
};