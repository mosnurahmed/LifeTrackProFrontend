/**
 * Tasks Screen
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useTasks, useDeleteTask, useTaskStats, useUpdateTaskStatus } from '../../../hooks/api/useTasks';
import { AppHeader, useGuide } from '../../../components/common';
import { useConfirm } from '../../../components/common/ConfirmModal';
import { TasksSkeleton } from '../../../components/common/Loading/ScreenSkeletons';
import TaskItem from '../components/TaskItem';

const DATE_FILTERS = [
  { key: 'all',      label: 'All',      icon: 'layers-outline' },
  { key: 'today',    label: 'Today',    icon: 'sunny-outline' },
  { key: 'upcoming', label: 'Upcoming', icon: 'calendar-outline' },
  { key: 'overdue',  label: 'Overdue',  icon: 'alert-circle-outline' },
] as const;

const STATUS_FILTERS = [
  { key: undefined,      label: 'All',         color: '#64748B' },
  { key: 'todo',         label: 'To Do',       color: '#64748B' },
  { key: 'in_progress',  label: 'In Progress', color: '#3B82F6' },
  { key: 'completed',    label: 'Done',        color: '#22C55E' },
] as const;

const TasksScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { confirm } = useConfirm();
  const { GuideButton, GuideView } = useGuide('tasks');

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const filters: any = {};
  if (dateFilter !== 'all') filters.dueDate = dateFilter;
  if (statusFilter) filters.status = statusFilter;

  const { data: tasksData, isLoading, refetch, isRefetching } = useTasks(filters);
  const { data: statsData } = useTaskStats();
  const deleteMutation = useDeleteTask();
  const updateMutation = useUpdateTaskStatus();

  const tasks = tasksData?.data?.data ?? [];
  const stats = statsData?.data;

  const statItems = useMemo(() => [
    { label: 'To Do',       value: stats?.todo       ?? 0, color: '#64748B', icon: 'ellipse-outline' },
    { label: 'In Progress', value: stats?.inProgress ?? 0, color: '#3B82F6', icon: 'time-outline' },
    { label: 'Done',        value: stats?.completed  ?? 0, color: '#22C55E', icon: 'checkmark-circle-outline' },
    { label: 'Overdue',     value: stats?.overdue    ?? 0, color: '#EF4444', icon: 'alert-circle-outline' },
  ], [stats]);

  const handleDelete = async (task: any) => {
    const ok = await confirm({
      title: 'Delete Task',
      message: `Delete "${task.title}"?`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) deleteMutation.mutate(task._id);
  };

  if (isLoading) return (
    <View style={[st.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Tasks" />
      <TasksSkeleton />
    </View>
  );

  return (
    <View style={[st.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Tasks"
        right={
          <TouchableOpacity
            style={[st.statsBtn, { backgroundColor: `${colors.primary}12` }]}
            onPress={() => (navigation as any).navigate('TaskStats')}
          >
            <Icon name="stats-chart-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      {/* Stats Strip */}
      <View style={[st.statsRow, { backgroundColor: surfaceC, borderBottomColor: borderC }]}>
        {statItems.map((s, i) => (
          <TouchableOpacity
            key={s.label}
            style={st.statItem}
            onPress={() => {
              if (s.label === 'To Do') setStatusFilter('todo');
              else if (s.label === 'In Progress') setStatusFilter('in_progress');
              else if (s.label === 'Done') setStatusFilter('completed');
              else if (s.label === 'Overdue') { setStatusFilter(undefined); setDateFilter('overdue'); }
            }}
          >
            <View style={[st.statIconWrap, { backgroundColor: `${s.color}10` }]}>
              <Icon name={s.icon} size={13} color={s.color} />
            </View>
            <Text style={[st.statValue, { color: textPri }]}>{s.value}</Text>
            <Text style={[st.statLabel, { color: textSec }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date Filter */}
      <View style={[st.dateBar, { backgroundColor: surfaceC, borderBottomColor: borderC }]}>
        {DATE_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[st.dateTab, dateFilter === f.key && { borderBottomColor: '#3B82F6', borderBottomWidth: 2 }]}
            onPress={() => setDateFilter(f.key)}
          >
            <Icon name={f.icon} size={13} color={dateFilter === f.key ? '#3B82F6' : textSec} />
            <Text style={[st.dateTabText, { color: dateFilter === f.key ? '#3B82F6' : textSec }, dateFilter === f.key && { fontWeight: '700' }]}>
              {f.label}
            </Text>
            {f.key === 'overdue' && (stats?.overdue ?? 0) > 0 && (
              <View style={st.overdueBadge}>
                <Text style={st.overdueBadgeText}>{stats!.overdue}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Status Chips */}
      <View style={[st.statusBar, { backgroundColor: colors.background }]}>
        {STATUS_FILTERS.map(s => {
          const isActive = statusFilter === s.key;
          return (
            <TouchableOpacity
              key={String(s.key)}
              style={[st.statusChip, {
                backgroundColor: isActive ? `${s.color}12` : surfaceC,
                borderColor: isActive ? s.color : borderC,
              }]}
              onPress={() => setStatusFilter(s.key)}
            >
              {isActive && <View style={[st.statusDot, { backgroundColor: s.color }]} />}
              <Text style={[st.statusChipText, { color: isActive ? s.color : textSec }]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Task List */}
      {tasks.length === 0 ? (
        <View style={st.emptyWrap}>
          <View style={[st.emptyIconBg, { backgroundColor: '#3B82F610' }]}>
            <Icon name="checkmark-done-outline" size={40} color="#3B82F6" />
          </View>
          <Text style={[st.emptyTitle, { color: textPri }]}>
            {dateFilter !== 'all' ? `No ${dateFilter} tasks` : 'No tasks yet'}
          </Text>
          <Text style={[st.emptyHint, { color: textSec }]}>
            {dateFilter === 'all' ? 'Add a task to stay organised' : 'Adjust filters or add a new task'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onPress={() => (navigation as any).navigate('TaskDetails', { taskId: item._id })}
              onDelete={() => handleDelete(item)}
              onToggleStatus={() => updateMutation.mutate({
                id: item._id,
                status: item.status === 'completed' ? 'todo' : 'completed',
              })}
            />
          )}
          contentContainerStyle={st.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch}
              colors={['#3B82F6']} tintColor="#3B82F6" />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[st.fab, { backgroundColor: colors.primary }]}
        onPress={() => (navigation as any).navigate('AddTask', { mode: 'create' })}
        activeOpacity={0.8}
      >
        <Icon name="add" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const st = StyleSheet.create({
  container: { flex: 1 },

  statsBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  statsRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1 },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statIconWrap: { width: 26, height: 26, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 9 },

  dateBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 4 },
  dateTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 9, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  dateTabText: { fontSize: 11, fontWeight: '600' },
  overdueBadge: { backgroundColor: '#EF4444', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1 },
  overdueBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },

  statusBar: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingVertical: 8 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusChipText: { fontSize: 11, fontWeight: '600' },

  listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 90 },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, paddingHorizontal: 40 },
  emptyIconBg: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 15, fontWeight: '700' },
  emptyHint: { fontSize: 12, textAlign: 'center', lineHeight: 18 },

  fab: { position: 'absolute', bottom: 90, right: 20, width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
});

export default TasksScreen;
