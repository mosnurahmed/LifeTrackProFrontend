/**
 * Income vs Expense Widget - Combined View
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useIncomeStats } from '../../../hooks/api/useIncome';
import { useExpenseStats } from '../../../hooks/api/useExpenses';
import { Card, Spinner } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

const IncomeExpenseWidget: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const { data: incomeStatsData, isLoading: incomeLoading } = useIncomeStats();
  const { data: expenseStatsData, isLoading: expenseLoading } =
    useExpenseStats();

  const incomeStats = incomeStatsData?.data?.data;
  const expenseStats = expenseStatsData?.data?.data;

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  if (incomeLoading || expenseLoading) {
    return (
      <Card style={styles.container}>
        <Spinner size="small" />
      </Card>
    );
  }

  const totalIncome = incomeStats?.allTime.total || 0;
  const totalExpense = expenseStats?.allTime.total || 0;
  const netBalance = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Icon name="analytics" size={20} color={colors.primary} />
        <Text style={styles.title}>Financial Overview</Text>
      </View>

      {/* Income Section */}
      <TouchableOpacity
        style={styles.section}
        onPress={() => (navigation as any).navigate('Income')}
        activeOpacity={0.7}
      >
        <View style={styles.sectionLeft}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${colors.success}15` },
            ]}
          >
            <Icon name="trending-up" size={20} color={colors.success} />
          </View>
          <View>
            <Text style={styles.sectionLabel}>Income</Text>
            <Text style={[styles.sectionValue, { color: colors.success }]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>
        </View>
        <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
      </TouchableOpacity>

      {/* Expense Section */}
      <TouchableOpacity
        style={styles.section}
        onPress={() => (navigation as any).navigate('Expenses')}
        activeOpacity={0.7}
      >
        <View style={styles.sectionLeft}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${colors.danger}15` },
            ]}
          >
            <Icon name="trending-down" size={20} color={colors.danger} />
          </View>
          <View>
            <Text style={styles.sectionLabel}>Expenses</Text>
            <Text style={[styles.sectionValue, { color: colors.danger }]}>
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>
        <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
      </TouchableOpacity>

      {/* Net Balance */}
      <View style={styles.balanceSection}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Net Balance</Text>
          <Text
            style={[
              styles.balanceValue,
              { color: netBalance >= 0 ? colors.success : colors.danger },
            ]}
          >
            {formatCurrency(netBalance)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressIncome,
                {
                  width:
                    totalIncome + totalExpense > 0
                      ? `${(totalIncome / (totalIncome + totalExpense)) * 100}%`
                      : '50%',
                  backgroundColor: colors.success,
                },
              ]}
            />
            <View
              style={[
                styles.progressExpense,
                {
                  width:
                    totalIncome + totalExpense > 0
                      ? `${
                          (totalExpense / (totalIncome + totalExpense)) * 100
                        }%`
                      : '50%',
                  backgroundColor: colors.danger,
                },
              ]}
            />
          </View>
        </View>

        {/* Savings Rate */}
        {savingsRate > 0 && (
          <View style={styles.savingsRate}>
            <Icon name="shield-checkmark" size={14} color={colors.info} />
            <Text style={styles.savingsRateText}>
              {savingsRate.toFixed(1)}% savings rate
            </Text>
          </View>
        )}
      </View>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    title: {
      ...textStyles.h4,
      color: colors.text.primary,
    },
    section: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    sectionValue: {
      ...textStyles.bodyMedium,
      fontWeight: '700',
    },
    balanceSection: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    balanceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    balanceLabel: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    balanceValue: {
      ...textStyles.h4,
      fontWeight: '700',
    },
    progressContainer: {
      marginBottom: spacing.sm,
    },
    progressBar: {
      flexDirection: 'row',
      height: 8,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
      backgroundColor: colors.border,
    },
    progressIncome: {
      height: '100%',
    },
    progressExpense: {
      height: '100%',
    },
    savingsRate: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      backgroundColor: `${colors.info}15`,
      borderRadius: borderRadius.md,
    },
    savingsRateText: {
      ...textStyles.caption,
      color: colors.info,
      fontWeight: '600',
    },
  });

export default IncomeExpenseWidget;
