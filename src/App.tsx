import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ConfirmProvider } from './components/common';
import { useTheme } from './hooks/useTheme';
import RootNavigator from './navigation/RootNavigator';
import { queryClient } from './config/queryClient';
import { navigationRef } from './navigation/navigationRef';
import notificationService from './services/notificationService';
import { useAuthStore } from './store/authStore';

// Import interceptors to initialize
import './api/interceptors';

const App: React.FC = () => {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const initNotifications = async () => {
      try {
        await notificationService.initialize();
        console.log('✅ Notifications initialized');
      } catch (error) {
        console.error('❌ Notification init error:', error);
      }
    };

    initNotifications();

    return () => {
      notificationService.unregisterDevice();
    };
  }, [isAuthenticated]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer ref={navigationRef}>
            <ConfirmProvider>
              <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent={true}
              />
              <RootNavigator />
              <Toast />
            </ConfirmProvider>
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;