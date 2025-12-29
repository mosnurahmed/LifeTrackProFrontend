/**
 * Tasks React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import tasksApi, { CreateTaskData } from '../../api/endpoints/tasks';
import Toast from 'react-native-toast-message';

// Query keys
export const tasksKeys = {
  all: ['tasks'] as const,
  lists: () => [...tasksKeys.all, 'list'] as const,
  list: (filters: any) => [...tasksKeys.lists(), filters] as const,
  details: () => [...tasksKeys.all, 'detail'] as const,
  detail: (id: string) => [...tasksKeys.details(), id] as const,
  stats: () => [...tasksKeys.all, 'stats'] as const,
};

// Get all tasks
export const useTasks = (filters?: {
  status?: string;
  priority?: string;
  tags?: string;
  dueDate?: 'today' | 'upcoming' | 'overdue';
  search?: string;
}) => {
  return useQuery({
    queryKey: tasksKeys.list(filters),
    queryFn: () => tasksApi.getAll(filters),
  });
};

// Get single task
export const useTask = (id: string) => {
  return useQuery({
    queryKey: tasksKeys.detail(id),
    queryFn: () => tasksApi.getById(id),
    enabled: !!id,
    select: (data) => data.data,
  });
};

// Get task statistics
export const useTaskStats = () => {
  return useQuery({
    queryKey: tasksKeys.stats(),
    queryFn: () => tasksApi.getStats(),
    select: (data) => data.data,
  });
};

// Create task
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskData) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.stats() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Task created successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to create task',
      });
    },
  });
};

// Update task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaskData> }) =>
      tasksApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tasksKeys.stats() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Task updated successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to update task',
      });
    },
  });
};

// Delete task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.stats() });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Task deleted successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to delete task',
      });
    },
  });
};

// Update task status
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
    }) => tasksApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.stats() });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to update status',
      });
    },
  });
};

// Add subtask
export const useAddSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) =>
      tasksApi.addSubtask(taskId, title),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.detail(variables.taskId) });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Subtask added successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to add subtask',
      });
    },
  });
};

// Update subtask
export const useUpdateSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      subtaskId,
      data,
    }: {
      taskId: string;
      subtaskId: string;
      data: { title?: string; completed?: boolean };
    }) => tasksApi.updateSubtask(taskId, subtaskId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.detail(variables.taskId) });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to update subtask',
      });
    },
  });
};

// Delete subtask
export const useDeleteSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, subtaskId }: { taskId: string; subtaskId: string }) =>
      tasksApi.deleteSubtask(taskId, subtaskId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.detail(variables.taskId) });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Subtask deleted successfully',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Failed to delete subtask',
      });
    },
  });
};