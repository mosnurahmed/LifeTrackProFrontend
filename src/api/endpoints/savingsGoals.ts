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
  // Virtuals
  progress: number;
  remainingAmount: number;
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
  date?: string;
  note?: string;
}

export const savingsGoalApi = {
  // Get all savings goals
  getAll: () => client.get('/savings'),

  // Get single savings goal
  getById: (id: string) => client.get(`/savings/${id}`),

  // Create savings goal
  create: (data: CreateSavingsGoalData) => client.post('/savings', data),

  // Update savings goal
  update: (id: string, data: Partial<CreateSavingsGoalData>) =>
    client.put(`/savings/${id}`, data),

  // Delete savings goal
  delete: (id: string) => client.delete(`/savings/${id}`),

  // Add contribution
  addContribution: (id: string, data: AddContributionData) =>
    client.post(`/savings/${id}/contribute`, data),

  // Get contribution history
  getContributions: (id: string) =>
    client.get(`/savings/${id}/contributions`),

  // Get statistics
  getStats: () => client.get('/savings/stats'),
};

export default savingsGoalApi;