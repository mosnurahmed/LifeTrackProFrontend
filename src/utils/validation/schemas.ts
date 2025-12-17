/**
 * Validation Schemas using Yup
 */

import * as yup from 'yup';

// Auth schemas
export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

// Expense schemas
export const expenseSchema = yup.object({
  categoryId: yup.string().required('Category is required'),
  amount: yup
    .number()
    .positive('Amount must be positive')
    .min(0.01, 'Amount must be at least 0.01')
    .required('Amount is required'),
  description: yup.string().optional(),
  date: yup.date().required('Date is required'),
  paymentMethod: yup
    .string()
    .oneOf(['cash', 'card', 'mobile_banking'])
    .optional(),
  location: yup.object({
    latitude: yup.number().optional(),
    longitude: yup.number().optional(),
    address: yup.string().optional(),
  }).optional(),
  tags: yup.array().of(yup.string()).optional(),
  // ✅ Add recurring fields
  isRecurring: yup.boolean().optional(),
  recurringConfig: yup.object({
    interval: yup.string().oneOf(['daily', 'weekly', 'monthly', 'yearly']).optional(),
    endDate: yup.date().optional(),
  }).optional(),
  receiptImage: yup.string().optional(),
});

// Bazar schemas
export const bazarListSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().optional(),
  totalBudget: yup.number().positive().optional(),
});

export const bazarItemSchema = yup.object({
  name: yup.string().required('Item name is required'),
  quantity: yup
    .number()
    .positive('Quantity must be positive')
    .required('Quantity is required'),
  unit: yup.string().required('Unit is required'),
  estimatedPrice: yup.number().positive().optional(),
  category: yup.string().optional(),
  notes: yup.string().optional(),
});

// Category schema 
export const categorySchema = yup.object({
  name: yup
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  icon: yup.string().required('Icon is required'),
  color: yup.string().required('Color is required'),

  monthlyBudget: yup.number().positive().optional()
});

// Budget update schema
export const updateBudgetSchema = yup.object({
  budget: yup
    .number()
    .nullable()
    .positive('Budget must be a positive number')
    .optional(),
});

// Task schema
export const taskSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().optional(),
  priority: yup
    .string()
    .oneOf(['urgent', 'high', 'medium', 'low'])
    .required('Priority is required'),
  dueDate: yup.date().optional()
});

// Note schema
export const noteSchema = yup.object({
  title: yup.string().required('Title is required'),
  content: yup.string().required('Content is required'),
  tags: yup.array().of(yup.string()).optional(),
  color: yup.string().optional()
});

// Savings goal schema
export const savingsGoalSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().optional(),
  targetAmount: yup
    .number()
    .positive('Amount must be positive')
    .required('Amount is required'),
  targetDate: yup.date().optional(),
  priority: yup
    .string()
    .oneOf(['high', 'medium', 'low'])
    .required('Priority is required')
});