/**
 * Category React Query Hooks - Updated
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import categoryApi, { CreateCategoryData } from '../../api/endpoints/categories';
import Toast from 'react-native-toast-message';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (type?: string) => [...categoryKeys.lists(), { type }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// ✅ Updated: Can filter by type
export const useCategories = (type?: 'expense' | 'income' | 'both') => {
  return useQuery({
    queryKey: categoryKeys.list(type),
    queryFn: () => categoryApi.getAll(type),
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryData) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Category created successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to create category',
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCategoryData> }) =>
      categoryApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Category updated successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to update category',
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, confirmed }: { id: string; confirmed?: boolean }) =>
      categoryApi.delete(id, confirmed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Category deleted successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to delete category',
      });
    },
  });
};

export const useCheckCategoryDeletion = (id: string) => {
  return useQuery({
    queryKey: ['category-deletion-check', id],
    queryFn: () => categoryApi.checkDeletion(id),
    enabled: !!id,
  });
};

export const useCreateDefaultCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => categoryApi.createDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Default categories created',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to create defaults',
      });
    },
  });
};