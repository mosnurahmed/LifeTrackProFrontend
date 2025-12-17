/**
 * API Interceptors
 * 
 * Request/Response interceptors for:
 * - Adding auth token to requests
 * - Handling errors globally
 * - Logging (development only)
 */

import { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import client from './client';
import { useAuthStore } from '../store/authStore';
import Toast from 'react-native-toast-message';

// Track if we're already handling a 401
let isRefreshing = false;

// Request Interceptor
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from store
    const { accessToken } = useAuthStore.getState();
    
    // Add token to headers if exists
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // Log request in development
    if (__DEV__) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data
      });
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
client.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (__DEV__) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    // Log error in development
    if (__DEV__) {
      console.log('❌ API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }
    
    // Handle different error types
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const message = (error.response.data as any)?.error || 'Something went wrong';
      
      switch (status) {
        case 401:
          // ✅ FIXED: Only logout if not already refreshing and not on login endpoint
          const isLoginRequest = error.config?.url?.includes('/auth/login');
          
          if (!isLoginRequest && !isRefreshing) {
            isRefreshing = true;
            
            // Try to refresh token
            const { refreshToken, clearAuth } = useAuthStore.getState();
            
            if (refreshToken) {
              try {
                // TODO: Implement token refresh
                // const response = await client.post('/auth/refresh', { refreshToken });
                // const { accessToken: newAccessToken } = response.data.data;
                // Update token in store
                // Retry original request
                
                // For now, just logout
                clearAuth();
                Toast.show({
                  type: 'error',
                  text1: 'Session Expired',
                  text2: 'Please login again'
                });
              } catch (refreshError) {
       
                clearAuth();
                Toast.show({
                  type: 'error',
                  text1: 'Session Expired',
                  text2: 'Please login again'
                });
              } finally {
                isRefreshing = false;
              }
            } else {
              clearAuth();
              Toast.show({
                type: 'error',
                text1: 'Session Expired',
                text2: 'Please login again'
              });
              isRefreshing = false;
            }
          }
          break;
          
        case 403:
          // Forbidden
          Toast.show({
            type: 'error',
            text1: 'Access Denied',
            text2: message
          });
          break;
          
        case 404:
          // Not found - Don't show toast for 404s
          // They might be intentional (checking if resource exists)
          break;
          
        case 422:
          // Validation error
          Toast.show({
            type: 'error',
            text1: 'Validation Error',
            text2: message
          });
          break;
          
        case 500:
          // Server error
          Toast.show({
            type: 'error',
            text1: 'Server Error',
            text2: 'Please try again later'
          });
          break;
          
        default:
          // Other errors - only show if not network related
          if (status >= 400 && status < 500) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: message
            });
          }
      }
    } else if (error.request) {
      // Request made but no response
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please check your internet connection'
      });
    } else {
      // Something else happened
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message
      });
    }
    
    return Promise.reject(error);
  }
);

export default client;