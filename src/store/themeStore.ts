import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, getTheme, ThemeConfig } from '../theme';

interface ThemeState {
  theme: Theme;
  themeConfig: ThemeConfig;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      themeConfig: getTheme('light'),
      
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({
          theme: newTheme,
          themeConfig: getTheme(newTheme)
        });
      },
      
      setTheme: (theme: Theme) => {
        set({
          theme,
          themeConfig: getTheme(theme)
        });
      }
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);