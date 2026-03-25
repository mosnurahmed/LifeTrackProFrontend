/**
 * Categories Screen
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useCategories, useDeleteCategory } from '../../../hooks/api/useCategories';
import { EmptyState, ErrorState, AppHeader } from '../../../components/common';
import { SkeletonList } from '../../../components/common/Loading';
import { useConfirm } from '../../../components/common/ConfirmModal';
import { formatCurrency } from '../../../utils/formatters';

type TypeFilter = 'all' | 'expense' | 'income';

const TYPE_TABS: { key: TypeFilter; label: string; icon: string; color: string }[] = [
  { key: 'all', label: 'All', icon: 'apps-outline', color: '#6366F1' },
  { key: 'expense', label: 'Expense', icon: 'trending-down', color: '#EF4444' },
  { key: 'income', label: 'Income', icon: 'trending-up', color: '#22C55E' },
];

const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { confirm } = useConfirm();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const queryType = typeFilter === 'all' ? undefined : typeFilter;
  const { data: categoriesData, isLoading, error, refetch, isRefetching } = useCategories(queryType as any);
  const deleteMutation = useDeleteCategory();
  const categories: any[] = categoriesData?.data || [];

  const counts = useMemo(() => ({
    all: categories.length,
    expense: categories.filter(c => c.type === 'expense' || c.type === 'both').length,
    income: categories.filter(c => c.type === 'income' || c.type === 'both').length,
  }), [categories]);

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({ title: 'Delete Category', message: `Delete "${name}"? Related data will also be deleted.`, confirmText: 'Delete', variant: 'danger' });
    if (ok) deleteMutation.mutate({ id, confirmed: true });
  };

  const handleAdd = () => (navigation as any).navigate('AddCategory', { mode: 'create', defaultType: typeFilter === 'all' ? 'expense' : typeFilter });
  const handleEdit = (id: string) => (navigation as any).navigate('AddCategory', { mode: 'edit', categoryId: id });

  if (isLoading) return (
    <View style={[st.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Categories" />
      <SkeletonList count={8} />
    </View>
  );

  if (error) return (
    <View style={[st.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Categories" />
      <ErrorState title="Failed to load" message="Please try again" onRetry={refetch} />
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const typeColor = item.type === 'income' ? '#22C55E' : item.type === 'both' ? '#3B82F6' : '#EF4444';
    const typeIcon = item.type === 'income' ? 'trending-up' : item.type === 'both' ? 'swap-horizontal' : 'trending-down';
    const typeLabel = item.type === 'income' ? 'Income' : item.type === 'both' ? 'Both' : 'Expense';
    const hasBudget = item.monthlyBudget > 0;

    return (
      <TouchableOpacity
        style={[st.card, { backgroundColor: surfaceC, borderColor: borderC }]}
        onPress={() => handleEdit(item._id)}
        onLongPress={() => !item.isDefault && handleDelete(item._id, item.name)}
        activeOpacity={0.75}
      >
        <View style={[st.iconWrap, { backgroundColor: `${item.color}12` }]}>
          <Icon name={item.icon} size={18} color={item.color} />
        </View>
        <View style={st.cardInfo}>
          <View style={st.cardTopRow}>
            <Text style={[st.cardName, { color: textPri }]} numberOfLines={1}>{item.name}</Text>
            {item.isDefault && (
              <View style={[st.defaultBadge, { backgroundColor: `${colors.primary}12` }]}>
                <Text style={[st.defaultBadgeText, { color: colors.primary }]}>Default</Text>
              </View>
            )}
          </View>
          <View style={st.cardBottomRow}>
            <View style={[st.typeBadge, { backgroundColor: `${typeColor}10` }]}>
              <Icon name={typeIcon} size={9} color={typeColor} />
              <Text style={[st.typeBadgeText, { color: typeColor }]}>{typeLabel}</Text>
            </View>
            {hasBudget && (
              <View style={[st.typeBadge, { backgroundColor: '#F59E0B10' }]}>
                <Icon name="wallet-outline" size={9} color="#F59E0B" />
                <Text style={[st.typeBadgeText, { color: '#F59E0B' }]}>{formatCurrency(item.monthlyBudget)}/mo</Text>
              </View>
            )}
          </View>
        </View>
        <Icon name="chevron-forward" size={16} color={isDark ? '#475569' : '#CBD5E1'} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[st.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Categories" />

      {/* Tabs */}
      <View style={[st.tabBar, { backgroundColor: surfaceC, borderBottomColor: borderC }]}>
        {TYPE_TABS.map(tab => {
          const isActive = typeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[st.tab, isActive && { borderBottomColor: tab.color, borderBottomWidth: 2 }]}
              onPress={() => setTypeFilter(tab.key)}
            >
              <Icon name={tab.icon} size={13} color={isActive ? tab.color : textSec} />
              <Text style={[st.tabText, { color: isActive ? tab.color : textSec }, isActive && { fontWeight: '700' }]}>
                {tab.label} ({counts[tab.key]})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={categories}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={st.listContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[colors.primary]} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="apps-outline" title="No Categories" message="Create your first category" actionLabel="Add Category" onAction={handleAdd} />}
        ListFooterComponent={categories.length > 0 ? <Text style={[st.hint, { color: isDark ? '#475569' : '#CBD5E1' }]}>Long press to delete</Text> : null}
      />

      {/* FAB */}
      <TouchableOpacity style={[st.fab, { backgroundColor: colors.primary }]} onPress={handleAdd} activeOpacity={0.8}>
        <Icon name="add" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const st = StyleSheet.create({
  container: { flex: 1 },

  tabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 12, fontWeight: '600' },

  listContent: { padding: 16, paddingBottom: 90 },

  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 8, gap: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cardName: { fontSize: 13, fontWeight: '600', flex: 1 },
  defaultBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  defaultBadgeText: { fontSize: 9, fontWeight: '700' },
  cardBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  typeBadgeText: { fontSize: 9, fontWeight: '700' },

  hint: { textAlign: 'center', fontSize: 11, marginTop: 6 },

  fab: { position: 'absolute', bottom: 90, right: 20, width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
});

export default CategoriesScreen;
