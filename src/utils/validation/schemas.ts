/**
 * Validation Schemas using Zod
 */

import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Expense schemas
export const expenseSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive').min(0.01, 'Amount must be at least 0.01'),
  description: z.string().optional(),
  date: z.date(),
  paymentMethod: z.enum(['cash', 'card', 'mobile_banking']).optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// Category schema
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
  type: z.enum(['income', 'expense']),
  monthlyBudget: z.number().positive().optional()
});

// Task schema
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low']),
  dueDate: z.date().optional()
});

// Note schema
export const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).optional(),
  color: z.string().optional()
});

// Savings goal schema
export const savingsGoalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  targetAmount: z.number().positive('Amount must be positive'),
  targetDate: z.date().optional(),
  priority: z.enum(['high', 'medium', 'low'])
});