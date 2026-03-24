/**
 * Savings Screen — Overview + Goals tabs
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../hooks/useTheme';
import {
  useSavingsGoals,
  useSavingsStats,
  useDeleteSavingsGoal,
  useSetSavingsAccount,
  useAddContribution,
} from '../../../hooks/api/useSavingsGoals';
import { AppHeader } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';
import type {
  SavingsGoal,
  MonthlyHistoryItem,
} from '../../../api/endpoints/savingsGoals';

const MONTH_NAMES = [
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

const PRIORITY_CONFIG = {
  high: { color: '#EF4444', label: 'High', icon: 'flame' },
  medium: { color: '#F97316', label: 'Medium', icon: 'trending-up' },
  low: { color: '#22C55E', label: 'Low', icon: 'leaf' },
};

// ─── Goal Card ────────────────────────────────────────────────────────────────

const GoalCard = ({
  goal,
  onPress,
  onAddContribution,
  onDelete,
  colors,
  borderRadius,
}: {
  goal: SavingsGoal;
  onPress: () => void;
  onAddContribution: () => void;
  onDelete: () => void;
  colors: any;
  borderRadius: any;
}) => {
  const pct = Math.min(goal.progress ?? 0, 100);
  const priority = PRIORITY_CONFIG[goal.priority] ?? PRIORITY_CONFIG.medium;

  const daysLeft = goal.targetDate
    ? Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <TouchableOpacity
      style={[
        styles.goalCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: goal.color,
        },
      ]}
      onPress={onPress}
      onLongPress={onDelete}
      activeOpacity={0.78}
    >
      {/* Top row */}
      <View style={styles.goalTop}>
        <View
          style={[styles.goalIconWrap, { backgroundColor: `${goal.color}18` }]}
        >
          <Icon name={goal.icon} size={22} color={goal.color} />
        </View>

        <View style={styles.goalMeta}>
          <Text
            style={[styles.goalTitle, { color: colors.text.primary }]}
            numberOfLines={1}
          >
            {goal.title}
          </Text>
          <View style={styles.goalBadges}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: `${priority.color}15` },
              ]}
            >
              <Icon name={priority.icon} size={11} color={priority.color} />
              <Text style={[styles.priorityText, { color: priority.color }]}>
                {priority.label}
              </Text>
            </View>
            {goal.isCompleted && (
              <View
                style={[
                  styles.completedBadge,
                  { backgroundColor: '#22C55E18' },
                ]}
              >
                <Icon name="checkmark-circle" size={11} color="#22C55E" />
                <Text style={[styles.completedText, { color: '#22C55E' }]}>
                  Done
                </Text>
              </View>
            )}
            {daysLeft !== null && !goal.isCompleted && (
              <View
                style={[
                  styles.deadlineBadge,
                  {
                    backgroundColor:
                      daysLeft < 30 ? '#EF444415' : `${colors.text.tertiary}15`,
                  },
                ]}
              >
                <Icon
                  name="calendar-outline"
                  size={11}
                  color={daysLeft < 30 ? '#EF4444' : colors.text.tertiary}
                />
                <Text
                  style={[
                    styles.deadlineText,
                    { color: daysLeft < 30 ? '#EF4444' : colors.text.tertiary },
                  ]}
                >
                  {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {!goal.isCompleted && (
          <TouchableOpacity
            style={[
              styles.addContribBtn,
              { backgroundColor: `${goal.color}18` },
            ]}
            onPress={onAddContribution}
          >
            <Icon name="add" size={20} color={goal.color} />
          </TouchableOpacity>
        )}
      </View>

      {/* Progress */}
      <View style={styles.goalProgress}>
        <View
          style={[styles.progressTrack, { backgroundColor: `${goal.color}20` }]}
        >
          <View
            style={[
              styles.progressFill,
              { width: `${pct}%`, backgroundColor: goal.color },
            ]}
          />
        </View>
        <View style={styles.progressRow}>
          <Text
            style={[styles.progressAmounts, { color: colors.text.secondary }]}
          >
            {formatCurrency(goal.currentAmount)}
            <Text style={{ color: colors.text.tertiary }}>
              {' '}
              / {formatCurrency(goal.targetAmount)}
            </Text>
          </Text>
          <Text style={[styles.progressPct, { color: goal.color }]}>
            {pct.toFixed(1)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const SavingsGoalsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, spacing, borderRadius, shadows } = useTheme();

  const now = new Date();
  const [tab, setTab] = useState<'overview' | 'goals'>('overview');
  const [goalFilter, setGoalFilter] = useState<'active' | 'completed' | 'all'>(
    'active',
  );
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Initial balance modal
  const [balanceModal, setBalanceModal] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');

  // Quick contribute modal
  const [contribModal, setContribModal] = useState(false);
  const [contribGoal, setContribGoal] = useState<SavingsGoal | null>(null);
  const [contribInput, setContribInput] = useState('');
  const [contribNote, setContribNote] = useState('');

  const {
    data: goalsData,
    isLoading: goalsLoading,
    refetch,
    isRefetching,
  } = useSavingsGoals();
  const { data: stats, isLoading: statsLoading } = useSavingsStats(
    selectedYear,
    selectedMonth,
  );
  console.log('stats', stats);
  const setAccountMutation = useSetSavingsAccount();
  const addContribMutation = useAddContribution();
  const deleteMutation = useDeleteSavingsGoal();

  const allGoals: SavingsGoal[] = (goalsData as any)?.data?.data ?? [];

  const filteredGoals = useMemo(() => {
    if (goalFilter === 'active') return allGoals.filter(g => !g.isCompleted);
    if (goalFilter === 'completed') return allGoals.filter(g => g.isCompleted);
    return allGoals;
  }, [allGoals, goalFilter]);

  const isCurrentMonth =
    selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();

  const goToPrev = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(y => y - 1);
    } else setSelectedMonth(m => m - 1);
  };
  const goToNext = () => {
    if (isCurrentMonth) return;
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(y => y + 1);
    } else setSelectedMonth(m => m + 1);
  };

  const handleDelete = (goal: SavingsGoal) =>
    Alert.alert('Delete Goal', `Delete "${goal.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(goal._id),
      },
    ]);

  const openContrib = (goal: SavingsGoal) => {
    setContribGoal(goal);
    setContribInput('');
    setContribNote('');
    setContribModal(true);
  };

  const saveContrib = () => {
    if (!contribGoal) return;
    const val = parseFloat(contribInput);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Invalid amount');
      return;
    }
    addContribMutation.mutate(
      {
        id: contribGoal._id,
        data: { amount: val, note: contribNote || undefined },
      },
      { onSuccess: () => setContribModal(false) },
    );
  };

  const saveBalance = () => {
    const val = parseFloat(balanceInput);
    if (isNaN(val) || val < 0) {
      Alert.alert('Invalid amount');
      return;
    }
    setAccountMutation.mutate(val, { onSuccess: () => setBalanceModal(false) });
  };

  // Stats values
  const totalBalance = stats?.totalBalance ?? 0;
  const initialBalance = stats?.initialBalance ?? 0;
  const allTimeSurplus = stats?.allTimeSurplus ?? 0;
  const goalsSaved = stats?.totalCurrentAmount ?? 0;
  const thisMonthIncome = stats?.thisMonthIncome ?? 0;
  const thisMonthExp = stats?.thisMonthExpenses ?? 0;
  const surplus = stats?.thisMonthSurplus ?? 0;
  const thisMonthSaved = stats?.thisMonthSaved ?? 0;
  const surplusColor = surplus >= 0 ? '#22C55E' : '#EF4444';
  const monthlyHistory: MonthlyHistoryItem[] = stats?.monthlyHistory ?? [];
  console.log('totalBalance:', totalBalance);
  const activeCount = allGoals.filter(g => !g.isCompleted).length;
  const completedCount = allGoals.filter(g => g.isCompleted).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Savings"
        right={
          <TouchableOpacity
            style={[
              styles.addGoalBtn,
              { backgroundColor: colors.success || '#22C55E' },
            ]}
            onPress={() =>
              (navigation as any).navigate('AddSavingsGoal', { mode: 'create' })
            }
          >
            <Icon name="add" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {/* Tab Bar */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        {(['overview', 'goals'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[
              styles.tab,
              tab === t && {
                borderBottomColor: '#22C55E',
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setTab(t)}
          >
            <Icon
              name={t === 'overview' ? 'wallet-outline' : 'flag-outline'}
              size={16}
              color={tab === t ? '#22C55E' : colors.text.tertiary}
            />
            <Text
              style={[
                styles.tabText,
                { color: tab === t ? '#22C55E' : colors.text.secondary },
                tab === t && { fontWeight: '700' },
              ]}
            >
              {t === 'overview' ? 'Overview' : `Goals (${activeCount})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#22C55E']}
            tintColor={'#22C55E'}
          />
        }
      >
        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <>
            {/* Total Balance Hero */}
            <LinearGradient
              colors={['#16A34A', '#22C55E']}
              style={[styles.heroCard, shadows.md]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.heroLabel}>Total Savings Balance</Text>
              <Text style={styles.heroAmount}>
                {formatCurrency(totalBalance)}
              </Text>

              <View style={styles.heroBreakdown}>
                <View style={styles.heroBreakdownItem}>
                  <Text style={styles.heroBreakdownVal}>
                    {formatCurrency(initialBalance)}
                  </Text>
                  <Text style={styles.heroBreakdownLabel}>Initial</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroBreakdownItem}>
                  <Text
                    style={[
                      styles.heroBreakdownVal,
                      { color: allTimeSurplus >= 0 ? '#86EFAC' : '#FCA5A5' },
                    ]}
                  >
                    {allTimeSurplus >= 0 ? '+' : ''}
                    {formatCurrency(allTimeSurplus)}
                  </Text>
                  <Text style={styles.heroBreakdownLabel}>Net Saved</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroBreakdownItem}>
                  <Text style={styles.heroBreakdownVal}>{allGoals.length}</Text>
                  <Text style={styles.heroBreakdownLabel}>Goals</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.setInitialBtn}
                onPress={() => {
                  setBalanceInput(
                    initialBalance > 0 ? String(initialBalance) : '',
                  );
                  setBalanceModal(true);
                }}
              >
                <Icon
                  name={
                    initialBalance > 0 ? 'create-outline' : 'add-circle-outline'
                  }
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.setInitialText}>
                  {initialBalance > 0
                    ? 'Edit initial balance'
                    : 'Set initial balance'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Month Navigator */}
            <View style={styles.monthNav}>
              <TouchableOpacity
                onPress={goToPrev}
                style={[
                  styles.monthBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Icon
                  name="chevron-back"
                  size={20}
                  color={colors.text.primary}
                />
              </TouchableOpacity>
              <Text style={[styles.monthLabel, { color: colors.text.primary }]}>
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </Text>
              <TouchableOpacity
                onPress={goToNext}
                style={[
                  styles.monthBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                  isCurrentMonth && { opacity: 0.3 },
                ]}
              >
                <Icon
                  name="chevron-forward"
                  size={20}
                  color={colors.text.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Monthly Analysis Card */}
            <View
              style={[
                styles.monthlyCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text
                style={[styles.monthlyTitle, { color: colors.text.primary }]}
              >
                Monthly Analysis
              </Text>

              <View style={styles.monthlyRow}>
                <View
                  style={[
                    styles.monthlyIconWrap,
                    { backgroundColor: '#22C55E18' },
                  ]}
                >
                  <Icon name="trending-up" size={18} color="#22C55E" />
                </View>
                <Text
                  style={[
                    styles.monthlyLabel,
                    { color: colors.text.secondary },
                  ]}
                >
                  Income
                </Text>
                <Text style={[styles.monthlyAmt, { color: '#22C55E' }]}>
                  {formatCurrency(thisMonthIncome)}
                </Text>
              </View>

              <View style={styles.monthlyRow}>
                <View
                  style={[
                    styles.monthlyIconWrap,
                    { backgroundColor: '#EF444418' },
                  ]}
                >
                  <Icon name="trending-down" size={18} color="#EF4444" />
                </View>
                <Text
                  style={[
                    styles.monthlyLabel,
                    { color: colors.text.secondary },
                  ]}
                >
                  Expenses
                </Text>
                <Text style={[styles.monthlyAmt, { color: '#EF4444' }]}>
                  {formatCurrency(thisMonthExp)}
                </Text>
              </View>

              <View
                style={[
                  styles.monthlySeparator,
                  { backgroundColor: colors.border },
                ]}
              />

              <View style={styles.monthlyRow}>
                <View
                  style={[
                    styles.monthlyIconWrap,
                    { backgroundColor: `${surplusColor}18` },
                  ]}
                >
                  <Icon
                    name={surplus >= 0 ? 'checkmark-circle' : 'alert-circle'}
                    size={18}
                    color={surplusColor}
                  />
                </View>
                <Text
                  style={[
                    styles.monthlyLabel,
                    { color: colors.text.secondary },
                  ]}
                >
                  {surplus >= 0 ? 'Surplus' : 'Deficit'}
                </Text>
                <Text
                  style={[
                    styles.monthlyAmt,
                    { color: surplusColor, fontWeight: '800' },
                  ]}
                >
                  {formatCurrency(Math.abs(surplus))}
                </Text>
              </View>

              <View style={styles.monthlyRow}>
                <View
                  style={[
                    styles.monthlyIconWrap,
                    { backgroundColor: '#3B82F618' },
                  ]}
                >
                  <Icon name="save-outline" size={18} color="#3B82F6" />
                </View>
                <Text
                  style={[
                    styles.monthlyLabel,
                    { color: colors.text.secondary },
                  ]}
                >
                  Saved to Goals
                </Text>
                <Text style={[styles.monthlyAmt, { color: '#3B82F6' }]}>
                  {formatCurrency(thisMonthSaved)}
                </Text>
              </View>

              {surplus > thisMonthSaved && (
                <View
                  style={[
                    styles.couldSaveRow,
                    { backgroundColor: '#F59E0B18', borderColor: '#F59E0B30' },
                  ]}
                >
                  <Icon name="bulb-outline" size={14} color="#F59E0B" />
                  <Text style={styles.couldSaveText}>
                    You could save{' '}
                    <Text style={{ fontWeight: '800', color: '#F59E0B' }}>
                      {formatCurrency(surplus - thisMonthSaved)}
                    </Text>{' '}
                    more this month
                  </Text>
                </View>
              )}
            </View>

            {/* Monthly Savings History */}
            {monthlyHistory.length > 0 && (
              <View
                style={[
                  styles.monthlyCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[styles.monthlyTitle, { color: colors.text.primary }]}
                >
                  Savings History
                </Text>
                {[...monthlyHistory].reverse().map((item, idx) => {
                  const isPos = item.saved >= 0;
                  const savedColor = isPos ? '#22C55E' : '#EF4444';
                  const monthName = MONTH_NAMES[item.month - 1].slice(0, 3);
                  return (
                    <View key={`${item.year}-${item.month}`}>
                      {idx > 0 && (
                        <View
                          style={[
                            styles.monthlySeparator,
                            { backgroundColor: colors.border },
                          ]}
                        />
                      )}
                      <View style={styles.historyRow}>
                        <View
                          style={[
                            styles.historyMonthBadge,
                            { backgroundColor: colors.background },
                          ]}
                        >
                          <Text
                            style={[
                              styles.historyMonthText,
                              { color: colors.text.secondary },
                            ]}
                          >
                            {monthName}
                          </Text>
                          <Text
                            style={[
                              styles.historyYearText,
                              { color: colors.text.tertiary },
                            ]}
                          >
                            {item.year}
                          </Text>
                        </View>
                        <View style={styles.historyMidCol}>
                          <View style={styles.historyIncExp}>
                            <Icon name="arrow-up" size={11} color="#22C55E" />
                            <Text
                              style={[
                                styles.historySmall,
                                { color: colors.text.secondary },
                              ]}
                            >
                              {formatCurrency(item.income)}
                            </Text>
                            <Icon
                              name="arrow-down"
                              size={11}
                              color="#EF4444"
                              style={{ marginLeft: 6 }}
                            />
                            <Text
                              style={[
                                styles.historySmall,
                                { color: colors.text.secondary },
                              ]}
                            >
                              {formatCurrency(item.expenses)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.historyBar,
                              { backgroundColor: colors.border },
                            ]}
                          >
                            <View
                              style={[
                                styles.historyBarFill,
                                {
                                  width: `${Math.min(
                                    (Math.abs(item.saved) /
                                      Math.max(item.income, item.expenses, 1)) *
                                      100,
                                    100,
                                  )}%`,
                                  backgroundColor: savedColor,
                                },
                              ]}
                            />
                          </View>
                        </View>
                        <View style={styles.historyRight}>
                          <Text
                            style={[styles.historySaved, { color: savedColor }]}
                          >
                            {isPos ? '+' : ''}
                            {formatCurrency(item.saved)}
                          </Text>
                          <Text
                            style={[
                              styles.historyBalance,
                              { color: colors.text.tertiary },
                            ]}
                          >
                            {formatCurrency(item.cumulativeBalance)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Active Goals Preview */}
            {activeCount > 0 && (
              <View style={styles.previewSection}>
                <View style={styles.previewHeader}>
                  <Text
                    style={[
                      styles.previewTitle,
                      { color: colors.text.primary },
                    ]}
                  >
                    Active Goals
                  </Text>
                  <TouchableOpacity onPress={() => setTab('goals')}>
                    <Text style={[styles.previewSeeAll, { color: '#22C55E' }]}>
                      See all →
                    </Text>
                  </TouchableOpacity>
                </View>
                {allGoals
                  .filter(g => !g.isCompleted)
                  .slice(0, 3)
                  .map(goal => (
                    <GoalCard
                      key={goal._id}
                      goal={goal}
                      onPress={() =>
                        (navigation as any).navigate('SavingsGoalDetails', {
                          goalId: goal._id,
                        })
                      }
                      onAddContribution={() => openContrib(goal)}
                      onDelete={() => handleDelete(goal)}
                      colors={colors}
                      borderRadius={borderRadius}
                    />
                  ))}
              </View>
            )}

            <View style={{ height: 40 }} />
          </>
        )}

        {/* ── GOALS TAB ── */}
        {tab === 'goals' && (
          <>
            {/* Filter */}
            <View
              style={[
                styles.goalFilterBar,
                { borderBottomColor: colors.border },
              ]}
            >
              {(['active', 'all', 'completed'] as const).map(f => {
                const count =
                  f === 'active'
                    ? activeCount
                    : f === 'completed'
                    ? completedCount
                    : allGoals.length;
                const isActive = goalFilter === f;
                return (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.goalFilterTab,
                      isActive && {
                        borderBottomColor: '#22C55E',
                        borderBottomWidth: 2,
                      },
                    ]}
                    onPress={() => setGoalFilter(f)}
                  >
                    <Text
                      style={[
                        styles.goalFilterText,
                        { color: isActive ? '#22C55E' : colors.text.secondary },
                        isActive && { fontWeight: '700' },
                      ]}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {filteredGoals.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Icon
                  name="flag-outline"
                  size={48}
                  color={colors.text.tertiary}
                />
                <Text
                  style={[styles.emptyTitle, { color: colors.text.secondary }]}
                >
                  No goals yet
                </Text>
                <Text
                  style={[styles.emptyHint, { color: colors.text.tertiary }]}
                >
                  Tap + to create your first savings goal
                </Text>
              </View>
            ) : (
              <View
                style={[styles.goalsList, { paddingHorizontal: spacing.lg }]}
              >
                {filteredGoals.map(goal => (
                  <GoalCard
                    key={goal._id}
                    goal={goal}
                    onPress={() =>
                      (navigation as any).navigate('SavingsGoalDetails', {
                        goalId: goal._id,
                      })
                    }
                    onAddContribution={() => openContrib(goal)}
                    onDelete={() => handleDelete(goal)}
                    colors={colors}
                    borderRadius={borderRadius}
                  />
                ))}
                <Text
                  style={[
                    styles.longPressHint,
                    { color: colors.text.tertiary },
                  ]}
                >
                  Long press to delete a goal
                </Text>
              </View>
            )}

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>

      {/* ── Initial Balance Modal ── */}
      <Modal
        visible={balanceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setBalanceModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View
            style={[styles.modalSheet, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Initial Savings Balance
              </Text>
              <TouchableOpacity onPress={() => setBalanceModal(false)}>
                <Icon name="close" size={22} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalHint, { color: colors.text.secondary }]}>
              Money you saved before using this app
            </Text>
            <View
              style={[
                styles.amountInput,
                { borderColor: '#22C55E', backgroundColor: colors.background },
              ]}
            >
              <Text
                style={[styles.currencySign, { color: colors.text.secondary }]}
              >
                ৳
              </Text>
              <TextInput
                style={[styles.amountField, { color: colors.text.primary }]}
                value={balanceInput}
                onChangeText={setBalanceInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.text.tertiary}
                autoFocus
              />
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: '#22C55E' }]}
              onPress={saveBalance}
            >
              <Text style={styles.saveBtnText}>
                {setAccountMutation.isPending ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Quick Contribute Modal ── */}
      <Modal
        visible={contribModal}
        transparent
        animationType="slide"
        onRequestClose={() => setContribModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View
            style={[styles.modalSheet, { backgroundColor: colors.surface }]}
          >
            {contribGoal && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.contribTitleRow}>
                    <View
                      style={[
                        styles.contribIcon,
                        { backgroundColor: `${contribGoal.color}18` },
                      ]}
                    >
                      <Icon
                        name={contribGoal.icon}
                        size={20}
                        color={contribGoal.color}
                      />
                    </View>
                    <Text
                      style={[
                        styles.modalTitle,
                        { color: colors.text.primary },
                      ]}
                    >
                      {contribGoal.title}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setContribModal(false)}>
                    <Icon
                      name="close"
                      size={22}
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.contribProgress,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Text
                    style={[
                      styles.contribProgressText,
                      { color: colors.text.secondary },
                    ]}
                  >
                    {formatCurrency(contribGoal.currentAmount)} /{' '}
                    {formatCurrency(contribGoal.targetAmount)}
                  </Text>
                  <View
                    style={[
                      styles.contribProgressTrack,
                      { backgroundColor: `${contribGoal.color}20` },
                    ]}
                  >
                    <View
                      style={[
                        styles.contribProgressFill,
                        {
                          width: `${Math.min(contribGoal.progress ?? 0, 100)}%`,
                          backgroundColor: contribGoal.color,
                        },
                      ]}
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.amountInput,
                    {
                      borderColor: contribGoal.color,
                      backgroundColor: colors.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.currencySign,
                      { color: colors.text.secondary },
                    ]}
                  >
                    ৳
                  </Text>
                  <TextInput
                    style={[styles.amountField, { color: colors.text.primary }]}
                    value={contribInput}
                    onChangeText={setContribInput}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.text.tertiary}
                    autoFocus
                  />
                </View>

                <TextInput
                  style={[
                    styles.noteInput,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text.primary,
                    },
                  ]}
                  value={contribNote}
                  onChangeText={setContribNote}
                  placeholder="Add a note (optional)"
                  placeholderTextColor={colors.text.tertiary}
                />

                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    { backgroundColor: contribGoal.color },
                  ]}
                  onPress={saveContrib}
                >
                  <Text style={styles.saveBtnText}>
                    {addContribMutation.isPending
                      ? 'Saving...'
                      : 'Add Contribution'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  tabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 8 },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: { fontSize: 14, fontWeight: '600' },

  heroCard: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 20,
    padding: 20,
  },
  heroLabel: { color: '#FFFFFF99', fontSize: 13, marginBottom: 4 },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 16,
  },
  heroBreakdown: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF20',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  heroBreakdownItem: { flex: 1, alignItems: 'center' },
  heroBreakdownVal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  heroBreakdownLabel: { color: '#FFFFFF80', fontSize: 11 },
  heroDivider: { width: 1, backgroundColor: '#FFFFFF30' },
  setInitialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF25',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  setInitialText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 20,
  },
  monthBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthLabel: { fontSize: 16, fontWeight: '700' },

  monthlyCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  monthlyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  monthlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  monthlyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthlyLabel: { flex: 1, fontSize: 14 },
  monthlyAmt: { fontSize: 15, fontWeight: '700' },
  monthlySeparator: { height: 1, marginBottom: 12 },
  couldSaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  couldSaveText: { flex: 1, fontSize: 12, color: '#F59E0B' },

  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  historyMonthBadge: {
    width: 42,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  historyMonthText: { fontSize: 12, fontWeight: '700' },
  historyYearText: { fontSize: 10, marginTop: 1 },
  historyMidCol: { flex: 1, gap: 5 },
  historyIncExp: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  historySmall: { fontSize: 11 },
  historyBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  historyBarFill: { height: 4, borderRadius: 2 },
  historyRight: { alignItems: 'flex-end', minWidth: 80 },
  historySaved: { fontSize: 14, fontWeight: '800' },
  historyBalance: { fontSize: 11, marginTop: 2 },

  previewSection: { paddingHorizontal: 20, marginBottom: 8 },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewTitle: { fontSize: 16, fontWeight: '700' },
  previewSeeAll: { fontSize: 13, fontWeight: '600' },

  goalFilterBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  goalFilterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  goalFilterText: { fontSize: 13, fontWeight: '600' },

  goalsList: { gap: 10 },
  longPressHint: { textAlign: 'center', fontSize: 12, marginTop: 8 },

  goalCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 0,
  },
  goalTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  goalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalMeta: { flex: 1 },
  goalTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  goalBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priorityText: { fontSize: 11, fontWeight: '700' },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  completedText: { fontSize: 11, fontWeight: '700' },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  deadlineText: { fontSize: 11, fontWeight: '600' },
  addContribBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalProgress: {},
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressAmounts: { fontSize: 13 },
  progressPct: { fontSize: 13, fontWeight: '800' },

  emptyWrap: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '600' },
  emptyHint: { fontSize: 13 },

  addGoalBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000055',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', flex: 1 },
  modalHint: { fontSize: 13, marginBottom: 16 },
  contribTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  contribIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contribProgress: { padding: 12, borderRadius: 12, marginBottom: 14 },
  contribProgressText: { fontSize: 13, marginBottom: 8, textAlign: 'center' },
  contribProgressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  contribProgressFill: { height: '100%', borderRadius: 3 },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 56,
  },
  currencySign: { fontSize: 22, fontWeight: '700', marginRight: 6 },
  amountField: { flex: 1, fontSize: 26, fontWeight: '800' },
  noteInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  saveBtn: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

export default SavingsGoalsScreen;
