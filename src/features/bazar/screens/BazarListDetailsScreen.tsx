/**
 * Bazar List Details Screen - View and Manage Items
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
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import {
  useBazarList,
  useToggleItem,
  useDeleteItem,
} from '../../../hooks/api/useBazar';
import {
  Card,
  EmptyState,
  ErrorState,
  Spinner,
} from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

const BazarListDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const { listId } = (route.params as any) || {};

  const {
    data: listData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useBazarList(listId);
  const toggleMutation = useToggleItem();
  const deleteMutation = useDeleteItem();

  const list = listData?.data;

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  const handleToggleItem = (itemId: string) => {
    toggleMutation.mutate({ listId, itemId });
  };

  const handleAddItem = () => {
    (navigation as any).navigate('AddBazarItem', { listId, mode: 'create' });
  };

  const handleEditItem = (itemId: string) => {
    (navigation as any).navigate('AddBazarItem', {
      listId,
      itemId,
      mode: 'edit',
    });
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    Alert.alert('Delete Item', `Delete "${itemName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate({ listId, itemId }),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Spinner text="Loading..." />
      </View>
    );
  }

  if (error || !list) {
    return (
      <View style={styles.container}>
        <ErrorState
          title="List not found"
          message="Unable to load list details"
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{list.title}</Text>
          {list.description && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {list.description}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() =>
            (navigation as any).navigate('AddBazarList', {
              mode: 'edit',
              listId,
            })
          }
        >
          <Icon name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{list.totalItems}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{list.completedItems}</Text>
            <Text style={styles.statLabel}>Purchased</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(list.completionPercentage)}%
            </Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${list.completionPercentage}%`,
                backgroundColor: list.isCompleted
                  ? colors.success
                  : colors.primary,
              },
            ]}
          />
        </View>

        {/* Budget Info */}
        {list.totalBudget && (
          <View style={styles.budgetInfo}>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Budget:</Text>
              <Text style={styles.budgetValue}>
                {formatCurrency(list.totalBudget)}
              </Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Spent:</Text>
              <Text
                style={[
                  styles.budgetValue,
                  list.totalActualCost > list.totalBudget && {
                    color: colors.danger,
                  },
                ]}
              >
                {formatCurrency(list.totalActualCost)}
              </Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Remaining:</Text>
              <Text
                style={[
                  styles.budgetValue,
                  {
                    color:
                      list.budgetRemaining >= 0
                        ? colors.success
                        : colors.danger,
                  },
                ]}
              >
                {formatCurrency(list.budgetRemaining)}
              </Text>
            </View>
          </View>
        )}

        {/* Estimated Total (if no budget) */}
        {!list.totalBudget && (
          <View style={styles.estimateRow}>
            <Text style={styles.estimateLabel}>Estimated Total:</Text>
            <Text style={styles.estimateValue}>
              {formatCurrency(list.totalEstimatedCost)}
            </Text>
          </View>
        )}
      </Card>

      {/* Items List */}
      {list.items && list.items.length > 0 ? (
        <FlatList
          data={list.items}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <Card style={styles.itemCard}>
              <View style={styles.itemContent}>
                {/* Checkbox */}
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => handleToggleItem(item._id)}
                >
                  {item.isPurchased ? (
                    <View style={styles.checkboxChecked}>
                      <Icon
                        name="checkmark"
                        size={16}
                        color={colors.text.inverse}
                      />
                    </View>
                  ) : (
                    <View style={styles.checkboxUnchecked} />
                  )}
                </TouchableOpacity>

                {/* Item Info */}
                <View style={styles.itemInfo}>
                  <Text
                    style={[
                      styles.itemName,
                      item.isPurchased && styles.itemNamePurchased,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemQuantity}>
                      {item.quantity} {item.unit}
                    </Text>
                    {item.category && (
                      <>
                        <Text style={styles.itemSeparator}>•</Text>
                        <Text style={styles.itemCategory}>{item.category}</Text>
                      </>
                    )}
                  </View>
                  {item.notes && (
                    <Text style={styles.itemNotes} numberOfLines={1}>
                      {item.notes}
                    </Text>
                  )}
                </View>

                {/* Price */}
                <View style={styles.itemPriceContainer}>
                  {item.actualPrice ? (
                    <Text style={styles.itemActualPrice}>
                      {formatCurrency(item.actualPrice)}
                    </Text>
                  ) : item.estimatedPrice ? (
                    <Text style={styles.itemEstimatedPrice}>
                      ~{formatCurrency(item.estimatedPrice)}
                    </Text>
                  ) : null}
                </View>

                {/* Actions */}
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={styles.itemActionButton}
                    onPress={() => handleEditItem(item._id)}
                  >
                    <Icon
                      name="create-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.itemActionButton}
                    onPress={() => handleDeleteItem(item._id, item.name)}
                  >
                    <Icon
                      name="trash-outline"
                      size={18}
                      color={colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              </View>
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
      ) : (
        <EmptyState
          icon="cart-outline"
          title="No Items Yet"
          message="Add items to your shopping list"
          actionLabel="Add Item"
          onAction={handleAddItem}
        />
      )}

      {/* Add Item FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddItem}
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
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: spacing.md,
    },
    headerTitleContainer: {
      flex: 1,
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
    statsCard: {
      margin: spacing.lg,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: spacing.md,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      ...textStyles.h3,
      color: colors.text.primary,
      fontWeight: '700',
    },
    statLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
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
    budgetInfo: {
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: borderRadius.md,
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
    estimateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      padding: spacing.md,
      borderRadius: borderRadius.md,
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
    listContent: {
      padding: spacing.lg,
      paddingBottom: 100,
    },
    itemCard: {
      marginBottom: spacing.md,
    },
    itemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    checkbox: {
      padding: spacing.xs,
    },
    checkboxChecked: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxUnchecked: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    itemNamePurchased: {
      textDecorationLine: 'line-through',
      color: colors.text.secondary,
    },
    itemMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    itemQuantity: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    itemSeparator: {
      ...textStyles.caption,
      color: colors.text.tertiary,
    },
    itemCategory: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    itemNotes: {
      ...textStyles.caption,
      color: colors.text.tertiary,
      fontStyle: 'italic',
    },
    itemPriceContainer: {
      minWidth: 60,
      alignItems: 'flex-end',
    },
    itemActualPrice: {
      ...textStyles.caption,
      color: colors.text.primary,
      fontWeight: '600',
    },
    itemEstimatedPrice: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    itemActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    itemActionButton: {
      padding: spacing.xs,
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

export default BazarListDetailsScreen;
