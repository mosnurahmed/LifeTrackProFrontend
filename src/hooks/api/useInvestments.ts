/**
 * Investment API Hooks
 * Note: All hooks with select — data is already extracted, don't double-extract in components
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';

const keys = {
  all: ['investments'] as const,
  lists: () => [...keys.all, 'list'] as const,
  list: (f?: any) => [...keys.lists(), f] as const,
  detail: (id: string) => [...keys.all, 'detail', id] as const,
  stats: () => [...keys.all, 'stats'] as const,
};

// Also invalidate expense/income queries since contributions create expenses, maturity creates income
const expenseKeys = { lists: () => ['expenses', 'list'], stats: () => ['expenses', 'stats'] };
const incomeKeys = { lists: () => ['income', 'list'], stats: () => ['income', 'stats'] };

export const useInvestments = (filters?: { type?: string; closed?: boolean }) => {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.closed !== undefined) params.append('closed', String(filters.closed));
  const qs = params.toString();

  return useQuery({
    queryKey: keys.list(filters),
    queryFn: () => client.get(`/investments${qs ? `?${qs}` : ''}`),
    select: (res) => res.data?.data ?? [],
  });
};

export const useInvestment = (id: string) => useQuery({
  queryKey: keys.detail(id),
  queryFn: () => client.get(`/investments/${id}`),
  select: (res) => res.data?.data,
  enabled: !!id,
});

export const useInvestmentStats = () => useQuery({
  queryKey: keys.stats(),
  queryFn: () => client.get('/investments/stats'),
  select: (res) => res.data?.data,
});

export const useCreateInvestment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => client.post('/investments', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.lists() });
      qc.invalidateQueries({ queryKey: keys.stats() });
      qc.invalidateQueries({ queryKey: expenseKeys.lists() });
      qc.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
};

export const useUpdateInvestment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => client.put(`/investments/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: keys.lists() });
      qc.invalidateQueries({ queryKey: keys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: keys.stats() });
    },
  });
};

export const useDeleteInvestment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/investments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.lists() });
      qc.invalidateQueries({ queryKey: keys.stats() });
      qc.invalidateQueries({ queryKey: expenseKeys.lists() });
      qc.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
};

export const useAddContribution = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ investmentId, ...data }: any) =>
      client.post(`/investments/${investmentId}/contributions`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: keys.lists() });
      qc.invalidateQueries({ queryKey: keys.detail(vars.investmentId) });
      qc.invalidateQueries({ queryKey: keys.stats() });
      qc.invalidateQueries({ queryKey: expenseKeys.lists() });
      qc.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
};

export const useDeleteContribution = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ investmentId, contribId }: { investmentId: string; contribId: string }) =>
      client.delete(`/investments/${investmentId}/contributions/${contribId}`),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: keys.lists() });
      qc.invalidateQueries({ queryKey: keys.detail(vars.investmentId) });
      qc.invalidateQueries({ queryKey: keys.stats() });
      qc.invalidateQueries({ queryKey: expenseKeys.lists() });
      qc.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
};

export const useCloseInvestment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.patch(`/investments/${id}/close`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: keys.lists() });
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: keys.stats() });
      // Maturity creates income entry
      qc.invalidateQueries({ queryKey: incomeKeys.lists() });
      qc.invalidateQueries({ queryKey: incomeKeys.stats() });
    },
  });
};
