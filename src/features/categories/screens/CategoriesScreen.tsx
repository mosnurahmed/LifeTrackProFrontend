/**
 * Categories Management Screen - Filter by Default Status
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
  useCreateDefaultCategories,
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

  // ✅ Filter by default status
  const [filterType, setFilterType] = useState<'all' | 'default' | 'custom'>(
    'all',
  );

  const {
    data: categoriesData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useCategories();
  const categories = categoriesData?.data || [];

  const deleteMutation = useDeleteCategory();
  const createDefaultsMutation = useCreateDefaultCategories();

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  // ✅ Filter categories by default status
  const filteredCategories =
    categories?.filter((cat: any) => {
      if (filterType === 'all') return true;
      if (filterType === 'default') return cat.isDefault === true;
      if (filterType === 'custom') return cat.isDefault === false;
      return true;
    }) || [];

  const defaultCount = categories?.filter((c: any) => c.isDefault).length || 0;
  const customCount = categories?.filter((c: any) => !c.isDefault).length || 0;

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${name}"? All expenses in this category will be moved to "Uncategorized".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id),
        },
      ],
    );
  };

  // const handleCreateDefaults = () => {
  //   Alert.alert(
  //     'Create Default Categories',
  //     'This will create default expense categories like Food, Transport, Shopping, etc.',
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: 'Create',
  //         onPress: () => createDefaultsMutation.mutate(),
  //       },
  //     ],
  //   );
  // };

  const handleAddCategory = () => {
    (navigation as any).navigate('AddCategory', { mode: 'create' });
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

  if (!categories || categories.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Categories</Text>
        </View>
        <EmptyState
          icon="apps-outline"
          title="No Categories Yet"
          message="Create your first category or add default ones"
          actionLabel="Create Defaults"
          onAction={handleCreateDefaults}
        />
        <View style={styles.bottomActions}>
          <Button onPress={handleAddCategory} fullWidth>
            Add Custom Category
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
        {/* <TouchableOpacity onPress={handleCreateDefaults}>
          <Icon name="add-circle-outline" size={24} color={colors.primary} />
        </TouchableOpacity> */}
      </View>

      {/* Filter Tabs - All / Default / Custom */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterType === 'all' && styles.filterTabActive,
          ]}
          onPress={() => setFilterType('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterType === 'all' && styles.filterTabTextActive,
            ]}
          >
            All ({categories.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filterType === 'default' && styles.filterTabActive,
          ]}
          onPress={() => setFilterType('default')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterType === 'default' && styles.filterTabTextActive,
            ]}
          >
            Default ({defaultCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filterType === 'custom' && styles.filterTabActive,
          ]}
          onPress={() => setFilterType('custom')}
        >
          <Text
            style={[
              styles.filterTabText,
              filterType === 'custom' && styles.filterTabTextActive,
            ]}
          >
            Custom ({customCount})
          </Text>
        </TouchableOpacity>
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
                  <Text style={styles.categoryName}>{item.name}</Text>
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
                  {/* Monthly Budget */}
                  {item.monthlyBudget && item.monthlyBudget > 0 && (
                    <Text style={styles.budgetText}>
                      Budget: {formatCurrency(item.monthlyBudget)}/month
                    </Text>
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
            message={`No ${filterType} categories available`}
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
    filterTabs: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
    categoryName: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.xs,
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
    budgetText: {
      ...textStyles.caption,
      color: colors.text.secondary,
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
    bottomActions: {
      padding: spacing.lg,
    },
  });

export default CategoriesScreen;
