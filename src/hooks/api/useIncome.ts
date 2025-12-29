/**
 * Income React Query Hooks - Updated
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import incomeApi, { CreateIncomeData } from '../../api/endpoints/income';
import Toast from 'react-native-toast-message';

// Query keys
export const incomeKeys = {
  all: ['incomes'] as const,
  lists: () => [...incomeKeys.all, 'list'] as const,
  list: (filters?: any) => [...incomeKeys.lists(), filters] as const,
  details: () => [...incomeKeys.all, 'detail'] as const,
  detail: (id: string) => [...incomeKeys.details(), id] as const,
  stats: () => [...incomeKeys.all, 'stats'] as const,
  daily: (days: number) => [...incomeKeys.all, 'daily', days] as const,
};

/**
 * Get all incomes
 */
export const useIncomes = (filters?: any) => {
  return useQuery({
    queryKey: incomeKeys.list(filters),
    queryFn: () => incomeApi.getAll(filters),
  });
};

/**
 * Get single income
 */
export const useIncome = (id: string) => {
  return useQuery({
    queryKey: incomeKeys.detail(id),
    queryFn: () => incomeApi.getById(id),
    enabled: !!id,
    select: (res) => res.data,
  });
};

/**
 * Get income statistics
 */
export const useIncomeStats = () => {
  return useQuery({
    queryKey: incomeKeys.stats(),
    queryFn: () => incomeApi.getStats(),
    select: (res) => res.data,
  });
};

/**
 * Get daily incomes
 */
export const useDailyIncomes = (days: number = 30) => {
  return useQuery({
    queryKey: incomeKeys.daily(days),
    queryFn: () => incomeApi.getDaily(days),
  });
};

/**
 * Create income
 */
export const useCreateIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIncomeData) => incomeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: incomeKeys.stats() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Income added successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to add income',
      });
    },
  });
};

/**
 * Update income
 */
export const useUpdateIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateIncomeData> }) =>
      incomeApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: incomeKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: incomeKeys.stats() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Income updated successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to update income',
      });
    },
  });
};

/**
 * Delete income
 */
export const useDeleteIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => incomeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: incomeKeys.stats() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Income deleted successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to delete income',
      });
    },
  });
};

/**
 * ✅ NEW: Bulk delete incomes
 */
export const useBulkDeleteIncomes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (incomeIds: string[]) => incomeApi.bulkDelete(incomeIds),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: incomeKeys.stats() });
      
      const deletedCount = response.data?.data?.deletedCount || 0;
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `${deletedCount} income(s) deleted successfully`,
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to delete incomes',
      });
    },
  });
};