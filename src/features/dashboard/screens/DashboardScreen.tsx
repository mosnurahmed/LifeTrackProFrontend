/**
 * Dashboard Screen - Complete Production Version
 *
 * Features:
 * - Welcome card with user info
 * - Month/Today expense stats
 * - Quick action buttons
 * - Top categories by spending
 * - Recent transactions
 * - Budget progress bars
 * - Pull to refresh
 * - Navigation to all features
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useExpenseStats } from '../../../hooks/api/useExpenses';
import { useAuthStore } from '../../../store/authStore';
import { Card, Spinner, ErrorState } from '../../../components/common';
import { BudgetWidget, BudgetAlertCard } from '../../budget/components';
// import { SavingsGoalsWidget } from '../../savingsGoals/components';
import {
  formatCurrency,
  formatRelativeTime,
  formatPercentage,
} from '../../../utils/formatters';
import { SavingsGoalsWidget } from '../../savings/components';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();
  const { user } = useAuthStore();

  const {
    data: stats,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useExpenseStats();

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  const quickActions = [
    {
      id: 'add-expense',
      icon: 'add-circle',
      label: 'Add Expense',
      color: colors.primary,
      onPress: () =>
        (navigation as any).navigate('AddExpense', { mode: 'create' }),
    },
    {
      id: 'expenses',
      icon: 'wallet',
      label: 'Expenses',
      color: colors.danger,
      onPress: () => navigation.navigate('Expenses' as never),
    },
    {
      id: 'budget',
      icon: 'stats-chart',
      label: 'Budget',
      color: colors.info,
      onPress: () => (navigation as any).navigate('Budget'),
    },
    {
      id: 'savings',
      icon: 'trophy',
      label: 'Savings',
      color: colors.success,
      onPress: () => (navigation as any).navigate('Savings'),
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (navigation as any).openDrawer()}
            style={styles.menuButton}
          >
            <Icon name="menu" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Icon
              name="notifications-outline"
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        </View>
        <Spinner text="Loading dashboard..." />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (navigation as any).openDrawer()}
            style={styles.menuButton}
          >
            <Icon name="menu" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Icon
              name="notifications-outline"
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        </View>
        <ErrorState
          title="Failed to load dashboard"
          message="Please check your connection and try again"
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation as any).openDrawer()}
          style={styles.menuButton}
        >
          <Icon name="menu" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Icon
            name="notifications-outline"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Welcome Card */}

        <Card
          variant="elevated"
          style={[styles.welcomeCard, { backgroundColor: colors.primary }]}
        >
          <View style={styles.welcomeContent}>
            <View>
              <Text
                style={[
                  textStyles.caption,
                  { color: 'rgba(255,255,255,0.8)', marginBottom: spacing.xs },
                ]}
              >
                Welcome back! 👋
              </Text>
              <Text style={[textStyles.h3, { color: colors.text.inverse }]}>
                {user?.name || 'User'}
              </Text>
            </View>
            <View style={styles.welcomeIcon}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <BudgetAlertCard />
        <BudgetWidget />
        <SavingsGoalsWidget />

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          {/* This Month */}
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statHeader}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: `${colors.danger}15` },
                ]}
              >
                <Icon name="trending-down" size={20} color={colors.danger} />
              </View>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.danger }]}>
              {formatCurrency(stats?.currentMonth?.totalExpenses || 0)}
            </Text>
            <View style={styles.statFooter}>
              <Text style={styles.statSubtext}>
                {stats?.currentMonth?.transactionCount || 0} transactions
              </Text>
              {stats?.previousMonth?.totalExpenses > 0 && (
                <View style={styles.statChange}>
                  <Icon
                    name={
                      stats?.currentMonth?.totalExpenses >
                      stats?.previousMonth?.totalExpenses
                        ? 'arrow-up'
                        : 'arrow-down'
                    }
                    size={12}
                    color={
                      stats?.currentMonth?.totalExpenses >
                      stats?.previousMonth?.totalExpenses
                        ? colors.danger
                        : colors.success
                    }
                  />
                  <Text
                    style={[
                      styles.statChangeText,
                      {
                        color:
                          stats?.currentMonth?.totalExpenses >
                          stats?.previousMonth?.totalExpenses
                            ? colors.danger
                            : colors.success,
                      },
                    ]}
                  >
                    {Math.abs(
                      ((stats?.currentMonth?.totalExpenses -
                        stats?.previousMonth?.totalExpenses) /
                        stats?.previousMonth?.totalExpenses) *
                        100,
                    ).toFixed(1)}
                    %
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Today */}
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statHeader}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: `${colors.info}15` },
                ]}
              >
                <Icon name="calendar" size={20} color={colors.info} />
              </View>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.info }]}>
              {formatCurrency(stats?.today?.totalExpenses || 0)}
            </Text>
            <View style={styles.statFooter}>
              <Text style={styles.statSubtext}>
                {stats?.today?.transactionCount || 0} transactions
              </Text>
            </View>
          </Card>
        </View>

        {/* Weekly Stats */}
        <View style={styles.statsContainer}>
          {/* This Week */}
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statHeader}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: `${colors.warning}15` },
                ]}
              >
                <Icon
                  name="calendar-outline"
                  size={20}
                  color={colors.warning}
                />
              </View>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {formatCurrency(stats?.currentWeek?.totalExpenses || 0)}
            </Text>
            <View style={styles.statFooter}>
              <Text style={styles.statSubtext}>
                {stats?.currentWeek?.transactionCount || 0} transactions
              </Text>
            </View>
          </Card>

          {/* Average Daily */}
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statHeader}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: `${colors.success}15` },
                ]}
              >
                <Icon name="trending-up" size={20} color={colors.success} />
              </View>
              <Text style={styles.statLabel}>Daily Avg</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {formatCurrency(stats?.averageDaily || 0)}
            </Text>
            <View style={styles.statFooter}>
              <Text style={styles.statSubtext}>This month</Text>
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: `${action.color}20` },
                  ]}
                >
                  <Icon name={action.icon} size={28} color={action.color} />
                </View>
                <Text style={styles.actionText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top Categories */}
        {stats?.topCategories && stats.topCategories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Categories</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Expenses' as never)}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <Card variant="elevated">
              {stats.topCategories
                .slice(0, 5)
                .map((cat: any, index: number) => {
                  const percentage =
                    (cat.total / stats.currentMonth?.totalExpenses) * 100;
                  return (
                    <View
                      key={cat._id || index}
                      style={[
                        styles.categoryRow,
                        index < Math.min(stats.topCategories.length - 1, 4) &&
                          styles.categoryRowBorder,
                      ]}
                    >
                      <View style={styles.categoryLeft}>
                        <View
                          style={[
                            styles.categoryIcon,
                            {
                              backgroundColor: `${
                                cat.color || colors.primary
                              }15`,
                            },
                          ]}
                        >
                          <Text style={styles.categoryEmoji}>
                            {cat.icon || '💰'}
                          </Text>
                        </View>
                        <View style={styles.categoryInfo}>
                          <Text style={styles.categoryName}>{cat.name}</Text>
                          <View style={styles.progressBarContainer}>
                            <View style={styles.progressBarBg}>
                              <View
                                style={[
                                  styles.progressBarFill,
                                  {
                                    width: `${Math.min(percentage, 100)}%`,
                                    backgroundColor:
                                      cat.color || colors.primary,
                                  },
                                ]}
                              />
                            </View>
                            <Text style={styles.progressText}>
                              {percentage.toFixed(0)}%
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.categoryRight}>
                        <Text
                          style={[
                            styles.categoryAmount,
                            { color: colors.danger },
                          ]}
                        >
                          {formatCurrency(cat.total)}
                        </Text>
                        <Text style={styles.categoryCount}>
                          {cat.count} items
                        </Text>
                      </View>
                    </View>
                  );
                })}
            </Card>
          </View>
        )}

        {/* Recent Transactions */}
        {stats?.recentTransactions && stats.recentTransactions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Expenses' as never)}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <Card variant="elevated">
              {stats.recentTransactions
                .slice(0, 5)
                .map((txn: any, index: number) => (
                  <TouchableOpacity
                    key={txn._id}
                    style={[
                      styles.transactionRow,
                      index <
                        Math.min(stats.recentTransactions.length - 1, 4) &&
                        styles.categoryRowBorder,
                    ]}
                    onPress={() =>
                      (navigation as any).navigate('AddExpense', {
                        mode: 'edit',
                        expenseId: txn._id,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.transactionLeft}>
                      <View
                        style={[
                          styles.transactionIcon,
                          {
                            backgroundColor: `${
                              txn.categoryId?.color || colors.primary
                            }15`,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 20 }}>
                          {txn.categoryId?.icon || '💰'}
                        </Text>
                      </View>
                      <View>
                        <Text
                          style={styles.transactionDescription}
                          numberOfLines={1}
                        >
                          {txn.description || 'No description'}
                        </Text>
                        <Text style={styles.transactionMeta}>
                          {txn.categoryId?.name || 'Uncategorized'} •{' '}
                          {formatRelativeTime(txn.date)}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: colors.danger },
                      ]}
                    >
                      {formatCurrency(txn.amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
            </Card>
          </View>
        )}

        {/* Budget Overview */}
        {stats?.budgetOverview && stats.budgetOverview.totalBudget > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Budget Overview</Text>
              <TouchableOpacity
                onPress={() => (navigation as any).navigate('Budget')}
              >
                <Text style={styles.seeAll}>View Budget</Text>
              </TouchableOpacity>
            </View>
            <Card variant="elevated">
              <View style={styles.budgetHeader}>
                <View>
                  <Text style={styles.budgetLabel}>Monthly Budget</Text>
                  <Text
                    style={[styles.budgetAmount, { color: colors.primary }]}
                  >
                    {formatCurrency(stats.budgetOverview.totalBudget)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.budgetLabel}>Remaining</Text>
                  <Text
                    style={[
                      styles.budgetAmount,
                      {
                        color:
                          stats.budgetOverview.remaining > 0
                            ? colors.success
                            : colors.danger,
                      },
                    ]}
                  >
                    {formatCurrency(Math.abs(stats.budgetOverview.remaining))}
                  </Text>
                </View>
              </View>

              <View style={styles.budgetProgressContainer}>
                <View style={styles.budgetProgressBar}>
                  <View
                    style={[
                      styles.budgetProgressFill,
                      {
                        width: `${Math.min(
                          (stats.budgetOverview.spent /
                            stats.budgetOverview.totalBudget) *
                            100,
                          100,
                        )}%`,
                        backgroundColor:
                          stats.budgetOverview.spent >
                          stats.budgetOverview.totalBudget
                            ? colors.danger
                            : colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.budgetProgressText}>
                  {formatPercentage(
                    stats.budgetOverview.spent,
                    stats.budgetOverview.totalBudget,
                  )}{' '}
                  used
                </Text>
              </View>

              {stats.budgetOverview.spent >
                stats.budgetOverview.totalBudget && (
                <View
                  style={[
                    styles.budgetAlert,
                    { backgroundColor: `${colors.danger}10` },
                  ]}
                >
                  <Icon name="warning" size={16} color={colors.danger} />
                  <Text
                    style={[styles.budgetAlertText, { color: colors.danger }]}
                  >
                    You've exceeded your budget by{' '}
                    {formatCurrency(
                      stats.budgetOverview.spent -
                        stats.budgetOverview.totalBudget,
                    )}
                  </Text>
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Spending Insights */}
        {stats?.insights && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights</Text>
            <Card variant="elevated">
              {stats.insights.highestSpendingDay && (
                <View style={styles.insightRow}>
                  <Icon name="calendar" size={20} color={colors.info} />
                  <Text style={styles.insightText}>
                    Your highest spending day was{' '}
                    <Text style={{ fontWeight: '600' }}>
                      {stats.insights.highestSpendingDay.day}
                    </Text>{' '}
                    with{' '}
                    {formatCurrency(stats.insights.highestSpendingDay.amount)}
                  </Text>
                </View>
              )}

              {stats.insights.mostExpensiveCategory && (
                <View style={[styles.insightRow, { marginTop: spacing.md }]}>
                  <Icon name="trending-up" size={20} color={colors.warning} />
                  <Text style={styles.insightText}>
                    You spent the most on{' '}
                    <Text style={{ fontWeight: '600' }}>
                      {stats.insights.mostExpensiveCategory.name}
                    </Text>{' '}
                    this month
                  </Text>
                </View>
              )}

              {stats.insights.comparedToLastMonth && (
                <View style={[styles.insightRow, { marginTop: spacing.md }]}>
                  <Icon
                    name={
                      stats.insights.comparedToLastMonth.trend === 'up'
                        ? 'arrow-up'
                        : 'arrow-down'
                    }
                    size={20}
                    color={
                      stats.insights.comparedToLastMonth.trend === 'up'
                        ? colors.danger
                        : colors.success
                    }
                  />
                  <Text style={styles.insightText}>
                    Spending is{' '}
                    <Text style={{ fontWeight: '600' }}>
                      {stats.insights.comparedToLastMonth.percentage}%{' '}
                      {stats.insights.comparedToLastMonth.trend}
                    </Text>{' '}
                    compared to last month
                  </Text>
                </View>
              )}
            </Card>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
    menuButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      ...textStyles.h3,
      color: colors.text.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    welcomeCard: {
      marginBottom: spacing.lg,
    },
    welcomeContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    welcomeIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      ...textStyles.h4,
      color: colors.primary,
      fontWeight: '700',
    },
    statsContainer: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    statCard: {
      flex: 1,
    },
    statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    statIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    statLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    statValue: {
      ...textStyles.h3,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    statFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statSubtext: {
      ...textStyles.caption,
      color: colors.text.tertiary,
    },
    statChange: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    statChangeText: {
      ...textStyles.caption,
      fontWeight: '600',
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      ...textStyles.h4,
      color: colors.text.primary,
    },
    seeAll: {
      ...textStyles.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    actionCard: {
      width: (width - spacing.lg * 2 - spacing.md) / 2,
      alignItems: 'center',
      paddingVertical: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    actionIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    actionText: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
    },
    categoryRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    categoryIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    categoryEmoji: {
      fontSize: 20,
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    progressBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    progressBarBg: {
      flex: 1,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: borderRadius.full,
    },
    progressText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      minWidth: 35,
      textAlign: 'right',
    },
    categoryRight: {
      alignItems: 'flex-end',
    },
    categoryAmount: {
      ...textStyles.h4,
      fontWeight: '700',
      marginBottom: 2,
    },
    categoryCount: {
      ...textStyles.caption,
      color: colors.text.tertiary,
    },
    transactionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
    },
    transactionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: spacing.md,
    },
    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    transactionDescription: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: 2,
    },
    transactionMeta: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    transactionAmount: {
      ...textStyles.h4,
      fontWeight: '700',
    },
    budgetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    budgetLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    budgetAmount: {
      ...textStyles.h3,
      fontWeight: '700',
    },
    budgetProgressContainer: {
      marginBottom: spacing.md,
    },
    budgetProgressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
      marginBottom: spacing.sm,
    },
    budgetProgressFill: {
      height: '100%',
      borderRadius: borderRadius.full,
    },
    budgetProgressText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    budgetAlert: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      gap: spacing.sm,
    },
    budgetAlertText: {
      ...textStyles.caption,
      flex: 1,
    },
    insightRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    insightText: {
      ...textStyles.body,
      color: colors.text.secondary,
      flex: 1,
      lineHeight: 22,
    },
  });

export default DashboardScreen;
