/**
 * Expense Statistics Screen - Enhanced with More Details
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  LineChart,
  PieChart,
  BarChart,
  ProgressChart,
} from 'react-native-chart-kit';
import { useTheme } from '../../../hooks/useTheme';
import {
  useExpenseStats,
  useDailyExpenses,
} from '../../../hooks/api/useExpenses';
import { Card, Spinner, ErrorState } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

const { width } = Dimensions.get('window');

const ExpenseStatsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(30);
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'categories' | 'trends'
  >('overview');

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useExpenseStats();
  const { data: dailyData, isLoading: dailyLoading } =
    useDailyExpenses(selectedPeriod);

  const stats = statsData?.data;
  const dailyExpenses = dailyData?.data || [];

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  // Chart config
  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => colors.text.secondary,
    style: {
      borderRadius: borderRadius.md,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  // Prepare line chart data (daily expenses)
  const lineChartData = {
    labels: dailyExpenses.slice(-7).map((d: any) => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        data: dailyExpenses.slice(-7).map((d: any) => d.total || 0),
        color: (opacity = 1) => colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  // Prepare pie chart data (category breakdown)
  const pieChartData =
    stats?.categoryBreakdown?.slice(0, 5).map((cat: any, index: number) => ({
      name: cat.categoryName,
      population: cat.total,
      color:
        cat.categoryColor ||
        [
          colors.primary,
          colors.success,
          colors.warning,
          colors.danger,
          colors.info,
        ][index % 5],
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    })) || [];

  // Prepare weekly bar chart
  const weeklyData = dailyExpenses.slice(-28);
  const weeks = [];
  for (let i = 0; i < 4; i++) {
    const weekData = weeklyData.slice(i * 7, (i + 1) * 7);
    const weekTotal = weekData.reduce(
      (sum: number, d: any) => sum + (d.total || 0),
      0,
    );
    weeks.push(weekTotal);
  }

  const barChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        data: weeks.length === 4 ? weeks : [0, 0, 0, 0],
      },
    ],
  };

  // Budget progress data
  const budgetProgressData = {
    labels:
      stats?.categoryBreakdown
        ?.filter((cat: any) => cat.budgetStatus)
        .slice(0, 3)
        .map((cat: any) => cat.categoryName) || [],
    data:
      stats?.categoryBreakdown
        ?.filter((cat: any) => cat.budgetStatus)
        .slice(0, 3)
        .map((cat: any) => cat.budgetStatus.percentage / 100) || [],
  };

  if (statsLoading || dailyLoading) {
    return (
      <View style={styles.container}>
        <Spinner text="Loading statistics..." />
      </View>
    );
  }

  if (statsError || !stats) {
    return (
      <View style={styles.container}>
        <ErrorState
          title="Failed to load statistics"
          message="Please try again"
          onRetry={() => navigation.goBack()}
        />
      </View>
    );
  }

  const totalBudget =
    stats.categoryBreakdown
      ?.filter((cat: any) => cat.budgetStatus)
      .reduce((sum: number, cat: any) => sum + cat.budgetStatus.budget, 0) || 0;

  const totalSpent =
    stats.categoryBreakdown
      ?.filter((cat: any) => cat.budgetStatus)
      .reduce((sum: number, cat: any) => sum + cat.budgetStatus.spent, 0) || 0;

  const totalRemaining = totalBudget - totalSpent;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Statistics</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'overview' && styles.tabTextActive,
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'categories' && styles.tabActive]}
          onPress={() => setSelectedTab('categories')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'categories' && styles.tabTextActive,
            ]}
          >
            Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'trends' && styles.tabActive]}
          onPress={() => setSelectedTab('trends')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'trends' && styles.tabTextActive,
            ]}
          >
            Trends
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* OVERVIEW TAB */}
        {selectedTab === 'overview' && (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryGrid}>
              <Card style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Icon name="calendar" size={24} color={colors.primary} />
                </View>
                <Text style={styles.summaryValue}>
                  {formatCurrency(stats.thisMonth?.total || 0)}
                </Text>
                <Text style={styles.summaryLabel}>This Month</Text>
                <Text style={styles.summarySubtext}>
                  {stats.thisMonth?.count || 0} transactions
                </Text>
                {stats.comparison?.percentageChange !== 0 && (
                  <View
                    style={[
                      styles.summaryBadge,
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
                      size={12}
                      color={
                        stats.comparison.percentageChange > 0
                          ? colors.danger
                          : colors.success
                      }
                    />
                    <Text
                      style={[
                        styles.summaryBadgeText,
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
                )}
              </Card>

              <Card style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Icon name="time" size={24} color={colors.success} />
                </View>
                <Text style={styles.summaryValue}>
                  {formatCurrency(stats.lastMonth?.total || 0)}
                </Text>
                <Text style={styles.summaryLabel}>Last Month</Text>
                <Text style={styles.summarySubtext}>
                  {stats.lastMonth?.count || 0} transactions
                </Text>
              </Card>

              <Card style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Icon name="stats-chart" size={24} color={colors.warning} />
                </View>
                <Text style={styles.summaryValue}>
                  {formatCurrency(stats.thisMonth?.average || 0)}
                </Text>
                <Text style={styles.summaryLabel}>Daily Average</Text>
                <Text style={styles.summarySubtext}>This month</Text>
              </Card>

              <Card style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Icon name="trending-up" size={24} color={colors.info} />
                </View>
                <Text style={styles.summaryValue}>
                  {formatCurrency(stats.thisMonth?.projected || 0)}
                </Text>
                <Text style={styles.summaryLabel}>Projected</Text>
                <Text style={styles.summarySubtext}>End of month</Text>
              </Card>
            </View>

            {/* Budget Overview */}
            {totalBudget > 0 && (
              <Card style={styles.budgetOverviewCard}>
                <View style={styles.chartHeader}>
                  <Icon name="wallet" size={20} color={colors.primary} />
                  <Text style={styles.chartTitle}>Budget Overview</Text>
                </View>

                <View style={styles.budgetMainStats}>
                  <View style={styles.budgetStatBox}>
                    <Text style={styles.budgetStatLabel}>Total Budget</Text>
                    <Text
                      style={[
                        styles.budgetStatValue,
                        { color: colors.primary },
                      ]}
                    >
                      {formatCurrency(totalBudget)}
                    </Text>
                  </View>
                  <View style={styles.budgetStatBox}>
                    <Text style={styles.budgetStatLabel}>Spent</Text>
                    <Text
                      style={[styles.budgetStatValue, { color: colors.danger }]}
                    >
                      {formatCurrency(totalSpent)}
                    </Text>
                  </View>
                  <View style={styles.budgetStatBox}>
                    <Text style={styles.budgetStatLabel}>Remaining</Text>
                    <Text
                      style={[
                        styles.budgetStatValue,
                        {
                          color:
                            totalRemaining >= 0
                              ? colors.success
                              : colors.danger,
                        },
                      ]}
                    >
                      {formatCurrency(totalRemaining)}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(
                          (totalSpent / totalBudget) * 100,
                          100,
                        )}%`,
                        backgroundColor:
                          (totalSpent / totalBudget) * 100 > 90
                            ? colors.danger
                            : (totalSpent / totalBudget) * 100 > 70
                            ? colors.warning
                            : colors.success,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {((totalSpent / totalBudget) * 100).toFixed(1)}% of budget
                  used
                </Text>
              </Card>
            )}

            {/* All Time Stats */}
            <Card style={styles.allTimeCard}>
              <View style={styles.chartHeader}>
                <Icon name="infinite" size={20} color={colors.primary} />
                <Text style={styles.chartTitle}>All Time Statistics</Text>
              </View>
              <View style={styles.allTimeStats}>
                <View style={styles.allTimeStat}>
                  <Icon
                    name="wallet-outline"
                    size={32}
                    color={colors.primary}
                  />
                  <Text style={styles.allTimeValue}>
                    {formatCurrency(stats.allTime?.total || 0)}
                  </Text>
                  <Text style={styles.allTimeLabel}>Total Spent</Text>
                </View>
                <View style={styles.allTimeDivider} />
                <View style={styles.allTimeStat}>
                  <Icon
                    name="receipt-outline"
                    size={32}
                    color={colors.success}
                  />
                  <Text style={styles.allTimeValue}>
                    {stats.allTime?.count || 0}
                  </Text>
                  <Text style={styles.allTimeLabel}>Transactions</Text>
                </View>
              </View>
            </Card>

            {/* Insights */}
            <Card style={styles.insightsCard}>
              <View style={styles.chartHeader}>
                <Icon name="bulb" size={20} color={colors.warning} />
                <Text style={styles.chartTitle}>Insights</Text>
              </View>

              <View style={styles.insightItem}>
                <Icon
                  name="checkmark-circle"
                  size={18}
                  color={colors.success}
                />
                <Text style={styles.insightText}>
                  You've made{' '}
                  <Text style={styles.insightHighlight}>
                    {stats.thisMonth?.count || 0}
                  </Text>{' '}
                  transactions this month
                </Text>
              </View>

              {stats.thisMonth?.projected && (
                <View style={styles.insightItem}>
                  <Icon name="trending-up" size={18} color={colors.info} />
                  <Text style={styles.insightText}>
                    Projected spending:{' '}
                    <Text style={styles.insightHighlight}>
                      {formatCurrency(stats.thisMonth.projected)}
                    </Text>
                  </Text>
                </View>
              )}

              {stats.comparison?.percentageChange !== 0 && (
                <View style={styles.insightItem}>
                  <Icon
                    name={
                      stats.comparison.percentageChange > 0
                        ? 'alert-circle'
                        : 'happy'
                    }
                    size={18}
                    color={
                      stats.comparison.percentageChange > 0
                        ? colors.danger
                        : colors.success
                    }
                  />
                  <Text style={styles.insightText}>
                    You're spending{' '}
                    <Text style={styles.insightHighlight}>
                      {Math.abs(stats.comparison.percentageChange).toFixed(1)}%{' '}
                      {stats.comparison.percentageChange > 0 ? 'more' : 'less'}
                    </Text>{' '}
                    than last month
                  </Text>
                </View>
              )}

              {totalBudget > 0 && (
                <View style={styles.insightItem}>
                  <Icon
                    name={totalRemaining >= 0 ? 'checkmark-circle' : 'warning'}
                    size={18}
                    color={totalRemaining >= 0 ? colors.success : colors.danger}
                  />
                  <Text style={styles.insightText}>
                    {totalRemaining >= 0 ? (
                      <>
                        You have{' '}
                        <Text style={styles.insightHighlight}>
                          {formatCurrency(totalRemaining)}
                        </Text>{' '}
                        remaining in your budget
                      </>
                    ) : (
                      <>
                        You've exceeded your budget by{' '}
                        <Text style={styles.insightHighlight}>
                          {formatCurrency(Math.abs(totalRemaining))}
                        </Text>
                      </>
                    )}
                  </Text>
                </View>
              )}
            </Card>
          </>
        )}

        {/* CATEGORIES TAB */}
        {selectedTab === 'categories' && (
          <>
            {/* Category Breakdown Pie Chart */}
            {pieChartData.length > 0 && (
              <Card style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Icon name="pie-chart" size={20} color={colors.primary} />
                  <Text style={styles.chartTitle}>Category Distribution</Text>
                </View>
                <PieChart
                  data={pieChartData}
                  width={width - 60}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  center={[10, 0]}
                  absolute
                />
              </Card>
            )}

            {/* Category Details */}
            {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
              <Card style={styles.categoryCard}>
                <View style={styles.chartHeader}>
                  <Icon name="apps" size={20} color={colors.primary} />
                  <Text style={styles.chartTitle}>Category Breakdown</Text>
                </View>

                {stats.categoryBreakdown.map((cat: any, index: number) => {
                  const hasBudget = cat.budgetStatus !== null;

                  return (
                    <View key={cat._id} style={styles.categoryRow}>
                      <View style={styles.categoryLeft}>
                        <View
                          style={[
                            styles.categoryRank,
                            {
                              backgroundColor:
                                index < 3
                                  ? cat.categoryColor
                                  : colors.background,
                            },
                          ]}
                        >
                          <Icon
                            name={cat.categoryIcon}
                            size={18}
                            color={
                              index < 3
                                ? colors.text.inverse
                                : colors.text.secondary
                            }
                          />
                        </View>
                        <View style={styles.categoryInfo}>
                          <Text style={styles.categoryName}>
                            {cat.categoryName}
                          </Text>
                          <Text style={styles.categoryCount}>
                            {cat.count} transaction{cat.count !== 1 ? 's' : ''}
                          </Text>
                          {hasBudget && (
                            <View style={styles.budgetInfo}>
                              <View style={styles.budgetBar}>
                                <View
                                  style={[
                                    styles.budgetBarFill,
                                    {
                                      width: `${Math.min(
                                        cat.budgetStatus.percentage,
                                        100,
                                      )}%`,
                                      backgroundColor:
                                        cat.budgetStatus.percentage > 90
                                          ? colors.danger
                                          : cat.budgetStatus.percentage > 70
                                          ? colors.warning
                                          : colors.success,
                                    },
                                  ]}
                                />
                              </View>
                              <Text style={styles.budgetText}>
                                {formatCurrency(cat.budgetStatus.spent)} /{' '}
                                {formatCurrency(cat.budgetStatus.budget)} (
                                {cat.budgetStatus.percentage.toFixed(0)}%)
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={styles.categoryRight}>
                        <Text style={styles.categoryAmount}>
                          {formatCurrency(cat.total)}
                        </Text>
                        <Text style={styles.categoryPercentage}>
                          {cat.percentage.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </Card>
            )}
          </>
        )}

        {/* TRENDS TAB */}
        {selectedTab === 'trends' && (
          <>
            {/* Period Selector */}
            <View style={styles.periodSelector}>
              {[7, 30, 90].map(days => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.periodButton,
                    selectedPeriod === days && styles.periodButtonActive,
                  ]}
                  onPress={() => setSelectedPeriod(days as 7 | 30 | 90)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedPeriod === days && styles.periodButtonTextActive,
                    ]}
                  >
                    {days === 7
                      ? '7 Days'
                      : days === 30
                      ? '30 Days'
                      : '90 Days'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Daily Trend Chart */}
            <Card style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Icon name="trending-up" size={20} color={colors.primary} />
                <Text style={styles.chartTitle}>
                  Daily Spending (Last 7 Days)
                </Text>
              </View>
              {dailyExpenses.length > 0 ? (
                <LineChart
                  data={lineChartData}
                  width={width - 60}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  withInnerLines={false}
                  withOuterLines={true}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  withDots={true}
                  withShadow={false}
                  fromZero
                />
              ) : (
                <View style={styles.emptyChart}>
                  <Text style={styles.emptyChartText}>No data available</Text>
                </View>
              )}
            </Card>

            {/* Weekly Comparison */}
            {weeks.length === 4 && weeks.some(w => w > 0) && (
              <Card style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Icon name="bar-chart" size={20} color={colors.primary} />
                  <Text style={styles.chartTitle}>Weekly Comparison</Text>
                </View>
                <BarChart
                  data={barChartData}
                  width={width - 60}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  showValuesOnTopOfBars
                  fromZero
                />
              </Card>
            )}
          </>
        )}

        <View style={{ height: 30 }} />
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
    headerTitle: {
      ...textStyles.h3,
      color: colors.text.primary,
    },
    tabSelector: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActive: {
      borderBottomColor: colors.primary,
    },
    tabText: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    tabTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    periodSelector: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    periodButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    periodButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    periodButtonText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    periodButtonTextActive: {
      color: colors.text.inverse,
    },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    summaryCard: {
      width: '47%',
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    summaryIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    summaryValue: {
      ...textStyles.h4,
      color: colors.text.primary,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    summaryLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: 2,
    },
    summarySubtext: {
      ...textStyles.caption,
      color: colors.text.tertiary,
      fontSize: 10,
    },
    summaryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
      marginTop: spacing.xs,
    },
    summaryBadgeText: {
      ...textStyles.caption,
      fontWeight: '700',
      fontSize: 10,
    },
    budgetOverviewCard: {
      marginBottom: spacing.lg,
    },
    budgetMainStats: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    budgetStatBox: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    budgetStatLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    budgetStatValue: {
      ...textStyles.bodyMedium,
      fontWeight: '700',
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
      marginBottom: spacing.sm,
    },
    progressBar: {
      height: '100%',
      borderRadius: borderRadius.full,
    },
    progressText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    allTimeCard: {
      marginBottom: spacing.lg,
    },
    allTimeStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    allTimeStat: {
      flex: 1,
      alignItems: 'center',
    },
    allTimeDivider: {
      width: 1,
      height: 60,
      backgroundColor: colors.border,
    },
    allTimeValue: {
      ...textStyles.h3,
      color: colors.text.primary,
      fontWeight: '700',
      marginVertical: spacing.sm,
    },
    allTimeLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    chartCard: {
      marginBottom: spacing.lg,
    },
    chartHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    chartTitle: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '600',
    },
    chart: {
      marginVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    emptyChart: {
      height: 220,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyChartText: {
      ...textStyles.caption,
      color: colors.text.tertiary,
    },
    categoryCard: {
      marginBottom: spacing.lg,
    },
    categoryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    categoryRank: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      ...textStyles.body,
      color: colors.text.primary,
      marginBottom: 2,
    },
    categoryCount: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    budgetInfo: {
      marginTop: spacing.xs,
    },
    budgetBar: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: 4,
    },
    budgetBarFill: {
      height: '100%',
      borderRadius: 2,
    },
    budgetText: {
      ...textStyles.caption,
      color: colors.text.tertiary,
      fontSize: 10,
    },
    categoryRight: {
      alignItems: 'flex-end',
    },
    categoryAmount: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '700',
      marginBottom: 2,
    },
    categoryPercentage: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    insightsCard: {
      //   backgroundColor: `${colors.warning}10`,
      borderWidth: 1,
      borderColor: `${colors.warning}30`,
      marginBottom: spacing.lg,
    },
    insightItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.sm,
    },
    insightText: {
      ...textStyles.body,
      color: colors.text.secondary,
      flex: 1,
      lineHeight: 22,
    },
    insightHighlight: {
      color: colors.text.primary,
      fontWeight: '700',
    },
  });

export default ExpenseStatsScreen;
