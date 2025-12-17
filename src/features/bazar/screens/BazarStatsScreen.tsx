/* eslint-disable react-native/no-inline-styles */
/**
 * Bazar Statistics Screen - Using React Native Chart Kit
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
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../../hooks/useTheme';
import { useBazarStats } from '../../../hooks/api/useBazar';
import { Card, Spinner, ErrorState } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

const { width } = Dimensions.get('window');

const BazarStatsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const { data: statsData, isLoading, error } = useBazarStats();

  const stats = statsData?.data;

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  // Pie chart data
  const pieData =
    stats && (stats.completedLists > 0 || stats.activeLists > 0)
      ? [
          {
            name: 'Completed',
            population: stats.completedLists || 0,
            color: colors.success,
            legendFontColor: colors.text.primary,
            legendFontSize: 12,
          },
          {
            name: 'Active',
            population: stats.activeLists || 0,
            color: colors.primary,
            legendFontColor: colors.text.primary,
            legendFontSize: 12,
          },
        ]
      : [];

  const chartConfig = {
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Spinner text="Loading stats..." />
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
        <Text style={styles.headerTitle}>Shopping Statistics</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Overview with Pie Chart */}
        <Card style={styles.overviewCard}>
          <Text style={styles.cardTitle}>Lists Overview</Text>

          {pieData.length > 0 ? (
            <View style={styles.chartWrapper}>
              <PieChart
                data={pieData}
                width={width - 60}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 0]}
                absolute
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Icon
                name="stats-chart-outline"
                size={60}
                color={colors.border}
              />
              <Text style={styles.emptyChartText}>No data yet</Text>
            </View>
          )}

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalLists || 0}</Text>
              <Text style={styles.statLabel}>Total Lists</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.completedLists || 0}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.activeLists || 0}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalItems || 0}</Text>
              <Text style={styles.statLabel}>Total Items</Text>
            </View>
          </View>
        </Card>

        {/* Spending Summary */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="wallet-outline" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Spending Summary</Text>
          </View>

          <View style={styles.spendingGrid}>
            <View style={styles.spendingBox}>
              <Text style={styles.spendingLabel}>Total Spent</Text>
              <Icon name="cash-outline" size={32} color={colors.primary} />
              <Text style={styles.spendingValue}>
                {formatCurrency(stats.totalSpent || 0)}
              </Text>
            </View>

            <View style={styles.spendingBox}>
              <Text style={styles.spendingLabel}>This Month</Text>
              <Icon name="calendar-outline" size={32} color={colors.success} />
              <Text style={styles.spendingValue}>
                {formatCurrency(stats.thisMonthSpent || 0)}
              </Text>
            </View>

            <View style={styles.spendingBox}>
              <Text style={styles.spendingLabel}>Avg Per List</Text>
              <Icon
                name="trending-up-outline"
                size={32}
                color={colors.warning}
              />
              <Text style={styles.spendingValue}>
                {formatCurrency(stats.averagePerList || 0)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Top Categories */}
        {stats.topCategories && stats.topCategories.length > 0 && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="apps-outline" size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>Top Categories</Text>
            </View>

            {stats.topCategories.slice(0, 5).map((cat: any, index: number) => (
              <View key={index} style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <View
                    style={[
                      styles.categoryRank,
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
                        styles.categoryRankText,
                        {
                          color:
                            index === 0 ? colors.text.inverse : colors.primary,
                        },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryCount}>{cat.count}</Text>
                  <Text style={styles.categoryCountLabel}>items</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Most Purchased Items */}
        {stats.mostPurchasedItems && stats.mostPurchasedItems.length > 0 && (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="cart-outline" size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>Most Purchased Items</Text>
            </View>

            {stats.mostPurchasedItems
              .slice(0, 8)
              .map((item: any, index: number) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <View
                      style={[
                        styles.itemRank,
                        {
                          backgroundColor:
                            index < 3 ? colors.primary : colors.background,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.itemRankText,
                          {
                            color:
                              index < 3
                                ? colors.text.inverse
                                : colors.text.secondary,
                          },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                  <View style={styles.itemBadge}>
                    <Text style={styles.itemBadgeText}>{item.count}x</Text>
                  </View>
                </View>
              ))}
          </Card>
        )}

        {/* Insights */}
        <Card style={styles.insightsCard}>
          <View style={styles.cardHeader}>
            <Icon name="bulb-outline" size={24} color={colors.warning} />
            <Text style={styles.cardTitle}>Insights</Text>
          </View>

          <View style={styles.insightItem}>
            <Icon name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.insightText}>
              You've completed{' '}
              <Text style={styles.insightHighlight}>
                {stats.completedLists || 0}
              </Text>{' '}
              shopping trips
            </Text>
          </View>

          {stats.totalSpent > 0 && (
            <View style={styles.insightItem}>
              <Icon name="trending-down" size={20} color={colors.info} />
              <Text style={styles.insightText}>
                Average spending per trip:{' '}
                <Text style={styles.insightHighlight}>
                  {formatCurrency(stats.averagePerList || 0)}
                </Text>
              </Text>
            </View>
          )}

          {stats.totalItems > 0 && (
            <View style={styles.insightItem}>
              <Icon name="cube" size={20} color={colors.primary} />
              <Text style={styles.insightText}>
                You've purchased{' '}
                <Text style={styles.insightHighlight}>
                  {stats.totalItems || 0}
                </Text>{' '}
                items in total
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
  //   shadows: any,
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
    overviewCard: {
      marginBottom: spacing.lg,
    },
    chartWrapper: {
      alignItems: 'center',
      marginVertical: spacing.md,
    },
    emptyChart: {
      height: 220,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyChartText: {
      ...textStyles.caption,
      color: colors.text.tertiary,
      marginTop: spacing.sm,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    statBox: {
      width: '45%',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: borderRadius.md,
    },
    statValue: {
      ...textStyles.h3,
      color: colors.primary,
      fontWeight: '700',
    },
    statLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    card: {
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
    spendingGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    spendingBox: {
      width: '30%',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: borderRadius.md,
    },
    spendingValue: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '700',
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    spendingLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      textAlign: 'center',
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
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryRankText: {
      ...textStyles.caption,
      fontWeight: '700',
    },
    categoryName: {
      ...textStyles.body,
      color: colors.text.primary,
      flex: 1,
    },
    categoryRight: {
      alignItems: 'flex-end',
    },
    categoryCount: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '700',
    },
    categoryCountLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    itemRank: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemRankText: {
      ...textStyles.caption,
      fontWeight: '700',
      fontSize: 12,
    },
    itemName: {
      ...textStyles.body,
      color: colors.text.primary,
      flex: 1,
    },
    itemBadge: {
      backgroundColor: `${colors.primary}15`,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    itemBadgeText: {
      ...textStyles.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    insightsCard: {
      // backgroundColor: `${colors.warning}10`,
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

export default BazarStatsScreen;
