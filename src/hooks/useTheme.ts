import { useThemeStore } from '../store/themeStore';

export const useTheme = () => {
  const { theme, themeConfig, toggleTheme, setTheme } = useThemeStore();
  
  return {
    theme,
    colors: themeConfig.colors,
    typography: themeConfig.typography,
    textStyles: themeConfig.textStyles,
    spacing: themeConfig.spacing,
    borderRadius: themeConfig.borderRadius,
    layout: themeConfig.layout,
    shadows: themeConfig.shadows,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark'
  };
};