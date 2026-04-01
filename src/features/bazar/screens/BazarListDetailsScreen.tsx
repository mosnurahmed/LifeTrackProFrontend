/**
 * Bazar List Details Screen — Professional Minimal + Optimistic Toggle
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useBazarList, useToggleItem, useDeleteItem } from '../../../hooks/api/useBazar';
import { AppHeader, useConfirm } from '../../../components/common';
import { Spinner, ErrorState, useGuide } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

// ─── Item Row ─────────────────────────────────────────────────────────────────

const ItemRow = ({
  item, optimisticPurchased, onToggle, onLongPress, isDark,
}: {
  item: any; optimisticPurchased: boolean; onToggle: () => void; onLongPress: () => void; isDark: boolean;
}) => {
  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';
  const purchased = optimisticPurchased;

  return (
    <TouchableOpacity
      style={[styles.itemRow, { backgroundColor: surfaceC, borderColor: borderC, opacity: purchased ? 0.6 : 1 }]}
      onPress={onToggle}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, purchased
        ? { backgroundColor: '#4A9B6E', borderColor: '#4A9B6E' }
        : { borderColor: borderC }]}>
        {purchased && <Icon name="checkmark" size={13} color="#FFF" />}
      </View>

      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: textPri }, purchased && styles.itemStrike]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.itemMeta, { color: textSec }]} numberOfLines={1}>
          {item.quantity} {item.unit}{item.category ? ` · ${item.category}` : ''}
        </Text>
      </View>

      {item.actualPrice ? (
        <Text style={[styles.priceText, { color: textPri }]}>{formatCurrency(item.actualPrice)}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const BazarListDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const { confirm, actionSheet } = useConfirm();
  const { GuideButton, GuideView } = useGuide('bazarListDetails');
  const { listId } = (route.params as any) || {};

  const { data: listData, isLoading, error, refetch, isRefetching } = useBazarList(listId);
  const toggleMutation = useToggleItem();
  const deleteMutation = useDeleteItem();

  const list = (listData as any)?.data?.data ?? (listData as any)?.data ?? null;

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  // Optimistic toggle state
  const [optimisticToggles, setOptimisticToggles] = useState<Record<string, boolean>>({});

  const handleToggle = useCallback((itemId: string, currentState: boolean) => {
    // Instant UI flip
    setOptimisticToggles(prev => ({ ...prev, [itemId]: !currentState }));

    toggleMutation.mutate(
      { listId, itemId },
      {
        onError: () => {
          // Revert on failure
          setOptimisticToggles(prev => {
            const next = { ...prev };
            delete next[itemId];
            return next;
          });
        },
        onSuccess: () => {
          // Clear optimistic state once server confirms
          setOptimisticToggles(prev => {
            const next = { ...prev };
            delete next[itemId];
            return next;
          });
        },
      }
    );
  }, [listId, toggleMutation]);

  const handleItemLongPress = async (item: any) => {
    const result = await actionSheet({
      title: item.name,
      icon: 'bag-outline',
      actions: [
        { key: 'edit', label: 'Edit Item', icon: 'create-outline' },
        { key: 'delete', label: 'Delete Item', icon: 'trash-outline', variant: 'danger' },
      ],
    });
    if (result === 'edit') {
      (navigation as any).navigate('AddBazarItem', { listId, itemId: item._id, mode: 'edit' });
    } else if (result === 'delete') {
      const ok = await confirm({
        title: 'Delete Item',
        message: `Delete "${item.name}"?`,
        confirmText: 'Delete',
        variant: 'danger',
      });
      if (ok) deleteMutation.mutate({ listId, itemId: item._id });
    }
  };

  // Group items by date — newest first, with section headers
  const sections = useMemo(() => {
    if (!list?.items) return [];

    const now = new Date();
    const todayKey = now.toISOString().split('T')[0];
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    const getLabel = (key: string) => {
      if (key === todayKey) return 'Today';
      if (key === yesterdayKey) return 'Yesterday';
      const d = new Date(key + 'T00:00:00');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    // Sort items by purchasedAt or createdAt desc, then group
    const sorted = [...list.items].sort((a: any, b: any) => {
      const aDate = a.purchasedAt || a.createdAt || '';
      const bDate = b.purchasedAt || b.createdAt || '';
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

    const groups: Record<string, any[]> = {};
    sorted.forEach((item: any) => {
      const dateKey = (item.purchasedAt || item.createdAt || new Date().toISOString()).split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(dateKey => ({
        title: getLabel(dateKey),
        dateKey,
        data: groups[dateKey],
      }));
  }, [list?.items]);

  const pct = Math.min(list?.completionPercentage ?? 0, 100);

  if (isLoading) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="List" />
      <Spinner />
    </View>
  );

  if (error || !list) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="List" />
      <ErrorState title="List not found" message="Unable to load" onRetry={() => navigation.goBack()} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title={list.title}
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <GuideButton color={textPri} />
            <TouchableOpacity
              style={[styles.editBtn, { backgroundColor: colors.primary + '15' }]}
              onPress={() => (navigation as any).navigate('AddBazarList', { mode: 'edit', listId })}
            >
              <Icon name="create-outline" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      <SectionList
        sections={sections}
        keyExtractor={(item: any) => item._id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch}
            colors={[colors.primary]} tintColor={colors.primary} />
        }
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <>
            {/* Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
              {list.description && (
                <Text style={[styles.descText, { color: textSec }]} numberOfLines={2}>{list.description}</Text>
              )}

              <View style={styles.statsRow}>
                {[
                  { label: 'Items', value: list.totalItems },
                  { label: 'Bought', value: list.completedItems },
                  { label: 'Pending', value: list.totalItems - list.completedItems },
                ].map((s, i) => (
                  <View key={s.label} style={[styles.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: borderC }]}>
                    <Text style={[styles.statVal, { color: textPri }]}>{s.value}</Text>
                    <Text style={[styles.statLabel, { color: textSec }]}>{s.label}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.progressTrack, { backgroundColor: borderC }]}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.pctLabel, { color: textSec }]}>{Math.round(pct)}% complete</Text>

              {/* Budget */}
              {(() => {
                const spent = list.totalActualCost > 0
                  ? list.totalActualCost
                  : (list.items || [])
                      .filter((i: any) => i.isPurchased)
                      .reduce((s: number, i: any) => s + (i.actualPrice || 0), 0);
                const isOver = list.totalBudget && spent > list.totalBudget;
                return list.totalBudget ? (
                  <View style={styles.budgetRow}>
                    <Text style={[styles.budgetText, { color: textSec }]}>
                      Budget: <Text style={{ color: textPri, fontWeight: '700' }}>{formatCurrency(list.totalBudget)}</Text>
                    </Text>
                    <Text style={[styles.budgetText, { color: textSec }]}>
                      Spent: <Text style={{ color: isOver ? '#C75050' : textPri, fontWeight: '700' }}>
                        {formatCurrency(spent)}
                      </Text>
                    </Text>
                  </View>
                ) : list.totalEstimatedCost > 0 ? (
                  <Text style={[styles.estText, { color: textSec }]}>
                    Est. total: <Text style={{ color: textPri, fontWeight: '700' }}>{formatCurrency(list.totalEstimatedCost)}</Text>
                  </Text>
                ) : null;
              })()}
            </View>

            {/* Items header */}
            <View style={styles.itemsHeader}>
              <View>
                <Text style={[styles.itemsTitle, { color: textPri }]}>Shodai List</Text>
                <Text style={[styles.itemsSubtitle, { color: textSec }]}>
                  {list.completedItems}/{list.totalItems} purchased
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.addItemBtn, { backgroundColor: colors.primary }]}
                onPress={() => (navigation as any).navigate('AddBazarItem', { listId, mode: 'create' })}
              >
                <Icon name="add-circle-outline" size={16} color="#FFF" />
                <Text style={styles.addItemBtnText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderSectionHeader={({ section }) => {
          const dayTotal = section.data.reduce((s: number, i: any) => s + (i.actualPrice || 0), 0);
          return (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionDate, { color: textPri }]}>{section.title}</Text>
              <Text style={[styles.sectionTotal, { color: colors.primary }]}>{formatCurrency(dayTotal)}</Text>
            </View>
          );
        }}
        renderItem={({ item }: { item: any }) => (
          <ItemRow
            item={item}
            optimisticPurchased={optimisticToggles[item._id] ?? item.isPurchased}
            onToggle={() => handleToggle(item._id, optimisticToggles[item._id] ?? item.isPurchased)}
            onLongPress={() => handleItemLongPress(item)}
            isDark={isDark}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyItems}>
            <Icon name="bag-outline" size={36} color={textSec} />
            <Text style={[styles.emptyText, { color: textSec }]}>No items yet</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      <GuideView />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  editBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },

  summaryCard: { margin: 16, marginBottom: 12, borderRadius: 14, borderWidth: 1, padding: 16 },
  descText: { fontSize: 13, marginBottom: 12, lineHeight: 18 },
  statsRow: { flexDirection: 'row', marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', marginBottom: 1 },
  statLabel: { fontSize: 11 },
  progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 3 },
  pctLabel: { fontSize: 11, textAlign: 'center', marginBottom: 10 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetText: { fontSize: 12 },
  estText: { fontSize: 12 },

  itemsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
  sectionDate: { fontSize: 13, fontWeight: '700' },
  sectionTotal: { fontSize: 13, fontWeight: '700' },
  itemsTitle: { fontSize: 15, fontWeight: '700' },
  itemsSubtitle: { fontSize: 11, marginTop: 2 },
  addItemBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  addItemBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  listContent: { paddingBottom: 40 },

  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 6, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600' },
  itemStrike: { textDecorationLine: 'line-through' },
  itemMeta: { fontSize: 11, marginTop: 2 },
  priceText: { fontSize: 13, fontWeight: '700' },

  emptyItems: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 13, fontWeight: '500' },
});

export default BazarListDetailsScreen;
