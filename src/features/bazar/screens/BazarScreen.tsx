/**
 * Bazar Screen - Complete with Real API
 */

import React from 'react';
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
import { useBazarLists, useDeleteList } from '../../../hooks/api/useBazar';
import { Card, EmptyState, ErrorState } from '../../../components/common';
import { SkeletonList } from '../../../components/common/Loading';
import { formatCurrency } from '../../../utils/formatters';

const BazarScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const {
    data: listsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useBazarLists();
  const deleteMutation = useDeleteList();

  const lists = listsData?.data?.data || [];

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  const handleAddList = () => {
    (navigation as any).navigate('AddBazarList', { mode: 'create' });
  };

  const handleEditList = (id: string) => {
    (navigation as any).navigate('AddBazarList', { mode: 'edit', listId: id });
  };

  const handleViewList = (id: string) => {
    (navigation as any).navigate('BazarListDetails', { listId: id });
  };

  const handleDeleteList = (id: string, title: string) => {
    Alert.alert('Delete List', `Are you sure you want to delete "${title}"?`, [
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
          <Text style={styles.headerTitle}>Shopping Lists</Text>
        </View>
        <SkeletonList count={5} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Lists</Text>
        </View>
        <ErrorState
          title="Failed to load lists"
          message="Please try again"
          onRetry={refetch}
        />
      </View>
    );
  }

  if (!lists || lists.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Lists</Text>
        </View>
        <EmptyState
          icon="cart-outline"
          title="No Shopping Lists"
          message="Create your first shopping list"
          actionLabel="Create List"
          onAction={handleAddList}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Lists</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('BazarStats')}
            style={styles.statsButton}
          >
            <Icon name="stats-chart-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lists */}
      <FlatList
        data={lists}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <Card style={styles.listCard}>
            <TouchableOpacity
              style={styles.listContent}
              onPress={() => handleViewList(item._id)}
              activeOpacity={0.7}
            >
              {/* Header */}
              <View style={styles.listHeader}>
                <View style={styles.listTitleRow}>
                  <Icon
                    name="cart"
                    size={24}
                    color={item.isCompleted ? colors.success : colors.primary}
                  />
                  <View style={styles.listTitleContainer}>
                    <Text style={styles.listTitle}>{item.title}</Text>
                    {item.description && (
                      <Text style={styles.listDescription} numberOfLines={1}>
                        {item.description}
                      </Text>
                    )}
                  </View>
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

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>
                    {item.completedItems} of {item.totalItems} items
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round(item.completionPercentage)}%
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${item.completionPercentage}%`,
                        backgroundColor: item.isCompleted
                          ? colors.success
                          : colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Budget Info */}
              {item.totalBudget && (
                <View style={styles.budgetSection}>
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Budget:</Text>
                    <Text style={styles.budgetValue}>
                      {formatCurrency(item.totalBudget)}
                    </Text>
                  </View>
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Spent:</Text>
                    <Text
                      style={[
                        styles.budgetValue,
                        item.totalActualCost > item.totalBudget && {
                          color: colors.danger,
                        },
                      ]}
                    >
                      {formatCurrency(item.totalActualCost)}
                    </Text>
                  </View>
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetLabel}>Remaining:</Text>
                    <Text
                      style={[
                        styles.budgetValue,
                        {
                          color:
                            item.budgetRemaining >= 0
                              ? colors.success
                              : colors.danger,
                        },
                      ]}
                    >
                      {formatCurrency(item.budgetRemaining)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Estimated Cost */}
              {!item.totalBudget && (
                <View style={styles.estimateSection}>
                  <Text style={styles.estimateLabel}>Estimated Total:</Text>
                  <Text style={styles.estimateValue}>
                    {formatCurrency(item.totalEstimatedCost)}
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.listActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleViewList(item._id)}
                >
                  <Icon name="eye-outline" size={20} color={colors.primary} />
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditList(item._id)}
                >
                  <Icon
                    name="create-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteList(item._id, item.title)}
                >
                  <Icon name="trash-outline" size={20} color={colors.danger} />
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
        onPress={handleAddList}
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
    headerActions: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    statsButton: {
      padding: spacing.xs,
    },
    listContent: {
      padding: spacing.lg,
      paddingBottom: 100,
    },
    listCard: {
      marginBottom: spacing.md,
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    listTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: spacing.sm,
    },
    listTitleContainer: {
      flex: 1,
    },
    listTitle: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    listDescription: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    completedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.success}15`,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
      gap: 4,
    },
    completedText: {
      ...textStyles.caption,
      color: colors.success,
      fontSize: 10,
      fontWeight: '600',
    },
    progressSection: {
      marginBottom: spacing.md,
    },
    progressInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    progressText: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    progressPercentage: {
      ...textStyles.caption,
      color: colors.text.primary,
      fontWeight: '600',
    },
    progressBarContainer: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: borderRadius.full,
    },
    budgetSection: {
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
      gap: spacing.xs,
    },
    budgetRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    budgetLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    budgetValue: {
      ...textStyles.caption,
      color: colors.text.primary,
      fontWeight: '600',
    },
    estimateSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
    },
    estimateLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    estimateValue: {
      ...textStyles.caption,
      color: colors.text.primary,
      fontWeight: '600',
    },
    listActions: {
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

export default BazarScreen;
