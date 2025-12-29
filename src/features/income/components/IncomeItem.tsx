/**
 * Income Item Component - With Selection Support
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { formatCurrency, formatDate } from '../../../utils/formatters';

interface IncomeItemProps {
  income: any;
  onPress: () => void;
  onDelete: () => void;
  selectionMode?: boolean; // ✅ NEW
  selected?: boolean; // ✅ NEW
  onToggleSelect?: () => void; // ✅ NEW
}

const IncomeItem: React.FC<IncomeItemProps> = ({
  income,
  onPress,
  onDelete,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}) => {
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  const renderRightActions = () => (
    <TouchableOpacity style={styles.deleteAction} onPress={onDelete}>
      <Icon name="trash-outline" size={24} color={colors.text.inverse} />
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  const content = (
    <View
      style={[
        styles.container,
        selectionMode && selected && styles.containerSelected,
      ]}
    >
      {/* ✅ Selection Checkbox */}
      {selectionMode && (
        <TouchableOpacity
          style={[
            styles.checkbox,
            selected && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          onPress={onToggleSelect}
        >
          {selected && (
            <Icon name="checkmark" size={16} color={colors.text.inverse} />
          )}
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        {/* Left Section */}
        <View style={styles.left}>
          {/* Category Icon */}
          <View
            style={[
              styles.categoryIcon,
              {
                backgroundColor: `${
                  income.categoryId?.color ||
                  income.category?.color ||
                  colors.primary
                }15`,
              },
            ]}
          >
            <Icon
              name={
                income.categoryId?.icon || income.category?.icon || 'wallet'
              }
              size={24}
              color={
                income.categoryId?.color ||
                income.category?.color ||
                colors.primary
              }
            />
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.source} numberOfLines={1}>
              {income.source}
            </Text>
            <View style={styles.meta}>
              <Text style={styles.category} numberOfLines={1}>
                {income.categoryId?.name ||
                  income.category?.name ||
                  'Uncategorized'}
              </Text>
              <View style={styles.dot} />
              <Text style={styles.date}>
                {formatDate(income.date, 'dd MMM yyyy')}
              </Text>
            </View>
            {income.description && (
              <Text style={styles.description} numberOfLines={1}>
                {income.description}
              </Text>
            )}
          </View>
        </View>

        {/* Right Section */}
        <View style={styles.right}>
          <Text style={styles.amount}>{formatCurrency(income.amount)}</Text>
          {income.isRecurring && (
            <View style={styles.recurringBadge}>
              <Icon name="repeat" size={12} color={colors.info} />
              <Text style={styles.recurringText}>Recurring</Text>
            </View>
          )}
          {income.paymentMethod && (
            <View style={styles.paymentBadge}>
              <Icon
                name={
                  income.paymentMethod === 'cash'
                    ? 'cash-outline'
                    : income.paymentMethod === 'card'
                    ? 'card-outline'
                    : income.paymentMethod === 'mobile_banking'
                    ? 'phone-portrait-outline'
                    : 'business-outline'
                }
                size={10}
                color={colors.text.tertiary}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );

  // ✅ Disable swipe in selection mode
  if (selectionMode) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    </Swipeable>
  );
};

const createStyles = (
  colors: any,
  textStyles: any,
  spacing: any,
  borderRadius: any,
) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.md,
    },
    containerSelected: {
      backgroundColor: `${colors.primary}10`,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: spacing.md,
    },
    categoryIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    info: {
      flex: 1,
    },
    source: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: 4,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: 4,
    },
    category: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontSize: 11,
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: colors.text.tertiary,
    },
    date: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontSize: 11,
    },
    description: {
      ...textStyles.caption,
      color: colors.text.tertiary,
      fontSize: 10,
    },
    right: {
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
    amount: {
      ...textStyles.bodyMedium,
      color: colors.success,
      fontWeight: '700',
      marginBottom: 4,
    },
    recurringBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      backgroundColor: `${colors.info}15`,
      borderRadius: borderRadius.sm,
    },
    recurringText: {
      ...textStyles.caption,
      color: colors.info,
      fontSize: 9,
      fontWeight: '600',
    },
    paymentBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteAction: {
      backgroundColor: colors.danger,
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      marginBottom: spacing.md,
      borderRadius: borderRadius.md,
    },
    deleteText: {
      ...textStyles.caption,
      color: colors.text.inverse,
      fontWeight: '600',
      marginTop: 4,
    },
  });

export default IncomeItem;
