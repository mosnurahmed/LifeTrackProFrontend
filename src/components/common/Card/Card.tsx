/**
 * Reusable Card Component
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'md',
}) => {
  const { colors, spacing, borderRadius, shadows } = useTheme();

  const paddingValue = {
    none: 0,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  };

  const variantStyles = {
    default: {
      backgroundColor: colors.surface,
      ...shadows.sm,
    },
    elevated: {
      backgroundColor: colors.surface,
      ...shadows.lg,
    },
    outlined: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
  };

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: borderRadius.lg,
          padding: paddingValue[padding],
        },
        variantStyles[variant],
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});

export default Card;
