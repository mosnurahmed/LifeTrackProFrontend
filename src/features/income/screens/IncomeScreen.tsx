/**
 * Income Screen - With Bulk Delete Support
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
  useIncomes,
  useDeleteIncome,
  useIncomeStats,
  useBulkDeleteIncomes, // ✅ NEW
} from '../../../hooks/api/useIncome';
import {
  Card,
  Button,
  EmptyState,
  ErrorState,
} from '../../../components/common';
import { SkeletonList } from '../../../components/common/Loading';
import IncomeItem from '../components/IncomeItem';
import { formatCurrency } from '../../../utils/formatters';

const IncomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  // ✅ NEW: Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const {
    data: incomesData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useIncomes();
  const { data: statsData } = useIncomeStats();
  const deleteMutation = useDeleteIncome();
  const bulkDeleteMutation = useBulkDeleteIncomes(); // ✅ NEW

  const incomes = incomesData?.data?.data || [];
  const stats = statsData?.data;

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  // ✅ Selection handlers
  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    setSelectedIds(incomes.map((i: any) => i._id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    Alert.alert(
      'Delete Incomes',
      `Delete ${selectedIds.length} selected income(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await bulkDeleteMutation.mutateAsync(selectedIds);
            setSelectionMode(false);
            setSelectedIds([]);
          },
        },
      ],
    );
  };

  const cancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const handleAddIncome = () => {
    (navigation as any).navigate('AddIncome', { mode: 'create' });
  };

  const handleEditIncome = (id: string) => {
    if (selectionMode) {
      toggleSelection(id);
    } else {
      (navigation as any).navigate('AddIncome', { mode: 'edit', incomeId: id });
    }
  };

  const handleDeleteIncome = (id: string, source: string) => {
    Alert.alert('Delete Income', `Delete "${source}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  const handleViewStats = () => {
    (navigation as any).navigate('IncomeStats');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Income</Text>
        </View>
        <SkeletonList count={5} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Income</Text>
        </View>
        <ErrorState
          title="Failed to load income"
          message="Please try again"
          onRetry={refetch}
        />
      </View>
    );
  }

  if (!incomes || incomes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Income</Text>
        </View>
        <EmptyState
          icon="wallet-outline"
          title="No Income Yet"
          message="Start tracking your income sources"
          actionLabel="Add Income"
          onAction={handleAddIncome}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {selectionMode ? (
          // Selection Mode Header
          <>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={cancelSelection}>
                <Icon name="close" size={28} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {selectedIds.length} selected
              </Text>
            </View>
            <View style={styles.headerRight}>
              {selectedIds.length < incomes.length ? (
                <TouchableOpacity
                  onPress={selectAll}
                  style={styles.headerButton}
                >
                  <Text
                    style={[styles.headerButtonText, { color: colors.primary }]}
                  >
                    Select All
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={deselectAll}
                  style={styles.headerButton}
                >
                  <Text
                    style={[styles.headerButtonText, { color: colors.primary }]}
                  >
                    Deselect All
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleBulkDelete}
                disabled={selectedIds.length === 0}
                style={styles.headerButton}
              >
                <Icon
                  name="trash-outline"
                  size={24}
                  color={
                    selectedIds.length > 0
                      ? colors.danger
                      : colors.text.tertiary
                  }
                />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Normal Header
          <>
            <View>
              <Text style={styles.headerTitle}>Income</Text>
              <Text style={styles.headerSubtitle}>
                {incomes.length} entries
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setSelectionMode(true)}
              >
                <Icon
                  name="checkmark-circle-outline"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleViewStats}
              >
                <Icon name="stats-chart" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Overview Card - Hide in selection mode */}
      {!selectionMode && stats && (
        <Card style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>This Month</Text>
            {stats.comparison.percentageChange !== 0 && (
              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor:
                      stats.comparison.percentageChange > 0
                        ? `${colors.success}15`
                        : `${colors.danger}15`,
                  },
                ]}
              >
                <Icon
                  name={
                    stats.comparison.percentageChange > 0
                      ? 'trending-up'
                      : 'trending-down'
                  }
                  size={12}
                  color={
                    stats.comparison.percentageChange > 0
                      ? colors.success
                      : colors.danger
                  }
                />
                <Text
                  style={[
                    styles.changeText,
                    {
                      color:
                        stats.comparison.percentageChange > 0
                          ? colors.success
                          : colors.danger,
                    },
                  ]}
                >
                  {Math.abs(stats.comparison.percentageChange).toFixed(1)}%
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.overviewAmount}>
            {formatCurrency(stats.thisMonth.total)}
          </Text>

          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Icon
                name="receipt-outline"
                size={16}
                color={colors.text.secondary}
              />
              <Text style={styles.overviewStatText}>
                {stats.thisMonth.count} transactions
              </Text>
            </View>
            <View style={styles.overviewStat}>
              <Icon
                name="calendar-outline"
                size={16}
                color={colors.text.secondary}
              />
              <Text style={styles.overviewStatText}>
                {formatCurrency(
                  stats.thisMonth.count > 0
                    ? stats.thisMonth.total / stats.thisMonth.count
                    : 0,
                )}{' '}
                avg
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Income List */}
      <FlatList
        data={incomes}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <IncomeItem
            income={item}
            onPress={() => handleEditIncome(item._id)}
            onDelete={() => handleDeleteIncome(item._id, item.source)}
            selectionMode={selectionMode}
            selected={selectedIds.includes(item._id)}
            onToggleSelect={() => toggleSelection(item._id)}
          />
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

      {/* FAB - Hide in selection mode */}
      {!selectionMode && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={handleAddIncome}
          activeOpacity={0.8}
        >
          <Icon name="add" size={28} color={colors.text.inverse} />
        </TouchableOpacity>
      )}
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
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
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
    headerButton: {
      padding: spacing.sm,
    },
    headerButtonText: {
      ...textStyles.body,
      fontWeight: '600',
    },
    overviewCard: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    overviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    overviewTitle: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    changeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    changeText: {
      ...textStyles.caption,
      fontWeight: '700',
      fontSize: 10,
    },
    overviewAmount: {
      ...textStyles.h1,
      color: colors.success,
      fontWeight: '700',
      marginBottom: spacing.md,
    },
    overviewStats: {
      flexDirection: 'row',
      gap: spacing.lg,
    },
    overviewStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    overviewStatText: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: 100,
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

export default IncomeScreen;
