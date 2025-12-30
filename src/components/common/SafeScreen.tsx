/**
 * Safe Screen Component
 * Automatically handles safe areas for all screens
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

interface SafeScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}

const SafeScreen: React.FC<SafeScreenProps> = ({
  children,
  style,
  edges = ['top', 'left', 'right'], // Default: all except bottom (for tab bar)
}) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }, style]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeScreen;
