/**
 * Bazar Screen — Shopping Lists (Professional Minimal)
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useBazarLists, useDeleteList, useMonthlyBazarBudget, useSetMonthlyBazarBudget } from '../../../hooks/api/useBazar';
import { AppHeader, useConfirm, useGuide } from '../../../components/common';
import { BazarSkeleton } from '../../../components/common/Loading/ScreenSkeletons';
import { formatCurrency } from '../../../utils/formatters';

// ─── List Card ────────────────────────────────────────────────────────────────

const ListCard = ({
  item, onPress, onLongPress, colors, isDark,
}: {
  item: any; onPress: () => void; onLongPress: () => void; colors: any; isDark: boolean;
}) => {
  const pct = Math.min(item.completionPercentage ?? 0, 100);
  const spent = item.totalActualCost > 0
    ? item.totalActualCost
    : (item.items || [])
        .filter((i: any) => i.isPurchased)
        .reduce((s: number, i: any) => s + (i.actualPrice || 0), 0);
  const isOver = item.totalBudget && spent > item.totalBudget;
  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const borderC = isDark ? '#334155' : '#F1F5F9';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const accent = item.isCompleted ? '#4A9B6E' : colors.primary;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardTop}>
        <View style={[styles.cardIcon, { backgroundColor: accent + '15' }]}>
          <Icon name={item.isCompleted ? 'checkmark-circle' : 'cart-outline'} size={16} color={accent} />
        </View>
        <View style={styles.cardTitleWrap}>
          <Text style={[styles.cardTitle, { color: textPri }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.cardSub, { color: textSec }]} numberOfLines={1}>
            {item.completedItems}/{item.totalItems} items{item.description ? ` · ${item.description}` : ''}
          </Text>
        </View>
        <Text style={[styles.pctText, { color: accent }]}>
          {item.isCompleted ? 'Done' : `${Math.round(pct)}%`}
        </Text>
      </View>

      {/* Progress */}
      <View style={[styles.progressTrack, { backgroundColor: borderC }]}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: accent }]} />
      </View>

      {/* Budget row */}
      {item.totalBudget ? (
        <View style={styles.budgetRow}>
          <Text style={[styles.budgetText, { color: textSec }]}>
            Budget: <Text style={{ color: textPri, fontWeight: '700' }}>{formatCurrency(item.totalBudget)}</Text>
          </Text>
          <Text style={[styles.budgetText, { color: textSec }]}>
            Spent: <Text style={{ color: isOver ? '#C75050' : textPri, fontWeight: '700' }}>{formatCurrency(spent)}</Text>
          </Text>
        </View>
      ) : item.totalEstimatedCost > 0 ? (
        <Text style={[styles.estimateText, { color: textSec }]}>
          Est. {formatCurrency(item.totalEstimatedCost)}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const BazarScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { actionSheet, confirm } = useConfirm();
  const { GuideButton, GuideView } = useGuide('bazar');

  const now = new Date();
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const isCurrentMonth = selYear === now.getFullYear() && selMonth === now.getMonth();

  const goPrev = () => {
    if (selMonth === 0) { setSelMonth(11); setSelYear(y => y - 1); }
    else setSelMonth(m => m - 1);
  };
  const goNext = () => {
    if (isCurrentMonth) return;
    if (selMonth === 11) { setSelMonth(0); setSelYear(y => y + 1); }
    else setSelMonth(m => m + 1);
  };

  const { data: listsData, isLoading, refetch, isRefetching } = useBazarLists();
  const deleteMutation = useDeleteList();
  const { data: monthlyBudget = 0 } = useMonthlyBazarBudget(selYear, selMonth + 1);
  const setBudgetMutation = useSetMonthlyBazarBudget();
  const [budgetModal, setBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  const allLists = listsData?.data?.data ?? [];

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  // Filter by selected month
  const monthLists = useMemo(() => {
    const mStart = new Date(selYear, selMonth, 1);
    const mEnd = new Date(selYear, selMonth + 1, 0, 23, 59, 59, 999);
    return allLists.filter((l: any) => {
      const d = new Date(l.createdAt);
      return d >= mStart && d <= mEnd;
    });
  }, [allLists, selYear, selMonth]);

  const monthStats = useMemo(() => {
    const active = monthLists.filter((l: any) => !l.isCompleted).length;
    const completed = monthLists.filter((l: any) => l.isCompleted).length;
    const totalSpent = monthLists.reduce((s: number, l: any) => {
      const spent = l.totalActualCost > 0 ? l.totalActualCost
        : (l.items || []).filter((i: any) => i.isPurchased).reduce((ss: number, i: any) => ss + (i.actualPrice || 0), 0);
      return s + spent;
    }, 0);
    const totalBudget = monthLists.reduce((s: number, l: any) => s + (l.totalBudget || 0), 0);
    return { total: monthLists.length, active, completed, totalSpent, totalBudget };
  }, [monthLists]);

  const handleLongPress = async (item: any) => {
    const result = await actionSheet({
      title: item.title,
      icon: 'cart-outline',
      actions: [
        { key: 'edit', label: 'Edit List', icon: 'create-outline' },
        { key: 'delete', label: 'Delete List', icon: 'trash-outline', variant: 'danger' },
      ],
    });
    if (result === 'edit') {
      (navigation as any).navigate('AddBazarList', { mode: 'edit', listId: item._id });
    } else if (result === 'delete') {
      const ok = await confirm({
        title: 'Delete List',
        message: `Delete "${item.title}"? This cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      });
      if (ok) deleteMutation.mutate(item._id);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Shopping Lists" showDrawer />
        <BazarSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Shopping Lists" showDrawer
        right={
          <TouchableOpacity
            style={[styles.statsBtn, { backgroundColor: `${colors.primary}12` }]}
            onPress={() => (navigation as any).navigate('BazarStats')}
          >
            <Icon name="stats-chart-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      {/* Month Navigator */}
      <View style={[styles.monthNav, { borderBottomColor: borderC }]}>
        <TouchableOpacity style={[styles.monthBtn, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]} onPress={goPrev}>
          <Icon name="chevron-back" size={18} color={textPri} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: textPri }]}>
          {MONTHS[selMonth]} {selYear}
        </Text>
        <TouchableOpacity
          style={[styles.monthBtn, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }, isCurrentMonth && { opacity: 0.3 }]}
          onPress={goNext} disabled={isCurrentMonth}
        >
          <Icon name="chevron-forward" size={18} color={textPri} />
        </TouchableOpacity>
      </View>

      {/* Monthly Overview */}
      <View style={[styles.overviewCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
        <View style={styles.overviewRow}>
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewVal, { color: textPri }]}>{monthStats.total}</Text>
            <Text style={[styles.overviewLabel, { color: textSec }]}>Lists</Text>
          </View>
          <View style={[styles.overviewDivider, { backgroundColor: borderC }]} />
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewVal, { color: '#10B981' }]}>{monthStats.completed}</Text>
            <Text style={[styles.overviewLabel, { color: textSec }]}>Done</Text>
          </View>
          <View style={[styles.overviewDivider, { backgroundColor: borderC }]} />
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewVal, { color: colors.primary }]}>{monthStats.active}</Text>
            <Text style={[styles.overviewLabel, { color: textSec }]}>Active</Text>
          </View>
        </View>

        {/* Spending vs Monthly Budget */}
        <View style={[styles.spendingRow, { borderTopColor: borderC }]}>
          <View>
            <Text style={[styles.spendLabel, { color: textSec }]}>Spent</Text>
            <Text style={[styles.spendVal, { color: monthlyBudget > 0 && monthStats.totalSpent > monthlyBudget ? '#EF4444' : textPri }]}>
              {formatCurrency(monthStats.totalSpent)}
            </Text>
          </View>
          <TouchableOpacity
            style={{ alignItems: 'flex-end' }}
            onPress={() => { setBudgetInput(monthlyBudget > 0 ? String(monthlyBudget) : ''); setBudgetModal(true); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.spendLabel, { color: textSec }]}>Monthly Budget</Text>
            {monthlyBudget > 0 ? (
              <Text style={[styles.spendVal, { color: '#10B981' }]}>{formatCurrency(monthlyBudget)}</Text>
            ) : (
              <Text style={[styles.setBudgetText, { color: colors.primary }]}>Set Budget</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Budget progress bar */}
        {monthlyBudget > 0 && (
          <>
            <View style={[styles.budgetBar, { backgroundColor: borderC }]}>
              <View style={[styles.budgetBarFill, {
                width: `${Math.min((monthStats.totalSpent / monthlyBudget) * 100, 100)}%` as any,
                backgroundColor: monthStats.totalSpent > monthlyBudget ? '#EF4444' : colors.primary,
              }]} />
            </View>
            <Text style={[styles.budgetPct, { color: monthStats.totalSpent > monthlyBudget ? '#EF4444' : textSec }]}>
              {Math.round((monthStats.totalSpent / monthlyBudget) * 100)}% of budget used · {formatCurrency(Math.max(monthlyBudget - monthStats.totalSpent, 0))} remaining
            </Text>
          </>
        )}
      </View>

      {/* List */}
      {monthLists.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIconWrap, { backgroundColor: `${colors.primary}12` }]}>
            <Icon name="cart-outline" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: textPri }]}>No lists in {MONTHS[selMonth]}</Text>
          <Text style={[styles.emptyHint, { color: textSec }]}>
            {isCurrentMonth ? 'Create your first list' : 'No shopping this month'}
          </Text>
          {isCurrentMonth && (
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => (navigation as any).navigate('AddBazarList', { mode: 'create' })}
            >
              <Icon name="add" size={16} color="#FFF" />
              <Text style={styles.emptyBtnText}>Create List</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={monthLists}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <ListCard
              item={item}
              onPress={() => (navigation as any).navigate('BazarListDetails', { listId: item._id })}
              onLongPress={() => handleLongPress(item)}
              colors={colors}
              isDark={isDark}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch}
              colors={[colors.primary]} tintColor={colors.primary} />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => (navigation as any).navigate('AddBazarList', { mode: 'create' })}
        activeOpacity={0.8}
      >
        <Icon name="add" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Monthly Budget Modal */}
      <Modal visible={budgetModal} transparent animationType="slide" onRequestClose={() => setBudgetModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalSheet, { backgroundColor: surfaceC }]}>
            <View style={[styles.modalHeader, { borderBottomColor: borderC }]}>
              <TouchableOpacity onPress={() => setBudgetModal(false)}>
                <Text style={[styles.modalCancel, { color: textSec }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: textPri }]}>{MONTHS[selMonth]} Budget</Text>
              <TouchableOpacity onPress={() => {
                const val = parseFloat(budgetInput) || 0;
                setBudgetMutation.mutate({ year: selYear, month: selMonth + 1, budget: val });
                setBudgetModal(false);
              }}>
                <Text style={[styles.modalDone, { color: colors.primary }]}>Save</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, { color: textSec }]}>Set monthly shopping budget</Text>
              <View style={[styles.modalInputWrap, { borderColor: borderC, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Text style={[styles.modalCurrency, { color: textSec }]}>৳</Text>
                <TextInput
                  style={[styles.modalInput, { color: textPri }]}
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
                  autoFocus
                />
              </View>
              {monthlyBudget > 0 && (
                <TouchableOpacity
                  style={styles.removeBudgetBtn}
                  onPress={() => {
                    setBudgetMutation.mutate({ year: selYear, month: selMonth + 1, budget: 0 });
                    setBudgetModal(false);
                  }}
                >
                  <Text style={styles.removeBudgetText}>Remove Budget</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  statsBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  fab: {
    position: 'absolute', bottom: 90, right: 20,
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },

  // Month nav
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  monthBtn: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  monthText: { fontSize: 15, fontWeight: '700' },

  // Overview
  overviewCard: { marginHorizontal: 16, marginTop: 12, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  overviewRow: { flexDirection: 'row', paddingVertical: 12 },
  overviewItem: { flex: 1, alignItems: 'center' },
  overviewVal: { fontSize: 18, fontWeight: '800', marginBottom: 1 },
  overviewLabel: { fontSize: 11 },
  overviewDivider: { width: 1, marginVertical: 4 },
  spendingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
  spendLabel: { fontSize: 10, marginBottom: 2 },
  spendVal: { fontSize: 14, fontWeight: '700' },
  setBudgetText: { fontSize: 13, fontWeight: '700' },
  budgetBar: { height: 4, borderRadius: 2, overflow: 'hidden', marginHorizontal: 14, marginBottom: 4 },
  budgetBarFill: { height: '100%', borderRadius: 2 },
  budgetPct: { fontSize: 10, textAlign: 'center', marginBottom: 12, paddingHorizontal: 14 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  modalCancel: { fontSize: 14 },
  modalTitle: { fontSize: 15, fontWeight: '700' },
  modalDone: { fontSize: 14, fontWeight: '700' },
  modalBody: { padding: 20 },
  modalLabel: { fontSize: 13, marginBottom: 12 },
  modalInputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 52 },
  modalCurrency: { fontSize: 18, fontWeight: '700', marginRight: 8 },
  modalInput: { flex: 1, fontSize: 22, fontWeight: '700' },
  removeBudgetBtn: { alignSelf: 'center', marginTop: 16 },
  removeBudgetText: { fontSize: 13, fontWeight: '600', color: '#EF4444' },

  listContent: { padding: 16, paddingBottom: 40 },

  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  cardTitleWrap: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardSub: { fontSize: 11, marginTop: 1 },
  pctText: { fontSize: 13, fontWeight: '700' },

  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 2 },

  budgetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetText: { fontSize: 12 },
  estimateText: { fontSize: 12 },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingHorizontal: 40 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptyHint: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, marginTop: 6 },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});

export default BazarScreen;
