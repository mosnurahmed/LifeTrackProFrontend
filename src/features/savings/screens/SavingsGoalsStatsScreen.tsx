/**
 * Savings Goals Statistics Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../../hooks/useTheme';
import {
  useSavingsStats,
  useSavingsGoals,
} from '../../../hooks/api/useSavingsGoals';
import { useInvestmentStats } from '../../../hooks/api/useInvestments';
import { Spinner, ErrorState, AppHeader, useGuide } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

const SavingsGoalsStatsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { GuideButton, GuideView } = useGuide('savingsStats');

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const now = new Date();
  const { data: stats, isLoading, error } = useSavingsStats(now.getFullYear(), now.getMonth() + 1);
  const { data: goalsData } = useSavingsGoals();
  const { data: invStats } = useInvestmentStats();

  const goals = goalsData?.data?.data || [];
  const activeGoals = goals.filter((g: any) => !g.isCompleted);

  if (isLoading) {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Savings Statistics" />
        <Spinner text="Loading..." />
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Savings Statistics" />
        <ErrorState title="Failed to load" message="Please try again" onRetry={() => navigation.goBack()} />
      </View>
    );
  }

  const pct = stats.overallProgress ?? 0;
  const avgPerGoal = stats.totalGoals > 0 ? stats.totalCurrentAmount / stats.totalGoals : 0;

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Savings Statistics"
        right={<GuideButton color={textPri} />}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Summary Row */}
        <View style={s.summaryRow}>
          {[
            { icon: 'trophy', color: '#22C55E', val: stats.completedGoals, label: 'Done' },
            { icon: 'time-outline', color: '#3B82F6', val: stats.activeGoals, label: 'Active' },
            { icon: 'flag-outline', color: '#F59E0B', val: stats.totalGoals, label: 'Total' },
          ].map(item => (
            <View key={item.label} style={[s.summaryCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
              <View style={[s.summaryIcon, { backgroundColor: `${item.color}10` }]}>
                <Icon name={item.icon} size={16} color={item.color} />
              </View>
              <Text style={[s.summaryVal, { color: textPri }]}>{item.val}</Text>
              <Text style={[s.summaryLabel, { color: textSec }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Overall Progress Card */}
        <View style={[s.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <Text style={[s.cardTitle, { color: textPri }]}>Overall Progress</Text>

          {/* Saved vs Target row */}
          <View style={s.progressStats}>
            <View>
              <Text style={[s.progressLabel, { color: textSec }]}>Saved</Text>
              <Text style={[s.progressValue, { color: '#22C55E' }]}>{formatCurrency(stats.totalCurrentAmount)}</Text>
            </View>
            <View style={s.progressCenter}>
              <Text style={[s.pctBig, { color: textPri }]}>{pct.toFixed(1)}%</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[s.progressLabel, { color: textSec }]}>Target</Text>
              <Text style={[s.progressValue, { color: '#3B82F6' }]}>{formatCurrency(stats.totalTargetAmount)}</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={[s.progressTrack, { backgroundColor: borderC }]}>
            <View style={[s.progressFill, { width: `${Math.min(pct, 100)}%` as any, backgroundColor: '#22C55E' }]} />
          </View>

          <View style={s.remainingRow}>
            <Text style={[s.remainingLabel, { color: textSec }]}>Remaining</Text>
            <Text style={[s.remainingVal, { color: textPri }]}>{formatCurrency(stats.totalRemainingAmount)}</Text>
          </View>
        </View>

        {/* Goals Donut Chart */}
        <View style={[s.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <Text style={[s.cardTitle, { color: textPri }]}>Goals Breakdown</Text>
          <View style={s.donutWrap}>
            <Svg width={140} height={140} viewBox="0 0 140 140">
              {/* Background circle */}
              <Circle
                cx="70" cy="70" r="55"
                stroke={borderC}
                strokeWidth={12}
                fill="none"
              />
              {/* Progress arc */}
              <Circle
                cx="70" cy="70" r="55"
                stroke="#22C55E"
                strokeWidth={12}
                fill="none"
                strokeDasharray={`${(Math.min(pct, 100) / 100) * 2 * Math.PI * 55} ${2 * Math.PI * 55}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
              />
            </Svg>
            <View style={s.donutCenter}>
              <Text style={[s.donutPct, { color: textPri }]}>{pct.toFixed(0)}%</Text>
              <Text style={[s.donutLabel, { color: textSec }]}>saved</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={s.legendRow}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: '#22C55E' }]} />
              <Text style={[s.legendText, { color: textSec }]}>Completed ({stats.completedGoals})</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={[s.legendText, { color: textSec }]}>Active ({stats.activeGoals})</Text>
            </View>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={[s.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <Text style={[s.cardTitle, { color: textPri }]}>Financial Summary</Text>

          {[
            { icon: 'arrow-up-circle', color: '#22C55E', label: 'Total Saved', val: formatCurrency(stats.totalCurrentAmount) },
            { icon: 'flag', color: '#3B82F6', label: 'Total Target', val: formatCurrency(stats.totalTargetAmount) },
            { icon: 'trending-down', color: '#F59E0B', label: 'Still Needed', val: formatCurrency(stats.totalRemainingAmount) },
            { icon: 'calculator', color: '#8B5CF6', label: 'Avg per Goal', val: formatCurrency(avgPerGoal) },
          ].map((r, i) => (
            <View key={r.label}>
              {i > 0 && <View style={[s.divider, { backgroundColor: borderC }]} />}
              <View style={s.finRow}>
                <View style={[s.finIcon, { backgroundColor: `${r.color}10` }]}>
                  <Icon name={r.icon} size={15} color={r.color} />
                </View>
                <Text style={[s.finLabel, { color: textSec }]}>{r.label}</Text>
                <Text style={[s.finVal, { color: textPri }]}>{r.val}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Top Active Goals */}
        {activeGoals.length > 0 && (
          <View style={[s.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Text style={[s.cardTitle, { color: textPri }]}>Top Active Goals</Text>

            {activeGoals
              .sort((a: any, b: any) => b.progress - a.progress)
              .slice(0, 5)
              .map((goal: any, idx: number) => (
                <View key={goal._id}>
                  {idx > 0 && <View style={[s.divider, { backgroundColor: borderC }]} />}
                  <TouchableOpacity
                    style={s.goalRow}
                    onPress={() => (navigation as any).navigate('SavingsGoalDetails', { goalId: goal._id })}
                    activeOpacity={0.7}
                  >
                    <View style={[s.goalIcon, { backgroundColor: `${goal.color}10` }]}>
                      <Icon name={goal.icon} size={15} color={goal.color} />
                    </View>
                    <View style={s.goalInfo}>
                      <Text style={[s.goalName, { color: textPri }]} numberOfLines={1}>{goal.title}</Text>
                      <View style={[s.goalBar, { backgroundColor: `${goal.color}15` }]}>
                        <View style={[s.goalBarFill, { width: `${Math.min(goal.progress, 100)}%` as any, backgroundColor: goal.color }]} />
                      </View>
                    </View>
                    <View style={s.goalRight}>
                      <Text style={[s.goalPct, { color: goal.color }]}>{goal.progress.toFixed(0)}%</Text>
                      <Text style={[s.goalAmt, { color: textSec }]}>{formatCurrency(goal.currentAmount)}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        )}

        {/* Investment Overview */}
        {invStats && invStats.activeCount > 0 && (
          <View style={[s.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Text style={[s.cardTitle, { color: textPri }]}>Investment Overview</Text>

            {/* Investment summary grid */}
            <View style={s.invGrid}>
              <View style={[s.invCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: borderC }]}>
                <Text style={[s.invLabel, { color: textSec }]}>Total Invested</Text>
                <Text style={[s.invVal, { color: colors.primary }]}>{formatCurrency(invStats.totalInvested)}</Text>
              </View>
              <View style={[s.invCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: borderC }]}>
                <Text style={[s.invLabel, { color: textSec }]}>Maturity Value</Text>
                <Text style={[s.invVal, { color: textPri }]}>{formatCurrency(invStats.totalMaturityValue)}</Text>
              </View>
              <View style={[s.invCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: borderC }]}>
                <Text style={[s.invLabel, { color: textSec }]}>Expected Profit</Text>
                <Text style={[s.invVal, { color: '#22C55E' }]}>{formatCurrency(invStats.expectedProfit)}</Text>
              </View>
              <View style={[s.invCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: borderC }]}>
                <Text style={[s.invLabel, { color: textSec }]}>Active Plans</Text>
                <Text style={[s.invVal, { color: textPri }]}>{invStats.activeCount}</Text>
              </View>
            </View>

            {/* By type breakdown */}
            {invStats.byType && Object.entries(invStats.byType)
              .filter(([_, v]: any) => v.count > 0)
              .map(([type, v]: any) => (
                <View key={type} style={s.invTypeRow}>
                  <Text style={[s.invTypeLabel, { color: textSec }]}>{type.toUpperCase()}</Text>
                  <Text style={[s.invTypeCount, { color: textSec }]}>{v.count} plan{v.count > 1 ? 's' : ''}</Text>
                  <Text style={[s.invTypeVal, { color: textPri }]}>{formatCurrency(v.invested)}</Text>
                </View>
              ))
            }

            {invStats.maturedCount > 0 && (
              <View style={[s.invMatured, { borderTopColor: borderC }]}>
                <Icon name="checkmark-circle" size={14} color="#22C55E" />
                <Text style={[s.invMaturedText, { color: textSec }]}>
                  {invStats.maturedCount} matured — {formatCurrency(invStats.totalMaturedValue)} received
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Insights */}
        <View style={[s.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <Text style={[s.cardTitle, { color: textPri }]}>Insights</Text>

          {[
            { icon: 'checkmark-circle', color: '#22C55E', text: `You've completed ${stats.completedGoals} out of ${stats.totalGoals} goals` },
            pct < 50
              ? { icon: 'alert-circle', color: '#F59E0B', text: `You're at ${pct.toFixed(1)}% of your total savings goal. Keep going!` }
              : pct < 100
              ? { icon: 'trending-up', color: '#22C55E', text: `Great progress! More than halfway at ${pct.toFixed(1)}%` }
              : null,
            stats.activeGoals > 0
              ? { icon: 'time', color: '#3B82F6', text: `${stats.activeGoals} active goal${stats.activeGoals !== 1 ? 's' : ''} in progress` }
              : null,
            stats.totalRemainingAmount > 0
              ? { icon: 'cash', color: '#8B5CF6', text: `Need ${formatCurrency(stats.totalRemainingAmount)} more to reach all goals` }
              : null,
          ]
            .filter(Boolean)
            .map((insight: any, idx) => (
              <View key={idx} style={s.insightRow}>
                <View style={[s.insightDot, { backgroundColor: `${insight.color}15` }]}>
                  <Icon name={insight.icon} size={13} color={insight.color} />
                </View>
                <Text style={[s.insightText, { color: textSec }]}>{insight.text}</Text>
              </View>
            ))}
        </View>
      </ScrollView>
      <GuideView />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },

  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: 12, marginBottom: 12 },
  summaryCard: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1, gap: 4 },
  summaryIcon: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  summaryVal: { fontSize: 18, fontWeight: '800' },
  summaryLabel: { fontSize: 10 },

  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, padding: 14 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },

  progressStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressLabel: { fontSize: 10, marginBottom: 2 },
  progressValue: { fontSize: 14, fontWeight: '700' },
  progressCenter: { alignItems: 'center' },
  pctBig: { fontSize: 22, fontWeight: '800' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 3 },
  remainingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  remainingLabel: { fontSize: 11 },
  remainingVal: { fontSize: 13, fontWeight: '700' },

  divider: { height: 1, marginVertical: 8 },

  finRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  finIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  finLabel: { flex: 1, fontSize: 12 },
  finVal: { fontSize: 13, fontWeight: '700' },

  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalIcon: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  goalInfo: { flex: 1 },
  goalName: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  goalBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  goalBarFill: { height: '100%', borderRadius: 2 },
  goalRight: { alignItems: 'flex-end', minWidth: 55 },
  goalPct: { fontSize: 12, fontWeight: '800' },
  goalAmt: { fontSize: 10, marginTop: 1 },

  donutWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutPct: { fontSize: 22, fontWeight: '800' },
  donutLabel: { fontSize: 10, marginTop: -2 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11 },

  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  insightDot: { width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  insightText: { flex: 1, fontSize: 12, lineHeight: 17 },

  // Investment overview
  invGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  invCard: { width: '48%' as any, borderRadius: 10, borderWidth: 1, padding: 10 },
  invLabel: { fontSize: 10, marginBottom: 3 },
  invVal: { fontSize: 15, fontWeight: '700' },
  invTypeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  invTypeLabel: { fontSize: 11, fontWeight: '700', width: 90 },
  invTypeCount: { fontSize: 11, flex: 1 },
  invTypeVal: { fontSize: 13, fontWeight: '600' },
  invMatured: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 10, marginTop: 8, borderTopWidth: 1 },
  invMaturedText: { fontSize: 12 },
});

export default SavingsGoalsStatsScreen;
