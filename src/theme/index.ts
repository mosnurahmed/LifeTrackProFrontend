/**
 * Theme System - Main Export
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';

import { colors, ColorPalette, Theme } from './colors';
import { typography, textStyles } from './typography';
import { spacing, borderRadius, layout } from './spacing';
import { shadows } from './shadows';

export interface ThemeConfig {
  colors: ColorPalette;
  typography: typeof typography;
  textStyles: typeof textStyles;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  layout: typeof layout;
  shadows: typeof shadows;
}

export const getTheme = (mode: Theme): ThemeConfig => ({
  colors: colors[mode],
  typography,
  textStyles,
  spacing,
  borderRadius,
  layout,
  shadows
});

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');