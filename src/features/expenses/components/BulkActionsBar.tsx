/**
 * Bulk Actions Bar
 *
 * Appears at bottom when items are selected
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onExport: () => void;
  onCancel: () => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onDelete,
  onExport,
  onCancel,
}) => {
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Icon name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.selectedText}>{selectedCount} selected</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onExport} style={styles.actionButton}>
          <Icon name="download-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
          <Icon name="trash-outline" size={24} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (
  colors: any,
  textStyles: any,
  spacing: any,
  borderRadius: any,
  shadows: any,
) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      ...shadows.lg,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    cancelButton: {
      padding: spacing.xs,
    },
    selectedText: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.lg,
    },
    actionButton: {
      padding: spacing.sm,
    },
  });

export default BulkActionsBar;
