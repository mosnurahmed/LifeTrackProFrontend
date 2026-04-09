/**
 * Transfer API Hooks
 * All hooks have select — data already extracted
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';

const keys = {
  all: ['transfers'] as const,
  list: () => [...keys.all, 'list'] as const,
  balances: () => [...keys.all, 'balances'] as const,
  expenseByMethod: (y?: number, m?: number) => [...keys.all, 'expense-method', y, m] as const,
};

const expenseKeys = { lists: () => ['expenses', 'list'], stats: () => ['expenses', 'stats'] };
const incomeKeys = { lists: () => ['income', 'list'], stats: () => ['income', 'stats'] };
const savingsKeys = { stats: () => ['savings', 'stats'] };

export const useTransfers = () => useQuery({
  queryKey: keys.list(),
  queryFn: () => client.get('/transfers'),
  select: (res) => res.data?.data ?? [],
});

export const usePaymentBalances = () => useQuery({
  queryKey: keys.balances(),
  queryFn: () => client.get('/transfers/balances'),
  select: (res) => res.data?.data,
});

export const useExpenseByMethod = (year?: number, month?: number) => useQuery({
  queryKey: keys.expenseByMethod(year, month),
  queryFn: () => client.get('/transfers/expense-by-method', { params: { year, month } }),
  select: (res) => res.data?.data ?? [],
});

export const useCreateTransfer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => client.post('/transfers', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list() });
      qc.invalidateQueries({ queryKey: keys.balances() });
      qc.invalidateQueries({ queryKey: savingsKeys.stats() });
    },
  });
};

export const useDeleteTransfer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client.delete(`/transfers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list() });
      qc.invalidateQueries({ queryKey: keys.balances() });
    },
  });
};
