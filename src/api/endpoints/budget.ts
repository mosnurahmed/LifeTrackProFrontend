/**
 * Budget API Endpoints
 */

import client from '../client';

export interface BudgetStatus {
  categoryId:        string;
  categoryName:      string;
  categoryColor:     string;
  categoryIcon:      string;
  budget:            number | null;
  budgetSource:      'monthly' | 'default' | 'none';
  spent:             number;
  remaining:         number | null;
  percentage:        number | null;
  percentageOfTotal: number;
  status:            'safe' | 'warning' | 'exceeded' | 'unbudgeted';
  color:             string;
  isOverride:        boolean;
}

export interface BudgetSummary {
  year:                 number;
  month:                number;
  totalBudget:          number | null;
  totalSpent:           number;
  totalRemaining:       number | null;
  overallPercentage:    number | null;
  categoriesWithBudget: number;
  categoriesOverBudget: number;
  categories:           BudgetStatus[];
}

const budgetApi = {
  getSummary: (year: number, month: number) =>
    client.get('/budget/summary', { params: { year, month } }),

  getAlerts: (year: number, month: number) =>
    client.get('/budget/alerts', { params: { year, month } }),

  setTotalBudget: (year: number, month: number, totalBudget: number | null) =>
    client.put('/budget/total', { year, month, totalBudget }),

  setCategoryMonthlyBudget: (
    categoryId: string,
    year: number,
    month: number,
    budget: number | null
  ) => client.put(`/budget/category/${categoryId}/month`, { year, month, budget }),

  setCategoryDefaultBudget: (categoryId: string, budget: number | null) =>
    client.put(`/budget/category/${categoryId}/default`, { budget }),
};

export default budgetApi;
