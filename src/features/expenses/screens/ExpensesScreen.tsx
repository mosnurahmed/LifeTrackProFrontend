/**
 * Expenses Screen
 *
 * List of all expenses
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@hooks/useTheme';

const ExpensesScreen: React.FC = () => {
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const mockExpenses = [
    {
      id: '1',
      title: 'Lunch',
      amount: 450,
      category: 'Food',
      icon: '🍔',
      date: 'Today',
    },
    {
      id: '2',
      title: 'Transport',
      amount: 200,
      category: 'Transport',
      icon: '🚗',
      date: 'Today',
    },
    {
      id: '3',
      title: 'Shopping',
      amount: 1500,
      category: 'Shopping',
      icon: '🛍️',
      date: 'Yesterday',
    },
  ];

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.expenseCard}>
      <View style={styles.expenseIcon}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <View style={styles.expenseDetails}>
        <Text style={styles.expenseTitle}>{item.title}</Text>
        <Text style={styles.expenseCategory}>
          {item.category} • {item.date}
        </Text>
      </View>
      <Text style={styles.expenseAmount}>৳{item.amount}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expenses</Text>
        <TouchableOpacity>
          <Icon name="filter" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={mockExpenses}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Icon name="add" size={28} color={colors.text.inverse} />
      </TouchableOpacity>
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
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      ...textStyles.h3,
      color: colors.text.primary,
    },
    listContent: {
      padding: spacing.lg,
    },
    expenseCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    expenseIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    iconText: {
      fontSize: 24,
    },
    expenseDetails: {
      flex: 1,
    },
    expenseTitle: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    expenseCategory: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    expenseAmount: {
      ...textStyles.h4,
      color: colors.danger,
    },
    fab: {
      position: 'absolute',
      bottom: 80,
      right: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.lg,
    },
  });

export default ExpensesScreen;
