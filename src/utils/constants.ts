/**
 * App Constants
 * 
 * Centralized configuration values
 */

import { Platform } from 'react-native';

// API Configuration
export const API_BASE_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'https://lifetrack-backend.vercel.app/api'  // Android emulator
    : 'https://lifetrack-backend.vercel.app/api'  // iOS simulator
  : 'https://lifetrack-backend.vercel.app/api';  // Production

export const SOCKET_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'https://lifetrack-backend.vercel.app/api'  // Android emulator
    : 'https://lifetrack-backend.vercel.app/api'
  : 'https://lifetrack-backend.vercel.app/api';

// Pagination
export const PAGE_SIZE = 20;

// Date Formats
export const DATE_FORMAT = 'dd MMM yyyy';
export const DATE_TIME_FORMAT = 'dd MMM yyyy, hh:mm a';

// Validation
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Currency
export const DEFAULT_CURRENCY = 'BDT';
export const CURRENCY_SYMBOL = '৳';