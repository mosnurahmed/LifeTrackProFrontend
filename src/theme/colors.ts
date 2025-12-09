/**
 * Color Palette - Green Theme
 * 
 * Professional, eye-comfortable green-based design
 */

export interface ColorPalette {
  primary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  background: string;
  surface: string;
  card: string;
  border: string;
  divider: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
  };
  income: string;
  expense: string;
  shadow: string;
}

// Light Theme - Green Vibe 🍃
export const lightColors: ColorPalette = {
  // Primary Green Colors
  primary: '#10B981',        // Emerald Green - Main brand
  success: '#059669',        // Darker Green
  danger: '#EF4444',         // Red
  warning: '#F59E0B',        // Amber
  info: '#3B82F6',           // Blue
  
  // Backgrounds - Slight green tint
  background: '#FFFFFF',
  surface: '#F0FDF4',        // Very light green tint
  card: '#FFFFFF',
  
  // Borders & Dividers
  border: '#D1FAE5',         // Light green border
  divider: '#E5E7EB',
  
  // Text Colors
  text: {
    primary: '#111827',      // Almost black
    secondary: '#6B7280',    // Gray
    tertiary: '#9CA3AF',     // Light gray
    disabled: '#D1D5DB',     // Very light gray
    inverse: '#FFFFFF'       // White
  },
  
  // Financial
  income: '#10B981',         // Green
  expense: '#EF4444',        // Red
  
  // Shadow
  shadow: '#000000'
};

// Dark Theme - Deep Green Vibe 🌙🍃
export const darkColors: ColorPalette = {
  // Primary Green Colors (Lighter for dark mode)
  primary: '#34D399',        // Lighter emerald
  success: '#10B981',        // Medium green
  danger: '#F87171',         // Lighter red
  warning: '#FBBF24',        // Lighter amber
  info: '#60A5FA',           // Lighter blue
  
  // Backgrounds - Dark with green tint
  background: '#0F172A',     // Very dark blue-gray
  surface: '#1E293B',        // Dark slate
  card: '#334155',           // Lighter slate
  
  // Borders & Dividers
  border: '#475569',         // Medium slate
  divider: '#334155',
  
  // Text Colors
  text: {
    primary: '#F9FAFB',      // Almost white
    secondary: '#D1D5DB',    // Light gray
    tertiary: '#9CA3AF',     // Medium gray
    disabled: '#6B7280',     // Dark gray
    inverse: '#111827'       // Dark
  },
  
  // Financial
  income: '#34D399',         // Light green
  expense: '#F87171',        // Light red
  
  // Shadow
  shadow: '#000000'
};

export type Theme = 'light' | 'dark';

export const colors = {
  light: lightColors,
  dark: darkColors
};