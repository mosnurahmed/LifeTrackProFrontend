/**
 * Savings Goals React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import savingsGoalApi, { CreateSavingsGoalData, AddContributionData } from '../../api/endpoints/savingsGoals';
import Toast from 'react-native-toast-message';

export const savingsKeys = {
  all:           ['savings'] as const,
  list:          ()                       => ['savings', 'list']                as const,
  detail:        (id: string)             => ['savings', 'detail', id]          as const,
  contributions: (id: string)             => ['savings', 'contributions', id]   as const,
  stats:         (year: number, month: number) => ['savings', 'stats', year, month] as const,
  account:       ()                       => ['savings', 'account']             as const,
};

export const useSavingsGoals = () =>
  useQuery({ queryKey: savingsKeys.list(), queryFn: () => savingsGoalApi.getAll() });

export const useSavingsGoal = (id: string) =>
  useQuery({ queryKey: savingsKeys.detail(id), queryFn: () => savingsGoalApi.getById(id), enabled: !!id });

export const useContributions = (id: string) =>
  useQuery({ queryKey: savingsKeys.contributions(id), queryFn: () => savingsGoalApi.getContributions(id), enabled: !!id });

export const useSavingsStats = (year: number, month: number) =>
  useQuery({
    queryKey: savingsKeys.stats(year, month),
    queryFn:  () => savingsGoalApi.getStats(year, month),
    select:   (data: any) => data?.data?.data as any,
  });

export const useSavingsAccount = () =>
  useQuery({
    queryKey: savingsKeys.account(),
    queryFn:  () => savingsGoalApi.getAccount(),
    select:   (data: any) => data.data as any,
  });

export const useSetSavingsAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (initialBalance: number) => savingsGoalApi.setAccount(initialBalance),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: savingsKeys.account() });
      qc.invalidateQueries({ queryKey: ['savings', 'stats'] });
      Toast.show({ type: 'success', text1: 'Initial balance updated' });
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err.response?.data?.error || 'Failed to update' }),
  });
};

export const useCreateSavingsGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSavingsGoalData) => savingsGoalApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: savingsKeys.list() });
      qc.invalidateQueries({ queryKey: ['savings', 'stats'] });
      Toast.show({ type: 'success', text1: 'Goal created!' });
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err.response?.data?.error || 'Failed to create goal' }),
  });
};

export const useUpdateSavingsGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSavingsGoalData> }) =>
      savingsGoalApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: savingsKeys.list() });
      qc.invalidateQueries({ queryKey: savingsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ['savings', 'stats'] });
      Toast.show({ type: 'success', text1: 'Goal updated' });
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err.response?.data?.error || 'Failed to update goal' }),
  });
};

export const useDeleteSavingsGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => savingsGoalApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: savingsKeys.list() });
      qc.invalidateQueries({ queryKey: ['savings', 'stats'] });
      Toast.show({ type: 'success', text1: 'Goal deleted' });
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err.response?.data?.error || 'Failed to delete' }),
  });
};

export const useAddContribution = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddContributionData }) =>
      savingsGoalApi.addContribution(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: savingsKeys.list() });
      qc.invalidateQueries({ queryKey: savingsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: savingsKeys.contributions(id) });
      qc.invalidateQueries({ queryKey: ['savings', 'stats'] });
      Toast.show({ type: 'success', text1: 'Contribution added!' });
    },
    onError: (err: any) => Toast.show({ type: 'error', text1: err.response?.data?.error || 'Failed to add contribution' }),
  });
};
