/**
 * Button Styles
 * 
 * Dynamic styles based on variant, size, state
 */

import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ColorPalette } from '../../../theme/colors';
import { spacing, borderRadius } from '../../../theme/spacing';
import { ButtonVariant, ButtonSize } from './Button.types';

export const createButtonStyles = (
  colors: ColorPalette,
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean,
  fullWidth: boolean
) => {
  // Base container style
  const baseContainer: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 0
  };

  // Size styles
  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 32
    },
    md: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      minHeight: 44
    },
    lg: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      minHeight: 56
    }
  };

  // Variant styles
  const variantContainerStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: colors.primary,
      borderWidth: 0
    },
    secondary: {
      backgroundColor: colors.text.tertiary,
      borderWidth: 0
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0
    },
    danger: {
      backgroundColor: colors.danger,
      borderWidth: 0
    }
  };

  const variantTextStyles: Record<ButtonVariant, TextStyle> = {
    primary: {
      color: colors.text.inverse
    },
    secondary: {
      color: colors.text.inverse
    },
    outline: {
      color: colors.primary
    },
    ghost: {
      color: colors.primary
    },
    danger: {
      color: colors.text.inverse
    }
  };

  // Text size styles
  const textSizeStyles: Record<ButtonSize, TextStyle> = {
    sm: {
      fontSize: 14,
      fontWeight: '600'
    },
    md: {
      fontSize: 16,
      fontWeight: '600'
    },
    lg: {
      fontSize: 18,
      fontWeight: '600'
    }
  };

  // Disabled styles
  const disabledContainerStyle: ViewStyle = disabled
    ? {
        opacity: 0.5
      }
    : {};

  // Full width style
  const fullWidthStyle: ViewStyle = fullWidth
    ? {
        width: '100%'
      }
    : {};

  // Combine all styles
  const containerStyle: ViewStyle = {
    ...baseContainer,
    ...sizeStyles[size],
    ...variantContainerStyles[variant],
    ...disabledContainerStyle,
    ...fullWidthStyle
  };

  const textStyle: TextStyle = {
    ...textSizeStyles[size],
    ...variantTextStyles[variant]
  };

  return StyleSheet.create({
    container: containerStyle,
    text: textStyle,
    icon: {
      marginHorizontal: spacing.xs
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center'
    }
  });
};