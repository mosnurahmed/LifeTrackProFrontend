/**
 * React Query Configuration
 */

import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// ── Online detection for React Native ────────────────────────────────────────
onlineManager.setEventListener(setOnline => {
  return NetInfo.addEventListener(state => {
    setOnline(!!state.isConnected);
  });
});

// ── Focus detection for React Native ─────────────────────────────────────────
focusManager.setEventListener(setFocused => {
  const sub = AppState.addEventListener('change', status => {
    setFocused(status === 'active');
  });
  return () => sub.remove();
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000,        // 10s — data fresh for shorter time
      gcTime: 5 * 60 * 1000,       // 5min cache (reduced from 24hr)
      retry: 1,                     // 1 retry only (faster fail)
      refetchOnWindowFocus: true,   // Refetch when app comes to foreground
      refetchOnReconnect: true,     // Refetch when internet reconnects
      refetchOnMount: 'always',     // Always refetch on screen mount
    },
    mutations: {
      retry: 0,
    },
  },
});