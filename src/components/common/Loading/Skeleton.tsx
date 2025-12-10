/* eslint-disable react-native/no-inline-styles */
/**
 * Skeleton Loading Component
 */

import React from 'react';
import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useTheme } from '../../../hooks/useTheme';

interface SkeletonProps {
  children: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({ children }) => {
  const { colors, isDark } = useTheme();

  return (
    <SkeletonPlaceholder
      backgroundColor={isDark ? colors.surface : '#E1E9EE'}
      highlightColor={isDark ? colors.border : '#F2F8FC'}
      speed={1200}
    >
      {children}
    </SkeletonPlaceholder>
  );
};

// Predefined skeleton components
export const SkeletonCard: React.FC = () => (
  <View style={{ marginBottom: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 48, height: 48, borderRadius: 24 }} />
      <View style={{ marginLeft: 16, flex: 1 }}>
        <View
          style={{ width: '80%', height: 20, borderRadius: 4, marginBottom: 8 }}
        />
        <View style={{ width: '60%', height: 16, borderRadius: 4 }} />
      </View>
    </View>
  </View>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <Skeleton>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </Skeleton>
);
