/**
 * Task Statistics Screen
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
import { PieChart, ProgressChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../../../hooks/useTheme';
import { useTaskStats, useTasks } from '../../../hooks/api/useTasks';
import { Card, Spinner, ErrorState } from '../../../components/common';

const { width } = Dimensions.get('window');

const TaskStatsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const { data: statsData, isLoading, error } = useTaskStats();
  const { data: tasksData } = useTasks();

  const stats = statsData?.data;
  const tasks = tasksData?.data?.data || [];

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
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => colors.text.secondary,
    style: {
      borderRadius: borderRadius.md,
    },
  };

  // Pie chart data for status distribution
  const pieChartData = [
    {
      name: 'To Do',
      population: stats?.todo || 0,
      color: colors.warning,
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    },
    {
      name: 'In Progress',
      population: stats?.inProgress || 0,
      color: colors.primary,
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    },
    {
      name: 'Completed',
      population: stats?.completed || 0,
      color: colors.success,
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    },
    {
      name: 'Cancelled',
      population: stats?.cancelled || 0,
      color: colors.text.tertiary,
      legendFontColor: colors.text.primary,
      legendFontSize: 12,
    },
  ].filter(item => item.population > 0);

  // Priority breakdown
  const priorityBreakdown = [
    {
      name: 'Urgent',
      count: tasks.filter((t: any) => t.priority === 'urgent').length,
      color: colors.danger,
    },
    {
      name: 'High',
      count: tasks.filter((t: any) => t.priority === 'high').length,
      color: colors.warning,
    },
    {
      name: 'Medium',
      count: tasks.filter((t: any) => t.priority === 'medium').length,
      color: colors.info,
    },
    {
      name: 'Low',
      count: tasks.filter((t: any) => t.priority === 'low').length,
      color: colors.text.tertiary,
    },
  ];

  // Completion rate
  const completionRate =
    stats?.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const progressData = {
    labels: ['Completion'],
    data: [completionRate / 100],
  };

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
        <Text style={styles.headerTitle}>Task Statistics</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="list" size={28} color={colors.primary} />
            </View>
            <Text style={styles.summaryValue}>{stats.total}</Text>
            <Text style={styles.summaryLabel}>Total Tasks</Text>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="checkmark-circle" size={28} color={colors.success} />
            </View>
            <Text style={styles.summaryValue}>{stats.completed}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="alert-circle" size={28} color={colors.danger} />
            </View>
            <Text style={styles.summaryValue}>{stats.overdue}</Text>
            <Text style={styles.summaryLabel}>Overdue</Text>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Icon name="today" size={28} color={colors.warning} />
            </View>
            <Text style={styles.summaryValue}>{stats.dueToday}</Text>
            <Text style={styles.summaryLabel}>Due Today</Text>
          </Card>
        </View>

        {/* Completion Rate */}
        <Card style={styles.progressCard}>
          <View style={styles.cardHeader}>
            <Icon name="trending-up" size={20} color={colors.success} />
            <Text style={styles.cardTitle}>Completion Rate</Text>
          </View>

          <View style={styles.chartWrapper}>
            <ProgressChart
              data={progressData}
              width={width - 80}
              height={180}
              strokeWidth={16}
              radius={60}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => colors.success,
              }}
              hideLegend
            />
            <View style={styles.progressCenter}>
              <Text style={styles.progressCenterValue}>
                {completionRate.toFixed(1)}%
              </Text>
              <Text style={styles.progressCenterLabel}>Completed</Text>
            </View>
          </View>

          <View style={styles.completionStats}>
            <View style={styles.completionStatItem}>
              <Text style={styles.completionStatLabel}>Completed</Text>
              <Text
                style={[styles.completionStatValue, { color: colors.success }]}
              >
                {stats.completed}
              </Text>
            </View>
            <View style={styles.completionStatItem}>
              <Text style={styles.completionStatLabel}>Pending</Text>
              <Text
                style={[styles.completionStatValue, { color: colors.warning }]}
              >
                {stats.todo + stats.inProgress}
              </Text>
            </View>
            <View style={styles.completionStatItem}>
              <Text style={styles.completionStatLabel}>Cancelled</Text>
              <Text
                style={[
                  styles.completionStatValue,
                  { color: colors.text.tertiary },
                ]}
              >
                {stats.cancelled}
              </Text>
            </View>
          </View>
        </Card>

        {/* Status Distribution */}
        {pieChartData.length > 0 && (
          <Card style={styles.chartCard}>
            <View style={styles.cardHeader}>
              <Icon name="pie-chart" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>Status Distribution</Text>
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

        {/* Priority Breakdown */}
        <Card style={styles.priorityCard}>
          <View style={styles.cardHeader}>
            <Icon name="flag" size={20} color={colors.danger} />
            <Text style={styles.cardTitle}>Priority Breakdown</Text>
          </View>

          {priorityBreakdown.map((priority, index) => (
            <View key={priority.name} style={styles.priorityRow}>
              <View style={styles.priorityLeft}>
                <View
                  style={[
                    styles.priorityDot,
                    { backgroundColor: priority.color },
                  ]}
                />
                <Text style={styles.priorityName}>{priority.name}</Text>
              </View>
              <View style={styles.priorityRight}>
                <Text style={styles.priorityCount}>{priority.count}</Text>
                <View style={styles.priorityBarContainer}>
                  <View
                    style={[
                      styles.priorityBar,
                      {
                        width:
                          stats.total > 0
                            ? `${(priority.count / stats.total) * 100}%`
                            : '0%',
                        backgroundColor: priority.color,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </Card>

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
              <Text style={styles.insightHighlight}>{stats.completed}</Text> out
              of <Text style={styles.insightHighlight}>{stats.total}</Text>{' '}
              tasks
            </Text>
          </View>

          {stats.overdue > 0 && (
            <View style={styles.insightItem}>
              <Icon name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.insightText}>
                <Text style={styles.insightHighlight}>{stats.overdue}</Text>{' '}
                task
                {stats.overdue !== 1 ? 's are' : ' is'} overdue. Consider
                rescheduling or completing them.
              </Text>
            </View>
          )}

          {stats.dueToday > 0 && (
            <View style={styles.insightItem}>
              <Icon name="today" size={18} color={colors.warning} />
              <Text style={styles.insightText}>
                <Text style={styles.insightHighlight}>{stats.dueToday}</Text>{' '}
                task
                {stats.dueToday !== 1 ? 's are' : ' is'} due today. Stay
                focused!
              </Text>
            </View>
          )}

          {stats.inProgress > 0 && (
            <View style={styles.insightItem}>
              <Icon name="play" size={18} color={colors.primary} />
              <Text style={styles.insightText}>
                You have{' '}
                <Text style={styles.insightHighlight}>{stats.inProgress}</Text>{' '}
                task
                {stats.inProgress !== 1 ? 's' : ''} in progress
              </Text>
            </View>
          )}

          {completionRate >= 80 && (
            <View style={styles.insightItem}>
              <Icon name="trophy" size={18} color={colors.warning} />
              <Text style={styles.insightText}>
                Excellent work! Your completion rate is{' '}
                <Text style={styles.insightHighlight}>
                  {completionRate.toFixed(1)}%
                </Text>
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
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '600',
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
    completionStats: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    completionStatItem: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    completionStatLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    completionStatValue: {
      ...textStyles.h4,
      fontWeight: '700',
    },
    chartCard: {
      marginBottom: spacing.lg,
    },
    priorityCard: {
      marginBottom: spacing.lg,
    },
    priorityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    priorityLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    priorityDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    priorityName: {
      ...textStyles.body,
      color: colors.text.primary,
    },
    priorityRight: {
      alignItems: 'flex-end',
      flex: 1,
    },
    priorityCount: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    priorityBarContainer: {
      width: '100%',
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    priorityBar: {
      height: '100%',
      borderRadius: 3,
    },
    insightsCard: {
      //   backgroundColor: `${colors.primary}10`,
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
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

export default TaskStatsScreen;
