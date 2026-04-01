/**
 * Expense Stats Screen - Clean Professional Design
 */

import React, { useState, useMemo } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../hooks/useTheme';
import {
  useExpenseStats,
  useDailyExpenses,
} from '../../../hooks/api/useExpenses';
import { Spinner, ErrorState, useGuide } from '../../../components/common';
import { formatCurrency, formatCompactNumber } from '../../../utils/formatters';

const { width } = Dimensions.get('window');

const PERIODS = [
  { label: 'This Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: 'This Year', days: 365 },
];

const TABS = ['Overview', 'Categories', 'Trends'] as const;
type Tab = (typeof TABS)[number];

const ExpenseStatsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows, isDark } =
    useTheme();
  const insets = useSafeAreaInsets();
  const { GuideButton, GuideView } = useGuide('expenseStats');

  const [selectedPeriodIdx, setSelectedPeriodIdx] = useState(0);
  const [selectedTab, setSelectedTab] = useState<Tab>('Overview');

  const selectedPeriod = PERIODS[selectedPeriodIdx];

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useExpenseStats();
  const { data: dailyData, isLoading: dailyLoading } = useDailyExpenses(
    selectedPeriod.days,
  );

  const stats = statsData?.data;
  const dailyExpenses: any[] = useMemo(() => dailyData?.data || [], [dailyData]);

  // Period totals — use stats API for "This Month" (accurate), daily data for others
  const periodTotal = useMemo(() => {
    if (selectedPeriodIdx === 0 && stats?.thisMonth?.total) return stats.thisMonth.total;
    return dailyExpenses.reduce((sum, d) => sum + (d.total || 0), 0);
  }, [dailyExpenses, stats, selectedPeriodIdx]);

  const periodCount = useMemo(
    () => dailyExpenses.reduce((sum, d) => sum + (d.count || 0), 0),
    [dailyExpenses],
  );

  const periodAvg =
    periodTotal > 0 && selectedPeriod.days > 0
      ? periodTotal / selectedPeriod.days
      : 0;

  // Chart config
  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: () => colors.text.secondary,
    propsForDots: { r: '3', strokeWidth: '2', stroke: colors.primary },
    propsForBackgroundLines: { stroke: colors.border, strokeDasharray: '' },
  };

  // Line chart - last 14 days of selected period
  const lineData = useMemo(() => {
    const slice = dailyExpenses.slice(-14);
    if (slice.length < 2) return null;
    return {
      labels: slice.map((d: any) => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [{ data: slice.map((d: any) => d.total || 0), strokeWidth: 2 }],
    };
  }, [dailyExpenses]);

  // Bar chart - weekly grouped
  const barData = useMemo(() => {
    const weeks: number[] = [];
    const labels: string[] = [];
    const sliced = dailyExpenses.slice(-28);
    for (let i = 0; i < 4; i++) {
      const week = sliced.slice(i * 7, (i + 1) * 7);
      weeks.push(week.reduce((s, d) => s + (d.total || 0), 0));
      labels.push(`W${i + 1}`);
    }
    return {
      labels,
      datasets: [{ data: weeks.length ? weeks : [0, 0, 0, 0] }],
    };
  }, [dailyExpenses]);

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  const loadingHeader = (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Icon name="arrow-back" size={22} color={colors.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Statistics</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  if (statsLoading || dailyLoading) {
    return (
      <View style={styles.container}>
        {loadingHeader}
        <Spinner text="Loading statistics..." />
      </View>
    );
  }

  if (statsError || !stats) {
    return (
      <View style={styles.container}>
        {loadingHeader}
        <ErrorState
          title="Failed to load"
          message="Please try again"
          onRetry={() => navigation.goBack()}
        />
      </View>
    );
  }

  const categoryBreakdown = stats.categoryBreakdown || [];
  const totalCategorySpend = categoryBreakdown.reduce(
    (s: number, c: any) => s + (c.total || 0),
    0,
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Statistics</Text>
        <GuideButton color={colors.text.primary} />
      </View>

      {/* Period Filter */}
      <View style={styles.periodRow}>
        {PERIODS.map((p, i) => (
          <TouchableOpacity
            key={p.label}
            style={[
              styles.periodBtn,
              selectedPeriodIdx === i && styles.periodBtnActive,
            ]}
            onPress={() => setSelectedPeriodIdx(i)}
          >
            <Text
              style={[
                styles.periodBtnText,
                selectedPeriodIdx === i && styles.periodBtnTextActive,
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ───── OVERVIEW TAB ───── */}
        {selectedTab === 'Overview' && (
          <>
            {/* Hero total card */}
            <LinearGradient
              colors={[colors.primary, `${colors.primary}BB`]}
              style={styles.heroCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.heroLabel}>{selectedPeriod.label}</Text>
              <Text style={styles.heroAmount}>
                {formatCurrency(periodTotal)}
              </Text>
              <View style={styles.heroRow}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>{periodCount}</Text>
                  <Text style={styles.heroStatLabel}>Transactions</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>
                    {formatCurrency(Math.round(periodAvg))}
                  </Text>
                  <Text style={styles.heroStatLabel}>Daily Avg</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>
                    {formatCurrency(stats.allTime?.total || 0)}
                  </Text>
                  <Text style={styles.heroStatLabel}>All Time</Text>
                </View>
              </View>
            </LinearGradient>

            {/* This month vs last month */}
            <View style={styles.compareRow}>
              <View
                style={[
                  styles.compareCard,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Icon name="calendar" size={20} color={colors.primary} />
                <Text style={styles.compareAmount}>
                  {formatCurrency(stats.thisMonth?.total || 0)}
                </Text>
                <Text style={styles.compareLabel}>This Month</Text>
                <Text style={styles.compareCount}>
                  {stats.thisMonth?.count || 0} txns
                </Text>
              </View>
              <View
                style={[
                  styles.compareCard,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Icon name="time-outline" size={20} color={colors.success} />
                <Text style={styles.compareAmount}>
                  {formatCurrency(stats.lastMonth?.total || 0)}
                </Text>
                <Text style={styles.compareLabel}>Last Month</Text>
                <Text style={styles.compareCount}>
                  {stats.lastMonth?.count || 0} txns
                </Text>
              </View>
            </View>

            {/* Month comparison badge */}
            {stats.comparison?.percentageChange !== 0 && (
              <View
                style={[
                  styles.changeBadgeWrap,
                  {
                    backgroundColor:
                      stats.comparison.percentageChange > 0
                        ? `${colors.danger}12`
                        : `${colors.success}12`,
                  },
                ]}
              >
                <Icon
                  name={
                    stats.comparison.percentageChange > 0
                      ? 'trending-up'
                      : 'trending-down'
                  }
                  size={18}
                  color={
                    stats.comparison.percentageChange > 0
                      ? colors.danger
                      : colors.success
                  }
                />
                <Text
                  style={[
                    styles.changeBadgeText,
                    {
                      color:
                        stats.comparison.percentageChange > 0
                          ? colors.danger
                          : colors.success,
                    },
                  ]}
                >
                  {Math.abs(stats.comparison.percentageChange).toFixed(1)}%{' '}
                  {stats.comparison.percentageChange > 0 ? 'more' : 'less'} than
                  last month
                </Text>
              </View>
            )}

            {/* Projected */}
            {stats.thisMonth?.projected > 0 && (
              <View style={styles.projectedRow}>
                <Icon name="flash-outline" size={16} color={colors.warning} />
                <Text style={styles.projectedText}>
                  Projected end of month:{' '}
                  <Text
                    style={{ color: colors.text.primary, fontWeight: '700' }}
                  >
                    {formatCurrency(stats.thisMonth.projected)}
                  </Text>
                </Text>
              </View>
            )}
          </>
        )}

        {/* ───── CATEGORIES TAB ───── */}
        {selectedTab === 'Categories' && (
          <>
            {categoryBreakdown.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon
                  name="pie-chart-outline"
                  size={48}
                  color={colors.text.tertiary}
                />
                <Text style={styles.emptyText}>No category data</Text>
              </View>
            ) : (
              <View style={styles.catCard}>
                <View style={styles.catCardHeader}>
                  <Icon name="apps-outline" size={20} color={colors.primary} />
                  <Text style={styles.catCardTitle}>Spending by Category</Text>
                </View>
                {categoryBreakdown.map((cat: any, idx: number) => {
                  const pct =
                    totalCategorySpend > 0
                      ? ((cat.total / totalCategorySpend) * 100).toFixed(1)
                      : '0';
                  const barWidth =
                    totalCategorySpend > 0
                      ? (cat.total / totalCategorySpend) * 100
                      : 0;
                  const catColor = cat.categoryColor || colors.primary;

                  return (
                    <View key={cat._id || idx} style={styles.catRow}>
                      <View
                        style={[
                          styles.catIconWrap,
                          { backgroundColor: `${catColor}18` },
                        ]}
                      >
                        <Icon
                          name={cat.categoryIcon || 'wallet-outline'}
                          size={18}
                          color={catColor}
                        />
                      </View>
                      <View style={styles.catInfo}>
                        <View style={styles.catNameRow}>
                          <Text style={styles.catName}>{cat.categoryName}</Text>
                          <Text style={styles.catAmount}>
                            {formatCurrency(cat.total)}
                          </Text>
                        </View>
                        <View style={styles.catBarRow}>
                          <View style={styles.catBarBg}>
                            <View
                              style={[
                                styles.catBarFill,
                                {
                                  width: `${barWidth}%`,
                                  backgroundColor: catColor,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.catPct}>{pct}%</Text>
                        </View>
                        <Text style={styles.catCount}>
                          {cat.count} transaction{cat.count !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        {/* ───── TRENDS TAB ───── */}
        {selectedTab === 'Trends' && (
          <>
            {/* Daily trend chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Icon
                  name="trending-up-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.chartTitle}>Daily Spending Trend</Text>
              </View>
              {lineData ? (
                <LineChart
                  data={lineData}
                  width={width - spacing.lg * 2 - 32}
                  height={200}
                  chartConfig={chartConfig}
                  bezier
                  withInnerLines={false}
                  withOuterLines={false}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  withDots={true}
                  withShadow={false}
                  fromZero
                  style={{
                    borderRadius: borderRadius.md,
                    marginTop: spacing.sm,
                  }}
                />
              ) : (
                <View style={styles.noData}>
                  <Text style={styles.noDataText}>Not enough data</Text>
                </View>
              )}
            </View>

            {/* Weekly bar chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Icon
                  name="bar-chart-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.chartTitle}>Weekly Comparison</Text>
              </View>
              {barData.datasets[0].data.some((v: number) => v > 0) ? (
                <BarChart
                  data={barData}
                  width={width - spacing.lg * 2 - 32}
                  height={200}
                  chartConfig={chartConfig}
                  showValuesOnTopOfBars
                  fromZero
                  style={{
                    borderRadius: borderRadius.md,
                    marginTop: spacing.sm,
                  }}
                />
              ) : (
                <View style={styles.noData}>
                  <Text style={styles.noDataText}>Not enough data</Text>
                </View>
              )}
            </View>

            {/* Summary numbers */}
            <View style={styles.trendSummary}>
              <View style={styles.trendStat}>
                <Text style={styles.trendStatVal}>
                  {formatCompactNumber(periodTotal)}
                </Text>
                <Text style={styles.trendStatLabel}>
                  Total ({selectedPeriod.label})
                </Text>
              </View>
              <View style={styles.trendDivider} />
              <View style={styles.trendStat}>
                <Text style={styles.trendStatVal}>
                  {formatCompactNumber(Math.round(periodAvg))}
                </Text>
                <Text style={styles.trendStatLabel}>Daily Average</Text>
              </View>
              <View style={styles.trendDivider} />
              <View style={styles.trendStat}>
                <Text style={styles.trendStatVal}>{periodCount}</Text>
                <Text style={styles.trendStatLabel}>Transactions</Text>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
      <GuideView />
    </View>
  );
};

const createStyles = (
  colors: any,
  _textStyles: any,
  spacing: any,
  borderRadius: any,
  _shadows: any,
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingBottom: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 38,
      height: 38,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
    },
    periodRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    periodBtn: {
      flex: 1,
      paddingVertical: 7,
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    periodBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    periodBtnText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    periodBtnTextActive: { color: '#FFFFFF' },
    tabRow: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActive: { borderBottomColor: colors.primary },
    tabText: { fontSize: 13, color: colors.text.secondary },
    tabTextActive: { color: colors.primary, fontWeight: '700' },
    scroll: { flex: 1, padding: 16 },

    // Hero card
    heroCard: {
      borderRadius: 14,
      padding: 18,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    heroLabel: {
      color: '#FFFFFF99',
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 2,
    },
    heroAmount: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -1,
      marginBottom: 14,
    },
    heroRow: { flexDirection: 'row', alignItems: 'center' },
    heroStat: { flex: 1, alignItems: 'center' },
    heroStatVal: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 2,
    },
    heroStatLabel: { color: '#FFFFFF80', fontSize: 10 },
    heroDivider: { width: 1, height: 28, backgroundColor: '#FFFFFF30' },

    // Compare cards
    compareRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    compareCard: {
      flex: 1,
      padding: 14,
      borderRadius: 14,
      alignItems: 'center',
      gap: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    compareAmount: {
      fontSize: 15,
      color: colors.text.primary,
      fontWeight: '700',
      marginTop: 4,
    },
    compareLabel: { fontSize: 12, color: colors.text.secondary },
    compareCount: { fontSize: 10, color: colors.text.tertiary },

    // Change badge
    changeBadgeWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 10,
      marginBottom: 10,
    },
    changeBadgeText: { fontSize: 13, fontWeight: '600' },

    // Projected
    projectedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: `${colors.warning}12`,
      padding: 12,
      borderRadius: 10,
      marginBottom: 10,
    },
    projectedText: { fontSize: 13, color: colors.text.secondary, flex: 1 },

    // Category card
    catCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    catCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    catCardTitle: {
      fontSize: 14,
      color: colors.text.primary,
      fontWeight: '700',
    },
    catRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 10,
    },
    catIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      justifyContent: 'center',
      alignItems: 'center',
    },
    catInfo: { flex: 1 },
    catNameRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    catName: { fontSize: 13, color: colors.text.primary, fontWeight: '600' },
    catAmount: { fontSize: 13, color: colors.text.primary, fontWeight: '700' },
    catBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 3,
    },
    catBarBg: {
      flex: 1,
      height: 5,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    catBarFill: { height: '100%', borderRadius: 3 },
    catPct: {
      fontSize: 11,
      color: colors.text.secondary,
      fontWeight: '600',
      width: 36,
      textAlign: 'right',
    },
    catCount: { fontSize: 10, color: colors.text.tertiary },

    // Charts
    chartCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    chartHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    chartTitle: { fontSize: 14, color: colors.text.primary, fontWeight: '700' },
    noData: { height: 120, justifyContent: 'center', alignItems: 'center' },
    noDataText: { fontSize: 13, color: colors.text.tertiary },

    // Trend summary
    trendSummary: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    trendStat: { flex: 1, alignItems: 'center' },
    trendStatVal: {
      fontSize: 14,
      color: colors.text.primary,
      fontWeight: '700',
      marginBottom: 3,
    },
    trendStatLabel: { fontSize: 10, color: colors.text.secondary },
    trendDivider: { width: 1, backgroundColor: colors.border },

    // Empty
    emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
    emptyText: { fontSize: 13, color: colors.text.tertiary },
  });

export default ExpenseStatsScreen;
