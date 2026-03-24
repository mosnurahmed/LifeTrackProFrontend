/**
 * Expenses Screen - Monthly View with Date Grouping
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../hooks/useTheme';
import { useExpenses, useDeleteExpense } from '../../../hooks/api/useExpenses';
import { EmptyState, ErrorState, AppHeader, useConfirm } from '../../../components/common';
import { SkeletonList } from '../../../components/common/Loading';
import { formatCurrency } from '../../../utils/formatters';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PAYMENT_ICONS: Record<string, string> = {
  cash: 'cash-outline',
  card: 'card-outline',
  mobile_banking: 'phone-portrait-outline',
  bank_transfer: 'business-outline',
};

const getDateLabel = (dateKey: string): string => {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (dateKey === todayKey) return 'Today';
  if (dateKey === yesterdayKey) return 'Yesterday';

  const date = new Date(dateKey + 'T00:00:00');
  return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`;
};

const ExpensesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();
  const { confirm } = useConfirm();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

  const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${lastDay}`;

  const { data: expensesData, isLoading, error, refetch, isRefetching } = useExpenses({
    startDate,
    endDate,
    limit: 300,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const deleteMutation = useDeleteExpense();

  const allExpenses = expensesData?.data?.data || [];

  // Only show categories that are actually used this month
  const usedCategoryIds = useMemo(
    () => new Set(allExpenses.map((e: any) => e.category?._id || e.categoryId?._id || e.categoryId)),
    [allExpenses],
  );

  const usedCategories = useMemo(() => {
    const seen = new Map<string, any>();
    allExpenses.forEach((e: any) => {
      const cat = e.category || e.categoryId;
      const id = cat?._id;
      if (id && !seen.has(id)) seen.set(id, cat);
    });
    return Array.from(seen.values());
  }, [allExpenses]);

  // Filter locally by selected category
  const expenses = useMemo(
    () => selectedCategoryId
      ? allExpenses.filter((e: any) => {
          const catId = e.category?._id || e.categoryId?._id || e.categoryId;
          return catId === selectedCategoryId;
        })
      : allExpenses,
    [allExpenses, selectedCategoryId],
  );

  const monthTotal = useMemo(
    () => allExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0),
    [allExpenses],
  );

  const sections = useMemo(() => {
    const groups: Record<string, any[]> = {};
    expenses.forEach((expense: any) => {
      const dateKey = expense.date?.split('T')[0] || '';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(expense);
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(dateKey => ({
        dateKey,
        title: getDateLabel(dateKey),
        total: groups[dateKey].reduce((sum, e) => sum + (e.amount || 0), 0),
        data: groups[dateKey],
      }));
  }, [expenses]);

  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
    if (isCurrentMonth) return;
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete Expense',
      message: 'This cannot be undone. Are you sure?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) deleteMutation.mutateAsync(id);
  };

  const styles = createStyles(colors, textStyles, spacing, borderRadius, shadows);

  const renderSectionHeader = ({ section }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionDate}>{section.title}</Text>
      <Text style={styles.sectionTotal}>{formatCurrency(section.total)}</Text>
    </View>
  );

  const renderItem = ({ item }: any) => {
    const category = item.category || item.categoryId;
    const categoryName = category?.name || 'Unknown';
    const categoryIcon = category?.icon || 'wallet-outline';
    const categoryColor = category?.color || colors.primary;

    return (
      <TouchableOpacity
        style={styles.expenseItem}
        onPress={() => (navigation as any).navigate('ExpenseDetails', { expenseId: item._id })}
        onLongPress={() => handleDelete(item._id)}
        activeOpacity={0.7}
      >
        <View style={[styles.categoryIcon, { backgroundColor: `${categoryColor}15` }]}>
          <Icon name={categoryIcon} size={18} color={categoryColor} />
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.description || categoryName}
          </Text>
          <Text style={styles.itemSub} numberOfLines={1}>
            {categoryName}{item.paymentMethod ? ` · ${item.paymentMethod.replace('_', ' ')}` : ''}
          </Text>
        </View>

        <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      {/* Month Navigator */}
      <LinearGradient
        colors={[colors.primary, `${colors.primary}CC`]}
        style={styles.monthCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.navBtn}>
            <Icon name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.monthInfo}>
            <Text style={styles.monthName}>
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </Text>
            <Text style={styles.monthTotal}>{formatCurrency(monthTotal)}</Text>
            <Text style={styles.monthSubtext}>
              {expenses.length} transaction{expenses.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={goToNextMonth}
            style={[styles.navBtn, isCurrentMonth && styles.navBtnDisabled]}
          >
            <Icon name="chevron-forward" size={24} color={isCurrentMonth ? '#FFFFFF60' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Category Filter */}
      {usedCategories.length > 0 && (
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[styles.filterChip, !selectedCategoryId && styles.filterChipActive]}
              onPress={() => setSelectedCategoryId(undefined)}
            >
              <Text style={[styles.filterChipText, !selectedCategoryId && styles.filterChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {usedCategories.map((cat: any) => (
              <TouchableOpacity
                key={cat._id}
                style={[
                  styles.filterChip,
                  selectedCategoryId === cat._id && { backgroundColor: cat.color, borderColor: cat.color },
                ]}
                onPress={() =>
                  setSelectedCategoryId(selectedCategoryId === cat._id ? undefined : cat._id)
                }
              >
                <Icon
                  name={cat.icon}
                  size={13}
                  color={selectedCategoryId === cat._id ? '#FFFFFF' : cat.color}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategoryId === cat._id && styles.filterChipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Expenses" showDrawer />
        <SkeletonList count={6} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <AppHeader title="Expenses" showDrawer />
        <ErrorState title="Failed to load" message="Please try again" onRetry={refetch} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Expenses"
        showDrawer
        right={
          <TouchableOpacity
            style={styles.statsBtn}
            onPress={() => (navigation as any).navigate('ExpenseStats')}
          >
            <Icon name="stats-chart-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      {expenses.length === 0 ? (
        <>
          {renderHeader()}
          <EmptyState
            icon="wallet-outline"
            title="No expenses"
            message={`No expenses in ${MONTH_NAMES[selectedMonth]}`}
            actionLabel="Add Expense"
            onAction={() => (navigation as any).navigate('AddExpense', { mode: 'create' })}
          />
        </>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => (navigation as any).navigate('AddExpense', { mode: 'create' })}
        activeOpacity={0.8}
      >
        <Icon name="add" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: any, textStyles: any, spacing: any, borderRadius: any, shadows: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    statsBtn: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      backgroundColor: `${colors.primary}12`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    monthCard: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      marginBottom: spacing.md,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      ...shadows.md,
    },
    monthNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    navBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFFFFF25',
      justifyContent: 'center',
      alignItems: 'center',
    },
    navBtnDisabled: { opacity: 0.4 },
    monthInfo: { alignItems: 'center' },
    monthName: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 4 },
    monthTotal: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', letterSpacing: -1 },
    monthSubtext: { color: '#FFFFFF99', fontSize: 13, marginTop: 4 },
    filterWrapper: {
      height: 52,
      marginBottom: spacing.sm,
    },
    filterContent: {
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
      alignItems: 'center',
      flexDirection: 'row',
      height: 52,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 14,
      height: 36,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    filterChipTextActive: { color: '#FFFFFF' },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      marginTop: spacing.sm,
    },
    sectionDate: {
      ...textStyles.bodyMedium,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    sectionTotal: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '700',
    },
    expenseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginHorizontal: spacing.lg,
      marginBottom: 6,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    categoryIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemInfo: { flex: 1 },
    itemTitle: {
      fontSize: 14,
      color: colors.text.primary,
      fontWeight: '600',
    },
    itemSub: {
      fontSize: 12,
      color: colors.text.tertiary,
      marginTop: 2,
      textTransform: 'capitalize',
    },
    itemAmount: {
      fontSize: 14,
      color: colors.danger,
      fontWeight: '700',
    },
    listContent: { paddingBottom: 100 },
    fab: {
      position: 'absolute',
      bottom: 90,
      right: 20,
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
  });

export default ExpensesScreen;
