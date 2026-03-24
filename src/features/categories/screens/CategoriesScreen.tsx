/**
 * Categories Screen — Redesigned
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import {
  useCategories,
  useDeleteCategory,
} from '../../../hooks/api/useCategories';
import { EmptyState, ErrorState, AppHeader } from '../../../components/common';
import { SkeletonList } from '../../../components/common/Loading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCurrency } from '../../../utils/formatters';

type TypeFilter = 'all' | 'expense' | 'income';

const TYPE_TABS: { key: TypeFilter; label: string; icon: string; color: string }[] = [
  { key: 'all',     label: 'All',     icon: 'apps',          color: '#6366F1' },
  { key: 'expense', label: 'Expense', icon: 'trending-down', color: '#EF4444' },
  { key: 'income',  label: 'Income',  icon: 'trending-up',   color: '#22C55E' },
];

const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const queryType = typeFilter === 'all' ? undefined : typeFilter;
  const { data: categoriesData, isLoading, error, refetch, isRefetching } =
    useCategories(queryType as any);

  const deleteMutation = useDeleteCategory();
  const categories: any[] = categoriesData?.data || [];

  const counts = useMemo(() => ({
    all:     categories.length,
    expense: categories.filter(c => c.type === 'expense' || c.type === 'both').length,
    income:  categories.filter(c => c.type === 'income'  || c.type === 'both').length,
  }), [categories]);

  const handleDelete = (id: string, name: string) =>
    Alert.alert(
      'Delete Category',
      `Delete "${name}"? All related expenses/incomes will also be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate({ id, confirmed: true }) },
      ]
    );

  const handleAdd = () =>
    (navigation as any).navigate('AddCategory', {
      mode: 'create',
      defaultType: typeFilter === 'all' ? 'expense' : typeFilter,
    });

  const handleEdit = (id: string) =>
    (navigation as any).navigate('AddCategory', { mode: 'edit', categoryId: id });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Categories" />
        <SkeletonList count={8} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Categories" />
        <ErrorState title="Failed to load" message="Please try again" onRetry={refetch} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const typeColor =
      item.type === 'income' ? '#22C55E' :
      item.type === 'both'   ? '#3B82F6' : '#EF4444';
    const typeIcon =
      item.type === 'income' ? 'trending-up' :
      item.type === 'both'   ? 'swap-horizontal' : 'trending-down';
    const typeLabel =
      item.type === 'income' ? 'Income' :
      item.type === 'both'   ? 'Both' : 'Expense';

    const hasBudget = item.monthlyBudget && item.monthlyBudget > 0;

    return (
      <TouchableOpacity
        style={[styles.card, {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: item.color,
        }]}
        onPress={() => handleEdit(item._id)}
        onLongPress={() => !item.isDefault && handleDelete(item._id, item.name)}
        activeOpacity={0.75}
      >
        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: `${item.color}18` }]}>
          <Icon name={item.icon} size={24} color={item.color} />
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <View style={styles.cardTopRow}>
            <Text style={[styles.cardName, { color: colors.text.primary }]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isDefault && (
              <View style={[styles.defaultBadge, { backgroundColor: `${colors.primary}15` }]}>
                <Text style={[styles.defaultBadgeText, { color: colors.primary }]}>Default</Text>
              </View>
            )}
          </View>

          <View style={styles.cardBottomRow}>
            {/* Type badge */}
            <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
              <Icon name={typeIcon} size={11} color={typeColor} />
              <Text style={[styles.typeBadgeText, { color: typeColor }]}>{typeLabel}</Text>
            </View>

            {/* Budget indicator */}
            {hasBudget && (
              <View style={[styles.budgetBadge, { backgroundColor: `${colors.warning || '#F59E0B'}15` }]}>
                <Icon name="wallet-outline" size={11} color={colors.warning || '#F59E0B'} />
                <Text style={[styles.budgetBadgeText, { color: colors.warning || '#F59E0B' }]}>
                  {formatCurrency(item.monthlyBudget)}/mo
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Edit btn */}
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: `${colors.primary}12` }]}
          onPress={() => handleEdit(item._id)}
        >
          <Icon name="create-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Categories"
        right={
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={handleAdd}
          >
            <Icon name="add" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {/* Type Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {TYPE_TABS.map(tab => {
          const isActive = typeFilter === tab.key;
          const count = counts[tab.key];
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                { borderColor: 'transparent' },
                isActive && { borderColor: tab.color, borderBottomWidth: 2 },
              ]}
              onPress={() => setTypeFilter(tab.key)}
            >
              <Icon name={tab.icon} size={16} color={isActive ? tab.color : colors.text.tertiary} />
              <Text style={[styles.tabText, { color: isActive ? tab.color : colors.text.secondary },
                isActive && { fontWeight: '700' }]}>
                {tab.label}
              </Text>
              <View style={[styles.tabCount, { backgroundColor: isActive ? `${tab.color}18` : colors.background }]}>
                <Text style={[styles.tabCountText, { color: isActive ? tab.color : colors.text.tertiary }]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={categories}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="apps-outline"
            title="No Categories"
            message="Create your first category to get started"
            actionLabel="Add Category"
            onAction={handleAdd}
          />
        }
        ListFooterComponent={
          categories.length > 0 ? (
            <Text style={[styles.hint, { color: colors.text.tertiary }]}>
              Long press to delete a category
            </Text>
          ) : null
        }
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  addBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },

  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 12, borderBottomWidth: 2,
  },
  tabText: { fontSize: 13, fontWeight: '600' },
  tabCount: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  tabCountText: { fontSize: 11, fontWeight: '700' },

  listContent: { padding: 16, paddingBottom: 110 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, borderWidth: 1, borderLeftWidth: 4,
    padding: 14, marginBottom: 10, gap: 12,
  },
  iconWrap: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  cardName: { fontSize: 15, fontWeight: '700', flex: 1 },
  defaultBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  defaultBadgeText: { fontSize: 10, fontWeight: '700' },
  cardBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },

  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },

  budgetBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  budgetBadgeText: { fontSize: 11, fontWeight: '700' },

  editBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  hint: { textAlign: 'center', fontSize: 12, marginTop: 8, marginBottom: 4 },
});

export default CategoriesScreen;
