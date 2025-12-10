/**
 * Formatting Utility Functions
 */

import { format, formatDistanceToNow, parseISO } from 'date-fns';

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'BDT'): string => {
  if (currency === 'BDT') {
    return `৳${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2
  });
};

// Date formatting
export const formatDate = (date: string | Date, formatStr: string = 'dd MMM yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

// Relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Number formatting
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-IN');
};

// Percentage formatting
export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

// Phone number formatting
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as: +880 1712-345678
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `+88${cleaned.substring(0, 4)}-${cleaned.substring(4)}`;
  }
  
  return phone;
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};