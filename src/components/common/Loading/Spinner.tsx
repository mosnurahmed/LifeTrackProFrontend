/**
 * Custom Spinner Component
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

interface SpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  fullScreen?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'large',
  text,
  fullScreen = false,
}) => {
  const { colors, textStyles, spacing } = useTheme();

  const Container = fullScreen ? View : React.Fragment;
  const containerStyle = fullScreen ? styles.fullScreen : {};

  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {text && (
        <Text
          style={[
            textStyles.body,
            { color: colors.text.secondary, marginTop: spacing.md },
          ]}
        >
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
  },
});

export default Spinner;
