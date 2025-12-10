import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useTheme } from './hooks/useTheme';
import RootNavigator from './navigation/RootNavigator';
import { queryClient } from './config/queryClient';

// Import interceptors to initialize
import './api/interceptors';

const App: React.FC = () => {
  const { colors, isDark } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <RootNavigator />

        {/* Toast Messages */}
        <Toast />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

export default App;
