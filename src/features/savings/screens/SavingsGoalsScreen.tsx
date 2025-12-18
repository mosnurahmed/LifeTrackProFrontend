/**
 * Savings Goals Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import {
  useSavingsGoals,
  useDeleteSavingsGoal,
} from '../../../hooks/api/useSavingsGoals';
import {
  Card,
  Button,
  EmptyState,
  ErrorState,
} from '../../../components/common';
import { SkeletonList } from '../../../components/common/Loading';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const SavingsGoalsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>(
    'active',
  );

  const {
    data: goalsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useSavingsGoals();
  const deleteMutation = useDeleteSavingsGoal();

  const goals = goalsData?.data?.data || [];

  const filteredGoals = goals.filter((goal: any) => {
    if (filter === 'active') return !goal.isCompleted;
    if (filter === 'completed') return goal.isCompleted;
    return true;
  });

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  const handleAddGoal = () => {
    (navigation as any).navigate('AddSavingsGoal', { mode: 'create' });
  };

  const handleEditGoal = (id: string) => {
    (navigation as any).navigate('AddSavingsGoal', {
      mode: 'edit',
      goalId: id,
    });
  };

  const handleViewGoal = (id: string) => {
    (navigation as any).navigate('SavingsGoalDetails', { goalId: id });
  };

  const handleDeleteGoal = (id: string, title: string) => {
    Alert.alert('Delete Goal', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Savings Goals</Text>
        </View>
        <SkeletonList count={5} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Savings Goals</Text>
        </View>
        <ErrorState
          title="Failed to load goals"
          message="Please try again"
          onRetry={refetch}
        />
      </View>
    );
  }

  if (!goals || goals.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Savings Goals</Text>
        </View>
        <EmptyState
          icon="wallet-outline"
          title="No Savings Goals"
          message="Create your first savings goal"
          actionLabel="Create Goal"
          onAction={handleAddGoal}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Savings Goals</Text>
          <Text style={styles.headerSubtitle}>{goals.length} goals</Text>
        </View>
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => (navigation as any).navigate('SavingsGoalsStats')}
        >
          <Icon name="stats-chart" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'active' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('active')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'active' && styles.filterTabTextActive,
            ]}
          >
            Active ({goals.filter((g: any) => !g.isCompleted).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'completed' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('completed')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'completed' && styles.filterTabTextActive,
            ]}
          >
            Completed ({goals.filter((g: any) => g.isCompleted).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'all' && styles.filterTabTextActive,
            ]}
          >
            All ({goals.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Goals List */}
      <FlatList
        data={filteredGoals}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <Card style={styles.goalCard}>
            <TouchableOpacity
              onPress={() => handleViewGoal(item._id)}
              activeOpacity={0.7}
            >
              {/* Header */}
              <View style={styles.goalHeader}>
                <View
                  style={[
                    styles.goalIcon,
                    { backgroundColor: `${item.color}15` },
                  ]}
                >
                  <Icon name={item.icon} size={28} color={item.color} />
                </View>
                <View style={styles.goalHeaderInfo}>
                  <Text style={styles.goalTitle}>{item.title}</Text>
                  {item.targetDate && (
                    <View style={styles.goalDate}>
                      <Icon
                        name="calendar-outline"
                        size={12}
                        color={colors.text.secondary}
                      />
                      <Text style={styles.goalDateText}>
                        Target: {formatDate(item.targetDate, 'dd MMM yyyy')}
                      </Text>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    styles.priorityBadge,
                    {
                      backgroundColor:
                        item.priority === 'high'
                          ? `${colors.danger}15`
                          : item.priority === 'medium'
                          ? `${colors.warning}15`
                          : `${colors.info}15`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      {
                        color:
                          item.priority === 'high'
                            ? colors.danger
                            : item.priority === 'medium'
                            ? colors.warning
                            : colors.info,
                      },
                    ]}
                  >
                    {item.priority}
                  </Text>
                </View>
              </View>

              {/* Progress */}
              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Text style={styles.currentAmount}>
                    {formatCurrency(item.currentAmount)}
                  </Text>
                  <Text style={styles.targetAmount}>
                    / {formatCurrency(item.targetAmount)}
                  </Text>
                </View>
                <Text style={styles.progressPercentage}>
                  {item.progress.toFixed(1)}%
                </Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(item.progress, 100)}%`,
                      backgroundColor: item.isCompleted
                        ? colors.success
                        : item.color,
                    },
                  ]}
                />
              </View>

              {/* Footer */}
              <View style={styles.goalFooter}>
                <View style={styles.goalStats}>
                  <Text style={styles.goalStatLabel}>Remaining:</Text>
                  <Text style={styles.goalStatValue}>
                    {formatCurrency(item.remainingAmount)}
                  </Text>
                </View>
                {item.isCompleted && (
                  <View style={styles.completedBadge}>
                    <Icon
                      name="checkmark-circle"
                      size={16}
                      color={colors.success}
                    />
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.goalActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleViewGoal(item._id)}
                >
                  <Icon name="eye-outline" size={18} color={colors.primary} />
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>
                {!item.isCompleted && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditGoal(item._id)}
                  >
                    <Icon
                      name="create-outline"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteGoal(item._id, item.title)}
                >
                  <Icon name="trash-outline" size={18} color={colors.danger} />
                  <Text
                    style={[styles.actionButtonText, { color: colors.danger }]}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Card>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddGoal}
        activeOpacity={0.8}
      >
        <Icon name="add" size={28} color={colors.text.inverse} />
      </TouchableOpacity>
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
    headerSubtitle: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    statsButton: {
      padding: spacing.sm,
    },
    filterTabs: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    filterTab: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
    },
    filterTabActive: {
      backgroundColor: colors.primary,
    },
    filterTabText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    filterTabTextActive: {
      color: colors.text.inverse,
    },
    listContent: {
      padding: spacing.lg,
      paddingBottom: 100,
    },
    goalCard: {
      marginBottom: spacing.md,
    },
    goalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
      gap: spacing.md,
    },
    goalIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    goalHeaderInfo: {
      flex: 1,
    },
    goalTitle: {
      ...textStyles.h4,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    goalDate: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    goalDateText: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    priorityBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    priorityText: {
      ...textStyles.caption,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    progressSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: spacing.sm,
    },
    progressInfo: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    currentAmount: {
      ...textStyles.h3,
      color: colors.text.primary,
      fontWeight: '700',
    },
    targetAmount: {
      ...textStyles.body,
      color: colors.text.secondary,
      marginLeft: spacing.xs,
    },
    progressPercentage: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '700',
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
      marginBottom: spacing.md,
    },
    progressBar: {
      height: '100%',
      borderRadius: borderRadius.full,
    },
    goalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    goalStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    goalStatLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    goalStatValue: {
      ...textStyles.caption,
      color: colors.text.primary,
      fontWeight: '700',
    },
    completedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: `${colors.success}15`,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
    },
    completedText: {
      ...textStyles.caption,
      fontSize: 10,
      color: colors.success,
      fontWeight: '700',
    },
    goalActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.md,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    actionButtonText: {
      ...textStyles.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    fab: {
      position: 'absolute',
      bottom: 80,
      right: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.lg,
    },
  });

export default SavingsGoalsScreen;
