/**
 * Budget API Endpoints
 */

import client from '../client';

export interface BudgetStatus {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'exceeded';
  color: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  categoriesWithBudget: number;
  categoriesOverBudget: number;
  categories: BudgetStatus[];
}

export interface UpdateBudgetData {
  budget: number | null;
}

export const budgetApi = {
  // Get budget summary (all categories)
  getSummary: () => client.get('/budget/summary'),

  // Get budget alerts
  getAlerts: () => client.get('/budget/alerts'),

  // Get single category budget status
  getCategoryStatus: (categoryId: string) =>
    client.get(`/budget/category/${categoryId}`),

  // Update category budget
  updateCategoryBudget: (categoryId: string, data: UpdateBudgetData) =>
    client.put(`/budget/category/${categoryId}`, data),
};

export default budgetApi;