/**
 * Budget React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import budgetApi from '../../api/endpoints/budget';
import Toast from 'react-native-toast-message';

export const budgetKeys = {
  all:     ['budget'] as const,
  summary: (year: number, month: number) => ['budget', 'summary', year, month] as const,
  alerts:  (year: number, month: number) => ['budget', 'alerts',  year, month] as const,
};

export const useBudgetSummary = (year: number, month: number) =>
  useQuery({
    queryKey: budgetKeys.summary(year, month),
    queryFn:  () => budgetApi.getSummary(year, month),
    select:   data => data.data as any,
  });

export const useBudgetAlerts = (year: number, month: number) =>
  useQuery({
    queryKey: budgetKeys.alerts(year, month),
    queryFn:  () => budgetApi.getAlerts(year, month),
    select:   data => data.data as any,
  });

export const useSetTotalBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ year, month, totalBudget }: { year: number; month: number; totalBudget: number | null }) =>
      budgetApi.setTotalBudget(year, month, totalBudget),
    onSuccess: (_, { year, month }) => {
      qc.invalidateQueries({ queryKey: budgetKeys.summary(year, month) });
      qc.invalidateQueries({ queryKey: ['expenses'] });
      Toast.show({ type: 'success', text1: 'Budget updated' });
    },
    onError: (err: any) =>
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Failed to update budget' }),
  });
};

export const useSetCategoryMonthlyBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId, year, month, budget,
    }: { categoryId: string; year: number; month: number; budget: number | null }) =>
      budgetApi.setCategoryMonthlyBudget(categoryId, year, month, budget),
    onSuccess: (_, { year, month }) => {
      qc.invalidateQueries({ queryKey: budgetKeys.summary(year, month) });
      qc.invalidateQueries({ queryKey: budgetKeys.alerts(year, month) });
      qc.invalidateQueries({ queryKey: ['expenses'] });
      Toast.show({ type: 'success', text1: 'Category budget updated' });
    },
    onError: (err: any) =>
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Failed to update' }),
  });
};
