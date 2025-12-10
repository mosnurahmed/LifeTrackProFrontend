/**
 * Error State Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import Button from '../Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Please try again',
  onRetry,
}) => {
  const { colors, textStyles, spacing } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${colors.danger}15` },
        ]}
      >
        <Icon name="alert-circle" size={48} color={colors.danger} />
      </View>

      <Text
        style={[
          textStyles.h3,
          { color: colors.text.primary, marginTop: spacing.lg },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          textStyles.body,
          {
            color: colors.text.secondary,
            marginTop: spacing.sm,
            textAlign: 'center',
          },
        ]}
      >
        {message}
      </Text>

      {onRetry && (
        <Button
          onPress={onRetry}
          variant="outline"
          style={{ marginTop: spacing.xl }}
        >
          Try Again
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ErrorState;
