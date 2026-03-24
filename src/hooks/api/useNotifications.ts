/**
 * Notifications Hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';

const KEYS = {
  list:  ['notifications'] as const,
  count: ['notifications', 'unread-count'] as const,
};

export const useNotifications = () =>
  useQuery({
    queryKey: KEYS.list,
    queryFn: async () => {
      const res = await client.get('/notifications');
      return (res.data?.data ?? []) as any[];
    },
    retry: false,
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: KEYS.count,
    queryFn: async () => {
      const res = await client.get('/notifications/unread-count');
      return (res.data?.data?.count ?? 0) as number;
    },
    retry: false,
    refetchInterval: 30_000, // refresh every 30s
  });

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list });
      qc.invalidateQueries({ queryKey: KEYS.count });
    },
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => client.patch('/notifications/read-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list });
      qc.invalidateQueries({ queryKey: KEYS.count });
    },
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/notifications/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list });
      qc.invalidateQueries({ queryKey: KEYS.count });
    },
  });
};

export const useClearAllNotifications = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => client.delete('/notifications/clear-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list });
      qc.invalidateQueries({ queryKey: KEYS.count });
    },
  });
};
