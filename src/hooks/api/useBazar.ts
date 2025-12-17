/**
 * Bazar React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bazarApi, {
  CreateListData,
  UpdateListData,
  CreateItemData,
  UpdateItemData,
} from '../../api/endpoints/bazar';
import Toast from 'react-native-toast-message';

// Query Keys
export const bazarKeys = {
  all: ['bazar'] as const,
  lists: () => [...bazarKeys.all, 'lists'] as const,
  list: (id: string) => [...bazarKeys.lists(), id] as const,
  stats: () => [...bazarKeys.all, 'stats'] as const,
};

// Get all shopping lists
export const useBazarLists = () => {
  return useQuery({
    queryKey: bazarKeys.lists(),
    queryFn: () => bazarApi.getAll(),
  });
};

// Get single shopping list
export const useBazarList = (id: string) => {
  return useQuery({
    queryKey: bazarKeys.list(id),
    queryFn: () => bazarApi.getById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

// Get statistics
export const useBazarStats = () => {
  return useQuery({
    queryKey: bazarKeys.stats(),
    queryFn: () => bazarApi.getStats(),
    select: (data) => data.data,
  });
};

// Create list
export const useCreateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListData) => bazarApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bazarKeys.lists() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Shopping list created',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to create list',
      });
    },
  });
};

// Update list
export const useUpdateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListData }) =>
      bazarApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bazarKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bazarKeys.list(variables.id) });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'List updated',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to update list',
      });
    },
  });
};

// Delete list
export const useDeleteList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bazarApi.deleteList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bazarKeys.lists() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'List deleted',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to delete list',
      });
    },
  });
};

// Add item
export const useAddItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, data }: { listId: string; data: CreateItemData }) =>
      bazarApi.addItem(listId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bazarKeys.list(variables.listId) });
      queryClient.invalidateQueries({ queryKey: bazarKeys.lists() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Item added',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to add item',
      });
    },
  });
};

// Update item
export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      listId,
      itemId,
      data,
    }: {
      listId: string;
      itemId: string;
      data: UpdateItemData;
    }) => bazarApi.updateItem(listId, itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bazarKeys.list(variables.listId) });
      queryClient.invalidateQueries({ queryKey: bazarKeys.lists() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Item updated',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to update item',
      });
    },
  });
};

// Delete item
export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) =>
      bazarApi.deleteItem(listId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bazarKeys.list(variables.listId) });
      queryClient.invalidateQueries({ queryKey: bazarKeys.lists() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Item deleted',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to delete item',
      });
    },
  });
};

// Toggle item purchase status
export const useToggleItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: string; itemId: string }) =>
      bazarApi.toggleItem(listId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bazarKeys.list(variables.listId) });
      queryClient.invalidateQueries({ queryKey: bazarKeys.lists() });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to toggle item',
      });
    },
  });
};