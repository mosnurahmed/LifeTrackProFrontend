/**
 * Income Statistics Screen
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
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../../hooks/useTheme';
import { useIncomeStats, useDailyIncomes } from '../../../hooks/api/useIncome';
import { Card, Spinner, ErrorState } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

const { width } = Dimensions.get('window');

const IncomeStatsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(30);

  const { data: statsData, isLoading, error } = useIncomeStats();
  const { data: dailyData } = useDailyIncomes(selectedPeriod);

  const stats = statsData?.data;
  const dailyIncomes = dailyData?.data || [];

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(39, 174, 96, ${opacity})`,
    labelColor: (opacity = 1) => colors.text.secondary,
    style: {
      borderRadius: borderRadius.md,
    },
  };

  const lineChartData = {
    labels: dailyIncomes.slice(-7).map((d: any) => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        data: dailyIncomes.slice(-7).map((d: any) => d.total || 0),
        color: (opacity = 1) => colors.success,
        strokeWidth: 2,
      },
    ],
  };

  const pieChartData =
    stats?.categoryBreakdown?.slice(0, 5).map((cat: any, index: number) => ({
      name: cat.categoryName,
      population: cat.total,
      color:
        cat.categoryColor ||
        [
          colors.success,
          colors.primary,
          colors.warning,
          colors.info,
          colors.danger,
        ][index % 5],
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    })) || [];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Spinner text="Loading statistics..." />
      </View>
    );
  }

  if (error || !stats) {
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Income Statistics</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="calendar" size={28} color={colors.success} />
            </View>
            <Text style={styles.summaryValue}>
              {formatCurrency(stats.thisMonth.total)}
            </Text>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summarySubtext}>
              {stats.thisMonth.count} transactions
            </Text>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="time" size={28} color={colors.primary} />
            </View>
            <Text style={styles.summaryValue}>
              {formatCurrency(stats.lastMonth.total)}
            </Text>
            <Text style={styles.summaryLabel}>Last Month</Text>
            <Text style={styles.summarySubtext}>
              {stats.lastMonth.count} transactions
            </Text>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="trending-up" size={28} color={colors.warning} />
            </View>
            <Text style={styles.summaryValue}>
              {formatCurrency(
                stats.thisMonth.count > 0
                  ? stats.thisMonth.total / stats.thisMonth.count
                  : 0,
              )}
            </Text>
            <Text style={styles.summaryLabel}>Average</Text>
            <Text style={styles.summarySubtext}>Per transaction</Text>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="infinite" size={28} color={colors.info} />
            </View>
            <Text style={styles.summaryValue}>
              {formatCurrency(stats.allTime.total)}
            </Text>
            <Text style={styles.summaryLabel}>All Time</Text>
            <Text style={styles.summarySubtext}>
              {stats.allTime.count} transactions
            </Text>
          </Card>
        </View>

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
                {days === 7 ? '7 Days' : days === 30 ? '30 Days' : '90 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Trend */}
        {dailyIncomes.length > 0 && (
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Icon name="trending-up" size={20} color={colors.success} />
              <Text style={styles.chartTitle}>Daily Income (Last 7 Days)</Text>
            </View>
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
          </Card>
        )}

        {/* Category Breakdown */}
        {pieChartData.length > 0 && (
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Icon name="pie-chart" size={20} color={colors.success} />
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
              <Icon name="apps" size={20} color={colors.success} />
              <Text style={styles.chartTitle}>Top Income Sources</Text>
            </View>

            {stats.categoryBreakdown
              .slice(0, 5)
              .map((cat: any, index: number) => (
                <View key={cat.categoryId} style={styles.categoryRow}>
                  <View style={styles.categoryLeft}>
                    <View
                      style={[
                        styles.categoryRank,
                        {
                          backgroundColor:
                            index === 0
                              ? colors.warning
                              : `${cat.categoryColor}50`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryRankText,
                          {
                            color:
                              index === 0
                                ? colors.text.inverse
                                : cat.categoryColor,
                          },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.categoryIconSmall,
                        { backgroundColor: `${cat.categoryColor}15` },
                      ]}
                    >
                      <Icon
                        name={cat.categoryIcon}
                        size={20}
                        color={cat.categoryColor}
                      />
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>
                        {cat.categoryName}
                      </Text>
                      <Text style={styles.categoryCount}>
                        {cat.count} transaction{cat.count !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>
                      {formatCurrency(cat.total)}
                    </Text>
                  </View>
                </View>
              ))}
          </Card>
        )}

        {/* Insights */}
        <Card style={styles.insightsCard}>
          <View style={styles.chartHeader}>
            <Icon name="bulb" size={20} color={colors.warning} />
            <Text style={styles.chartTitle}>Insights</Text>
          </View>

          <View style={styles.insightItem}>
            <Icon name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.insightText}>
              Total income this month:{' '}
              <Text style={styles.insightHighlight}>
                {formatCurrency(stats.thisMonth.total)}
              </Text>
            </Text>
          </View>

          {stats.comparison.percentageChange !== 0 && (
            <View style={styles.insightItem}>
              <Icon
                name={
                  stats.comparison.percentageChange > 0
                    ? 'trending-up'
                    : 'trending-down'
                }
                size={18}
                color={
                  stats.comparison.percentageChange > 0
                    ? colors.success
                    : colors.danger
                }
              />
              <Text style={styles.insightText}>
                Your income is{' '}
                <Text style={styles.insightHighlight}>
                  {Math.abs(stats.comparison.percentageChange).toFixed(1)}%{' '}
                  {stats.comparison.percentageChange > 0 ? 'higher' : 'lower'}
                </Text>{' '}
                than last month
              </Text>
            </View>
          )}

          {stats.allTime.count > 0 && (
            <View style={styles.insightItem}>
              <Icon name="stats-chart" size={18} color={colors.info} />
              <Text style={styles.insightText}>
                Total of{' '}
                <Text style={styles.insightHighlight}>
                  {stats.allTime.count}
                </Text>{' '}
                income transactions recorded
              </Text>
            </View>
          )}
        </Card>

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
    content: {
      flex: 1,
      padding: spacing.lg,
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
      width: 56,
      height: 56,
      borderRadius: 28,
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
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    periodButtonText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    periodButtonTextActive: {
      color: colors.text.inverse,
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
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryRankText: {
      ...textStyles.caption,
      fontWeight: '700',
      fontSize: 12,
    },
    categoryIconSmall: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      ...textStyles.body,
      color: colors.text.primary,
      marginBottom: 4,
    },
    categoryCount: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontSize: 10,
    },
    categoryRight: {
      alignItems: 'flex-end',
    },
    categoryAmount: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '700',
    },
    insightsCard: {
      // backgroundColor: `${colors.success}10`,
      borderWidth: 1,
      borderColor: `${colors.success}30`,
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

export default IncomeStatsScreen;
