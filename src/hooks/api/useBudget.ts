/**
 * Budget React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import budgetApi, { UpdateBudgetData } from '../../api/endpoints/budget';
import Toast from 'react-native-toast-message';

// Query keys
export const budgetKeys = {
  all: ['budget'] as const,
  summary: () => [...budgetKeys.all, 'summary'] as const,
  alerts: () => [...budgetKeys.all, 'alerts'] as const,
  category: (categoryId: string) =>
    [...budgetKeys.all, 'category', categoryId] as const,
};

// Get budget summary
export const useBudgetSummary = () => {
  return useQuery({
    queryKey: budgetKeys.summary(),
    queryFn: () => budgetApi.getSummary(),
      select: (data) => data.data,
  });
};

// Get budget alerts
export const useBudgetAlerts = () => {
  return useQuery({
    queryKey: budgetKeys.alerts(),
    queryFn: () => budgetApi.getAlerts(),
    select: (data) => data.data,
  });
};

// Get category budget status
export const useCategoryBudgetStatus = (categoryId: string) => {
  return useQuery({
    queryKey: budgetKeys.category(categoryId),
    queryFn: () => budgetApi.getCategoryStatus(categoryId),
    select: (data) => data.data,
    enabled: !!categoryId,
  });
};

// Update category budget
export const useUpdateCategoryBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: UpdateBudgetData;
    }) => budgetApi.updateCategoryBudget(categoryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.summary() });
      queryClient.invalidateQueries({ queryKey: budgetKeys.alerts() });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.category(variables.categoryId),
      });
      // Also invalidate categories
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Budget updated successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to update budget',
      });
    },
  });
};