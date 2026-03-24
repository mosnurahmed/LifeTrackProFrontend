/**
 * React Query Configuration
 * 
 * Centralized query client with default options
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: Data fresh থাকবে কতক্ষণ
      staleTime: 30 * 1000, // 30 seconds — data fresh for 30s

      cacheTime: 10 * 60 * 1000, // 10 minutes cache

      retry: 2,

      refetchOnWindowFocus: true, // refetch when app comes to foreground

      refetchOnReconnect: true,

      refetchOnMount: true // refetch stale data on screen mount
    },
    
    mutations: {
      // Retry: Mutation failed হলে চেষ্টা করবে না
      retry: 0
    }
  }
});