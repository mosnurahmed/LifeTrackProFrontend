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
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time: Data cache এ থাকবে কতক্ষণ
      cacheTime: 10 * 60 * 1000, // 10 minutes
      
      // Retry: Failed হলে কতবার চেষ্টা করবে
      retry: 2,
      
      // Refetch on window focus: App reopen করলে refetch করবে কিনা
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect: Internet আসলে refetch করবে কিনা
      refetchOnReconnect: true,
      
      // Refetch on mount: Component mount হলে refetch করবে কিনা
      refetchOnMount: false
    },
    
    mutations: {
      // Retry: Mutation failed হলে চেষ্টা করবে না
      retry: 0
    }
  }
});