/**
 * Income Screen - Monthly View with Date Grouping
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
import { useIncomes, useDeleteIncome, useIncomeStats } from '../../../hooks/api/useIncome';
import { EmptyState, ErrorState, AppHeader, useConfirm, useGuide } from '../../../components/common';
import { ExpenseListSkeleton } from '../../../components/common/Loading/ScreenSkeletons';
import { formatCurrency } from '../../../utils/formatters';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PAYMENT_ICONS: Record<string, string> = {
  cash: 'cash-outline',
  card: 'card-outline',
  mobile_banking: 'phone-portrait-outline',
  bank_transfer: 'business-outline',
};

const getDateLabel = (dateKey: string): string => {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

  if (dateKey === todayKey) return 'Today';
  if (dateKey === yesterdayKey) return 'Yesterday';
  const date = new Date(dateKey + 'T00:00:00');
  return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`;
};

const IncomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();
  const { confirm } = useConfirm();
  const { GuideButton, GuideView } = useGuide('income');

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

  const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${lastDay}`;

  const { data: incomesData, isLoading, error, refetch, isRefetching } = useIncomes({
    startDate,
    endDate,
    limit: 300,
  });

  const { data: statsData } = useIncomeStats();
  const deleteMutation = useDeleteIncome();

  const allIncomes = incomesData?.data?.data || [];
  const stats = statsData?.data;

  // Only show categories that are actually used this month
  const usedCategories = useMemo(() => {
    const seen = new Map<string, any>();
    allIncomes.forEach((i: any) => {
      const cat = i.category || i.categoryId;
      const id = cat?._id;
      if (id && !seen.has(id)) seen.set(id, cat);
    });
    return Array.from(seen.values());
  }, [allIncomes]);

  // Filter locally by selected category
  const incomes = useMemo(
    () => selectedCategoryId
      ? allIncomes.filter((i: any) => {
          const catId = i.category?._id || i.categoryId?._id || i.categoryId;
          return catId === selectedCategoryId;
        })
      : allIncomes,
    [allIncomes, selectedCategoryId],
  );

  const monthTotal = useMemo(
    () => allIncomes.reduce((sum: number, i: any) => sum + (i.amount || 0), 0),
    [allIncomes],
  );

  const sections = useMemo(() => {
    const groups: Record<string, any[]> = {};
    incomes.forEach((income: any) => {
      const dateKey = income.date?.split('T')[0] || '';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(income);
    });
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(dateKey => ({
        dateKey,
        title: getDateLabel(dateKey),
        total: groups[dateKey].reduce((sum, i) => sum + (i.amount || 0), 0),
        data: groups[dateKey],
      }));
  }, [incomes]);

  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

  const goToPrevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };

  const goToNextMonth = () => {
    if (isCurrentMonth) return;
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  const handleDelete = async (id: string, source: string) => {
    const ok = await confirm({
      title: 'Delete Income',
      message: `Delete "${source}"? This cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) deleteMutation.mutate(id);
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
    const categoryName = category?.name || 'Income';
    const categoryIcon = category?.icon || 'trending-up-outline';
    const categoryColor = category?.color || colors.success;

    return (
      <TouchableOpacity
        style={styles.incomeItem}
        onPress={() => (navigation as any).navigate('IncomeDetails', { incomeId: item._id })}
        onLongPress={() => handleDelete(item._id, item.source)}
        activeOpacity={0.7}
      >
        <View style={[styles.categoryIcon, { backgroundColor: `${categoryColor}15` }]}>
          <Icon name={categoryIcon} size={18} color={categoryColor} />
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.source || categoryName}</Text>
          <Text style={styles.itemSub} numberOfLines={1}>
            {categoryName}{item.paymentMethod ? ` · ${item.paymentMethod.replace('_', ' ')}` : ''}
          </Text>
        </View>

        <Text style={[styles.itemAmount, { color: categoryColor }]}>
          +{formatCurrency(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      {/* Month Navigator */}
      <LinearGradient
        colors={[colors.success, `${colors.success}BB`]}
        style={styles.monthCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.navBtn}>
            <Icon name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.monthInfo}>
            <Text style={styles.monthName}>{MONTH_NAMES[selectedMonth]} {selectedYear}</Text>
            <Text style={styles.monthTotal}>{formatCurrency(monthTotal)}</Text>
            <Text style={styles.monthSubtext}>
              {incomes.length} income entr{incomes.length !== 1 ? 'ies' : 'y'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={goToNextMonth}
            style={[styles.navBtn, isCurrentMonth && styles.navBtnDisabled]}
          >
            <Icon name="chevron-forward" size={24} color={isCurrentMonth ? '#FFFFFF40' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>

        {/* This month vs last month mini stats */}
        {stats && (
          <View style={styles.miniStats}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatVal}>{formatCurrency(stats.thisMonth?.total || 0)}</Text>
              <Text style={styles.miniStatLabel}>This Month</Text>
            </View>
            <View style={styles.miniDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatVal}>{formatCurrency(stats.lastMonth?.total || 0)}</Text>
              <Text style={styles.miniStatLabel}>Last Month</Text>
            </View>
            <View style={styles.miniDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatVal}>{stats.thisMonth?.count || 0}</Text>
              <Text style={styles.miniStatLabel}>Transactions</Text>
            </View>
          </View>
        )}
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
                onPress={() => setSelectedCategoryId(selectedCategoryId === cat._id ? undefined : cat._id)}
              >
                <Icon name={cat.icon} size={13} color={selectedCategoryId === cat._id ? '#FFFFFF' : cat.color} />
                <Text style={[styles.filterChipText, selectedCategoryId === cat._id && styles.filterChipTextActive]}>
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
        <AppHeader title="Income" showDrawer />
        <ExpenseListSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <AppHeader title="Income" showDrawer />
        <ErrorState title="Failed to load" message="Please try again" onRetry={refetch} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Income"
        showDrawer
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <GuideButton color={colors.text.primary} />
            <TouchableOpacity
              style={styles.statsBtn}
              onPress={() => (navigation as any).navigate('IncomeStats')}
            >
              <Icon name="stats-chart-outline" size={22} color={colors.success} />
            </TouchableOpacity>
          </View>
        }
      />

      {incomes.length === 0 ? (
        <>
          {renderHeader()}
          <EmptyState
            icon="trending-up-outline"
            title="No income"
            message={`No income in ${MONTH_NAMES[selectedMonth]}`}
            actionLabel="Add Income"
            onAction={() => (navigation as any).navigate('AddIncome', { mode: 'create' })}
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
              colors={[colors.success]}
              tintColor={colors.success}
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.success }]}
        onPress={() => (navigation as any).navigate('AddIncome', { mode: 'create' })}
        activeOpacity={0.8}
      >
        <Icon name="add" size={22} color="#FFFFFF" />
      </TouchableOpacity>
      <GuideView />
    </View>
  );
};

