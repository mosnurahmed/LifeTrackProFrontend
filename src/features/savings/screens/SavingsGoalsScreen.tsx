/**
 * Savings Screen — Overview + Goals tabs
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
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
import {
  useInvestments,
  useDeleteInvestment,
  useInvestmentStats,
} from '../../../hooks/api/useInvestments';
import { AppHeader, useGuide } from '../../../components/common';
import { SavingsSkeleton } from '../../../components/common/Loading/ScreenSkeletons';
import { useConfirm } from '../../../components/common/ConfirmModal';
import { formatCurrency } from '../../../utils/formatters';
import { usePrivacy } from '../../../store/privacyStore';
import type {
  SavingsGoal,
  MonthlyHistoryItem,
} from '../../../api/endpoints/savingsGoals';

const INV_TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  fd: { icon: 'business-outline', color: '#F97316', label: 'FD' },
  dps: { icon: 'repeat-outline', color: '#3B82F6', label: 'DPS' },
  sip: { icon: 'trending-up-outline', color: '#8B5CF6', label: 'SIP' },
  sanchayapatra: { icon: 'document-text-outline', color: '#10B981', label: 'Sanchayapatra' },
  bond: { icon: 'ribbon-outline', color: '#06B6D4', label: 'Bond' },
  insurance: { icon: 'shield-checkmark-outline', color: '#EF4444', label: 'Insurance' },
  custom: { icon: 'cube-outline', color: '#64748B', label: 'Custom' },
};

// ─── Investment Card ─────────────────────────────────────────────────────────

const InvestmentCard = ({
  inv,
  onPress,
  onDelete,
  isDark,
}: {
  inv: any;
  onPress: () => void;
  onDelete: () => void;
  isDark: boolean;
}) => {
  const { mask } = usePrivacy();
  const tc = INV_TYPE_CONFIG[inv.type] || INV_TYPE_CONFIG.custom;
  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const totalDeposited = inv.totalDeposited ?? 0;
  const maturityAmount = inv.maturityAmount ?? 0;
  const pct = maturityAmount > 0 ? Math.min((totalDeposited / maturityAmount) * 100, 100) : 0;

  // Tenure progress — recurring: by installments, lump sum: by time
  const startDate = inv.startDate ? new Date(inv.startDate) : null;
  const tenure = inv.tenure ?? 0;
  const paidInstallments = inv.isRecurring ? (inv.contributions?.length ?? 0) : 0;
  const elapsed = inv.isRecurring
    ? paidInstallments
    : startDate ? Math.max(0, (Date.now() - startDate.getTime()) / (30.44 * 86400000)) : 0;
  const tenurePct = tenure > 0 ? Math.min((elapsed / tenure) * 100, 100) : 0;

  return (
    <TouchableOpacity
      style={[styles.goalCard, { backgroundColor: surfaceC, borderColor: borderC }]}
      onPress={onPress}
      onLongPress={onDelete}
      activeOpacity={0.78}
    >
      <View style={styles.goalRow}>
        <View style={[styles.goalIconWrap, { backgroundColor: `${tc.color}10` }]}>
          <Icon name={tc.icon} size={16} color={tc.color} />
        </View>
        <View style={styles.goalMeta}>
          <View style={styles.goalTitleRow}>
            <Text style={[styles.goalTitle, { color: textPri }]} numberOfLines={1}>
              {inv.name}
            </Text>
            <View style={[styles.invTypeBadge, { backgroundColor: `${tc.color}15` }]}>
              <Text style={[styles.invTypeBadgeText, { color: tc.color }]}>{tc.label}</Text>
            </View>
          </View>

          {/* Tenure progress bar */}
          <View style={[styles.progressTrack, { backgroundColor: `${tc.color}12` }]}>
            <View style={[styles.progressFill, { width: `${tenurePct}%` as any, backgroundColor: tc.color }]} />
          </View>

          <View style={styles.goalBottom}>
            <Text style={[styles.progressAmt, { color: textSec }]}>
              {mask(formatCurrency(totalDeposited))}
              <Text style={{ color: isDark ? '#475569' : '#CBD5E1' }}>
                {' / '}{mask(formatCurrency(maturityAmount))}
              </Text>
            </Text>
            <View style={styles.goalTags}>
              {inv.interestRate > 0 && (
                <Text style={[styles.tagText, { color: '#22C55E' }]}>{inv.interestRate}%</Text>
              )}
              {inv.isClosed && (
                <Icon name="checkmark-circle" size={13} color="#22C55E" />
              )}
              {!inv.isClosed && (
                <Text style={[styles.progressPct, { color: tc.color }]}>{pct.toFixed(0)}%</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// ─── Goal Card ────────────────────────────────────────────────────────────────

const GoalCard = ({
  goal,
  onPress,
  onAddContribution,
  onDelete,
  isDark,
}: {
  goal: SavingsGoal;
  onPress: () => void;
  onAddContribution: () => void;
  onDelete: () => void;
  isDark: boolean;
}) => {
  const { mask } = usePrivacy();
  const pct = Math.min(goal.progress ?? 0, 100);
  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const daysLeft = goal.targetDate
    ? Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <TouchableOpacity
      style={[
        styles.goalCard,
        { backgroundColor: surfaceC, borderColor: borderC },
      ]}
      onPress={onPress}
      onLongPress={onDelete}
      activeOpacity={0.78}
    >
      <View style={styles.goalRow}>
        {/* Icon */}
        <View
          style={[styles.goalIconWrap, { backgroundColor: `${goal.color}10` }]}
        >
          <Icon name={goal.icon} size={16} color={goal.color} />
        </View>

        {/* Info */}
        <View style={styles.goalMeta}>
          <View style={styles.goalTitleRow}>
            <Text
              style={[styles.goalTitle, { color: textPri }]}
              numberOfLines={1}
            >
              {goal.title}
            </Text>
            {goal.isCompleted ? (
              <Icon name="checkmark-circle" size={13} color="#22C55E" />
            ) : (
              !goal.isCompleted && (
                <TouchableOpacity
                  style={[
                    styles.addContribBtn,
                    { backgroundColor: `${goal.color}10` },
                  ]}
                  onPress={onAddContribution}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="add" size={14} color={goal.color} />
                </TouchableOpacity>
              )
            )}
          </View>

          {/* Thin progress bar */}
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: `${goal.color}12` },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${pct}%` as any, backgroundColor: goal.color },
              ]}
            />
          </View>

          <View style={styles.goalBottom}>
            <Text style={[styles.progressAmt, { color: textSec }]}>
              {mask(formatCurrency(goal.currentAmount))}
              <Text style={{ color: isDark ? '#475569' : '#CBD5E1' }}>
                {' / '}
                {mask(formatCurrency(goal.targetAmount))}
              </Text>
            </Text>
            <View style={styles.goalTags}>
              {daysLeft !== null && !goal.isCompleted && (
                <Text
                  style={[
                    styles.tagText,
                    { color: daysLeft < 30 ? '#EF4444' : textSec },
                  ]}
                >
                  {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                </Text>
              )}
              <Text style={[styles.progressPct, { color: goal.color }]}>
                {pct.toFixed(0)}%
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const SavingsGoalsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { GuideButton, GuideView } = useGuide('savings');
  const { isHidden, toggle: togglePrivacy, mask } = usePrivacy();

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const now = new Date();
  const [tab, setTab] = useState<'overview' | 'goals' | 'investments'>('overview');
  const [goalFilter, setGoalFilter] = useState<'active' | 'completed' | 'all'>(
    'active',
  );
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Modals
  const [balanceModal, setBalanceModal] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');
  const [contribModal, setContribModal] = useState(false);
  const [contribGoal, setContribGoal] = useState<SavingsGoal | null>(null);
  const [contribInput, setContribInput] = useState('');
  const [contribNote, setContribNote] = useState('');
  const { confirm } = useConfirm();

  const { data: goalsData, isLoading, refetch, isRefetching } = useSavingsGoals();
  const { data: stats } = useSavingsStats(selectedYear, selectedMonth);
  const setAccountMutation = useSetSavingsAccount();
  const addContribMutation = useAddContribution();
  const deleteMutation = useDeleteSavingsGoal();

  // Investments
  const { data: investments = [], isLoading: invLoading, refetch: invRefetch, isRefetching: invRefetching } = useInvestments();
  const { data: invStats } = useInvestmentStats();
  const deleteInvMutation = useDeleteInvestment();

  const handleDeleteInvestment = async (inv: any) => {
    const ok = await confirm({
      title: 'Delete Investment',
      message: `Delete "${inv.name}"?`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) deleteInvMutation.mutate(inv._id);
  };

  const allGoals: SavingsGoal[] = useMemo(
    () => (goalsData as any)?.data?.data ?? [],
    [goalsData],
  );

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

  const handleDelete = async (goal: SavingsGoal) => {
    const ok = await confirm({
      title: 'Delete Goal',
      message: `Delete "${goal.title}"?`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) deleteMutation.mutate(goal._id);
  };

  const openContrib = (goal: SavingsGoal) => {
    setContribGoal(goal);
    setContribInput('');
    setContribNote('');
    setContribModal(true);
  };

  const saveContrib = () => {
    if (!contribGoal) return;
    const val = parseFloat(contribInput);
    if (isNaN(val) || val <= 0) return;
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
    if (isNaN(val) || val < 0) return;
    setAccountMutation.mutate(val, { onSuccess: () => setBalanceModal(false) });
  };

  // Stats values
  const totalBalance = stats?.totalBalance ?? 0;
  const initialBalance = stats?.initialBalance ?? 0;
  const allTimeSurplus = stats?.allTimeSurplus ?? 0;
  const thisMonthIncome = stats?.thisMonthIncome ?? 0;
  const thisMonthExp = stats?.thisMonthExpenses ?? 0;
  const surplus = stats?.thisMonthSurplus ?? 0;
  const thisMonthSaved = stats?.thisMonthSaved ?? 0;
  const surplusColor = surplus >= 0 ? '#22C55E' : '#EF4444';
  const monthlyHistory: MonthlyHistoryItem[] = stats?.monthlyHistory ?? [];
  const activeCount = allGoals.filter(g => !g.isCompleted).length;
  const completedCount = allGoals.filter(g => g.isCompleted).length;

  const statsNavTarget = tab === 'investments' ? 'InvestmentStats' : 'SavingsGoalsStats';

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader
          title="Savings"
          right={
            <TouchableOpacity
              style={[styles.statsBtn, { backgroundColor: '#22C55E12' }]}
              onPress={() => (navigation as any).navigate(statsNavTarget)}
            >
              <Icon name="stats-chart-outline" size={20} color="#22C55E" />
            </TouchableOpacity>
          }
        />
        <SavingsSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Savings"
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity onPress={togglePrivacy} style={{ padding: 4 }}>
              <Icon name={isHidden ? 'eye-off-outline' : 'eye-outline'} size={18} color={textSec} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statsBtn, { backgroundColor: '#22C55E12' }]}
              onPress={() => (navigation as any).navigate(statsNavTarget)}
            >
              <Icon name="stats-chart-outline" size={20} color="#22C55E" />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Tab Bar */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: surfaceC, borderBottomColor: borderC },
        ]}
      >
        {(['overview', 'goals', 'investments'] as const).map(t => {
          const tabIcon = t === 'overview' ? 'wallet-outline' : t === 'goals' ? 'flag-outline' : 'trending-up-outline';
          const tabLabel = t === 'overview' ? 'Overview' : t === 'goals' ? `Goals (${activeCount})` : `Investments (${(investments as any[]).length})`;
          return (
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
                name={tabIcon}
                size={15}
                color={tab === t ? '#22C55E' : textSec}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: tab === t ? '#22C55E' : textSec },
                  tab === t && { fontWeight: '700' },
                ]}
              >
                {tabLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={tab === 'investments' ? invRefetching : isRefetching}
            onRefresh={tab === 'investments' ? invRefetch : refetch}
            colors={['#22C55E']}
            tintColor="#22C55E"
          />
        }
      >
        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <>
            {/* Hero Card */}
            <LinearGradient
              colors={['#16A34A', '#22C55E']}
              style={styles.heroCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.heroLabel}>Total Savings</Text>
              <Text style={styles.heroAmount}>
                {mask(formatCurrency(totalBalance))}
              </Text>

              <View style={styles.heroGrid}>
                <View style={styles.heroGridItem}>
                  <Text style={styles.heroGridVal}>
                    {mask(formatCurrency(initialBalance))}
                  </Text>
                  <Text style={styles.heroGridLabel}>Initial</Text>
                </View>
                <View style={styles.heroGridDivider} />
                <View style={styles.heroGridItem}>
                  <Text
                    style={[
                      styles.heroGridVal,
                      { color: allTimeSurplus >= 0 ? '#86EFAC' : '#FCA5A5' },
                    ]}
                  >
                    {allTimeSurplus >= 0 ? '+' : ''}
                    {mask(formatCurrency(allTimeSurplus))}
                  </Text>
                  <Text style={styles.heroGridLabel}>Net Saved</Text>
                </View>
                <View style={styles.heroGridDivider} />
                <View style={styles.heroGridItem}>
                  <Text style={styles.heroGridVal}>{allGoals.length}</Text>
                  <Text style={styles.heroGridLabel}>Goals</Text>
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
                  size={14}
                  color="#FFF"
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
                  { backgroundColor: surfaceC, borderColor: borderC },
                ]}
              >
                <Icon name="chevron-back" size={18} color={textPri} />
              </TouchableOpacity>
              <Text style={[styles.monthLabel, { color: textPri }]}>
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </Text>
              <TouchableOpacity
                onPress={goToNext}
                style={[
                  styles.monthBtn,
                  { backgroundColor: surfaceC, borderColor: borderC },
                  isCurrentMonth && { opacity: 0.3 },
                ]}
              >
                <Icon name="chevron-forward" size={18} color={textPri} />
              </TouchableOpacity>
            </View>

            {/* Monthly Analysis */}
            <View
              style={[
                styles.card,
                { backgroundColor: surfaceC, borderColor: borderC },
              ]}
            >
              <Text style={[styles.cardTitle, { color: textPri }]}>
                Monthly Analysis
              </Text>

              {[
                {
                  icon: 'trending-up',
                  color: '#22C55E',
                  label: 'Income',
                  val: thisMonthIncome,
                },
                {
                  icon: 'trending-down',
                  color: '#EF4444',
                  label: 'Expenses',
                  val: thisMonthExp,
                },
              ].map(r => (
                <View key={r.label} style={styles.analysisRow}>
                  <View
                    style={[
                      styles.analysisIcon,
                      { backgroundColor: `${r.color}12` },
                    ]}
                  >
                    <Icon name={r.icon} size={15} color={r.color} />
                  </View>
                  <Text style={[styles.analysisLabel, { color: textSec }]}>
                    {r.label}
                  </Text>
                  <Text style={[styles.analysisVal, { color: r.color }]}>
                    {mask(formatCurrency(r.val))}
                  </Text>
                </View>
              ))}

              <View style={[styles.divider, { backgroundColor: borderC }]} />

              <View style={styles.analysisRow}>
                <View
                  style={[
                    styles.analysisIcon,
                    { backgroundColor: `${surplusColor}12` },
                  ]}
                >
                  <Icon
                    name={surplus >= 0 ? 'checkmark-circle' : 'alert-circle'}
                    size={15}
                    color={surplusColor}
                  />
                </View>
                <Text style={[styles.analysisLabel, { color: textSec }]}>
                  {surplus >= 0 ? 'Surplus' : 'Deficit'}
                </Text>
                <Text
                  style={[
                    styles.analysisVal,
                    { color: surplusColor, fontWeight: '800' },
                  ]}
                >
                  {mask(formatCurrency(Math.abs(surplus)))}
                </Text>
              </View>

              <View style={styles.analysisRow}>
                <View
                  style={[
                    styles.analysisIcon,
                    { backgroundColor: '#3B82F612' },
                  ]}
                >
                  <Icon name="save-outline" size={15} color="#3B82F6" />
                </View>
                <Text style={[styles.analysisLabel, { color: textSec }]}>
                  Saved to Goals
                </Text>
                <Text style={[styles.analysisVal, { color: '#3B82F6' }]}>
                  {mask(formatCurrency(thisMonthSaved))}
                </Text>
              </View>

              {surplus > thisMonthSaved && (
                <View
                  style={[
                    styles.tipRow,
                    { backgroundColor: '#F59E0B10', borderColor: '#F59E0B25' },
                  ]}
                >
                  <Icon name="bulb-outline" size={13} color="#F59E0B" />
                  <Text style={styles.tipText}>
                    You could save{' '}
                    <Text style={{ fontWeight: '800', color: '#F59E0B' }}>
                      {mask(formatCurrency(surplus - thisMonthSaved))}
                    </Text>{' '}
                    more
                  </Text>
                </View>
              )}
            </View>

            {/* Savings History */}
            {monthlyHistory.length > 0 && (
              <View
                style={[
                  styles.card,
                  { backgroundColor: surfaceC, borderColor: borderC },
                ]}
              >
                <Text style={[styles.cardTitle, { color: textPri }]}>
                  Savings History
                </Text>
                {[...monthlyHistory].reverse().map((item, idx) => {
                  const isPos = item.saved >= 0;
                  const savedColor = isPos ? '#22C55E' : '#EF4444';
                  return (
                    <View key={`${item.year}-${item.month}`}>
                      {idx > 0 && (
                        <View
                          style={[styles.divider, { backgroundColor: borderC }]}
                        />
                      )}
                      <View style={styles.historyRow}>
                        <View
                          style={[
                            styles.historyBadge,
                            { backgroundColor: isDark ? '#334155' : '#F8FAFC' },
                          ]}
                        >
                          <Text
                            style={[styles.historyMonth, { color: textSec }]}
                          >
                            {MONTH_NAMES[item.month - 1]}
                          </Text>
                          <Text
                            style={[
                              styles.historyYear,
                              { color: isDark ? '#475569' : '#CBD5E1' },
                            ]}
                          >
                            {item.year}
                          </Text>
                        </View>
                        <View style={styles.historyMid}>
                          <View style={styles.historyIncExp}>
                            <Icon name="arrow-up" size={10} color="#22C55E" />
                            <Text
                              style={[styles.historySmall, { color: textSec }]}
                            >
                              {mask(formatCurrency(item.income))}
                            </Text>
                            <Icon
                              name="arrow-down"
                              size={10}
                              color="#EF4444"
                              style={{ marginLeft: 4 }}
                            />
                            <Text
                              style={[styles.historySmall, { color: textSec }]}
                            >
                              {mask(formatCurrency(item.expenses))}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.historyBar,
                              { backgroundColor: borderC },
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
                                  )}%` as any,
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
                            {mask(formatCurrency(item.saved))}
                          </Text>
                          <Text
                            style={[
                              styles.historyBal,
                              { color: isDark ? '#475569' : '#CBD5E1' },
                            ]}
                          >
                            {mask(formatCurrency(item.cumulativeBalance))}
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
                  <Text style={[styles.cardTitle, { color: textPri }]}>
                    Active Goals
                  </Text>
                  <TouchableOpacity onPress={() => setTab('goals')}>
                    <Text style={styles.seeAll}>See all →</Text>
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
                      isDark={isDark}
                    />
                  ))}
              </View>
            )}

            {/* Investment Overview */}
            {invStats && invStats.activeCount > 0 && (
              <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
                <View style={styles.previewHeader}>
                  <Text style={[styles.cardTitle, { color: textPri }]}>Investments</Text>
                  <TouchableOpacity onPress={() => setTab('investments')}>
                    <Text style={styles.seeAll}>See all →</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.invOverviewGrid}>
                  <View style={[styles.invOverviewCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                    <Text style={[styles.invOverviewLabel, { color: textSec }]}>Invested</Text>
                    <Text style={[styles.invOverviewVal, { color: colors.primary }]}>
                      {mask(formatCurrency(invStats.totalInvested))}
                    </Text>
                  </View>
                  <View style={[styles.invOverviewCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                    <Text style={[styles.invOverviewLabel, { color: textSec }]}>Maturity</Text>
                    <Text style={[styles.invOverviewVal, { color: textPri }]}>
                      {mask(formatCurrency(invStats.totalMaturityValue))}
                    </Text>
                  </View>
                  <View style={[styles.invOverviewCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                    <Text style={[styles.invOverviewLabel, { color: textSec }]}>Profit</Text>
                    <Text style={[styles.invOverviewVal, { color: '#22C55E' }]}>
                      +{mask(formatCurrency(invStats.expectedProfit))}
                    </Text>
                  </View>
                  <View style={[styles.invOverviewCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                    <Text style={[styles.invOverviewLabel, { color: textSec }]}>Active</Text>
                    <Text style={[styles.invOverviewVal, { color: textPri }]}>
                      {invStats.activeCount} plans
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {/* ── GOALS TAB ── */}
        {tab === 'goals' && (
          <>
            {/* Filter */}
            <View style={[styles.filterBar, { borderBottomColor: borderC }]}>
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
                      styles.filterTab,
                      isActive && {
                        borderBottomColor: '#22C55E',
                        borderBottomWidth: 2,
                      },
                    ]}
                    onPress={() => setGoalFilter(f)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        { color: isActive ? '#22C55E' : textSec },
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
                <Icon name="flag-outline" size={40} color={textSec} />
                <Text style={[styles.emptyTitle, { color: textPri }]}>
                  No goals yet
                </Text>
                <Text style={[styles.emptyHint, { color: textSec }]}>
                  Tap + to create your first savings goal
                </Text>
              </View>
            ) : (
              <View style={styles.goalsList}>
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
                    isDark={isDark}
                  />
                ))}
                <Text
                  style={[
                    styles.hint,
                    { color: isDark ? '#475569' : '#CBD5E1' },
                  ]}
                >
                  Long press to delete
                </Text>
              </View>
            )}
          </>
        )}

        {/* ── INVESTMENTS TAB ── */}
        {tab === 'investments' && (
          <>
            {(investments as any[]).length === 0 ? (
              <View style={styles.emptyWrap}>
                <Icon name="trending-up-outline" size={40} color={textSec} />
                <Text style={[styles.emptyTitle, { color: textPri }]}>
                  No investments yet
                </Text>
                <Text style={[styles.emptyHint, { color: textSec }]}>
                  Tap + to create your first investment
                </Text>
              </View>
            ) : (
              <View style={styles.goalsList}>
                {(investments as any[]).map((inv: any) => (
                  <InvestmentCard
                    key={inv._id}
                    inv={inv}
                    onPress={() =>
                      (navigation as any).navigate('InvestmentDetails', {
                        investmentId: inv._id,
                      })
                    }
                    onDelete={() => handleDeleteInvestment(inv)}
                    isDark={isDark}
                  />
                ))}
                <Text
                  style={[
                    styles.hint,
                    { color: isDark ? '#475569' : '#CBD5E1' },
                  ]}
                >
                  Long press to delete
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: '#22C55E' }]}
        onPress={() => {
          if (tab === 'investments') {
            (navigation as any).navigate('AddInvestment', { mode: 'create' });
          } else {
            (navigation as any).navigate('AddSavingsGoal', { mode: 'create' });
          }
        }}
        activeOpacity={0.8}
      >
        <Icon name="add" size={22} color="#FFFFFF" />
      </TouchableOpacity>

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
          <View style={[styles.modalSheet, { backgroundColor: surfaceC }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textPri }]}>
                Initial Savings Balance
              </Text>
              <TouchableOpacity onPress={() => setBalanceModal(false)}>
                <Icon name="close" size={20} color={textSec} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalHint, { color: textSec }]}>
              Money you saved before using this app
            </Text>
            <View
              style={[
                styles.amountInput,
                { borderColor: '#22C55E', backgroundColor: colors.background },
              ]}
            >
              <Text style={[styles.currencySign, { color: textSec }]}>৳</Text>
              <TextInput
                style={[styles.amountField, { color: textPri }]}
                value={balanceInput}
                onChangeText={setBalanceInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
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
          <View style={[styles.modalSheet, { backgroundColor: surfaceC }]}>
            {contribGoal && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.contribTitleRow}>
                    <View
                      style={[
                        styles.contribIcon,
                        { backgroundColor: `${contribGoal.color}15` },
                      ]}
                    >
                      <Icon
                        name={contribGoal.icon}
                        size={16}
                        color={contribGoal.color}
                      />
                    </View>
                    <Text style={[styles.modalTitle, { color: textPri }]}>
                      {contribGoal.title}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setContribModal(false)}>
                    <Icon name="close" size={20} color={textSec} />
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.contribProgress,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Text
                    style={[styles.contribProgressText, { color: textSec }]}
                  >
                    {mask(formatCurrency(contribGoal.currentAmount))} /{' '}
                    {mask(formatCurrency(contribGoal.targetAmount))}
                  </Text>
                  <View
                    style={[
                      styles.contribProgressTrack,
                      { backgroundColor: `${contribGoal.color}15` },
                    ]}
                  >
                    <View
                      style={[
                        styles.contribProgressFill,
                        {
                          width: `${Math.min(
                            contribGoal.progress ?? 0,
                            100,
                          )}%` as any,
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
                  <Text style={[styles.currencySign, { color: textSec }]}>
                    ৳
                  </Text>
                  <TextInput
                    style={[styles.amountField, { color: textPri }]}
                    value={contribInput}
                    onChangeText={setContribInput}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
                    autoFocus
                  />
                </View>

                <TextInput
                  style={[
                    styles.noteInput,
                    {
                      borderColor: borderC,
                      backgroundColor: colors.background,
                      color: textPri,
                    },
                  ]}
                  value={contribNote}
                  onChangeText={setContribNote}
                  placeholder="Add a note (optional)"
                  placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
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

  statsBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 8 },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: { fontSize: 13, fontWeight: '600' },

  heroCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
  },
  heroLabel: { color: '#FFFFFF90', fontSize: 12, marginBottom: 2 },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  heroGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF18',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  heroGridItem: { flex: 1, alignItems: 'center' },
  heroGridVal: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 1,
  },
  heroGridLabel: { color: '#FFFFFF70', fontSize: 10 },
  heroGridDivider: { width: 1, backgroundColor: '#FFFFFF25' },
  setInitialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  setInitialText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 16,
  },
  monthBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthLabel: { fontSize: 14, fontWeight: '700' },

  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },

  analysisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  analysisIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisLabel: { flex: 1, fontSize: 13 },
  analysisVal: { fontSize: 13, fontWeight: '700' },
  divider: { height: 1, marginBottom: 10 },

  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
  },
  tipText: { flex: 1, fontSize: 11, color: '#F59E0B' },

  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  historyBadge: {
    width: 38,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 6,
  },
  historyMonth: { fontSize: 11, fontWeight: '700' },
  historyYear: { fontSize: 9, marginTop: 1 },
  historyMid: { flex: 1, gap: 4 },
  historyIncExp: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  historySmall: { fontSize: 10 },
  historyBar: { height: 3, borderRadius: 2, overflow: 'hidden' },
  historyBarFill: { height: 3, borderRadius: 2 },
  historyRight: { alignItems: 'flex-end', minWidth: 70 },
  historySaved: { fontSize: 12, fontWeight: '800' },
  historyBal: { fontSize: 10, marginTop: 1 },

  previewSection: { paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seeAll: { fontSize: 12, fontWeight: '600', color: '#22C55E' },

  invOverviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  invOverviewCard: { width: '48%' as any, borderRadius: 10, padding: 10 },
  invOverviewLabel: { fontSize: 10, marginBottom: 3 },
  invOverviewVal: { fontSize: 14, fontWeight: '700' },

  filterBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterText: { fontSize: 12, fontWeight: '600' },

  goalsList: { paddingHorizontal: 16, gap: 8 },
  hint: { textAlign: 'center', fontSize: 11, marginTop: 6 },

  goalCard: { borderRadius: 10, borderWidth: 1, padding: 10 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalMeta: { flex: 1 },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  goalTitle: { fontSize: 13, fontWeight: '600', flex: 1, marginRight: 6 },
  goalBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  goalTags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagText: { fontSize: 10, fontWeight: '600' },
  addContribBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressAmt: { fontSize: 10 },
  progressPct: { fontSize: 10, fontWeight: '700' },

  invTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  invTypeBadgeText: { fontSize: 10, fontWeight: '700' },

  emptyWrap: { alignItems: 'center', paddingVertical: 50, gap: 8 },
  emptyTitle: { fontSize: 14, fontWeight: '600' },
  emptyHint: { fontSize: 12 },

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

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000055',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  modalHint: { fontSize: 12, marginBottom: 12 },
  contribTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  contribIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contribProgress: { padding: 10, borderRadius: 10, marginBottom: 12 },
  contribProgressText: { fontSize: 12, marginBottom: 6, textAlign: 'center' },
  contribProgressTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  contribProgressFill: { height: '100%', borderRadius: 3 },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    height: 48,
  },
  currencySign: { fontSize: 18, fontWeight: '700', marginRight: 4 },
  amountField: { flex: 1, fontSize: 22, fontWeight: '800' },
  noteInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 12,
  },
  saveBtn: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});

export default SavingsGoalsScreen;
