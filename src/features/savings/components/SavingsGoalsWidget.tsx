/**
 * Savings Goals Widget - For Dashboard
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useSavingsGoals } from '../../../hooks/api/useSavingsGoals';
import { Card, Spinner } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

const SavingsGoalsWidget: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const { data: goalsData, isLoading } = useSavingsGoals();
  const goals = goalsData?.data?.data || [];
  const activeGoals = goals.filter((g: any) => !g.isCompleted);

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  if (isLoading) {
    return (
      <Card style={styles.container}>
        <Spinner size="small" />
      </Card>
    );
  }

  if (!activeGoals || activeGoals.length === 0) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <Icon name="wallet-outline" size={20} color={colors.primary} />
          <Text style={styles.title}>Savings Goals</Text>
        </View>
        <Text style={styles.emptyText}>No active savings goals</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => (navigation as any).navigate('SavingsGoals')}
        >
          <Text style={styles.emptyButtonText}>Create Goal</Text>
        </TouchableOpacity>
      </Card>
    );
  }

  const totalTarget = activeGoals.reduce(
    (sum: number, g: any) => sum + g.targetAmount,
    0,
  );
  const totalSaved = activeGoals.reduce(
    (sum: number, g: any) => sum + g.currentAmount,
    0,
  );
  const overallProgress =
    totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <Card style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => (navigation as any).navigate('Savings')}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Icon name="wallet" size={20} color={colors.primary} />
          <Text style={styles.title}>Savings Goals</Text>
          <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
        </View>

        {/* Overall Progress */}
        <View style={styles.overallSection}>
          <View style={styles.overallRow}>
            <Text style={styles.overallLabel}>Total Saved</Text>
            <Text style={styles.overallValue}>
              {formatCurrency(totalSaved)}
            </Text>
          </View>
          <View style={styles.overallRow}>
            <Text style={styles.overallLabel}>Target</Text>
            <Text style={styles.overallValue}>
              {formatCurrency(totalTarget)}
            </Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(overallProgress, 100)}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {overallProgress.toFixed(0)}% of total goal
        </Text>

        {/* Active Goals Preview */}
        <View style={styles.goalsPreview}>
          <Text style={styles.goalsPreviewTitle}>Active Goals</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {activeGoals.slice(0, 3).map((goal: any) => (
              <View
                key={goal._id}
                style={[
                  styles.goalPreviewCard,
                  { backgroundColor: `${goal.color}15` },
                ]}
              >
                <Icon name={goal.icon} size={24} color={goal.color} />
                <Text style={styles.goalPreviewTitle} numberOfLines={1}>
                  {goal.title}
                </Text>
                <Text style={styles.goalPreviewProgress}>
                  {goal.progress.toFixed(0)}%
                </Text>
              </View>
            ))}
          </ScrollView>
          {activeGoals.length > 3 && (
            <Text style={styles.moreGoals}>+{activeGoals.length - 3} more</Text>
          )}
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
    overallSection: {
      marginBottom: spacing.md,
    },
    overallRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs,
    },
    overallLabel: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    overallValue: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '700',
    },
    progressBarContainer: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
      marginBottom: spacing.xs,
    },
    progressBar: {
      height: '100%',
      borderRadius: borderRadius.full,
    },
    progressText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    goalsPreview: {
      marginTop: spacing.sm,
    },
    goalsPreviewTitle: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
      fontWeight: '600',
    },
    goalPreviewCard: {
      width: 100,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginRight: spacing.sm,
      alignItems: 'center',
    },
    goalPreviewTitle: {
      ...textStyles.caption,
      color: colors.text.primary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    goalPreviewProgress: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontWeight: '700',
      marginTop: 4,
    },
    moreGoals: {
      ...textStyles.caption,
      color: colors.text.tertiary,
      textAlign: 'center',
      marginTop: spacing.sm,
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

export default SavingsGoalsWidget;
