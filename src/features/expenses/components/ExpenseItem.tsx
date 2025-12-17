/**
 * Expense List Item with Swipe Actions & Selection Mode - FIXED
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { Expense } from '../../../api/endpoints/expenses';
import { formatCurrency, formatRelativeTime } from '../../../utils/formatters';

interface ExpenseItemProps {
  expense: Expense;
  onPress: () => void;
  onLongPress?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
  selectionMode?: boolean;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  onPress,
  onLongPress,
  onDelete,
  isSelected = false,
  selectionMode = false,
}) => {
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  // Get category - handle both nested and direct categoryId
  const category =
    expense.category ||
    (typeof expense.categoryId === 'object' ? expense.categoryId : null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          { backgroundColor: colors.danger, transform: [{ translateX }] },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete?.();
          }}
        >
          <Icon name="trash" size={24} color={colors.text.inverse} />
          <Text
            style={[
              textStyles.caption,
              { color: colors.text.inverse, marginTop: 4 },
            ]}
          >
            Delete
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
    isSelected,
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={selectionMode ? undefined : renderRightActions}
      overshootRight={false}
      enabled={!selectionMode}
    >
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        {/* Selection Checkbox */}
        {selectionMode && (
          <View style={styles.checkbox}>
            {isSelected ? (
              <View style={styles.checkboxSelected}>
                <Icon name="checkmark" size={16} color={colors.text.inverse} />
              </View>
            ) : (
              <View style={styles.checkboxUnselected} />
            )}
          </View>
        )}

        {/* Category Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: category?.color
                ? `${category.color}15`
                : `${colors.primary}15`,
            },
          ]}
        >
          <Icon
            name={category?.icon || 'cash-outline'}
            size={24}
            color={category?.color || colors.primary}
          />
        </View>

        {/* Details */}
        <View style={styles.details}>
          {/* Description or "No description" */}
          <Text style={styles.description} numberOfLines={1}>
            {expense.description || 'No description'}
          </Text>

          {/* Metadata: Category • Date */}
          <View style={styles.metadata}>
            <Text style={styles.category}>
              {category?.name || 'Uncategorized'}
            </Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.date}>{formatRelativeTime(expense.date)}</Text>
          </View>

          {/* Tags & Additional Info */}
          <View style={styles.metaIcons}>
            {/* Tags */}
            {expense.tags && expense.tags.length > 0 && (
              <View style={styles.tagsBadge}>
                <Icon name="pricetag" size={12} color={colors.primary} />
                <Text style={styles.tagsBadgeText}>{expense.tags.length}</Text>
              </View>
            )}

            {/* Payment Method */}
            {expense.paymentMethod && (
              <View style={styles.metaBadge}>
                <Icon
                  name={
                    expense.paymentMethod === 'cash'
                      ? 'cash'
                      : expense.paymentMethod === 'card'
                      ? 'card'
                      : 'phone-portrait'
                  }
                  size={12}
                  color={colors.text.secondary}
                />
              </View>
            )}

            {/* Location */}
            {expense.location?.address && (
              <View style={styles.metaBadge}>
                <Icon name="location" size={12} color={colors.text.secondary} />
              </View>
            )}

            {/* Receipt */}
            {expense.receiptImage && (
              <View style={styles.metaBadge}>
                <Icon
                  name="document-attach"
                  size={12}
                  color={colors.text.secondary}
                />
              </View>
            )}

            {/* Recurring */}
            {expense.isRecurring && (
              <View style={styles.metaBadge}>
                <Icon name="repeat" size={12} color={colors.warning} />
              </View>
            )}
          </View>
        </View>

        {/* Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const createStyles = (
  colors: any,
  textStyles: any,
  spacing: any,
  borderRadius: any,
  shadows: any,
  isSelected: boolean,
) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isSelected ? `${colors.primary}10` : colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: isSelected ? 2 : 1,
      borderColor: isSelected ? colors.primary : colors.border,
      ...shadows.sm,
    },
    checkbox: {
      marginRight: spacing.md,
    },
    checkboxSelected: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxUnselected: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    details: {
      flex: 1,
    },
    description: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    metadata: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    category: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    separator: {
      ...textStyles.caption,
      color: colors.text.tertiary,
      marginHorizontal: spacing.xs,
    },
    date: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    metaIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    tagsBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: `${colors.primary}15`,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
    },
    tagsBadgeText: {
      ...textStyles.caption,
      fontSize: 10,
      color: colors.primary,
      fontWeight: '600',
    },
    metaBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    amountContainer: {
      alignItems: 'flex-end',
      marginLeft: spacing.sm,
    },
    amount: {
      ...textStyles.h4,
      fontWeight: '700',
      color: colors.danger,
    },
    deleteAction: {
      width: 80,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
    },
    deleteButton: {
      alignItems: 'center',
      padding: spacing.md,
    },
  });

export default ExpenseItem;