const createStyles = (colors: any, textStyles: any, spacing: any, borderRadius: any, shadows: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    statsBtn: {
      width: 40, height: 40,
      borderRadius: borderRadius.md,
      backgroundColor: `${colors.success}12`,
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
      marginBottom: spacing.md,
    },
    navBtn: {
      width: 40, height: 40,
      borderRadius: 20,
      backgroundColor: '#FFFFFF25',
      justifyContent: 'center',
      alignItems: 'center',
    },
    navBtnDisabled: { opacity: 0.35 },
    monthInfo: { alignItems: 'center' },
    monthName: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 2 },
    monthTotal: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: -1 },
    monthSubtext: { color: '#FFFFFF99', fontSize: 12, marginTop: 2 },
    miniStats: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF20',
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
    miniStat: { flex: 1, alignItems: 'center' },
    miniStatVal: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 2 },
    miniStatLabel: { color: '#FFFFFF80', fontSize: 11 },
    miniDivider: { width: 1, backgroundColor: '#FFFFFF30' },
    filterWrapper: { height: 52, marginBottom: spacing.sm },
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
    filterChipActive: { backgroundColor: colors.success, borderColor: colors.success },
    filterChipText: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
    filterChipTextActive: { color: '#FFFFFF' },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      marginTop: spacing.sm,
    },
    sectionDate: { ...textStyles.bodyMedium, color: colors.text.secondary, fontWeight: '600' },
    sectionTotal: { ...textStyles.bodyMedium, color: colors.success, fontWeight: '700' },
    incomeItem: {
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
      width: 38, height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemInfo: { flex: 1 },
    itemTitle: { fontSize: 14, color: colors.text.primary, fontWeight: '600' },
    itemSub: { fontSize: 12, color: colors.text.tertiary, marginTop: 2, textTransform: 'capitalize' },
    itemAmount: { fontSize: 14, fontWeight: '700' },
    listContent: { paddingBottom: 100 },
    fab: {
      position: 'absolute',
      bottom: 90,
      right: 20,
      width: 48, height: 48,
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

export default IncomeScreen;
