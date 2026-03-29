/**
 * App Constants
 * 
 * Centralized configuration values
 */

// API Configuration
const LOCAL_IP = '192.168.1.6'; // ← তোমার PC-র local IP দাও
// `http://${LOCAL_IP}:5000`

export const API_BASE_URL = __DEV__
  ? `https://lifetrack-backend-mosnur-ahmeds-projects.vercel.app/api`
  : 'https://lifetrack-backend-mosnur-ahmeds-projects.vercel.app/api';

export const SOCKET_URL = __DEV__
  ? `https://lifetrack-backend-mosnur-ahmeds-projects.vercel.app`
  : 'https://lifetrack-backend-mosnur-ahmeds-projects.vercel.app';

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