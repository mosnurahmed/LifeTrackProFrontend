/**
 * Bazar (Shopping Lists) API Endpoints - Matched with Backend
 */

import client from '../client';

// Types
export interface ShoppingItem {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice?: number;
  actualPrice?: number;
  isPurchased: boolean;
  category?: string;
  notes?: string;
}

export interface ShoppingList {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  items: ShoppingItem[];
  totalBudget?: number;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  totalItems: number;
  completedItems: number;
  completionPercentage: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  budgetRemaining: number;
}

export interface CreateListData {
  title: string;
  description?: string;
  totalBudget?: number;
}

export interface UpdateListData {
  title?: string;
  description?: string;
  totalBudget?: number;
}

export interface CreateItemData {
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice?: number;
  category?: string;
  notes?: string;
}

export interface UpdateItemData {
  name?: string;
  quantity?: number;
  unit?: string;
  estimatedPrice?: number;
  actualPrice?: number;
  category?: string;
  notes?: string;
}

// API Functions

// Get all shopping lists
export const getAll = () => client.get('/bazar');

// Get single shopping list
export const getById = (id: string) => client.get(`/bazar/${id}`);

// Create shopping list
export const create = (data: CreateListData) => client.post('/bazar', data);

// Update shopping list
export const update = (id: string, data: UpdateListData) =>
  client.put(`/bazar/${id}`, data);

// Delete shopping list
export const deleteList = (id: string) => client.delete(`/bazar/${id}`);

// Add item to list
export const addItem = (listId: string, data: CreateItemData) =>
  client.post(`/bazar/${listId}/items`, data);

// Update item
export const updateItem = (listId: string, itemId: string, data: UpdateItemData) =>
  client.put(`/bazar/${listId}/items/${itemId}`, data);

// Delete item
export const deleteItem = (listId: string, itemId: string) =>
  client.delete(`/bazar/${listId}/items/${itemId}`);

// Toggle item purchase status
export const toggleItem = (listId: string, itemId: string) =>
  client.patch(`/bazar/${listId}/items/${itemId}/toggle`);

// Get statistics
export const getStats = (year?: number, month?: number) => {
  const params = new URLSearchParams();
  if (year) params.append('year', String(year));
  if (month) params.append('month', String(month));
  const qs = params.toString();
  return client.get(`/bazar/stats${qs ? `?${qs}` : ''}`);
};

// Monthly bazar budget
export const getMonthlyBudget = (year: number, month: number) =>
  client.get(`/bazar/budget/${year}/${month}`);

export const setMonthlyBudget = (year: number, month: number, budget: number) =>
  client.put(`/bazar/budget/${year}/${month}`, { budget });

const bazarApi = {
  getAll,
  getById,
  create,
  update,
  deleteList,
  addItem,
  updateItem,
  deleteItem,
  toggleItem,
  getStats,
  getMonthlyBudget,
  setMonthlyBudget,
};

export default bazarApi;