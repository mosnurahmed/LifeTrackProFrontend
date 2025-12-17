/**
 * Budget Widget - For Dashboard
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useBudgetSummary } from '../../../hooks/api/useBudget';
import { Card, Spinner } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

const BudgetWidget: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const { data: summaryData, isLoading } = useBudgetSummary();
  const summary = summaryData?.data;

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  if (isLoading) {
    return (
      <Card style={styles.container}>
        <Spinner size="small" />
      </Card>
    );
  }

  if (!summary || summary.categoriesWithBudget === 0) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <Icon name="wallet-outline" size={20} color={colors.primary} />
          <Text style={styles.title}>Budget</Text>
        </View>
        <Text style={styles.emptyText}>No budgets set</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => (navigation as any).navigate('Budget')}
        >
          <Text style={styles.emptyButtonText}>Set Budget</Text>
        </TouchableOpacity>
      </Card>
    );
  }

  const overallStatus =
    summary.overallPercentage >= 100
      ? 'exceeded'
      : summary.overallPercentage >= 80
      ? 'warning'
      : 'safe';

  return (
    <Card style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => (navigation as any).navigate('Budget')}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Icon name="wallet" size={20} color={colors.primary} />
          <Text style={styles.title}>Budget</Text>
          <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
        </View>

        <View style={styles.main}>
          <View style={styles.row}>
            <Text style={styles.label}>Spent</Text>
            <Text style={[styles.value, { color: colors.danger }]}>
              {formatCurrency(summary.totalSpent)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Budget</Text>
            <Text style={[styles.value, { color: colors.primary }]}>
              {formatCurrency(summary.totalBudget)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(summary.overallPercentage, 100)}%`,
                  backgroundColor:
                    overallStatus === 'exceeded'
                      ? colors.danger
                      : overallStatus === 'warning'
                      ? colors.warning
                      : colors.success,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {summary.overallPercentage.toFixed(0)}% used
          </Text>
        </View>

        {/* Status */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                overallStatus === 'exceeded'
                  ? `${colors.danger}15`
                  : overallStatus === 'warning'
                  ? `${colors.warning}15`
                  : `${colors.success}15`,
            },
          ]}
        >
          <Icon
            name={
              overallStatus === 'exceeded'
                ? 'alert-circle'
                : overallStatus === 'warning'
                ? 'warning'
                : 'checkmark-circle'
            }
            size={14}
            color={
              overallStatus === 'exceeded'
                ? colors.danger
                : overallStatus === 'warning'
                ? colors.warning
                : colors.success
            }
          />
          <Text
            style={[
              styles.statusText,
              {
                color:
                  overallStatus === 'exceeded'
                    ? colors.danger
                    : overallStatus === 'warning'
                    ? colors.warning
                    : colors.success,
              },
            ]}
          >
            {overallStatus === 'exceeded'
              ? 'Over Budget'
              : overallStatus === 'warning'
              ? 'Near Limit'
              : 'On Track'}
          </Text>
        </View>
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
      fontWeight: '700',
    },
    progressContainer: {
      marginBottom: spacing.md,
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
      marginBottom: spacing.xs,
    },
    progressFill: {
      height: '100%',
      borderRadius: borderRadius.full,
    },
    progressText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    statusText: {
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
      backgroundColor: colors.primary,
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

export default BudgetWidget;
