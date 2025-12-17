/**
 * Formatting Utilities
 */

/**
 * Format number as currency (BDT)
 */
export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '৳0';
  }

  const integerAmount = Math.floor(amount);
  return `৳${integerAmount}`;
};


/**
 * Format date
 */
export const formatDate = (
  date: Date | string | undefined | null,
  format: string = 'dd/MM/yyyy'
): string => {
  // ✅ Handle undefined/null
  if (!date) {
    return 'N/A';
  }

  const d = typeof date === 'string' ? new Date(date) : date;
  
  // ✅ Check if valid date
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const monthName = monthNames[d.getMonth()];

  switch (format) {
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`;
    case 'dd MMM yyyy':
      return `${day} ${monthName} ${year}`;
    case 'MMM dd, yyyy':
      return `${monthName} ${day}, ${year}`;
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string | undefined | null): string => {
  // ✅ Handle undefined/null
  if (!date) {
    return 'Unknown';
  }

  const d = typeof date === 'string' ? new Date(date) : date;
  
  // ✅ Check if valid date
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
};

/**
 * Format percentage
 */
export const formatPercentage = (
  value: number | undefined | null,
  total: number | undefined | null
): string => {
  // ✅ Handle undefined/null
  if (
    value === undefined ||
    value === null ||
    total === undefined ||
    total === null ||
    total === 0 ||
    isNaN(value) ||
    isNaN(total)
  ) {
    return '0%';
  }

  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

/**
 * Format number with K/M/B suffix
 */
export const formatCompactNumber = (num: number | undefined | null): string => {
  // ✅ Handle undefined/null
  if (num === undefined || num === null || isNaN(num)) {
    return '0';
  }

  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Truncate text
 */
export const truncateText = (text: string | undefined | null, maxLength: number = 50): string => {
  // ✅ Handle undefined/null
  if (!text) {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
};