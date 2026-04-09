/**
 * Dashboard Screen — Professional Minimal
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store/authStore';
import { useExpenseStats, useExpenses } from '../../../hooks/api/useExpenses';
import { useBudgetSummary } from '../../../hooks/api/useBudget';
import { useIncomeStats } from '../../../hooks/api/useIncome';
import { useTaskStats } from '../../../hooks/api/useTasks';
import { useUnreadCount } from '../../../hooks/api/useNotifications';
import { useSavingsStats } from '../../../hooks/api/useSavingsGoals';
import { useLoanStats } from '../../../hooks/api/useLoans';
import { formatCurrency, formatRelativeTime } from '../../../utils/formatters';
import { DashboardSkeleton } from '../../../components/common/Loading/ScreenSkeletons';
import { useGuide } from '../../../components/common';

const { width } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickAction {
  icon: string;
  label: string;
  color: string;
  nav: string;
  params?: Record<string, any>;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { GuideButton, GuideView } = useGuide('dashboard');

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthLabel = `${MONTHS[month - 1]} ${year}`;

  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: savingsStats } = useSavingsStats(year, month);
  const {
    data: expenseStats,
    isLoading: isExpenseStatsLoading,
    isRefetching,
    refetch,
  } = useExpenseStats();
  const { data: incomeStats } = useIncomeStats();
  const { data: budgetData } = useBudgetSummary(year, month);
  const { data: taskStats } = useTaskStats();
  const { data: loanStats } = useLoanStats();
  const { data: recentData } = useExpenses({
    limit: 5,
    sortBy: 'date',
    sortOrder: 'desc',
  } as any);

  // useExpenseStats: select=(data)=>data.data → data = { success, data: { thisMonth, categoryBreakdown, ... } }
  // useIncomeStats:  select=(res)=>res.data   → data = { success, data: { thisMonth, ... } }
  // useBudgetSummary:select=(data)=>data.data → data = { success, data: { totalBudget, totalSpent, ... } }
  // useTaskStats:    select=(data)=>data.data → data = { success, data: { total, completed, overdue, ... } }
  // useExpenses:     no select               → data = axios response, expenses at data.data.data

  const monthExpenses = expenseStats?.data?.thisMonth?.total ?? 0;
  const monthIncome = incomeStats?.data?.thisMonth?.total ?? 0;
  const net = monthIncome - monthExpenses;

  const totalBudget = budgetData?.data?.totalBudget ?? 0;
  const totalSpent = budgetData?.data?.totalSpent ?? 0;
  const budgetPct =
    totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const budgetOver = totalBudget > 0 && totalSpent > totalBudget;

  const totalTasks = taskStats?.data?.total ?? 0;
  const completedTasks = taskStats?.data?.completed ?? 0;
  const overdueTasks = taskStats?.data?.overdue ?? 0;
  const pendingTasks = totalTasks - completedTasks;

  // useSavingsStats: select=(data)=>data?.data?.data → returns { totalBalance, initialBalance, ... }
  const totalSaved = savingsStats?.totalBalance ?? 0;

  // Loan stats
  const totalGivenRemaining = loanStats?.totalGivenRemaining ?? 0;
  const totalTakenRemaining = loanStats?.totalTakenRemaining ?? 0;
  const loanOverdue = loanStats?.overdue ?? 0;

  // categoryBreakdown fields: { categoryName, categoryIcon, categoryColor, total, percentage }
  const topCategories = expenseStats?.data?.categoryBreakdown ?? [];
  // useExpenses (no select): axios response → .data = API body → .data = expenses array
  const recentTxns = recentData?.data?.data ?? [];

  // Theme
  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';
  const bgColor = colors.background;

  const ACTIONS: QuickAction[] = [
    {
      icon: 'add-circle-outline',
      label: 'Add Expense',
      color: '#EF4444',
      nav: 'AddExpense',
      params: { mode: 'create' },
    },
    {
      icon: 'add-circle-outline',
      label: 'Add Income',
      color: '#10B981',
      nav: 'AddIncome',
      params: { mode: 'create' },
    },
    {
      icon: 'bar-chart-outline',
      label: 'Add Invest',
      color: '#8B5CF6',
      nav: 'AddInvestment',
    },
    {
      icon: 'pie-chart-outline',
      label: 'Budget',
      color: '#8B5CF6',
      nav: 'Budget',
    },
    {
      icon: 'wallet-outline',
      label: 'Savings',
      color: '#F59E0B',
      nav: 'Savings',
    },
    { icon: 'receipt-outline', label: 'Loans', color: '#F97316', nav: 'Loans' },
    { icon: 'swap-horizontal-outline', label: 'Transfer', color: '#06B6D4', nav: 'Transfers' },
    {
      icon: 'checkmark-circle-outline',
      label: 'Tasks',
      color: '#06B6D4',
      nav: 'Tasks',
    },
    {
      icon: 'document-text-outline',
      label: 'Notes',
      color: '#F97316',
      nav: 'Notes',
    },
    {
      icon: 'chatbubbles-outline',
      label: 'Chat',
      color: '#A78BFA',
      nav: 'Chat',
    },
    { icon: 'cart-outline', label: 'Bazar', color: '#0EA5E9', nav: 'Bazar' },
    {
      icon: 'grid-outline',
      label: 'Categories',
      color: '#64748B',
      nav: 'Categories',
    },
    {
      icon: 'settings-outline',
      label: 'Settings',
      color: '#64748B',
      nav: 'Settings',
    },
  ];

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const goTo = (item: QuickAction) => {
    (navigation as any).navigate(item.nav, item.params ?? {});
  };

  if (isExpenseStatsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 10,
              backgroundColor: surfaceC,
              borderBottomColor: borderC,
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.avatarRing, { borderColor: '#8B5CF640' }]}>
              <View style={[styles.avatar, { backgroundColor: '#8B5CF6' }]}>
                <Text style={styles.avatarLetter}>
                  {(user?.name ?? 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.headerUserInfo}>
              <Text style={[styles.greeting, { color: textSec }]}>
                {greeting()}
              </Text>
              <Text
                style={[styles.userName, { color: textPri }]}
                numberOfLines={1}
              >
                {user?.name || 'User'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: borderC }]}
            onPress={() => (navigation as any).navigate('NotificationsList')}
          >
            <Icon name="notifications-outline" size={22} color={textPri} />
          </TouchableOpacity>
        </View>
        <DashboardSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
            backgroundColor: surfaceC,
            borderBottomColor: borderC,
          },
        ]}
      >
        {/* Left: avatar + name → tap to edit profile */}
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => (navigation as any).navigate('EditProfile')}
          activeOpacity={0.7}
        >
          <View style={[styles.avatarRing, { borderColor: '#8B5CF640' }]}>
            <View style={[styles.avatar, { backgroundColor: '#8B5CF6' }]}>
              <Text style={styles.avatarLetter}>
                {(user?.name ?? 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.headerUserInfo}>
            <Text style={[styles.greeting, { color: textSec }]}>
              {greeting()}
            </Text>
            <Text
              style={[styles.userName, { color: textPri }]}
              numberOfLines={1}
            >
              {user?.name || 'User'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right: guide + notification bell + badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <GuideButton color={textPri} />
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: borderC }]}
            onPress={() => (navigation as any).navigate('NotificationsList')}
          >
            <Icon name="notifications-outline" size={22} color={textPri} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* ── Quick Actions ───────────────────────────────────────── */}
        <View style={[styles.section, { marginTop: 12 }]}>
          <Text style={[styles.sectionTitle, { color: textPri }]}>
            Quick Actions
          </Text>
          <View
            style={[
              styles.actionsGrid,
              { backgroundColor: surfaceC, borderColor: borderC },
            ]}
          >
            {ACTIONS.map((item, idx) => (
              <TouchableOpacity
                key={`${item.label}-${idx}`}
                style={styles.actionItem}
                onPress={() => goTo(item)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.actionIconWrap,
                    { backgroundColor: item.color + '18' },
                  ]}
                >
                  <Icon name={item.icon} size={22} color={item.color} />
                </View>
                <Text
                  style={[styles.actionLabel, { color: textPri }]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Monthly Summary ────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeading, { color: textPri }]}>
            Monthly Summary
          </Text>
          <Text style={[styles.sectionPeriod, { color: textSec }]}>
            {monthLabel}
          </Text>
        </View>
        <View style={styles.row3}>
          <TouchableOpacity
            style={[
              styles.summaryCard,
              { backgroundColor: surfaceC, borderColor: borderC },
            ]}
            onPress={() => (navigation as any).navigate('Expenses')}
            activeOpacity={0.8}
          >
            <View style={[styles.ovIcon, { backgroundColor: '#EF444415' }]}>
              <Icon name="trending-down" size={15} color="#EF4444" />
            </View>
            <Text style={[styles.ovLabel, { color: textSec }]}>Expenses</Text>
            <Text
              style={[styles.ovVal, { color: '#EF4444' }]}
              numberOfLines={1}
            >
              {formatCurrency(monthExpenses)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.summaryCard,
              { backgroundColor: surfaceC, borderColor: borderC },
            ]}
            onPress={() => (navigation as any).navigate('Income')}
            activeOpacity={0.8}
          >
            <View style={[styles.ovIcon, { backgroundColor: '#10B98115' }]}>
              <Icon name="trending-up" size={15} color="#10B981" />
            </View>
            <Text style={[styles.ovLabel, { color: textSec }]}>Income</Text>
            <Text
              style={[styles.ovVal, { color: '#10B981' }]}
              numberOfLines={1}
            >
              {formatCurrency(monthIncome)}
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.summaryCard,
              { backgroundColor: surfaceC, borderColor: borderC },
            ]}
          >
            <View
              style={[
                styles.ovIcon,
                { backgroundColor: net >= 0 ? '#6366F115' : '#EF444415' },
              ]}
            >
              <Icon
                name="analytics"
                size={15}
                color={net >= 0 ? '#6366F1' : '#EF4444'}
              />
            </View>
            <Text style={[styles.ovLabel, { color: textSec }]}>Net</Text>
            <Text
              style={[
                styles.ovVal,
                { color: net >= 0 ? '#6366F1' : '#EF4444' },
              ]}
              numberOfLines={1}
            >
              {net >= 0 ? '+' : ''}
              {formatCurrency(net)}
            </Text>
          </View>
        </View>

        {/* ── Overview ──────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeading, { color: textPri }]}>
            Overview
          </Text>
        </View>
        <View style={styles.ovGrid}>
          {/* Budget */}
          <TouchableOpacity
            style={[
              styles.ovCard,
              { backgroundColor: surfaceC, borderColor: borderC },
            ]}
            onPress={() => (navigation as any).navigate('Budget')}
            activeOpacity={0.8}
          >
            <View style={[styles.ovIcon, { backgroundColor: '#8B5CF615' }]}>
              <Icon name="pie-chart" size={15} color="#8B5CF6" />
            </View>
            <Text style={[styles.ovLabel, { color: textSec }]}>Budget</Text>
            {totalBudget > 0 ? (
              <>
                <Text
                  style={[
                    styles.ovVal,
                    { color: budgetOver ? '#EF4444' : '#8B5CF6' },
                  ]}
                >
                  {budgetPct.toFixed(0)}%
                </Text>
                <View style={[styles.ovBar, { backgroundColor: borderC }]}>
                  <View
                    style={[
                      styles.ovBarFill,
                      {
                        width: `${budgetPct}%` as any,
                        backgroundColor: budgetOver ? '#EF4444' : '#8B5CF6',
                      },
                    ]}
                  />
                </View>
              </>
            ) : (
              <Text style={[styles.ovVal, { color: textSec }]}>—</Text>
            )}
          </TouchableOpacity>

          {/* Tasks */}
          <TouchableOpacity
            style={[
              styles.ovCard,
              { backgroundColor: surfaceC, borderColor: borderC },
            ]}
            onPress={() => (navigation as any).navigate('Tasks')}
            activeOpacity={0.8}
          >
            <View style={[styles.ovIcon, { backgroundColor: '#06B6D415' }]}>
              <Icon name="checkmark-circle" size={15} color="#06B6D4" />
            </View>
            <Text style={[styles.ovLabel, { color: textSec }]}>Tasks</Text>
            <Text style={[styles.ovVal, { color: '#06B6D4' }]}>
              {pendingTasks} pending
            </Text>
            <Text style={[styles.ovSub, { color: textSec }]}>
              {completedTasks} done
              {overdueTasks > 0 ? ` · ${overdueTasks} late` : ''}
            </Text>
          </TouchableOpacity>

          {/* Savings */}
          <TouchableOpacity
            style={[
              styles.ovCard,
              { backgroundColor: surfaceC, borderColor: borderC },
            ]}
            onPress={() => (navigation as any).navigate('Savings')}
            activeOpacity={0.8}
          >
            <View style={[styles.ovIcon, { backgroundColor: '#F59E0B15' }]}>
              <Icon name="wallet" size={15} color="#F59E0B" />
            </View>
            <Text style={[styles.ovLabel, { color: textSec }]}>Savings</Text>
            <Text
              style={[styles.ovVal, { color: '#F59E0B' }]}
              numberOfLines={1}
            >
              {formatCurrency(totalSaved)}
            </Text>
          </TouchableOpacity>

          {/* Loans */}
          <TouchableOpacity
            style={[
              styles.ovCard,
              { backgroundColor: surfaceC, borderColor: borderC },
            ]}
            onPress={() => (navigation as any).navigate('Loans')}
            activeOpacity={0.8}
          >
            <View style={[styles.ovIcon, { backgroundColor: '#F9731615' }]}>
              <Icon name="receipt" size={15} color="#F97316" />
            </View>
            <Text style={[styles.ovLabel, { color: textSec }]}>Loans</Text>
            {totalGivenRemaining > 0 || totalTakenRemaining > 0 ? (
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {totalGivenRemaining > 0 && (
                  <Text
                    style={[
                      styles.ovSub,
                      { color: '#10B981', fontWeight: '600' },
                    ]}
                  >
                    ↑{formatCurrency(totalGivenRemaining)}
                  </Text>
                )}
                {totalTakenRemaining > 0 && (
                  <Text
                    style={[
                      styles.ovSub,
                      { color: '#EF4444', fontWeight: '600' },
                    ]}
                  >
                    ↓{formatCurrency(totalTakenRemaining)}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={[styles.ovVal, { color: textSec }]}>—</Text>
            )}
            {loanOverdue > 0 && (
              <Text
                style={[styles.ovSub, { color: '#EF4444', fontWeight: '700' }]}
              >
                {loanOverdue} overdue
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Top Spending ────────────────────────────────────────── */}
        {topCategories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: textPri }]}>
                Top Spending
              </Text>
              <TouchableOpacity
                onPress={() => (navigation as any).navigate('Expenses')}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.listCard,
                { backgroundColor: surfaceC, borderColor: borderC },
              ]}
            >
              {topCategories.slice(0, 4).map((cat: any, idx: number) => {
                const pct =
                  cat.percentage ??
                  (monthExpenses > 0 ? (cat.total / monthExpenses) * 100 : 0);
                const color = cat.categoryColor || '#8B5CF6';
                return (
                  <View
                    key={cat.categoryId ?? idx}
                    style={[
                      styles.listRow,
                      idx < Math.min(topCategories.length, 4) - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: borderC,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.catIcon,
                        { backgroundColor: color + '20' },
                      ]}
                    >
                      <Icon
                        name={cat.categoryIcon || 'wallet-outline'}
                        size={20}
                        color={color}
                      />
                    </View>
                    <View style={styles.catInfo}>
                      <Text style={[styles.catName, { color: textPri }]}>
                        {cat.categoryName}
                      </Text>
                      <View
                        style={[
                          styles.progressTrack,
                          { backgroundColor: borderC, marginTop: 5 },
                        ]}
                      >
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(pct, 100)}%` as any,
                              backgroundColor: color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <View style={styles.catRight}>
                      <Text style={[styles.catAmount, { color: '#EF4444' }]}>
                        {formatCurrency(cat.total)}
                      </Text>
                      <Text style={[styles.catPct, { color: textSec }]}>
                        {pct.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Recent Activity ─────────────────────────────────────── */}
        {recentTxns.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: textPri }]}>
                Recent Activity
              </Text>
              <TouchableOpacity
                onPress={() => (navigation as any).navigate('Expenses')}
              >
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.listCard,
                { backgroundColor: surfaceC, borderColor: borderC },
              ]}
            >
              {recentTxns.slice(0, 5).map((txn: any, idx: number) => {
                // virtual 'category' field from populate, or fallback
                const catRaw = txn.category;
                const cat = Array.isArray(catRaw)
                  ? catRaw[0] || {}
                  : catRaw || {};
                return (
                  <TouchableOpacity
                    key={txn._id ?? idx}
                    style={[
                      styles.listRow,
                      idx < Math.min(recentTxns.length, 5) - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: borderC,
                      },
                    ]}
                    onPress={() =>
                      (navigation as any).navigate('ExpenseDetails', {
                        expenseId: txn._id,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.catIcon,
                        { backgroundColor: (cat.color || '#8B5CF6') + '20' },
                      ]}
                    >
                      <Icon
                        name={cat.icon || 'wallet-outline'}
                        size={20}
                        color={cat.color || '#8B5CF6'}
                      />
                    </View>
                    <View style={styles.catInfo}>
                      <Text
                        style={[styles.catName, { color: textPri }]}
                        numberOfLines={1}
                      >
                        {txn.description || 'No description'}
                      </Text>
                      <Text style={[styles.catPct, { color: textSec }]}>
                        {cat.name || 'Uncategorized'} ·{' '}
                        {formatRelativeTime(txn.date)}
                      </Text>
                    </View>
                    <Text style={[styles.catAmount, { color: '#EF4444' }]}>
                      {formatCurrency(txn.amount)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
      <GuideView />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

// section paddingHorizontal:16 × 2 = 32, grid borderWidth:1 × 2 = 2
const ITEM_W = (width - 42) / 3; // 3 columns

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  headerUserInfo: { alignItems: 'flex-start' },
  iconBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#FFFFFF' },

  greeting: { fontSize: 11, letterSpacing: 0.2 },
  userName: { fontSize: 16, fontWeight: '700' },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 8,
  },
  sectionHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 12,
  },
  sectionHeading: { fontSize: 14, fontWeight: '700' },
  sectionPeriod: { fontSize: 12 },

  // 3-col overview
  // Monthly Summary 3-column row
  row3: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 3,
  },

  // Overview 2x2 grid
  ovGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  ovCard: {
    width: '48%' as any,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 1,
  },
  ovIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  ovLabel: { fontSize: 10, fontWeight: '500' },
  ovVal: { fontSize: 13, fontWeight: '700' },
  ovSub: { fontSize: 9 },
  ovBar: { height: 3, borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  ovBarFill: { height: '100%', borderRadius: 2 },

  // Savings card
  savingsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  savingsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  savingsRight: { alignItems: 'flex-end' },
  savingsAmount: { fontSize: 16, fontWeight: '700' },
  savingsSub: { fontSize: 11, marginTop: 1 },

  // Budget card
  budgetCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  budgetTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  budgetLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  budgetTitle: { fontSize: 14, fontWeight: '600' },
  budgetPct: { fontSize: 15, fontWeight: '700' },
  budgetBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  budgetSub: { fontSize: 12 },

  // Task card
  taskCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taskTitle: { fontSize: 14, fontWeight: '600', flex: 0 },
  taskChips: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  chipText: { fontSize: 11, fontWeight: '600' },

  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  // Quick actions grid
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: { fontSize: 13, color: '#8B5CF6', fontWeight: '600' },

  actionsGrid: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionItem: {
    width: ITEM_W,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: { fontSize: 11, fontWeight: '500', textAlign: 'center' },

  // List cards
  listCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catInfo: { flex: 1 },
  catName: { fontSize: 13, fontWeight: '600' },
  catRight: { alignItems: 'flex-end' },
  catAmount: { fontSize: 13, fontWeight: '700' },
  catPct: { fontSize: 11, marginTop: 2 },
});

export default DashboardScreen;
