/**
 * Loan API Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';

const loanKeys = {
  all: ['loans'] as const,
  lists: () => [...loanKeys.all, 'list'] as const,
  list: (filters?: any) => [...loanKeys.lists(), filters] as const,
  detail: (id: string) => [...loanKeys.all, 'detail', id] as const,
  stats: () => [...loanKeys.all, 'stats'] as const,
};

// ── List ─────────────────────────────────────────────────────────────────────

export const useLoans = (filters?: { type?: 'given' | 'taken'; settled?: boolean }) => {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.settled !== undefined) params.append('settled', String(filters.settled));
  const qs = params.toString();

  return useQuery({
    queryKey: loanKeys.list(filters),
    queryFn: () => client.get(`/loans${qs ? `?${qs}` : ''}`),
    select: (res) => res.data?.data ?? [],
  });
};

// ── Detail ───────────────────────────────────────────────────────────────────

export const useLoan = (id: string) => useQuery({
  queryKey: loanKeys.detail(id),
  queryFn: () => client.get(`/loans/${id}`),
  select: (res) => res.data?.data,
  enabled: !!id,
});

// ── Stats ────────────────────────────────────────────────────────────────────

export const useLoanStats = () => useQuery({
  queryKey: loanKeys.stats(),
  queryFn: () => client.get('/loans/stats'),
  select: (res) => res.data?.data,
});

// ── Create ───────────────────────────────────────────────────────────────────

export const useCreateLoan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => client.post('/loans', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: loanKeys.lists() });
      qc.invalidateQueries({ queryKey: loanKeys.stats() });
    },
  });
};

// ── Update ───────────────────────────────────────────────────────────────────

export const useUpdateLoan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => client.put(`/loans/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: loanKeys.lists() });
      qc.invalidateQueries({ queryKey: loanKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: loanKeys.stats() });
    },
  });
};

// ── Delete ───────────────────────────────────────────────────────────────────

export const useDeleteLoan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/loans/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: loanKeys.lists() });
      qc.invalidateQueries({ queryKey: loanKeys.stats() });
    },
  });
};

// ── Add Payment ──────────────────────────────────────────────────────────────

export const useAddPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ loanId, ...data }: any) => client.post(`/loans/${loanId}/payments`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: loanKeys.lists() });
      qc.invalidateQueries({ queryKey: loanKeys.detail(vars.loanId) });
      qc.invalidateQueries({ queryKey: loanKeys.stats() });
    },
  });
};

// ── Delete Payment ───────────────────────────────────────────────────────────

export const useDeletePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ loanId, paymentId }: { loanId: string; paymentId: string }) =>
      client.delete(`/loans/${loanId}/payments/${paymentId}`),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: loanKeys.lists() });
      qc.invalidateQueries({ queryKey: loanKeys.detail(vars.loanId) });
      qc.invalidateQueries({ queryKey: loanKeys.stats() });
    },
  });
};

// ── Toggle Settled ───────────────────────────────────────────────────────────

export const useToggleSettled = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.patch(`/loans/${id}/toggle-settled`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: loanKeys.lists() });
      qc.invalidateQueries({ queryKey: loanKeys.detail(id) });
      qc.invalidateQueries({ queryKey: loanKeys.stats() });
    },
  });
};
