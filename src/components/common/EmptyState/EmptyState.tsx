/**
 * Empty State Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import Button from '../Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'document-outline',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const { colors, textStyles, spacing } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${colors.primary}15` },
        ]}
      >
        <Icon name={icon} size={48} color={colors.primary} />
      </View>

      <Text
        style={[
          textStyles.h3,
          { color: colors.text.primary, marginTop: spacing.lg },
        ]}
      >
        {title}
      </Text>

      {message && (
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
      )}

      {actionLabel && onAction && (
        <Button onPress={onAction} style={{ marginTop: spacing.xl }}>
          {actionLabel}
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

export default EmptyState;
