/**
 * Savings Goal Details Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import {
  useSavingsGoal,
  useContributions,
  useAddContribution,
} from '../../../hooks/api/useSavingsGoals';
import { Card, Button, Spinner, ErrorState } from '../../../components/common';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from '../../../utils/formatters';

const SavingsGoalDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const { goalId } = (route.params as any) || {};

  const [showContributeModal, setShowContributeModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const {
    data: goalData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useSavingsGoal(goalId);
  const { data: contributionsData } = useContributions(goalId);
  const addContributionMutation = useAddContribution();

  const goal = goalData?.data?.data;
  const contributions = contributionsData?.data?.data || [];

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  const handleAddContribution = async () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return;
    }

    await addContributionMutation.mutateAsync({
      id: goalId,
      data: {
        amount: amountValue,
        note: note.trim() || undefined,
      },
    });

    setAmount('');
    setNote('');
    setShowContributeModal(false);
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Spinner text="Loading..." />
      </View>
    );
  }

  if (error || !goal) {
    return (
      <View style={styles.container}>
        <ErrorState
          title="Goal not found"
          message="Unable to load goal details"
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
        <Text style={styles.headerTitle}>Goal Details</Text>
        {!goal.isCompleted && (
          <TouchableOpacity
            onPress={() =>
              (navigation as any).navigate('AddSavingsGoal', {
                mode: 'edit',
                goalId,
              })
            }
          >
            <Icon name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        {goal.isCompleted && <View style={{ width: 24 }} />}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Goal Info Card */}
        <Card style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View
              style={[styles.goalIcon, { backgroundColor: `${goal.color}15` }]}
            >
              <Icon name={goal.icon} size={48} color={goal.color} />
            </View>
            <View style={styles.goalHeaderInfo}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              {goal.description && (
                <Text style={styles.goalDescription}>{goal.description}</Text>
              )}
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.currentAmount}>
                {formatCurrency(goal.currentAmount)}
              </Text>
              <Text style={styles.progressPercentage}>
                {goal.progress.toFixed(1)}%
              </Text>
            </View>
            <Text style={styles.targetAmount}>
              of {formatCurrency(goal.targetAmount)}
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(goal.progress, 100)}%`,
                  backgroundColor: goal.isCompleted
                    ? colors.success
                    : goal.color,
                },
              ]}
            />
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Icon name="trending-down" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={styles.statValue}>
                {formatCurrency(goal.remainingAmount)}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Icon
                name={
                  goal.priority === 'high'
                    ? 'flag'
                    : goal.priority === 'medium'
                    ? 'flag-outline'
                    : 'bookmark-outline'
                }
                size={20}
                color={
                  goal.priority === 'high'
                    ? colors.danger
                    : goal.priority === 'medium'
                    ? colors.warning
                    : colors.info
                }
              />
              <Text style={styles.statLabel}>Priority</Text>
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor:
                      goal.priority === 'high'
                        ? `${colors.danger}15`
                        : goal.priority === 'medium'
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
                        goal.priority === 'high'
                          ? colors.danger
                          : goal.priority === 'medium'
                          ? colors.warning
                          : colors.info,
                    },
                  ]}
                >
                  {goal.priority}
                </Text>
              </View>
            </View>

            <View style={styles.statBox}>
              <Icon name="calendar" size={20} color={colors.success} />
              <Text style={styles.statLabel}>Target Date</Text>
              <Text style={styles.statValue}>
                {goal.targetDate
                  ? formatDate(goal.targetDate, 'dd MMM yyyy')
                  : 'No deadline'}
              </Text>
            </View>
          </View>

          {/* Additional Info Cards */}
          {goal.targetDate && (
            <View style={styles.infoCards}>
              <Card style={styles.infoCard}>
                <Icon
                  name="hourglass-outline"
                  size={16}
                  color={colors.warning}
                />
                <Text style={styles.infoCardText}>
                  {getDaysRemaining(goal.targetDate)} days remaining
                </Text>
              </Card>
            </View>
          )}

          {goal.isCompleted && (
            <View style={styles.completedBanner}>
              <Icon name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.completedText}>
                Goal completed on {formatDate(goal.completedAt, 'dd MMM yyyy')}!
              </Text>
            </View>
          )}
        </Card>

        {/* Contributions */}
        <View style={styles.contributionsSection}>
          <View style={styles.contributionsHeader}>
            <Text style={styles.contributionsTitle}>Contribution History</Text>
            <Text style={styles.contributionsCount}>
              {contributions.length} contributions
            </Text>
          </View>

          {contributions.length > 0 ? (
            contributions.map((contribution: any) => (
              <Card key={contribution._id} style={styles.contributionCard}>
                <View style={styles.contributionHeader}>
                  <View
                    style={[
                      styles.contributionIcon,
                      { backgroundColor: `${colors.success}15` },
                    ]}
                  >
                    <Icon name="add-circle" size={20} color={colors.success} />
                  </View>
                  <View style={styles.contributionInfo}>
                    <Text style={styles.contributionAmount}>
                      {formatCurrency(contribution.amount)}
                    </Text>
                    <Text style={styles.contributionDate}>
                      {formatRelativeTime(contribution.date)}
                    </Text>
                  </View>
                </View>
                {contribution.note && (
                  <Text style={styles.contributionNote}>
                    {contribution.note}
                  </Text>
                )}
              </Card>
            ))
          ) : (
            <Card style={styles.emptyContributions}>
              <Icon
                name="wallet-outline"
                size={48}
                color={colors.text.tertiary}
              />
              <Text style={styles.emptyText}>No contributions yet</Text>
            </Card>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Contribution Button */}
      {!goal.isCompleted && (
        <View style={styles.footer}>
          <Button onPress={() => setShowContributeModal(true)}>
            <Icon
              name="add-circle-outline"
              size={20}
              color={colors.text.inverse}
            />
            <Text style={styles.buttonText}>Add Contribution</Text>
          </Button>
        </View>
      )}

      {/* Contribute Modal */}
      <Modal visible={showContributeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Contribution</Text>
              <TouchableOpacity onPress={() => setShowContributeModal(false)}>
                <Icon name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Amount *</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                  style={styles.amountTextInput}
                  placeholderTextColor={colors.text.tertiary}
                  autoFocus
                />
              </View>

              <Text style={styles.inputLabel}>Note (Optional)</Text>
              <TextInput
                placeholder="Add a note"
                value={note}
                onChangeText={setNote}
                style={styles.noteInput}
                placeholderTextColor={colors.text.tertiary}
                multiline
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                variant="outline"
                onPress={() => setShowContributeModal(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              >
                Cancel
              </Button>
              <Button
                onPress={handleAddContribution}
                loading={addContributionMutation.isPending}
                disabled={!amount || parseFloat(amount) <= 0}
                style={{ flex: 1, marginLeft: spacing.sm }}
              >
                Add
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
    goalCard: {
      marginBottom: spacing.lg,
    },
    goalHeader: {
      flexDirection: 'row',
      marginBottom: spacing.lg,
      gap: spacing.md,
    },
    goalIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    goalHeaderInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    goalTitle: {
      ...textStyles.h3,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    goalDescription: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    progressSection: {
      marginBottom: spacing.md,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: spacing.xs,
    },
    currentAmount: {
      ...textStyles.h2,
      color: colors.text.primary,
      fontWeight: '700',
    },
    progressPercentage: {
      ...textStyles.h4,
      color: colors.text.primary,
      fontWeight: '700',
    },
    targetAmount: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    progressBarContainer: {
      height: 12,
      backgroundColor: colors.border,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
      marginBottom: spacing.lg,
    },
    progressBar: {
      height: '100%',
      borderRadius: borderRadius.full,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      minHeight: 100,
      justifyContent: 'space-between',
    },
    statLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginTop: spacing.xs,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    statValue: {
      ...textStyles.caption,
      color: colors.text.primary,
      fontWeight: '700',
      textAlign: 'center',
      fontSize: 11,
    },
    priorityBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    priorityText: {
      ...textStyles.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
      fontSize: 10,
    },
    infoCards: {
      marginBottom: spacing.md,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      //   backgroundColor: `${colors.warning}10`,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      //   borderColor: `${colors.warning}30`,
    },
    infoCardText: {
      ...textStyles.caption,
      color: colors.text.primary,
      fontWeight: '600',
    },
    completedBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: `${colors.success}15`,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginTop: spacing.md,
    },
    completedText: {
      ...textStyles.body,
      color: colors.success,
      fontWeight: '600',
      flex: 1,
    },
    contributionsSection: {
      marginBottom: spacing.lg,
    },
    contributionsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    contributionsTitle: {
      ...textStyles.h4,
      color: colors.text.primary,
    },
    contributionsCount: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    contributionCard: {
      marginBottom: spacing.md,
    },
    contributionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    contributionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contributionInfo: {
      flex: 1,
    },
    contributionAmount: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '700',
      marginBottom: 4,
    },
    contributionDate: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    contributionNote: {
      ...textStyles.body,
      color: colors.text.secondary,
      marginTop: spacing.sm,
      fontStyle: 'italic',
    },
    emptyContributions: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    emptyText: {
      ...textStyles.body,
      color: colors.text.tertiary,
      marginTop: spacing.md,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    buttonText: {
      ...textStyles.bodyMedium,
      color: colors.text.inverse,
      marginLeft: spacing.sm,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      paddingBottom: spacing.xl + 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      ...textStyles.h3,
      color: colors.text.primary,
    },
    modalBody: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
    },
    inputLabel: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    amountInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
      marginBottom: spacing.xl,
    },
    currencySymbol: {
      ...textStyles.h3,
      color: colors.text.secondary,
      marginRight: spacing.sm,
    },
    amountTextInput: {
      ...textStyles.h3,
      color: colors.text.primary,
      flex: 1,
      paddingVertical: spacing.md,
    },
    noteInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      backgroundColor: colors.surface,
      ...textStyles.body,
      color: colors.text.primary,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    modalActions: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
    },
  });

export default SavingsGoalDetailsScreen;
