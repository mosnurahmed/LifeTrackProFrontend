/**
 * Task Statistics Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useTaskStats, useTasks } from '../../../hooks/api/useTasks';
import { Spinner, ErrorState, AppHeader, useGuide } from '../../../components/common';

const TaskStatsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { GuideButton, GuideView } = useGuide('taskStats');

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const { data: statsData, isLoading, error } = useTaskStats();
  const { data: tasksData } = useTasks();

  const stats = statsData?.data;
  const tasks = tasksData?.data?.data || [];

  if (isLoading) return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Task Statistics" />
      <Spinner text="Loading..." />
    </View>
  );

  if (error || !stats) return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Task Statistics" />
      <ErrorState title="Failed to load" message="Please try again" onRetry={() => navigation.goBack()} />
    </View>
  );

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const circumference = 2 * Math.PI * 55;

  const priorityBreakdown = [
    { label: 'Urgent', count: tasks.filter((t: any) => t.priority === 'urgent').length, color: '#EF4444', icon: 'flame' },
    { label: 'High', count: tasks.filter((t: any) => t.priority === 'high').length, color: '#F97316', icon: 'arrow-up-circle' },
    { label: 'Medium', count: tasks.filter((t: any) => t.priority === 'medium').length, color: '#F59E0B', icon: 'remove-circle' },
    { label: 'Low', count: tasks.filter((t: any) => t.priority === 'low').length, color: '#64748B', icon: 'arrow-down-circle' },
  ];

  const statusBreakdown = [
    { label: 'To Do', count: stats.todo, color: '#64748B' },
    { label: 'In Progress', count: stats.inProgress, color: '#3B82F6' },
    { label: 'Completed', count: stats.completed, color: '#22C55E' },
    { label: 'Cancelled', count: stats.cancelled, color: '#94A3B8' },
  ];

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Task Statistics"
        right={<GuideButton color={textPri} />}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Summary Row */}
        <View style={s.summaryRow}>
          {[
            { icon: 'list-outline', color: colors.primary, val: stats.total, label: 'Total' },
            { icon: 'checkmark-circle-outline', color: '#22C55E', val: stats.completed, label: 'Done' },
            { icon: 'alert-circle-outline', color: '#EF4444', val: stats.overdue, label: 'Overdue' },
            { icon: 'today-outline', color: '#F59E0B', val: stats.dueToday, label: 'Today' },
          ].map(item => (
            <View key={item.label} style={[s.summaryCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
              <View style={[s.summaryIcon, { backgroundColor: `${item.color}10` }]}>
                <Icon name={item.icon} size={14} color={item.color} />
              </View>
              <Text style={[s.summaryVal, { color: textPri }]}>{item.val}</Text>
              <Text style={[s.summaryLabel, { color: textSec }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Completion Donut */}
        <View style={[s.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <Text style={[s.cardTitle, { color: textPri }]}>Completion Rate</Text>
          <View style={s.donutWrap}>
            <Svg width={130} height={130} viewBox="0 0 130 130">
              <Circle cx="65" cy="65" r="55" stroke={borderC} strokeWidth={10} fill="none" />
              <Circle
                cx="65" cy="65" r="55"
                stroke="#22C55E"
                strokeWidth={10}
                fill="none"
                strokeDasharray={`${(Math.min(completionRate, 100) / 100) * circumference} ${circumference}`}
                strokeLinecap="round"
                transform="rotate(-90 65 65)"
              />
            </Svg>
            <View style={s.donutCenter}>
              <Text style={[s.donutPct, { color: textPri }]}>{completionRate.toFixed(0)}%</Text>
              <Text style={[s.donutLabel, { color: textSec }]}>done</Text>
            </View>
          </View>
          <View style={s.completionRow}>
            <View style={s.completionItem}>
              <Text style={[s.completionVal, { color: '#22C55E' }]}>{stats.completed}</Text>
              <Text style={[s.completionLabel, { color: textSec }]}>Done</Text>
            </View>
            <View style={s.completionItem}>
              <Text style={[s.completionVal, { color: '#F59E0B' }]}>{stats.todo + stats.inProgress}</Text>
              <Text style={[s.completionLabel, { color: textSec }]}>Pending</Text>
            </View>
            <View style={s.completionItem}>
              <Text style={[s.completionVal, { color: '#94A3B8' }]}>{stats.cancelled}</Text>
              <Text style={[s.completionLabel, { color: textSec }]}>Cancelled</Text>
            </View>
          </View>
        </View>

        {/* Status Breakdown */}
        <View style={[s.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <Text style={[s.cardTitle, { color: textPri }]}>Status Breakdown</Text>
          {statusBreakdown.map((item, i) => (
            <View key={item.label}>
              {i > 0 && <View style={[s.divider, { backgroundColor: borderC }]} />}
              <View style={s.breakdownRow}>
                <View style={[s.breakdownDot, { backgroundColor: item.color }]} />
                <Text style={[s.breakdownLabel, { color: textSec }]}>{item.label}</Text>
                <Text style={[s.breakdownCount, { color: textPri }]}>{item.count}</Text>
                <View style={[s.breakdownBar, { backgroundColor: borderC }]}>
                  <View style={[s.breakdownBarFill, {
                    width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` as any,
                    backgroundColor: item.color,
                  }]} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Priority Breakdown */}
        <View style={[s.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <Text style={[s.cardTitle, { color: textPri }]}>Priority Breakdown</Text>
          {priorityBreakdown.map((item, i) => (
            <View key={item.label}>
              {i > 0 && <View style={[s.divider, { backgroundColor: borderC }]} />}
              <View style={s.breakdownRow}>
                <View style={[s.priorityIcon, { backgroundColor: `${item.color}10` }]}>
                  <Icon name={item.icon} size={12} color={item.color} />
                </View>
                <Text style={[s.breakdownLabel, { color: textSec }]}>{item.label}</Text>
                <Text style={[s.breakdownCount, { color: textPri }]}>{item.count}</Text>
                <View style={[s.breakdownBar, { backgroundColor: borderC }]}>
                  <View style={[s.breakdownBarFill, {
                    width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` as any,
                    backgroundColor: item.color,
                  }]} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Insights */}
        <View style={[s.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <Text style={[s.cardTitle, { color: textPri }]}>Insights</Text>
          {[
            { icon: 'checkmark-circle', color: '#22C55E', text: `Completed ${stats.completed} of ${stats.total} tasks` },
            stats.overdue > 0 ? { icon: 'alert-circle', color: '#EF4444', text: `${stats.overdue} task${stats.overdue !== 1 ? 's' : ''} overdue — consider rescheduling` } : null,
            stats.dueToday > 0 ? { icon: 'today', color: '#F59E0B', text: `${stats.dueToday} task${stats.dueToday !== 1 ? 's' : ''} due today` } : null,
            stats.inProgress > 0 ? { icon: 'play', color: '#3B82F6', text: `${stats.inProgress} task${stats.inProgress !== 1 ? 's' : ''} in progress` } : null,
            completionRate >= 80 ? { icon: 'trophy', color: '#F59E0B', text: `Great work! ${completionRate.toFixed(0)}% completion rate` } : null,
          ].filter(Boolean).map((ins: any, idx) => (
            <View key={idx} style={s.insightRow}>
              <View style={[s.insightDot, { backgroundColor: `${ins.color}12` }]}>
                <Icon name={ins.icon} size={13} color={ins.color} />
              </View>
              <Text style={[s.insightText, { color: textSec }]}>{ins.text}</Text>
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
  summaryCard: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1, gap: 3 },
  summaryIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  summaryVal: { fontSize: 16, fontWeight: '800' },
  summaryLabel: { fontSize: 9 },

  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, padding: 14 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  divider: { height: 1, marginVertical: 8 },

  donutWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutPct: { fontSize: 22, fontWeight: '800' },
  donutLabel: { fontSize: 10, marginTop: -2 },

  completionRow: { flexDirection: 'row', justifyContent: 'space-around' },
  completionItem: { alignItems: 'center', gap: 2 },
  completionVal: { fontSize: 16, fontWeight: '800' },
  completionLabel: { fontSize: 10 },

  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  priorityIcon: { width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  breakdownLabel: { fontSize: 12, width: 75 },
  breakdownCount: { fontSize: 13, fontWeight: '700', width: 24, textAlign: 'center' },
  breakdownBar: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  breakdownBarFill: { height: '100%', borderRadius: 2 },

  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  insightDot: { width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  insightText: { flex: 1, fontSize: 12, lineHeight: 17 },
});

export default TaskStatsScreen;
