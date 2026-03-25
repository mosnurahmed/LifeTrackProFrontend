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
    onMutate: async ({ id, status }) => {
      // Cancel both list and detail queries
      await queryClient.cancelQueries({ queryKey: tasksKeys.lists() });
      await queryClient.cancelQueries({ queryKey: tasksKeys.detail(id) });

      const prevLists = queryClient.getQueriesData({ queryKey: tasksKeys.lists() });
      const prevDetail = queryClient.getQueryData(tasksKeys.detail(id));

      // Optimistic update lists
      queryClient.setQueriesData({ queryKey: tasksKeys.lists() }, (old: any) => {
        if (!old?.data?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map((t: any) =>
              t._id === id ? { ...t, status, completedAt: status === 'completed' ? new Date().toISOString() : null } : t
            ),
          },
        };
      });

      // Optimistic update detail (cache = axios response = { data: { success, data: task } })
      queryClient.setQueryData(tasksKeys.detail(id), (old: any) => {
        if (!old?.data?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: { ...old.data.data, status, completedAt: status === 'completed' ? new Date().toISOString() : null },
          },
        };
      });

      return { prevLists, prevDetail, id };
    },
    onError: (_err: any, _vars, context: any) => {
      if (context?.prevLists) {
        context.prevLists.forEach(([key, data]: any) => queryClient.setQueryData(key, data));
      }
      if (context?.prevDetail) {
        queryClient.setQueryData(tasksKeys.detail(context.id), context.prevDetail);
      }
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: _err.response?.data?.error || 'Failed to update status',
      });
    },
    onSettled: (_d, _e, { id }) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.stats() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.detail(id) });
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

// Update subtask (optimistic for toggle)
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
    onMutate: async ({ taskId, subtaskId, data }) => {
      const detailKey = tasksKeys.detail(taskId);
      await queryClient.cancelQueries({ queryKey: detailKey });
      const prev = queryClient.getQueryData(detailKey);
      // Cache = axios response = { data: { success, data: task } }
      queryClient.setQueryData(detailKey, (old: any) => {
        const task = old?.data?.data;
        if (!task?.subtasks) return old;
        const subtasks = task.subtasks.map((s: any) =>
          s._id === subtaskId ? { ...s, ...data } : s
        );
        const done = subtasks.filter((s: any) => s.completed).length;
        const total = subtasks.length;
        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...task,
              subtasks,
              subtaskProgress: total > 0 ? Math.round((done / total) * 100) : 0,
            },
          },
        };
      });
      return { prev, detailKey };
    },
    onError: (_err: any, _vars, context: any) => {
      if (context?.prev) queryClient.setQueryData(context.detailKey, context.prev);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: _err.response?.data?.error || 'Failed to update subtask',
      });
    },
    onSettled: (_, __, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.detail(taskId) });
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