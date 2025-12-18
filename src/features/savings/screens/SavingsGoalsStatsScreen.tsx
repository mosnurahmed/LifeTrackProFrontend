/**
 * Savings Goals Statistics Screen
 */

import React from 'react';
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
import { PieChart, ProgressChart } from 'react-native-chart-kit';
import { useTheme } from '../../../hooks/useTheme';
import {
  useSavingsStats,
  useSavingsGoals,
} from '../../../hooks/api/useSavingsGoals';
import { Card, Spinner, ErrorState } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

const { width } = Dimensions.get('window');

const SavingsGoalsStatsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const { data: statsData, isLoading: statsLoading, error } = useSavingsStats();
  const { data: goalsData } = useSavingsGoals();

  const stats = statsData?.data;
  const goals = goalsData?.data?.data || [];
  const activeGoals = goals.filter((g: any) => !g.isCompleted);

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
  };

  // Pie chart data for goals distribution
  const pieChartData = [
    {
      name: 'Completed',
      population: stats?.completedGoals || 0,
      color: colors.success,
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    },
    {
      name: 'Active',
      population: stats?.activeGoals || 0,
      color: colors.primary,
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    },
  ].filter(item => item.population > 0);

  // Progress chart data
  const progressData = {
    labels: ['Progress'],
    data: [stats?.overallProgress ? stats.overallProgress / 100 : 0],
  };

  if (statsLoading) {
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
        <Text style={styles.headerTitle}>Savings Statistics</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Overview Cards */}
        <View style={styles.summaryGrid}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="trophy" size={28} color={colors.success} />
            </View>
            <Text style={styles.summaryValue}>{stats.completedGoals}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="time" size={28} color={colors.primary} />
            </View>
            <Text style={styles.summaryValue}>{stats.activeGoals}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="wallet" size={28} color={colors.warning} />
            </View>
            <Text style={styles.summaryValue}>{stats.totalGoals}</Text>
            <Text style={styles.summaryLabel}>Total Goals</Text>
          </Card>
        </View>

        {/* Overall Progress */}
        <Card style={styles.progressCard}>
          <View style={styles.cardHeader}>
            <Icon name="trending-up" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Overall Progress</Text>
          </View>

          <View style={styles.progressMainStats}>
            <View style={styles.progressMainItem}>
              <Text style={styles.progressMainLabel}>Saved</Text>
              <Text
                style={[styles.progressMainValue, { color: colors.success }]}
              >
                {formatCurrency(stats.totalCurrentAmount)}
              </Text>
            </View>
            <View style={styles.progressMainItem}>
              <Text style={styles.progressMainLabel}>Target</Text>
              <Text
                style={[styles.progressMainValue, { color: colors.primary }]}
              >
                {formatCurrency(stats.totalTargetAmount)}
              </Text>
            </View>
          </View>

          {/* Circular Progress */}
          <View style={styles.chartWrapper}>
            <ProgressChart
              data={progressData}
              width={width - 80}
              height={180}
              strokeWidth={16}
              radius={60}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => colors.primary,
              }}
              hideLegend
            />
            <View style={styles.progressCenter}>
              <Text style={styles.progressCenterValue}>
                {stats.overallProgress.toFixed(1)}%
              </Text>
              <Text style={styles.progressCenterLabel}>Complete</Text>
            </View>
          </View>

          <View style={styles.remainingSection}>
            <Text style={styles.remainingLabel}>Remaining Amount</Text>
            <Text style={styles.remainingValue}>
              {formatCurrency(stats.totalRemainingAmount)}
            </Text>
          </View>
        </Card>

        {/* Goals Distribution */}
        {pieChartData.length > 0 && (
          <Card style={styles.chartCard}>
            <View style={styles.cardHeader}>
              <Icon name="pie-chart" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>Goals Distribution</Text>
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

        {/* Financial Summary */}
        <Card style={styles.financialCard}>
          <View style={styles.cardHeader}>
            <Icon name="cash" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Financial Summary</Text>
          </View>

          <View style={styles.financialRow}>
            <View style={styles.financialItem}>
              <Icon name="arrow-up-circle" size={24} color={colors.success} />
              <View style={styles.financialInfo}>
                <Text style={styles.financialLabel}>Total Saved</Text>
                <Text style={styles.financialValue}>
                  {formatCurrency(stats.totalCurrentAmount)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.financialRow}>
            <View style={styles.financialItem}>
              <Icon name="flag" size={24} color={colors.primary} />
              <View style={styles.financialInfo}>
                <Text style={styles.financialLabel}>Total Target</Text>
                <Text style={styles.financialValue}>
                  {formatCurrency(stats.totalTargetAmount)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.financialRow}>
            <View style={styles.financialItem}>
              <Icon name="trending-down" size={24} color={colors.warning} />
              <View style={styles.financialInfo}>
                <Text style={styles.financialLabel}>Still Needed</Text>
                <Text style={styles.financialValue}>
                  {formatCurrency(stats.totalRemainingAmount)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.financialRow}>
            <View style={styles.financialItem}>
              <Icon name="calculator" size={24} color={colors.info} />
              <View style={styles.financialInfo}>
                <Text style={styles.financialLabel}>Average per Goal</Text>
                <Text style={styles.financialValue}>
                  {formatCurrency(
                    stats.totalGoals > 0
                      ? stats.totalCurrentAmount / stats.totalGoals
                      : 0,
                  )}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Top Goals by Progress */}
        {activeGoals.length > 0 && (
          <Card style={styles.topGoalsCard}>
            <View style={styles.cardHeader}>
              <Icon name="star" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>Top Active Goals</Text>
            </View>

            {activeGoals
              .sort((a: any, b: any) => b.progress - a.progress)
              .slice(0, 5)
              .map((goal: any, index: number) => (
                <View key={goal._id} style={styles.topGoalRow}>
                  <View style={styles.topGoalLeft}>
                    <View
                      style={[
                        styles.topGoalRank,
                        {
                          backgroundColor:
                            index === 0
                              ? colors.warning
                              : index === 1
                              ? `${colors.primary}50`
                              : `${colors.primary}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.topGoalRankText,
                          {
                            color:
                              index === 0
                                ? colors.text.inverse
                                : colors.primary,
                          },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.topGoalIcon,
                        { backgroundColor: `${goal.color}15` },
                      ]}
                    >
                      <Icon name={goal.icon} size={20} color={goal.color} />
                    </View>
                    <View style={styles.topGoalInfo}>
                      <Text style={styles.topGoalName}>{goal.title}</Text>
                      <View style={styles.topGoalProgressBar}>
                        <View
                          style={[
                            styles.topGoalProgressFill,
                            {
                              width: `${Math.min(goal.progress, 100)}%`,
                              backgroundColor: goal.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={styles.topGoalRight}>
                    <Text style={styles.topGoalProgress}>
                      {goal.progress.toFixed(0)}%
                    </Text>
                    <Text style={styles.topGoalAmount}>
                      {formatCurrency(goal.currentAmount)}
                    </Text>
                  </View>
                </View>
              ))}
          </Card>
        )}

        {/* Insights */}
        <Card style={styles.insightsCard}>
          <View style={styles.cardHeader}>
            <Icon name="bulb" size={20} color={colors.warning} />
            <Text style={styles.cardTitle}>Insights</Text>
          </View>

          <View style={styles.insightItem}>
            <Icon name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.insightText}>
              You've completed{' '}
              <Text style={styles.insightHighlight}>
                {stats.completedGoals}
              </Text>{' '}
              out of{' '}
              <Text style={styles.insightHighlight}>{stats.totalGoals}</Text>{' '}
              goals
            </Text>
          </View>

          {stats.overallProgress < 50 && (
            <View style={styles.insightItem}>
              <Icon name="alert-circle" size={18} color={colors.warning} />
              <Text style={styles.insightText}>
                You're at{' '}
                <Text style={styles.insightHighlight}>
                  {stats.overallProgress.toFixed(1)}%
                </Text>{' '}
                of your total savings goal. Keep going!
              </Text>
            </View>
          )}

          {stats.overallProgress >= 50 && stats.overallProgress < 100 && (
            <View style={styles.insightItem}>
              <Icon name="trending-up" size={18} color={colors.success} />
              <Text style={styles.insightText}>
                Great progress! You're more than halfway to your total goal at{' '}
                <Text style={styles.insightHighlight}>
                  {stats.overallProgress.toFixed(1)}%
                </Text>
              </Text>
            </View>
          )}

          {stats.activeGoals > 0 && (
            <View style={styles.insightItem}>
              <Icon name="time" size={18} color={colors.primary} />
              <Text style={styles.insightText}>
                You have{' '}
                <Text style={styles.insightHighlight}>{stats.activeGoals}</Text>{' '}
                active goal{stats.activeGoals !== 1 ? 's' : ''} in progress
              </Text>
            </View>
          )}

          {stats.totalRemainingAmount > 0 && (
            <View style={styles.insightItem}>
              <Icon name="cash" size={18} color={colors.info} />
              <Text style={styles.insightText}>
                You need{' '}
                <Text style={styles.insightHighlight}>
                  {formatCurrency(stats.totalRemainingAmount)}
                </Text>{' '}
                more to reach all your goals
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
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    summaryCard: {
      flex: 1,
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
      ...textStyles.h2,
      color: colors.text.primary,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    summaryLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    progressCard: {
      marginBottom: spacing.lg,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    cardTitle: {
      ...textStyles.h4,
      color: colors.text.primary,
    },
    progressMainStats: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    progressMainItem: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    progressMainLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    progressMainValue: {
      ...textStyles.bodyMedium,
      fontWeight: '700',
    },
    chartWrapper: {
      alignItems: 'center',
      marginVertical: spacing.md,
      position: 'relative',
    },
    progressCenter: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressCenterValue: {
      ...textStyles.h1,
      color: colors.text.primary,
      fontWeight: '700',
    },
    progressCenterLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    remainingSection: {
      backgroundColor: colors.background,
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    remainingLabel: {
      ...textStyles.body,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    },
    remainingValue: {
      ...textStyles.h3,
      color: colors.warning,
      fontWeight: '700',
    },
    chartCard: {
      marginBottom: spacing.lg,
    },
    financialCard: {
      marginBottom: spacing.lg,
    },
    financialRow: {
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    financialItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    financialInfo: {
      flex: 1,
    },
    financialLabel: {
      ...textStyles.body,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    financialValue: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '700',
    },
    topGoalsCard: {
      marginBottom: spacing.lg,
    },
    topGoalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    topGoalLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    topGoalRank: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    topGoalRankText: {
      ...textStyles.caption,
      fontWeight: '700',
      fontSize: 12,
    },
    topGoalIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    topGoalInfo: {
      flex: 1,
    },
    topGoalName: {
      ...textStyles.body,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    topGoalProgressBar: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    topGoalProgressFill: {
      height: '100%',
      borderRadius: 2,
    },
    topGoalRight: {
      alignItems: 'flex-end',
    },
    topGoalProgress: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '700',
      marginBottom: 4,
    },
    topGoalAmount: {
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

export default SavingsGoalsStatsScreen;
