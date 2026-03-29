/**
 * Loans Screen — Track money given and taken
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useLoans, useLoanStats, useDeleteLoan } from '../../../hooks/api/useLoans';
import { AppHeader, EmptyState, useGuide, useConfirm } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

type FilterType = 'all' | 'given' | 'taken' | 'settled';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'given', label: 'Given' },
  { key: 'taken', label: 'Taken' },
  { key: 'settled', label: 'Settled' },
];

// ─── Skeleton ────────────────────────────────────────────────────────────────

const SkeletonCard = ({ isDark }: { isDark: boolean }) => {
  const bg = isDark ? '#1E293B' : '#FFFFFF';
  const shimmer = isDark ? '#334155' : '#F1F5F9';
  return (
    <View style={[s.card, { backgroundColor: bg, borderColor: shimmer }]}>
      <View style={[s.skeletonCircle, { backgroundColor: shimmer }]} />
      <View style={s.cardInfo}>
        <View style={[s.skeletonLine, { backgroundColor: shimmer, width: '55%' }]} />
        <View style={[s.skeletonLine, { backgroundColor: shimmer, width: '35%', marginTop: 6 }]} />
      </View>
      <View style={[s.skeletonLine, { backgroundColor: shimmer, width: 60, height: 16 }]} />
    </View>
  );
};

const LoansScreenSkeleton = ({ isDark }: { isDark: boolean }) => (
  <View style={s.skeletonWrap}>
    {[1, 2, 3, 4, 5].map(i => (
      <SkeletonCard key={i} isDark={isDark} />
    ))}
  </View>
);

// ─── Loan Card ───────────────────────────────────────────────────────────────

const LoanCard = ({
  loan,
  onPress,
  onLongPress,
  isDark,
}: {
  loan: any;
  onPress: () => void;
  onLongPress: () => void;
  isDark: boolean;
}) => {
  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const isGiven = loan.type === 'given';
  const typeColor = isGiven ? '#10B981' : '#EF4444';
  const totalPaid = (loan.payments || []).reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const remaining = loan.remainingAmount ?? (loan.amount - totalPaid);
  const pct = loan.amount > 0 ? Math.min((totalPaid / loan.amount) * 100, 100) : 0;

  const daysLeft = loan.deadline
    ? Math.ceil((new Date(loan.deadline).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <TouchableOpacity
      style={[s.card, { backgroundColor: surfaceC, borderColor: borderC }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.78}
    >
      <View style={[s.cardIcon, { backgroundColor: `${typeColor}12` }]}>
        <Icon
          name={isGiven ? 'arrow-up-circle' : 'arrow-down-circle'}
          size={18}
          color={typeColor}
        />
      </View>

      <View style={s.cardInfo}>
        <View style={s.cardTitleRow}>
          <Text style={[s.cardName, { color: textPri }]} numberOfLines={1}>
            {loan.personName}
          </Text>
          {loan.isSettled && (
            <View style={[s.settledBadge, { backgroundColor: '#22C55E12' }]}>
              <Text style={s.settledText}>Settled</Text>
            </View>
          )}
        </View>

        {/* Progress bar */}
        <View style={[s.progressTrack, { backgroundColor: `${typeColor}12` }]}>
          <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: typeColor }]} />
        </View>

        <View style={s.cardBottom}>
          <Text style={[s.cardAmount, { color: textSec }]}>
            {formatCurrency(totalPaid)}
            <Text style={{ color: isDark ? '#475569' : '#CBD5E1' }}>
              {' / '}
              {formatCurrency(loan.amount)}
            </Text>
          </Text>
          <View style={s.cardTags}>
            {daysLeft !== null && !loan.isSettled && (
              <Text style={[s.tagText, { color: daysLeft < 0 ? '#EF4444' : daysLeft < 7 ? '#F59E0B' : textSec }]}>
                {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
              </Text>
            )}
            <Text style={[s.remainingText, { color: typeColor }]}>
              {formatCurrency(remaining)} left
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

const LoansScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { GuideButton, GuideView } = useGuide('loans');
  const { confirm } = useConfirm();

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const [filter, setFilter] = useState<FilterType>('all');

  const { data: statsData } = useLoanStats();
  const { data: loansData, isLoading, refetch, isRefetching } = useLoans({ type: filter === 'all' ? undefined : filter });
  const deleteMutation = useDeleteLoan();

  // useLoans has select → data is already the array
  // useLoanStats has select → data is already the stats object
  const stats = statsData ?? {};
  const loans: any[] = useMemo(
    () => Array.isArray(loansData) ? loansData : [],
    [loansData],
  );

  const filteredLoans = useMemo(() => {
    if (filter === 'settled') return loans.filter((l: any) => l.isSettled);
    if (filter === 'given') return loans.filter((l: any) => l.type === 'given' && !l.isSettled);
    if (filter === 'taken') return loans.filter((l: any) => l.type === 'taken' && !l.isSettled);
    return loans;
  }, [loans, filter]);

  const totalGiven = stats.totalGivenRemaining ?? 0;
  const totalTaken = stats.totalTakenRemaining ?? 0;
  const overdueCount = stats.overdue ?? 0;

  const handleDelete = async (loan: any) => {
    const ok = await confirm({
      title: 'Delete Loan',
      message: `Delete loan for "${loan.personName}"? This cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) deleteMutation.mutate(loan._id);
  };

  if (isLoading) {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <AppHeader
          title="Loans"
          showDrawer
          right={<GuideButton color={colors.text.primary} />}
        />
        <LoansScreenSkeleton isDark={isDark} />
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Loans"
        showDrawer
        right={<GuideButton color={colors.text.primary} />}
      />

      <FlatList
        data={filteredLoans}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.listContent, filteredLoans.length === 0 && { flex: 1 }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* Overview Card */}
            <View style={[s.overviewCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
              <View style={s.overviewRow}>
                <View style={s.overviewItem}>
                  <View style={[s.overviewIcon, { backgroundColor: '#10B98112' }]}>
                    <Icon name="arrow-up-circle-outline" size={16} color="#10B981" />
                  </View>
                  <Text style={[s.overviewLabel, { color: textSec }]}>Given</Text>
                  <Text style={[s.overviewValue, { color: '#10B981' }]}>
                    {formatCurrency(totalGiven)}
                  </Text>
                </View>
                <View style={[s.overviewDivider, { backgroundColor: borderC }]} />
                <View style={s.overviewItem}>
                  <View style={[s.overviewIcon, { backgroundColor: '#EF444412' }]}>
                    <Icon name="arrow-down-circle-outline" size={16} color="#EF4444" />
                  </View>
                  <Text style={[s.overviewLabel, { color: textSec }]}>Taken</Text>
                  <Text style={[s.overviewValue, { color: '#EF4444' }]}>
                    {formatCurrency(totalTaken)}
                  </Text>
                </View>
                <View style={[s.overviewDivider, { backgroundColor: borderC }]} />
                <View style={s.overviewItem}>
                  <View style={[s.overviewIcon, { backgroundColor: '#F59E0B12' }]}>
                    <Icon name="alert-circle-outline" size={16} color="#F59E0B" />
                  </View>
                  <Text style={[s.overviewLabel, { color: textSec }]}>Overdue</Text>
                  <Text style={[s.overviewValue, { color: overdueCount > 0 ? '#F59E0B' : textPri }]}>
                    {overdueCount}
                  </Text>
                </View>
              </View>
            </View>

            {/* Filter Chips */}
            <View style={s.filterRow}>
              {FILTERS.map(f => {
                const active = filter === f.key;
                return (
                  <TouchableOpacity
                    key={f.key}
                    style={[
                      s.filterChip,
                      {
                        backgroundColor: active ? colors.primary : surfaceC,
                        borderColor: active ? colors.primary : borderC,
                      },
                    ]}
                    onPress={() => setFilter(f.key)}
                  >
                    <Text
                      style={[
                        s.filterChipText,
                        { color: active ? '#FFFFFF' : textSec },
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <LoanCard
            loan={item}
            isDark={isDark}
            onPress={() => (navigation as any).navigate('LoanDetails', { loanId: item._id })}
            onLongPress={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="cash-outline"
            title="No loans"
            message="Tap + to record a loan"
            actionLabel="Add Loan"
            onAction={() => (navigation as any).navigate('AddLoan', { mode: 'create' })}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[s.fab, { backgroundColor: colors.primary }]}
        onPress={() => (navigation as any).navigate('AddLoan', { mode: 'create' })}
        activeOpacity={0.8}
      >
        <Icon name="add" size={22} color="#FFFFFF" />
      </TouchableOpacity>
      <GuideView />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },

  listContent: { paddingBottom: 100 },

  // Overview
  overviewCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  overviewRow: { flexDirection: 'row', alignItems: 'center' },
  overviewItem: { flex: 1, alignItems: 'center', gap: 4 },
  overviewIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  overviewLabel: { fontSize: 11, fontWeight: '500' },
  overviewValue: { fontSize: 14, fontWeight: '800' },
  overviewDivider: { width: 1, height: 36 },

  // Filters
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  filterChipText: { fontSize: 12, fontWeight: '600' },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  cardIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  cardName: { fontSize: 14, fontWeight: '600', flex: 1 },
  settledBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  settledText: { fontSize: 10, fontWeight: '700', color: '#22C55E' },
  progressTrack: { height: 3, borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 2 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardAmount: { fontSize: 11, fontWeight: '600' },
  cardTags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagText: { fontSize: 10, fontWeight: '600' },
  remainingText: { fontSize: 10, fontWeight: '700' },

  // Skeleton
  skeletonWrap: { padding: 16, gap: 8 },
  skeletonCircle: { width: 36, height: 36, borderRadius: 18 },
  skeletonLine: { height: 12, borderRadius: 4 },

  // FAB
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
});

export default LoansScreen;
