/**
 * Budget Screen - Complete with Interactive Features
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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import {
  useBudgetSummary,
  useBudgetAlerts,
  useUpdateCategoryBudget,
} from '../../../hooks/api/useBudget';
import {
  Card,
  Button,
  EmptyState,
  ErrorState,
  Spinner,
} from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

const BudgetScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [budgetInput, setBudgetInput] = useState('');

  const {
    data: summaryData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useBudgetSummary();
  const { data: alertsData } = useBudgetAlerts();
  const updateBudgetMutation = useUpdateCategoryBudget();

  const summary = summaryData?.data;
  const alerts = alertsData?.data || [];

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  const handleEditBudget = (category: any) => {
    setEditingCategory(category);
    setBudgetInput(category.budget?.toString() || '');
  };

  const handleSaveBudget = async () => {
    if (!editingCategory) return;

    const budgetValue = parseFloat(budgetInput);
    if (isNaN(budgetValue) || budgetValue < 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid positive number');
      return;
    }

    await updateBudgetMutation.mutateAsync({
      categoryId: editingCategory.categoryId,
      data: { budget: budgetValue },
    });

    setEditingCategory(null);
    setBudgetInput('');
  };

  const handleRemoveBudget = async (categoryId: string) => {
    Alert.alert(
      'Remove Budget',
      'Are you sure you want to remove this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await updateBudgetMutation.mutateAsync({
              categoryId,
              data: { budget: null },
            });
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Spinner text="Loading budget..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorState
          title="Failed to load budget"
          message="Please try again"
          onRetry={refetch}
        />
      </View>
    );
  }

  if (!summary || summary.categoriesWithBudget === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Budget</Text>
        </View>
        <EmptyState
          icon="wallet-outline"
          title="No Budgets Set"
          message="Set budgets for your categories to track spending"
          actionLabel="Go to Categories"
          onAction={() => (navigation as any).navigate('Categories')}
        />
      </View>
    );
  }

  const overallStatus =
    summary.overallPercentage >= 100
      ? 'exceeded'
      : summary.overallPercentage >= 80
      ? 'warning'
      : 'safe';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Budget</Text>
          <Text style={styles.headerSubtitle}>
            {summary.categoriesWithBudget} categories tracked
          </Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => (navigation as any).navigate('Categories')}
        >
          <Icon name="settings-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
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
        {/* Alerts */}
        {alerts.length > 0 && (
          <Card style={styles.alertsCard}>
            <View style={styles.alertsHeader}>
              <Icon name="warning" size={20} color={colors.warning} />
              <Text style={styles.alertsTitle}>Budget Alerts</Text>
            </View>
            {alerts.map((alert: any) => (
              <View key={alert.categoryId} style={styles.alertItem}>
                <View
                  style={[
                    styles.alertDot,
                    {
                      backgroundColor:
                        alert.status === 'exceeded'
                          ? colors.danger
                          : colors.warning,
                    },
                  ]}
                />
                <Text style={styles.alertText}>
                  <Text style={styles.alertCategory}>{alert.categoryName}</Text>{' '}
                  is at {alert.percentage.toFixed(0)}% of budget
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Overall Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Overall Budget</Text>

          <View style={styles.summaryMain}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Budget</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                {formatCurrency(summary.totalBudget)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Spent</Text>
              <Text style={[styles.summaryValue, { color: colors.danger }]}>
                {formatCurrency(summary.totalSpent)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Remaining</Text>
              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      summary.totalRemaining >= 0
                        ? colors.success
                        : colors.danger,
                  },
                ]}
              >
                {formatCurrency(summary.totalRemaining)}
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
              {summary.overallPercentage.toFixed(1)}% used
            </Text>
          </View>

          {/* Status Badge */}
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
              size={16}
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
                ? 'Budget Exceeded'
                : overallStatus === 'warning'
                ? 'Near Limit'
                : 'On Track'}
            </Text>
          </View>
        </Card>

        {/* Category Budgets */}
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>Category Budgets</Text>
          <Text style={styles.categoriesSubtitle}>
            {summary.categoriesOverBudget > 0 &&
              `${summary.categoriesOverBudget} over budget`}
          </Text>
        </View>

        {summary.categories.map((category: any) => (
          <Card key={category.categoryId} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryLeft}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: `${category.categoryColor}15` },
                  ]}
                >
                  <Icon
                    name={category.categoryIcon}
                    size={24}
                    color={category.categoryColor}
                  />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>
                    {category.categoryName}
                  </Text>
                  <Text style={styles.categoryAmount}>
                    {formatCurrency(category.spent)} /{' '}
                    {formatCurrency(category.budget)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditBudget(category)}
              >
                <Icon name="create-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.categoryProgress}>
              <View style={styles.categoryProgressBar}>
                <View
                  style={[
                    styles.categoryProgressFill,
                    {
                      width: `${Math.min(category.percentage, 100)}%`,
                      backgroundColor: category.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.categoryProgressText}>
                {category.percentage.toFixed(0)}%
              </Text>
            </View>

            {/* Status & Remaining */}
            <View style={styles.categoryFooter}>
              <View
                style={[
                  styles.categoryStatusBadge,
                  { backgroundColor: `${category.color}15` },
                ]}
              >
                <Text
                  style={[styles.categoryStatusText, { color: category.color }]}
                >
                  {category.status === 'exceeded'
                    ? 'Over Budget'
                    : category.status === 'warning'
                    ? 'Near Limit'
                    : 'On Track'}
                </Text>
              </View>
              <Text
                style={[
                  styles.categoryRemaining,
                  {
                    color:
                      category.remaining >= 0 ? colors.success : colors.danger,
                  },
                ]}
              >
                {category.remaining >= 0 ? 'Remaining: ' : 'Over by: '}
                {formatCurrency(Math.abs(category.remaining))}
              </Text>
            </View>
          </Card>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Edit Budget Modal */}
      <Modal
        visible={!!editingCategory}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingCategory(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Budget</Text>
              <TouchableOpacity onPress={() => setEditingCategory(null)}>
                <Icon name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {editingCategory && (
              <>
                <View style={styles.modalCategory}>
                  <View
                    style={[
                      styles.modalCategoryIcon,
                      { backgroundColor: `${editingCategory.categoryColor}15` },
                    ]}
                  >
                    <Icon
                      name={editingCategory.categoryIcon}
                      size={32}
                      color={editingCategory.categoryColor}
                    />
                  </View>
                  <Text style={styles.modalCategoryName}>
                    {editingCategory.categoryName}
                  </Text>
                </View>

                <View style={styles.modalInput}>
                  <Text style={styles.modalInputLabel}>Monthly Budget</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>৳</Text>
                    <TextInput
                      style={styles.textInput}
                      value={budgetInput}
                      onChangeText={setBudgetInput}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={colors.text.tertiary}
                      autoFocus
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    variant="outline"
                    onPress={() =>
                      handleRemoveBudget(editingCategory.categoryId)
                    }
                    style={{ flex: 1, marginRight: spacing.sm }}
                  >
                    Remove
                  </Button>
                  <Button
                    onPress={handleSaveBudget}
                    loading={updateBudgetMutation.isPending}
                    style={{ flex: 1, marginLeft: spacing.sm }}
                  >
                    Save
                  </Button>
                </View>
              </>
            )}
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
    headerSubtitle: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    settingsButton: {
      padding: spacing.sm,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    alertsCard: {
      marginBottom: spacing.lg,
      backgroundColor: `${colors.warning}10`,
      borderWidth: 1,
      borderColor: `${colors.warning}30`,
    },
    alertsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    alertsTitle: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '600',
    },
    alertItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    alertDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    alertText: {
      ...textStyles.body,
      color: colors.text.secondary,
      flex: 1,
    },
    alertCategory: {
      fontWeight: '600',
      color: colors.text.primary,
    },
    summaryCard: {
      marginBottom: spacing.lg,
    },
    summaryTitle: {
      ...textStyles.h4,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    summaryMain: {
      marginBottom: spacing.lg,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    summaryLabel: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    summaryValue: {
      ...textStyles.bodyMedium,
      fontWeight: '700',
    },
    progressContainer: {
      marginBottom: spacing.md,
    },
    progressBar: {
      height: 12,
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
      ...textStyles.body,
      fontWeight: '600',
    },
    categoriesHeader: {
      marginBottom: spacing.md,
    },
    categoriesTitle: {
      ...textStyles.h4,
      color: colors.text.primary,
    },
    categoriesSubtitle: {
      ...textStyles.caption,
      color: colors.danger,
      marginTop: spacing.xs,
    },
    categoryCard: {
      marginBottom: spacing.md,
    },
    categoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    categoryLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    categoryIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    categoryAmount: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    editButton: {
      padding: spacing.sm,
    },
    categoryProgress: {
      marginBottom: spacing.md,
    },
    categoryProgressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
      marginBottom: spacing.xs,
    },
    categoryProgressFill: {
      height: '100%',
      borderRadius: borderRadius.full,
    },
    categoryProgressText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      textAlign: 'right',
    },
    categoryFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    categoryStatusBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    categoryStatusText: {
      ...textStyles.caption,
      fontWeight: '600',
    },
    categoryRemaining: {
      ...textStyles.caption,
      fontWeight: '600',
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
      padding: spacing.lg,
      paddingBottom: spacing.xl + 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    modalTitle: {
      ...textStyles.h3,
      color: colors.text.primary,
    },
    modalCategory: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    modalCategoryIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    modalCategoryName: {
      ...textStyles.h4,
      color: colors.text.primary,
    },
    modalInput: {
      marginBottom: spacing.xl,
    },
    modalInputLabel: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
    },
    currencySymbol: {
      ...textStyles.h3,
      color: colors.text.secondary,
      marginRight: spacing.sm,
    },
    textInput: {
      ...textStyles.h3,
      color: colors.text.primary,
      flex: 1,
      paddingVertical: spacing.md,
    },
    modalActions: {
      flexDirection: 'row',
    },
  });

export default BudgetScreen;
