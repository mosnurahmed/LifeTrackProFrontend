/**
 * Bazar Screen — Shopping Lists (Professional Minimal)
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useBazarLists, useDeleteList } from '../../../hooks/api/useBazar';
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

const BazarScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { actionSheet, confirm } = useConfirm();
  const { GuideButton, GuideView } = useGuide('bazar');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const { data: listsData, isLoading, refetch, isRefetching } = useBazarLists();
  const deleteMutation = useDeleteList();

  const allLists = listsData?.data?.data ?? [];

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const stats = useMemo(() => ({
    total:     allLists.length,
    active:    allLists.filter((l: any) => !l.isCompleted).length,
    completed: allLists.filter((l: any) =>  l.isCompleted).length,
  }), [allLists]);

  const filtered = useMemo(() => {
    if (filter === 'active')    return allLists.filter((l: any) => !l.isCompleted);
    if (filter === 'completed') return allLists.filter((l: any) =>  l.isCompleted);
    return allLists;
  }, [allLists, filter]);

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

      {/* Summary */}
      {allLists.length > 0 && (
        <View style={[styles.summaryRow, { borderBottomColor: borderC }]}>
          {[
            { label: 'Total', value: stats.total },
            { label: 'Active', value: stats.active },
            { label: 'Done', value: stats.completed },
          ].map((s, i) => (
            <View key={s.label} style={[styles.summaryItem, i < 2 && { borderRightWidth: 1, borderRightColor: borderC }]}>
              <Text style={[styles.summaryVal, { color: textPri }]}>{s.value}</Text>
              <Text style={[styles.summaryLabel, { color: textSec }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Filter */}
      {allLists.length > 0 && (
        <View style={[styles.filterBar, { borderBottomColor: borderC }]}>
          {(['all', 'active', 'completed'] as const).map(f => {
            const isActive = filter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, { color: isActive ? colors.primary : textSec }]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* List */}
      {allLists.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIconWrap, { backgroundColor: `${colors.primary}12` }]}>
            <Icon name="cart-outline" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: textPri }]}>No Shopping Lists</Text>
          <Text style={[styles.emptyHint, { color: textSec }]}>
            Create your first list to track shopping
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            onPress={() => (navigation as any).navigate('AddBazarList', { mode: 'create' })}
          >
            <Icon name="add" size={16} color="#FFF" />
            <Text style={styles.emptyBtnText}>Create List</Text>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Icon name="filter-outline" size={36} color={textSec} />
          <Text style={[styles.emptyTitle, { color: textSec }]}>No {filter} lists</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
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

  summaryRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 18, fontWeight: '800', marginBottom: 1 },
  summaryLabel: { fontSize: 11 },

  filterBar: { flexDirection: 'row', borderBottomWidth: 1 },
  filterTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  filterTabActive: { borderBottomColor: '#10B981' },
  filterText: { fontSize: 13, fontWeight: '600' },

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
