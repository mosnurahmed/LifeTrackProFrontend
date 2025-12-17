import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        console.log('✅ setAuth called with:', {
          userName: user.name,
          hasToken: !!accessToken,
          tokenLength: accessToken?.length
        });
        
        set({
          isAuthenticated: true,
          user,
          accessToken,
          refreshToken
        });
        
        // Verify immediately
        const state = get();
        console.log('✅ State after setAuth:', {
          isAuthenticated: state.isAuthenticated,
          hasUser: !!state.user,
          hasAccessToken: !!state.accessToken,
          tokenPreview: state.accessToken?.substring(0, 20)
        });
      },

      clearAuth: () => {
        console.log('🚪 clearAuth called');
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null
        });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log('💾 Rehydrated state:', {
          isAuthenticated: state?.isAuthenticated,
          hasUser: !!state?.user,
          hasToken: !!state?.accessToken
        });
      }
    }
  )
);