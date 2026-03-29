/**
 * Budget Screen — Monthly View
 *
 * - Month navigator
 * - Total monthly budget hero card (set / edit)
 * - Filter: All / Exceeded / Warning / Safe / Unbudgeted
 * - Category rows: budgeted show progress bar, unbudgeted show % of total
 * - Tap any category to set / update this month's budget
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Modal, TextInput, KeyboardAvoidingView,
  Platform, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../hooks/useTheme';
import { useBudgetSummary, useSetTotalBudget, useSetCategoryMonthlyBudget } from '../../../hooks/api/useBudget';
import { formatCurrency } from '../../../utils/formatters';
import { AppHeader, useGuide } from '../../../components/common';
import { BudgetSkeleton } from '../../../components/common/Loading/ScreenSkeletons';
import type { BudgetStatus } from '../../../api/endpoints/budget';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

type Filter = 'all' | 'exceeded' | 'warning' | 'safe' | 'unbudgeted';

const FILTERS: { key: Filter; label: string; icon: string }[] = [
  { key: 'all',        label: 'All',       icon: 'apps-outline' },
  { key: 'exceeded',   label: 'Exceeded',  icon: 'alert-circle-outline' },
  { key: 'warning',    label: 'Warning',   icon: 'warning-outline' },
  { key: 'safe',       label: 'Safe',      icon: 'checkmark-circle-outline' },
  { key: 'unbudgeted', label: 'No Budget', icon: 'remove-circle-outline' },
];

const STATUS_COLORS = {
  exceeded:   '#C75050',
  warning:    '#C48A4A',
  safe:       '#4A9B6E',
  unbudgeted: '#8B95A5',
};

// ─── Category Row ─────────────────────────────────────────────────────────────

const CategoryBudgetRow = ({
  item, onPress, colors, borderRadius,
}: { item: BudgetStatus; onPress: () => void; colors: any; borderRadius: any }) => {
  const hasBudget   = item.budget !== null;
  const statusColor = STATUS_COLORS[item.status] ?? '#94A3B8';
  const barPct      = hasBudget
    ? Math.min(item.percentage ?? 0, 100)
    : Math.min(item.percentageOfTotal, 100);

  return (
    <TouchableOpacity
      style={[styles.catRow, {
        backgroundColor: colors.surface,
        borderColor:     colors.border,
      }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.catIconWrap, { backgroundColor: `${item.categoryColor}15` }]}>
        <Icon name={item.categoryIcon} size={16} color={item.categoryColor} />
      </View>

      <View style={styles.catInfo}>
        <View style={styles.catTopRow}>
          <Text style={[styles.catName, { color: colors.text.primary }]} numberOfLines={1}>
            {item.categoryName}
          </Text>
          <View style={styles.catAmounts}>
            <Text style={[styles.catSpent, { color: colors.text.primary }]}>
              {formatCurrency(item.spent)}
            </Text>
            {hasBudget && (
              <Text style={[styles.catBudgetAmt, { color: colors.text.tertiary }]}>
                /{formatCurrency(item.budget!)}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: `${statusColor}20` }]}>
          <View style={[styles.progressFill, { width: `${barPct}%`, backgroundColor: statusColor }]} />
        </View>

        <View style={styles.catBottomRow}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {hasBudget
              ? `${item.status === 'exceeded' ? 'Exceeded' : item.status === 'warning' ? 'Near limit' : 'On track'} · ${item.percentage?.toFixed(0)}%`
              : `No budget · ${item.percentageOfTotal.toFixed(0)}% of total`}
          </Text>
          {item.isOverride && (
            <Text style={styles.overrideText}>This month</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const BudgetScreen: React.FC = () => {
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();
  const { GuideButton, GuideView } = useGuide('budget');

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear,  setSelectedYear]  = useState(now.getFullYear());
  const [filter, setFilter]               = useState<Filter>('all');

  const [totalModal,    setTotalModal]    = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [editCategory,  setEditCategory]  = useState<BudgetStatus | null>(null);
  const [inputValue,    setInputValue]    = useState('');

  const { data: summaryData, isLoading, refetch, isRefetching } =
    useBudgetSummary(selectedYear, selectedMonth);
  const setTotalMutation    = useSetTotalBudget();
  const setCategoryMutation = useSetCategoryMonthlyBudget();

  const summary = (summaryData as any)?.data ?? summaryData;

  const isCurrentMonth = selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();

  const goToPrev = () => {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const goToNext = () => {
    if (isCurrentMonth) return;
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  const cats: BudgetStatus[] = summary?.categories ?? [];

  const counts = useMemo(() => ({
    exceeded:   cats.filter(c => c.status === 'exceeded').length,
    warning:    cats.filter(c => c.status === 'warning').length,
    safe:       cats.filter(c => c.status === 'safe').length,
    unbudgeted: cats.filter(c => c.status === 'unbudgeted').length,
  }), [cats]);

  const filteredCats = useMemo(() =>
    filter === 'all' ? cats : cats.filter(c => c.status === filter),
    [cats, filter]
  );

  // Total budget modal
  const openTotalModal = () => {
    setInputValue(summary?.totalBudget != null ? String(summary.totalBudget) : '');
    setTotalModal(true);
  };
  const saveTotalBudget = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val < 0) { Alert.alert('Invalid amount'); return; }
    setTotalMutation.mutate(
      { year: selectedYear, month: selectedMonth, totalBudget: val },
      { onSuccess: () => setTotalModal(false) }
    );
  };
  const removeTotalBudget = () =>
    Alert.alert('Remove Budget', 'Remove total budget for this month?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () =>
          setTotalMutation.mutate(
            { year: selectedYear, month: selectedMonth, totalBudget: null },
            { onSuccess: () => setTotalModal(false) }
          )
      },
    ]);

  // Category budget modal
  const openCategoryModal = (cat: BudgetStatus) => {
    setEditCategory(cat);
    setInputValue(cat.budget != null ? String(cat.budget) : '');
    setCategoryModal(true);
  };
  const saveCategoryBudget = () => {
    if (!editCategory) return;
    const val = parseFloat(inputValue);
    if (isNaN(val) || val < 0) { Alert.alert('Invalid amount'); return; }
    setCategoryMutation.mutate(
      { categoryId: editCategory.categoryId, year: selectedYear, month: selectedMonth, budget: val },
      { onSuccess: () => setCategoryModal(false) }
    );
  };
  const removeCategoryBudget = () => {
    if (!editCategory) return;
    Alert.alert('Remove Budget', `Remove budget for ${editCategory.categoryName} this month?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () =>
          setCategoryMutation.mutate(
            { categoryId: editCategory.categoryId, year: selectedYear, month: selectedMonth, budget: null },
            { onSuccess: () => setCategoryModal(false) }
          )
      },
    ]);
  };

  const totalBudget  = summary?.totalBudget ?? null;
  const totalSpent   = summary?.totalSpent  ?? 0;
  const overallPct   = summary?.overallPercentage ?? null;
  const heroColor    = overallPct == null ? colors.primary
    : overallPct >= 100 ? '#EF4444'
    : overallPct >= 80  ? '#F97316'
    : '#22C55E';

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Budget" />
        <BudgetSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Budget" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch}
            colors={[colors.primary]} tintColor={colors.primary} />
        }
      >
        {/* Month Nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPrev}
            style={[styles.monthBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Icon name="chevron-back" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.monthLabel, { color: colors.text.primary }]}>
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </Text>
          <TouchableOpacity onPress={goToNext}
            style={[styles.monthBtn, { backgroundColor: colors.surface, borderColor: colors.border },
              isCurrentMonth && { opacity: 0.3 }]}>
            <Icon name="chevron-forward" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

            {/* Hero Card */}
            <LinearGradient
              colors={[heroColor, `${heroColor}CC`]}
              style={[styles.heroCard, shadows.md]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroTop}>
                <View>
                  <Text style={styles.heroLabel}>Total Monthly Budget</Text>
                  {totalBudget != null
                    ? <Text style={styles.heroBudget}>{formatCurrency(totalBudget)}</Text>
                    : <Text style={styles.heroNoBudget}>Not set</Text>
                  }
                </View>
                <TouchableOpacity style={styles.editBudgetBtn} onPress={openTotalModal}>
                  <Icon name={totalBudget != null ? 'create-outline' : 'add'} size={18} color="#FFFFFF" />
                  <Text style={styles.editBudgetText}>{totalBudget != null ? 'Edit' : 'Set Budget'}</Text>
                </TouchableOpacity>
              </View>

              {totalBudget != null && (
                <View style={styles.heroBarTrack}>
                  <View style={[styles.heroBarFill, { width: `${Math.min(overallPct ?? 0, 100)}%` }]} />
                </View>
              )}

              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatVal}>{formatCurrency(totalSpent)}</Text>
                  <Text style={styles.heroStatLabel}>Spent</Text>
                </View>
                {summary?.totalRemaining != null && (
                  <>
                    <View style={styles.heroDivider} />
                    <View style={styles.heroStat}>
                      <Text style={styles.heroStatVal}>{formatCurrency(Math.max(summary.totalRemaining, 0))}</Text>
                      <Text style={styles.heroStatLabel}>Remaining</Text>
                    </View>
                  </>
                )}
                {overallPct != null && (
                  <>
                    <View style={styles.heroDivider} />
                    <View style={styles.heroStat}>
                      <Text style={styles.heroStatVal}>{overallPct.toFixed(1)}%</Text>
                      <Text style={styles.heroStatLabel}>Used</Text>
                    </View>
                  </>
                )}
                {counts.exceeded > 0 && (
                  <>
                    <View style={styles.heroDivider} />
                    <View style={styles.heroStat}>
                      <Text style={[styles.heroStatVal, { color: '#FCA5A5' }]}>{counts.exceeded}</Text>
                      <Text style={styles.heroStatLabel}>Over limit</Text>
                    </View>
                  </>
                )}
              </View>
            </LinearGradient>

            {/* Filters */}
            {cats.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
                {FILTERS.map(f => {
                  const count = f.key === 'all' ? cats.length : counts[f.key as keyof typeof counts];
                  const isActive = filter === f.key;
                  const fc = f.key === 'exceeded' ? STATUS_COLORS.exceeded
                    : f.key === 'warning'    ? STATUS_COLORS.warning
                    : f.key === 'safe'       ? STATUS_COLORS.safe
                    : f.key === 'unbudgeted' ? STATUS_COLORS.unbudgeted
                    : colors.primary;
                  return (
                    <TouchableOpacity key={f.key}
                      style={[styles.filterChip,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        isActive && { backgroundColor: fc, borderColor: fc }]}
                      onPress={() => setFilter(f.key)}>
                      <Icon name={f.icon} size={13} color={isActive ? '#FFFFFF' : fc} />
                      <Text style={[styles.filterText, { color: isActive ? '#FFFFFF' : colors.text.secondary }]}>
                        {f.label}
                      </Text>
                      {count > 0 && (
                        <View style={[styles.filterBadge,
                          { backgroundColor: isActive ? '#FFFFFF30' : `${fc}20` }]}>
                          <Text style={[styles.filterBadgeText,
                            { color: isActive ? '#FFFFFF' : fc }]}>{count}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Category List */}
            {filteredCats.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Icon name="wallet-outline" size={48} color={colors.text.tertiary} />
                <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                  {cats.length === 0 ? 'No expenses this month' : 'No categories match this filter'}
                </Text>
              </View>
            ) : (
              <View style={[styles.catList, { paddingHorizontal: spacing.lg }]}>
                {filteredCats.map(cat => (
                  <CategoryBudgetRow
                    key={cat.categoryId}
                    item={cat}
                    onPress={() => openCategoryModal(cat)}
                    colors={colors}
                    borderRadius={borderRadius}
                  />
                ))}
              </View>
            )}

            <View style={{ height: 40 }} />
      </ScrollView>


      {/* ── Total Budget Modal ── */}
      <Modal visible={totalModal} transparent animationType="slide" onRequestClose={() => setTotalModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear} — Total Budget
              </Text>
              <TouchableOpacity onPress={() => setTotalModal(false)}>
                <Icon name="close" size={22} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalHint, { color: colors.text.secondary }]}>
              Total spending cap for this month across all categories
            </Text>
            <View style={[styles.amountInput, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <Text style={[styles.currencySign, { color: colors.text.secondary }]}>৳</Text>
              <TextInput
                style={[styles.amountField, { color: colors.text.primary }]}
                value={inputValue} onChangeText={setInputValue}
                keyboardType="numeric" placeholder="0"
                placeholderTextColor={colors.text.tertiary} autoFocus
              />
            </View>
            <View style={styles.modalBtns}>
              {totalBudget != null && (
                <TouchableOpacity style={styles.removeBtn} onPress={removeTotalBudget}>
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={saveTotalBudget}>
                <Text style={styles.saveBtnText}>
                  {setTotalMutation.isPending ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Category Budget Modal ── */}
      <Modal visible={categoryModal} transparent animationType="slide" onRequestClose={() => setCategoryModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            {editCategory && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalCatTitleRow}>
                    <View style={[styles.modalCatIcon, { backgroundColor: `${editCategory.categoryColor}18` }]}>
                      <Icon name={editCategory.categoryIcon} size={20} color={editCategory.categoryColor} />
                    </View>
                    <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                      {editCategory.categoryName}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setCategoryModal(false)}>
                    <Icon name="close" size={22} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.modalHint, { color: colors.text.secondary }]}>
                  Budget for {MONTH_NAMES[selectedMonth - 1]} {selectedYear} only
                  {editCategory.budgetSource === 'default' && editCategory.budget != null
                    ? ` (default: ${formatCurrency(editCategory.budget)})`
                    : ''}
                </Text>

                {/* Spent info */}
                <View style={[styles.spentInfo, { backgroundColor: colors.background }]}>
                  <Text style={[styles.spentLabel, { color: colors.text.secondary }]}>Spent this month</Text>
                  <Text style={[styles.spentAmt, { color: colors.text.primary }]}>
                    {formatCurrency(editCategory.spent)}
                  </Text>
                </View>

                <View style={[styles.amountInput, { borderColor: editCategory.categoryColor, backgroundColor: colors.background }]}>
                  <Text style={[styles.currencySign, { color: colors.text.secondary }]}>৳</Text>
                  <TextInput
                    style={[styles.amountField, { color: colors.text.primary }]}
                    value={inputValue} onChangeText={setInputValue}
                    keyboardType="numeric" placeholder="0"
                    placeholderTextColor={colors.text.tertiary} autoFocus
                  />
                </View>
                <View style={styles.modalBtns}>
                  {editCategory.budget != null && editCategory.isOverride && (
                    <TouchableOpacity style={styles.removeBtn} onPress={removeCategoryBudget}>
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: editCategory.categoryColor }]}
                    onPress={saveCategoryBudget}>
                    <Text style={styles.saveBtnText}>
                      {setCategoryMutation.isPending ? 'Saving...' : 'Set for This Month'}
                    </Text>
                  </TouchableOpacity>
                </View>
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

  monthNav:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 18 },
  monthBtn:   { width: 34, height: 34, borderRadius: 17, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  monthLabel: { fontSize: 15, fontWeight: '700' },

  heroCard:   { marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 16 },
  heroTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  heroLabel:  { color: '#FFFFFF99', fontSize: 11, marginBottom: 2 },
  heroBudget: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  heroNoBudget: { color: '#FFFFFF70', fontSize: 16, fontWeight: '600', fontStyle: 'italic' },
  editBudgetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFFFF25', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
  editBudgetText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  heroBarTrack: { height: 6, backgroundColor: '#FFFFFF30', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  heroBarFill:  { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 3 },
  heroStats:    { flexDirection: 'row', backgroundColor: '#FFFFFF20', borderRadius: 10, padding: 10 },
  heroStat:     { flex: 1, alignItems: 'center' },
  heroStatVal:  { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginBottom: 1 },
  heroStatLabel: { color: '#FFFFFF80', fontSize: 10 },
  heroDivider:  { width: 1, backgroundColor: '#FFFFFF30' },

  filterScroll: { marginBottom: 6 },
  filterRow:    { paddingHorizontal: 16, gap: 6, height: 44, alignItems: 'center' },
  filterChip:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, height: 32, borderRadius: 16, borderWidth: 1 },
  filterText:   { fontSize: 11, fontWeight: '600' },
  filterBadge:  { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8 },
  filterBadgeText: { fontSize: 10, fontWeight: '700' },

  catList: { gap: 6 },
  catRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 10, gap: 10,
  },
  catIconWrap:  { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  catInfo:      { flex: 1 },
  catTopRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  catName:      { fontSize: 13, fontWeight: '600', flex: 1 },
  catAmounts:   { flexDirection: 'row', alignItems: 'baseline' },
  catSpent:     { fontSize: 13, fontWeight: '700' },
  catBudgetAmt: { fontSize: 11, fontWeight: '500' },
  progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 3 },
  catBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusText:   { fontSize: 11, fontWeight: '600' },
  overrideText: { fontSize: 10, fontWeight: '600', color: '#3B82F6' },

  emptyWrap:  { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText:  { fontSize: 13, fontWeight: '500' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000055' },
  modalSheet:   { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  modalCatTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalCatIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  modalTitle:   { fontSize: 16, fontWeight: '700' },
  modalHint:    { fontSize: 12, marginBottom: 14, color: '#94A3B8' },
  spentInfo:    { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderRadius: 10, marginBottom: 12 },
  spentLabel:   { fontSize: 12 },
  spentAmt:     { fontSize: 12, fontWeight: '700' },
  amountInput:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, marginBottom: 14, height: 48 },
  currencySign: { fontSize: 20, fontWeight: '700', marginRight: 6 },
  amountField:  { flex: 1, fontSize: 22, fontWeight: '800' },
  modalBtns:    { flexDirection: 'row', gap: 10 },
  removeBtn:    { paddingHorizontal: 14, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  removeBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },
  saveBtn:      { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  saveBtnText:  { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});

export default BudgetScreen;
