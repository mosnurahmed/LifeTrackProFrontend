/* eslint-disable react-native/no-inline-styles */
/**
 * Bazar Statistics Screen — Professional Minimal
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../../hooks/useTheme';
import { useBazarStats } from '../../../hooks/api/useBazar';
import { Spinner, ErrorState, useGuide } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

const { width } = Dimensions.get('window');

const BazarStatsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { GuideButton, GuideView } = useGuide('bazarStats');

  const now = new Date();
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const isCurrentMonth = selYear === now.getFullYear() && selMonth === now.getMonth() + 1;

  const goPrev = () => {
    if (selMonth === 1) { setSelMonth(12); setSelYear(y => y - 1); }
    else setSelMonth(m => m - 1);
  };
  const goNext = () => {
    if (isCurrentMonth) return;
    if (selMonth === 12) { setSelMonth(1); setSelYear(y => y + 1); }
    else setSelMonth(m => m + 1);
  };

  const { data: statsData, isLoading, error } = useBazarStats(selYear, selMonth);
  const stats = statsData?.data;

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  // Donut chart segments for overview
  const DONUT_R = 50;
  const DONUT_CIRCUM = 2 * Math.PI * DONUT_R;
  const totalLists = stats?.totalLists || 0;
  const doneLists = stats?.completedLists || 0;
  const activeLists = stats?.activeLists || 0;
  const donePct = totalLists > 0 ? doneLists / totalLists : 0;
  const activePct = totalLists > 0 ? activeLists / totalLists : 0;

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: surfaceC, borderBottomColor: borderC }]}>
      <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={22} color={textPri} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: textPri }]}>Shopping Statistics</Text>
      <GuideButton color={textPri} />
    </View>
  );

  if (isLoading) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {header}
      <Spinner text="Loading..." />
    </View>
  );

  if (error || !stats) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {header}
      <ErrorState title="Failed to load" message="Please try again" onRetry={() => navigation.goBack()} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {header}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
        {/* Summary Row */}
        <View style={[styles.summaryCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
          {[
            { val: stats.totalLists || 0, label: 'Lists' },
            { val: stats.completedLists || 0, label: 'Done' },
            { val: stats.activeLists || 0, label: 'Active' },
            { val: stats.totalItems || 0, label: 'Items' },
          ].map((s, i) => (
            <View key={i} style={[styles.summaryItem, i < 3 && { borderRightWidth: 1, borderRightColor: borderC }]}>
              <Text style={[styles.summaryVal, { color: textPri }]}>{s.val}</Text>
              <Text style={[styles.summaryLabel, { color: textSec }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Month Navigator */}
        <View style={[styles.monthNav, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <TouchableOpacity style={[styles.monthBtn, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]} onPress={goPrev}>
            <Icon name="chevron-back" size={18} color={textPri} />
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: textPri }]}>
            {MONTHS[selMonth - 1]} {selYear}
          </Text>
          <TouchableOpacity
            style={[styles.monthBtn, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }, isCurrentMonth && { opacity: 0.3 }]}
            onPress={goNext}
            disabled={isCurrentMonth}
          >
            <Icon name="chevron-forward" size={18} color={textPri} />
          </TouchableOpacity>
        </View>

        {/* Overview Card — Donut + Stats */}
        <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <View style={styles.cardHeader}>
            <Icon name="analytics-outline" size={16} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: textPri }]}>Overview</Text>
          </View>

          <View style={styles.overviewRow}>
            {/* Donut Chart */}
            <View style={styles.donutWrap}>
              <Svg width={120} height={120} viewBox="0 0 120 120">
                {/* Background */}
                <Circle cx="60" cy="60" r={DONUT_R} stroke={borderC} strokeWidth={10} fill="none" />
                {/* Done segment (green) */}
                <Circle cx="60" cy="60" r={DONUT_R}
                  stroke="#22C55E" strokeWidth={10} fill="none"
                  strokeDasharray={`${donePct * DONUT_CIRCUM} ${DONUT_CIRCUM}`}
                  strokeDashoffset={0} strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
                {/* Active segment (blue) */}
                <Circle cx="60" cy="60" r={DONUT_R}
                  stroke="#3B82F6" strokeWidth={10} fill="none"
                  strokeDasharray={`${activePct * DONUT_CIRCUM} ${DONUT_CIRCUM}`}
                  strokeDashoffset={-donePct * DONUT_CIRCUM}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </Svg>
              <View style={styles.donutCenter}>
                <Text style={[styles.donutVal, { color: textPri }]}>{totalLists}</Text>
                <Text style={[styles.donutLabel, { color: textSec }]}>lists</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.overviewStats}>
              {[
                { icon: 'checkmark-circle', color: '#22C55E', label: 'Completed', val: doneLists },
                { icon: 'time-outline', color: '#3B82F6', label: 'Active', val: activeLists },
                { icon: 'bag-outline', color: '#F59E0B', label: 'Total Items', val: stats.totalItems || 0 },
                { icon: 'cart-outline', color: '#8B5CF6', label: 'Purchased', val: stats.purchasedItems || 0 },
              ].map((s, i) => (
                <View key={i} style={styles.overviewStatRow}>
                  <View style={[styles.overviewStatDot, { backgroundColor: `${s.color}15` }]}>
                    <Icon name={s.icon} size={13} color={s.color} />
                  </View>
                  <Text style={[styles.overviewStatLabel, { color: textSec }]}>{s.label}</Text>
                  <Text style={[styles.overviewStatVal, { color: textPri }]}>{s.val}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} /><Text style={[styles.legendText, { color: textSec }]}>Done</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} /><Text style={[styles.legendText, { color: textSec }]}>Active</Text></View>
          </View>
        </View>

        {/* Spending Summary */}
        <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <View style={styles.cardHeader}>
            <Icon name="wallet-outline" size={16} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: textPri }]}>Spending</Text>
          </View>
          <View style={styles.spendGrid}>
            {[
              { label: 'Total Spent', val: formatCurrency(stats.totalSpent || 0), icon: 'cash-outline', color: textPri },
              { label: `${MONTHS[selMonth - 1]} Spent`, val: formatCurrency(stats.thisMonthSpent || 0), icon: 'calendar-outline', color: '#10B981' },
              { label: 'Avg per List', val: formatCurrency(stats.averagePerList || 0), icon: 'bar-chart-outline', color: '#F59E0B' },
              { label: 'Total Budget', val: formatCurrency(stats.totalBudget || 0), icon: 'pie-chart-outline', color: '#3B82F6' },
            ].map((s, i) => (
              <View key={i} style={[styles.spendCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Icon name={s.icon} size={14} color={s.color} />
                <Text style={[styles.spendCardVal, { color: s.color }]}>{s.val}</Text>
                <Text style={[styles.spendCardLabel, { color: textSec }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Categories — All Time */}
        {stats.topCategories && stats.topCategories.length > 0 && (
          <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <View style={styles.cardHeader}>
              <Icon name="list-outline" size={16} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: textPri }]}>All Time — Category Spending</Text>
            </View>
            {stats.topCategories.slice(0, 10).map((cat: any, i: number) => {
              const maxSpent = stats.topCategories[0]?.spent || 1;
              const pct = (cat.spent / maxSpent) * 100;
              return (
                <View key={i} style={[styles.catRow, i < Math.min(stats.topCategories.length, 10) - 1 && { borderBottomWidth: 1, borderBottomColor: borderC }]}>
                  <View style={styles.catInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={[styles.catName, { color: textPri }]}>{cat.name}</Text>
                      <Text style={[styles.catAmount, { color: textPri }]}>{formatCurrency(cat.spent)}</Text>
                    </View>
                    <View style={[styles.catBar, { backgroundColor: `${colors.primary}12` }]}>
                      <View style={[styles.catBarFill, { width: `${pct}%` as any, backgroundColor: colors.primary }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Monthly Breakdown — current month first, scrollable */}
        {stats.monthlyBreakdown && stats.monthlyBreakdown.length > 0 && (() => {
          const months = [...stats.monthlyBreakdown].reverse();
          const maxSpent = Math.max(...months.map((x: any) => x.spent), 1);
          return (
            <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
              <View style={styles.cardHeader}>
                <Icon name="calendar-outline" size={16} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: textPri }]}>Monthly Spending</Text>
              </View>
              <ScrollView style={{ maxHeight: 280 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {months.map((m: any, i: number) => {
                  const pct = (m.spent / maxSpent) * 100;
                  const isCurrent = i === 0;
                  return (
                    <View key={i} style={[styles.monthRow, i < months.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderC }]}>
                      <View style={styles.monthLabel}>
                        <Text style={[styles.monthText, { color: isCurrent ? colors.primary : textPri, fontWeight: isCurrent ? '700' : '500' }]}>{m.month} {m.year}</Text>
                        <Text style={[styles.monthSub, { color: textSec }]}>{m.lists} lists · {m.items} items</Text>
                      </View>
                      <View style={styles.monthBarWrap}>
                        <View style={[styles.monthBar, { backgroundColor: `${colors.primary}12` }]}>
                          <View style={[styles.monthBarFill, { width: `${pct}%` as any, backgroundColor: isCurrent ? colors.primary : `${colors.primary}60` }]} />
                        </View>
                      </View>
                      <Text style={[styles.monthAmount, { color: m.spent > 0 ? (isCurrent ? colors.primary : textPri) : textSec, fontWeight: isCurrent ? '700' : '600' }]}>{formatCurrency(m.spent)}</Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          );
        })()}

        {/* This Month Categories */}
        {stats.thisMonthCategories && stats.thisMonthCategories.length > 0 && (
          <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <View style={styles.cardHeader}>
              <Icon name="grid-outline" size={16} color="#F59E0B" />
              <Text style={[styles.cardTitle, { color: textPri }]}>{MONTHS[selMonth - 1]} {selYear} — Categories</Text>
            </View>
            {stats.thisMonthCategories.map((cat: any, i: number) => {
              const totalCatSpent = stats.thisMonthCategories.reduce((s: number, c: any) => s + c.spent, 0);
              const pct = totalCatSpent > 0 ? (cat.spent / totalCatSpent) * 100 : 0;
              return (
                <View key={i} style={[styles.catRow, i < stats.thisMonthCategories.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderC }]}>
                  <View style={styles.catInfo}>
                    <Text style={[styles.catName, { color: textPri }]}>{cat.name}</Text>
                    <View style={[styles.catBar, { backgroundColor: `${colors.primary}12` }]}>
                      <View style={[styles.catBarFill, { width: `${pct}%` as any, backgroundColor: colors.primary }]} />
                    </View>
                  </View>
                  <View style={styles.catRight}>
                    <Text style={[styles.catAmount, { color: textPri }]}>{formatCurrency(cat.spent)}</Text>
                    <Text style={[styles.catPct, { color: textSec }]}>{pct.toFixed(0)}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Insights */}
        {stats.totalSpent > 0 && (
          <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <View style={styles.cardHeader}>
              <Icon name="bulb-outline" size={16} color="#D4956A" />
              <Text style={[styles.cardTitle, { color: textPri }]}>Insights</Text>
            </View>
            <Text style={[styles.insightText, { color: textSec }]}>
              You've completed <Text style={{ color: textPri, fontWeight: '700' }}>{stats.completedLists || 0}</Text> shopping trips
              with an average of <Text style={{ color: textPri, fontWeight: '700' }}>{formatCurrency(stats.averagePerList || 0)}</Text> per trip.
              {stats.thisMonthCategories && stats.thisMonthCategories.length > 0 && (
                <Text> Top category this month: <Text style={{ color: colors.primary, fontWeight: '700' }}>{stats.thisMonthCategories[0].name}</Text> ({formatCurrency(stats.thisMonthCategories[0].spent)})</Text>
              )}
            </Text>
          </View>
        )}
      </ScrollView>
      <GuideView />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1,
  },
  headerBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' },

  summaryCard: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 12 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 16, fontWeight: '800', marginBottom: 1 },
  summaryLabel: { fontSize: 10 },

  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700' },

  // Overview
  overviewRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  donutWrap: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center' },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutVal: { fontSize: 22, fontWeight: '800' },
  donutLabel: { fontSize: 10 },
  overviewStats: { flex: 1, gap: 8 },
  overviewStatRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  overviewStatDot: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  overviewStatLabel: { flex: 1, fontSize: 12 },
  overviewStatVal: { fontSize: 14, fontWeight: '700' },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11 },

  // Spending grid
  spendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  spendCard: { width: '48%' as any, borderRadius: 10, padding: 10, gap: 3 },
  spendCardVal: { fontSize: 14, fontWeight: '700' },
  spendCardLabel: { fontSize: 10 },

  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, gap: 10 },
  rank: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  rankText: { fontSize: 11, fontWeight: '700' },
  listName: { flex: 1, fontSize: 13, fontWeight: '600' },
  listCount: { fontSize: 12 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  countBadgeText: { fontSize: 11, fontWeight: '700' },

  insightText: { fontSize: 13, lineHeight: 20 },

  // Month navigator
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 12, borderWidth: 1, padding: 8, marginBottom: 12,
  },
  monthBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  monthText: { fontSize: 15, fontWeight: '700' },

  // Monthly breakdown
  monthRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  monthLabel: { width: 70 },
  monthText: { fontSize: 12 },
  monthSub: { fontSize: 9 },
  monthBarWrap: { flex: 1 },
  monthBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  monthBarFill: { height: '100%', borderRadius: 3 },
  monthAmount: { width: 70, fontSize: 12, fontWeight: '700', textAlign: 'right' },

  // Category breakdown
  catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  catInfo: { flex: 1 },
  catName: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  catBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 2 },
  catRight: { alignItems: 'flex-end' },
  catAmount: { fontSize: 13, fontWeight: '700' },
  catPct: { fontSize: 10 },
});

export default BazarStatsScreen;
