/**
 * Income Widget - For Dashboard
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useIncomeStats } from '../../../hooks/api/useIncome';
import { Card, Spinner } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

const IncomeWidget: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const { data: statsData, isLoading } = useIncomeStats();
  const stats = statsData?.data;

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  if (isLoading) {
    return (
      <Card style={styles.container}>
        <Spinner size="small" />
      </Card>
    );
  }

  if (!stats || stats.thisMonth.total === 0) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <Icon name="trending-up" size={20} color={colors.success} />
          <Text style={styles.title}>Income</Text>
        </View>
        <Text style={styles.emptyText}>No income this month</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => (navigation as any).navigate('Income')}
        >
          <Text style={styles.emptyButtonText}>Add Income</Text>
        </TouchableOpacity>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => (navigation as any).navigate('Income')}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Icon name="trending-up" size={20} color={colors.success} />
          <Text style={styles.title}>Income</Text>
          <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
        </View>

        <View style={styles.main}>
          <View style={styles.row}>
            <Text style={styles.label}>This Month</Text>
            <Text style={[styles.value, { color: colors.success }]}>
              {formatCurrency(stats.thisMonth.total)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Transactions</Text>
            <Text style={styles.value}>{stats.thisMonth.count}</Text>
          </View>
        </View>

        {/* Comparison Badge */}
        {stats.comparison.percentageChange !== 0 && (
          <View
            style={[
              styles.changeBadge,
              {
                backgroundColor:
                  stats.comparison.percentageChange > 0
                    ? `${colors.success}15`
                    : `${colors.danger}15`,
              },
            ]}
          >
            <Icon
              name={
                stats.comparison.percentageChange > 0
                  ? 'trending-up'
                  : 'trending-down'
              }
              size={14}
              color={
                stats.comparison.percentageChange > 0
                  ? colors.success
                  : colors.danger
              }
            />
            <Text
              style={[
                styles.changeText,
                {
                  color:
                    stats.comparison.percentageChange > 0
                      ? colors.success
                      : colors.danger,
                },
              ]}
            >
              {Math.abs(stats.comparison.percentageChange).toFixed(1)}% vs last
              month
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );
};

const createStyles = (
  colors: any,
  textStyles: any,
  spacing: any,
  borderRadius: any,
) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    content: {
      padding: 0,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    title: {
      ...textStyles.h4,
      color: colors.text.primary,
      flex: 1,
    },
    main: {
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs,
    },
    label: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    value: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '700',
    },
    changeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    changeText: {
      ...textStyles.caption,
      fontWeight: '600',
    },
    emptyText: {
      ...textStyles.body,
      color: colors.text.secondary,
      textAlign: 'center',
      marginVertical: spacing.md,
    },
    emptyButton: {
      backgroundColor: colors.success,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      alignSelf: 'center',
    },
    emptyButtonText: {
      ...textStyles.body,
      color: colors.text.inverse,
      fontWeight: '600',
    },
  });

export default IncomeWidget;
