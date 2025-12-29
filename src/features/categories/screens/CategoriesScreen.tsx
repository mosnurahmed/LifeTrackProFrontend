/**
 * Categories Management Screen - Updated with Type Filter
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
  useCategories,
  useDeleteCategory,
  useCheckCategoryDeletion,
} from '../../../hooks/api/useCategories';
import {
  Card,
  Button,
  EmptyState,
  ErrorState,
} from '../../../components/common';
import { SkeletonList } from '../../../components/common/Loading';
import { formatCurrency } from '../../../utils/formatters';

const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  // ✅ Filter by type (expense/income/both)
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>(
    'all',
  );
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'default' | 'custom'
  >('all');

  const queryType = typeFilter === 'all' ? undefined : typeFilter;

  const {
    data: categoriesData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useCategories(queryType as any);

  const categories = categoriesData?.data || [];
  const deleteMutation = useDeleteCategory();

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  // Apply status filter
  const filteredCategories = categories.filter((cat: any) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'default') return cat.isDefault === true;
    if (statusFilter === 'custom') return cat.isDefault === false;
    return true;
  });

  const expenseCount = categories.filter(
    (c: any) => c.type === 'expense' || c.type === 'both',
  ).length;
  const incomeCount = categories.filter(
    (c: any) => c.type === 'income' || c.type === 'both',
  ).length;
  const defaultCount = filteredCategories.filter(
    (c: any) => c.isDefault,
  ).length;
  const customCount = filteredCategories.filter(
    (c: any) => !c.isDefault,
  ).length;

  const handleDelete = async (id: string, name: string) => {
    Alert.alert(
      'Delete Category',
      `Delete "${name}"? This will also delete all related expenses/incomes.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate({ id, confirmed: true }),
        },
      ],
    );
  };

  const handleAddCategory = () => {
    (navigation as any).navigate('AddCategory', {
      mode: 'create',
      defaultType: typeFilter === 'all' ? 'expense' : typeFilter, // ✅ Pass default type
    });
  };

  const handleEditCategory = (id: string) => {
    (navigation as any).navigate('AddCategory', {
      mode: 'edit',
      categoryId: id,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Categories</Text>
        </View>
        <SkeletonList count={8} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Categories</Text>
        </View>
        <ErrorState
          title="Failed to load categories"
          message="Please try again"
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      {/* Type Filter Tabs - Expense / Income / All */}
      <View style={styles.typeFilters}>
        <TouchableOpacity
          style={[styles.typeTab, typeFilter === 'all' && styles.typeTabActive]}
          onPress={() => setTypeFilter('all')}
        >
          <Icon
            name="apps"
            size={16}
            color={
              typeFilter === 'all' ? colors.text.inverse : colors.text.secondary
            }
          />
          <Text
            style={[
              styles.typeTabText,
              typeFilter === 'all' && styles.typeTabTextActive,
            ]}
          >
            All ({categories.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeTab,
            typeFilter === 'expense' && styles.typeTabActive,
          ]}
          onPress={() => setTypeFilter('expense')}
        >
          <Icon
            name="trending-down"
            size={16}
            color={
              typeFilter === 'expense'
                ? colors.text.inverse
                : colors.text.secondary
            }
          />
          <Text
            style={[
              styles.typeTabText,
              typeFilter === 'expense' && styles.typeTabTextActive,
            ]}
          >
            Expense ({expenseCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeTab,
            typeFilter === 'income' && styles.typeTabActive,
          ]}
          onPress={() => setTypeFilter('income')}
        >
          <Icon
            name="trending-up"
            size={16}
            color={
              typeFilter === 'income'
                ? colors.text.inverse
                : colors.text.secondary
            }
          />
          <Text
            style={[
              styles.typeTabText,
              typeFilter === 'income' && styles.typeTabTextActive,
            ]}
          >
            Income ({incomeCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs - All / Default / Custom */}
      <View style={styles.statusFilters}>
        {['all', 'default', 'custom'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusChip,
              statusFilter === status && styles.statusChipActive,
            ]}
            onPress={() => setStatusFilter(status as any)}
          >
            <Text
              style={[
                styles.statusChipText,
                statusFilter === status && styles.statusChipTextActive,
              ]}
            >
              {status === 'all'
                ? `All (${filteredCategories.length})`
                : status === 'default'
                ? `Default (${defaultCount})`
                : `Custom (${customCount})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories List */}
      <FlatList
        data={filteredCategories}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <Card style={styles.categoryCard}>
            <TouchableOpacity
              style={styles.categoryContent}
              onPress={() => handleEditCategory(item._id)}
              activeOpacity={0.7}
            >
              {/* Icon & Info */}
              <View style={styles.categoryLeft}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: `${item.color}15` },
                  ]}
                >
                  <Icon name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryNameRow}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    {/* Type Badge */}
                    <View
                      style={[
                        styles.typeBadge,
                        {
                          backgroundColor:
                            item.type === 'income'
                              ? `${colors.success}15`
                              : item.type === 'both'
                              ? `${colors.info}15`
                              : `${colors.danger}15`,
                        },
                      ]}
                    >
                      <Icon
                        name={
                          item.type === 'income'
                            ? 'trending-up'
                            : item.type === 'both'
                            ? 'swap-horizontal'
                            : 'trending-down'
                        }
                        size={10}
                        color={
                          item.type === 'income'
                            ? colors.success
                            : item.type === 'both'
                            ? colors.info
                            : colors.danger
                        }
                      />
                      <Text
                        style={[
                          styles.typeBadgeText,
                          {
                            color:
                              item.type === 'income'
                                ? colors.success
                                : item.type === 'both'
                                ? colors.info
                                : colors.danger,
                          },
                        ]}
                      >
                        {item.type}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.categoryMeta}>
                    {/* Default Badge */}
                    {item.isDefault && (
                      <View
                        style={[
                          styles.defaultBadge,
                          { backgroundColor: `${colors.primary}15` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.defaultBadgeText,
                            { color: colors.primary },
                          ]}
                        >
                          Default
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Budgets */}
                  {(item.monthlyBudget || item.monthlyIncome) && (
                    <View style={styles.budgets}>
                      {item.monthlyBudget && item.monthlyBudget > 0 && (
                        <Text style={styles.budgetText}>
                          Budget: {formatCurrency(item.monthlyBudget)}/mo
                        </Text>
                      )}
                      {item.monthlyIncome && item.monthlyIncome > 0 && (
                        <Text
                          style={[styles.budgetText, { color: colors.success }]}
                        >
                          Target: {formatCurrency(item.monthlyIncome)}/mo
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.categoryActions}>
                <TouchableOpacity
                  onPress={() => handleEditCategory(item._id)}
                  style={styles.actionButton}
                >
                  <Icon
                    name="create-outline"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                {!item.isDefault && (
                  <TouchableOpacity
                    onPress={() => handleDelete(item._id, item.name)}
                    style={styles.actionButton}
                  >
                    <Icon
                      name="trash-outline"
                      size={20}
                      color={colors.danger}
                    />
                  </TouchableOpacity>
                )}
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
        ListEmptyComponent={
          <EmptyState
            icon="apps-outline"
            title="No Categories Found"
            message="Create your first category"
            actionLabel="Add Category"
            onAction={handleAddCategory}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddCategory}
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
    typeFilters: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      gap: spacing.sm,
    },
    typeTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
    },
    typeTabActive: {
      backgroundColor: colors.primary,
    },
    typeTabText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    typeTabTextActive: {
      color: colors.text.inverse,
    },
    statusFilters: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statusChip: {
      flex: 1,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: colors.background,
      alignItems: 'center',
    },
    statusChipActive: {
      backgroundColor: colors.primary,
    },
    statusChipText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontSize: 11,
      fontWeight: '600',
    },
    statusChipTextActive: {
      color: colors.text.inverse,
    },
    listContent: {
      padding: spacing.lg,
      paddingBottom: 100,
    },
    categoryCard: {
      marginBottom: spacing.md,
    },
    categoryContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    categoryLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    categoryIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    categoryInfo: {
      flex: 1,
    },
    categoryNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    categoryName: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
    },
    typeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
    },
    typeBadgeText: {
      ...textStyles.caption,
      fontSize: 9,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    categoryMeta: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    defaultBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
    },
    defaultBadgeText: {
      ...textStyles.caption,
      fontSize: 10,
      fontWeight: '600',
    },
    budgets: {
      gap: 4,
    },
    budgetText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontSize: 11,
    },
    categoryActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
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

export default CategoriesScreen;
