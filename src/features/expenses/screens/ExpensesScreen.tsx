/**
 * Expenses Screen - Redesigned with Overview
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import {
  useExpenses,
  useDeleteExpense,
  useExpenseStats,
} from '../../../hooks/api/useExpenses';
import ExpenseItem from '../components/ExpenseItem';
import {
  Card,
  Button,
  EmptyState,
  ErrorState,
} from '../../../components/common';
import { SkeletonList } from '../../../components/common/Loading';
import { formatCurrency } from '../../../utils/formatters';

const ExpensesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const {
    data: expensesData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useExpenses();

  const { data: statsData } = useExpenseStats();
  const deleteMutation = useDeleteExpense();

  const expenses = expensesData?.data?.data || [];
  const stats = statsData?.data;

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  const handleAddExpense = () => {
    (navigation as any).navigate('AddExpense', { mode: 'create' });
  };

  const handleViewStats = () => {
    (navigation as any).navigate('ExpenseStats');
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Delete Expenses',
      `Delete ${selectedItems.length} expense(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            for (const id of selectedItems) {
              await deleteMutation.mutateAsync(id);
            }
            setSelectedItems([]);
            setSelectionMode(false);
          },
        },
      ],
    );
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Expenses</Text>
        </View>
        <SkeletonList count={5} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Expenses</Text>
        </View>
        <ErrorState
          title="Failed to load expenses"
          message="Please try again"
          onRetry={refetch}
        />
      </View>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Expenses</Text>
        </View>
        <EmptyState
          icon="wallet-outline"
          title="No Expenses Yet"
          message="Start tracking your expenses"
          actionLabel="Add Expense"
          onAction={handleAddExpense}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Expenses</Text>
          <Text style={styles.headerSubtitle}>
            {expenses.length} transactions
          </Text>
        </View>
        <TouchableOpacity style={styles.statsButton} onPress={handleViewStats}>
          <Icon name="stats-chart" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Overview Card */}
      {stats && (
        <Card style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>This Month</Text>
            <TouchableOpacity onPress={handleViewStats}>
              <Text style={styles.viewDetailsText}>View Details →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.overviewMain}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total Spent</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(stats.thisMonth?.total || 0)}
              </Text>
            </View>

            {stats.comparison?.percentageChange !== 0 && (
              <View style={styles.comparisonSection}>
                <View
                  style={[
                    styles.comparisonBadge,
                    {
                      backgroundColor:
                        stats.comparison.percentageChange > 0
                          ? `${colors.danger}15`
                          : `${colors.success}15`,
                    },
                  ]}
                >
                  <Icon
                    name={
                      stats.comparison.percentageChange > 0
                        ? 'trending-up'
                        : 'trending-down'
                    }
                    size={16}
                    color={
                      stats.comparison.percentageChange > 0
                        ? colors.danger
                        : colors.success
                    }
                  />
                  <Text
                    style={[
                      styles.comparisonText,
                      {
                        color:
                          stats.comparison.percentageChange > 0
                            ? colors.danger
                            : colors.success,
                      },
                    ]}
                  >
                    {Math.abs(stats.comparison.percentageChange).toFixed(1)}%
                  </Text>
                </View>
                <Text style={styles.comparisonLabel}>vs last month</Text>
              </View>
            )}
          </View>

          <View style={styles.overviewStats}>
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatValue}>
                {stats.thisMonth?.count || 0}
              </Text>
              <Text style={styles.overviewStatLabel}>Transactions</Text>
            </View>
            <View style={styles.overviewStatDivider} />
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatValue}>
                {formatCurrency(stats.thisMonth?.average || 0)}
              </Text>
              <Text style={styles.overviewStatLabel}>Daily Avg</Text>
            </View>
            <View style={styles.overviewStatDivider} />
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatValue}>
                {formatCurrency(stats.thisMonth?.projected || 0)}
              </Text>
              <Text style={styles.overviewStatLabel}>Projected</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Selection Mode Bar */}
      {selectionMode && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            {selectedItems.length} selected
          </Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={handleDeleteSelected}
              disabled={selectedItems.length === 0}
            >
              <Icon name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => {
                setSelectionMode(false);
                setSelectedItems([]);
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Expenses List */}
      <FlatList
        data={expenses}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <ExpenseItem
            expense={item}
            onPress={() =>
              selectionMode
                ? toggleSelection(item._id)
                : (navigation as any).navigate('ExpenseDetails', {
                    expenseId: item._id,
                  })
            }
            onLongPress={() => {
              if (!selectionMode) {
                setSelectionMode(true);
                setSelectedItems([item._id]);
              }
            }}
            isSelected={selectedItems.includes(item._id)}
            selectionMode={selectionMode}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* FAB */}
      {!selectionMode && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleAddExpense}
          activeOpacity={0.8}
        >
          <Icon name="add" size={28} color={colors.text.inverse} />
        </TouchableOpacity>
      )}
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
    headerSubtitle: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    statsButton: {
      padding: spacing.sm,
    },
    overviewCard: {
      margin: spacing.lg,
    },
    overviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    overviewTitle: {
      ...textStyles.h4,
      color: colors.text.primary,
    },
    viewDetailsText: {
      ...textStyles.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    overviewMain: {
      marginBottom: spacing.lg,
    },
    totalSection: {
      marginBottom: spacing.sm,
    },
    totalLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    totalValue: {
      ...textStyles.h1,
      color: colors.text.primary,
      fontWeight: '700',
    },
    comparisonSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    comparisonBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    comparisonText: {
      ...textStyles.caption,
      fontWeight: '700',
    },
    comparisonLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    overviewStats: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: borderRadius.md,
    },
    overviewStatItem: {
      flex: 1,
      alignItems: 'center',
    },
    overviewStatValue: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    overviewStatLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    overviewStatDivider: {
      width: 1,
      backgroundColor: colors.border,
    },
    selectionBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    selectionText: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
    },
    selectionActions: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    selectionButton: {
      padding: spacing.sm,
    },
    cancelText: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    listContent: {
      padding: spacing.lg,
      paddingBottom: 100,
    },
    fab: {
      position: 'absolute',
      bottom: 80,
      right: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.lg,
    },
  });

export default ExpensesScreen;
