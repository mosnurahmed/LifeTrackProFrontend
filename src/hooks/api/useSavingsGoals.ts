/**
 * Savings Goals React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import savingsGoalApi, {
  CreateSavingsGoalData,
  AddContributionData,
} from '../../api/endpoints/savingsGoals';
import Toast from 'react-native-toast-message';

// Query keys
export const savingsGoalKeys = {
  all: ['savingsGoals'] as const,
  lists: () => [...savingsGoalKeys.all, 'list'] as const,
  details: () => [...savingsGoalKeys.all, 'detail'] as const,
  detail: (id: string) => [...savingsGoalKeys.details(), id] as const,
  contributions: (id: string) =>
    [...savingsGoalKeys.all, 'contributions', id] as const,
  stats: () => [...savingsGoalKeys.all, 'stats'] as const,
};

// Get all savings goals
export const useSavingsGoals = () => {
  return useQuery({
    queryKey: savingsGoalKeys.lists(),
    queryFn: () => savingsGoalApi.getAll(),
    
  });
};

// Get single savings goal
export const useSavingsGoal = (id: string) => {
  return useQuery({
    queryKey: savingsGoalKeys.detail(id),
    queryFn: () => savingsGoalApi.getById(id),
    enabled: !!id,
  });
};

// Get contribution history
export const useContributions = (id: string) => {
  return useQuery({
    queryKey: savingsGoalKeys.contributions(id),
    queryFn: () => savingsGoalApi.getContributions(id),
    enabled: !!id,
  });
};

// Get statistics
export const useSavingsStats = () => {
  return useQuery({
    queryKey: savingsGoalKeys.stats(),
    queryFn: () => savingsGoalApi.getStats(),
    select: (data) => data.data,
  });
};

// Create savings goal
export const useCreateSavingsGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSavingsGoalData) => savingsGoalApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savingsGoalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: savingsGoalKeys.stats() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Savings goal created successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to create goal',
      });
    },
  });
};

// Update savings goal
export const useUpdateSavingsGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateSavingsGoalData>;
    }) => savingsGoalApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: savingsGoalKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: savingsGoalKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: savingsGoalKeys.stats() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Savings goal updated successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to update goal',
      });
    },
  });
};

// Delete savings goal
export const useDeleteSavingsGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => savingsGoalApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savingsGoalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: savingsGoalKeys.stats() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Savings goal deleted successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to delete goal',
      });
    },
  });
};

// Add contribution
export const useAddContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddContributionData }) =>
      savingsGoalApi.addContribution(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: savingsGoalKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: savingsGoalKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: savingsGoalKeys.contributions(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: savingsGoalKeys.stats() });

      // Check for milestone notification
      const data = response?.data;
      if (data?.milestoneReached) {
        Toast.show({
          type: 'success',
          text1: '🎉 Milestone Reached!',
          text2: `${data.progress}% of your goal completed!`,
          visibilityTime: 4000,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Contribution added successfully',
        });
      }
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to add contribution',
      });
    },
  });
};