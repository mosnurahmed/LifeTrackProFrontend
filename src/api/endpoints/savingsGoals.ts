/**
 * Savings Goals API Endpoints
 */

import client from '../client';

export interface Contribution {
  _id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface SavingsGoal {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  icon: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
  contributions: Contribution[];
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  remainingAmount: number;
}

export interface MonthlyHistoryItem {
  year: number;
  month: number;
  income: number;
  expenses: number;
  saved: number;
  cumulativeBalance: number;
}

export interface SavingsStats {
  initialBalance: number;
  allTimeIncome: number;
  allTimeExpenses: number;
  allTimeSurplus: number;
  totalBalance: number;
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  totalRemainingAmount: number;
  overallProgress: number;
  year: number;
  month: number;
  thisMonthIncome: number;
  thisMonthExpenses: number;
  thisMonthSurplus: number;
  thisMonthSaved: number;
  monthlyHistory: MonthlyHistoryItem[];
}

export interface CreateSavingsGoalData {
  title: string;
  description?: string;
  targetAmount: number;
  targetDate?: string;
  icon: string;
  color: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface AddContributionData {
  amount: number;
  note?: string;
}

export const savingsGoalApi = {
  getAll:            ()                                       => client.get('/savings'),
  getById:           (id: string)                            => client.get(`/savings/${id}`),
  create:            (data: CreateSavingsGoalData)           => client.post('/savings', data),
  update:            (id: string, data: Partial<CreateSavingsGoalData>) => client.put(`/savings/${id}`, data),
  delete:            (id: string)                            => client.delete(`/savings/${id}`),
  addContribution:   (id: string, data: AddContributionData) => client.post(`/savings/${id}/contribute`, data),
  getContributions:  (id: string)                            => client.get(`/savings/${id}/contributions`),
  getStats:          (year: number, month: number)           => client.get('/savings/stats', { params: { year, month } }),
  getAccount:        ()                                       => client.get('/savings/account'),
  setAccount:        (initialBalance: number)                => client.put('/savings/account', { initialBalance }),
};

export default savingsGoalApi;
