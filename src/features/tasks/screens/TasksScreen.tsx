/**
 * Tasks Screen
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../hooks/useTheme';
import { useTasks, useDeleteTask, useTaskStats, useUpdateTaskStatus } from '../../../hooks/api/useTasks';
import { AppHeader } from '../../../components/common';
import { SkeletonList } from '../../../components/common/Loading';
import TaskItem from '../components/TaskItem';

const ACCENT = '#8B5CF6';
const ACCENT_DARK = '#7C3AED';

const DATE_FILTERS = [
  { key: 'all',      label: 'All',      icon: 'layers-outline' },
  { key: 'today',    label: 'Today',    icon: 'sunny-outline' },
  { key: 'upcoming', label: 'Upcoming', icon: 'calendar-outline' },
  { key: 'overdue',  label: 'Overdue',  icon: 'alert-circle-outline' },
] as const;

const STATUS_FILTERS = [
  { key: undefined,      label: 'All',         color: '#64748B' },
  { key: 'todo',         label: 'To Do',       color: '#64748B' },
  { key: 'in_progress',  label: 'In Progress', color: ACCENT },
  { key: 'completed',    label: 'Done',        color: '#22C55E' },
] as const;

const TasksScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, shadows } = useTheme();

  const [dateFilter, setDateFilter]     = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const filters: any = {};
  if (dateFilter !== 'all')             filters.dueDate = dateFilter;
  if (statusFilter)                     filters.status  = statusFilter;

  const { data: tasksData, isLoading, error, refetch, isRefetching } = useTasks(filters);
  const { data: statsData } = useTaskStats();
  const deleteMutation      = useDeleteTask();
  const updateMutation      = useUpdateTaskStatus();

  const tasks = tasksData?.data?.data ?? [];
  const stats = statsData?.data;

  const statItems = useMemo(() => [
    { label: 'To Do',       value: stats?.todo       ?? 0, color: '#64748B', icon: 'ellipse-outline' },
    { label: 'In Progress', value: stats?.inProgress ?? 0, color: ACCENT,    icon: 'time-outline' },
    { label: 'Done',        value: stats?.completed  ?? 0, color: '#22C55E', icon: 'checkmark-circle-outline' },
    { label: 'Overdue',     value: stats?.overdue    ?? 0, color: '#EF4444', icon: 'alert-circle-outline' },
  ], [stats]);

  if (isLoading) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Tasks" right={<View style={{ width: 34 }} />} />
      <SkeletonList count={5} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Tasks"
        right={
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => (navigation as any).navigate('TaskStats')}
            >
              <Icon name="stats-chart-outline" size={18} color={ACCENT} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: ACCENT }]}
              onPress={() => (navigation as any).navigate('AddTask', { mode: 'create' })}
            >
              <Icon name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Stats Strip */}
      <LinearGradient
        colors={[ACCENT_DARK, ACCENT]}
        style={[styles.statsStrip, shadows.sm]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      >
        {statItems.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <View style={styles.stripDivider} />}
            <TouchableOpacity
              style={styles.stripItem}
              onPress={() => {
                if (s.label === 'To Do')       setStatusFilter('todo');
                else if (s.label === 'In Progress') setStatusFilter('in_progress');
                else if (s.label === 'Done')   setStatusFilter('completed');
                else if (s.label === 'Overdue') { setStatusFilter(undefined); setDateFilter('overdue'); }
              }}
            >
              <Icon name={s.icon} size={14} color="#FFFFFF99" />
              <Text style={[styles.stripValue, s.value > 0 && s.label === 'Overdue' && { color: '#FCA5A5' }]}>
                {s.value}
              </Text>
              <Text style={styles.stripLabel}>{s.label}</Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </LinearGradient>

      {/* Date Filter Chips */}
      <View style={[styles.dateFilterBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {DATE_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.dateTab, dateFilter === f.key && { borderBottomColor: ACCENT, borderBottomWidth: 2 }]}
            onPress={() => setDateFilter(f.key)}
          >
            <Icon name={f.icon} size={14} color={dateFilter === f.key ? ACCENT : colors.text.tertiary} />
            <Text style={[styles.dateTabText, { color: dateFilter === f.key ? ACCENT : colors.text.secondary },
              dateFilter === f.key && { fontWeight: '700' }]}>
              {f.label}
            </Text>
            {f.key === 'overdue' && (stats?.overdue ?? 0) > 0 && (
              <View style={styles.overdueCount}>
                <Text style={styles.overdueCountText}>{stats!.overdue}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Status Chips */}
      <View style={[styles.statusBar, { backgroundColor: colors.background }]}>
        {STATUS_FILTERS.map(s => {
          const isActive = statusFilter === s.key;
          return (
            <TouchableOpacity
              key={String(s.key)}
              style={[styles.statusChip, {
                backgroundColor: isActive ? `${s.color}20` : colors.surface,
                borderColor:     isActive ? s.color : colors.border,
              }]}
              onPress={() => setStatusFilter(s.key)}
            >
              {isActive && <View style={[styles.statusDot, { backgroundColor: s.color }]} />}
              <Text style={[styles.statusChipText, { color: isActive ? s.color : colors.text.secondary }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Task List */}
      {tasks.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIconBg, { backgroundColor: `${ACCENT}12` }]}>
            <Icon name="checkmark-done-outline" size={52} color={ACCENT} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
            {dateFilter !== 'all' ? `No ${dateFilter} tasks` : 'No tasks yet'}
          </Text>
          <Text style={[styles.emptyHint, { color: colors.text.secondary }]}>
            {dateFilter === 'all' ? 'Add a task to stay organised' : 'Adjust filters or add a new task'}
          </Text>
          {dateFilter === 'all' && (
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: ACCENT }]}
              onPress={() => (navigation as any).navigate('AddTask', { mode: 'create' })}
            >
              <Icon name="add" size={18} color="#FFFFFF" />
              <Text style={styles.emptyBtnText}>Add Task</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onPress={() => (navigation as any).navigate('TaskDetails', { taskId: item._id })}
              onDelete={() => Alert.alert('Delete Task', `Delete "${item.title}"?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(item._id) },
              ])}
              onToggleStatus={() => updateMutation.mutate({
                id: item._id,
                status: item.status === 'completed' ? 'todo' : 'completed',
              })}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch}
              colors={[ACCENT]} tintColor={ACCENT} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerRight: { flexDirection: 'row', gap: 8 },
  headerBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  statsStrip: { flexDirection: 'row', marginHorizontal: 16, marginTop: 14, marginBottom: 2, borderRadius: 14, paddingVertical: 13 },
  stripItem:  { flex: 1, alignItems: 'center', gap: 3 },
  stripValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  stripLabel: { color: '#FFFFFF90', fontSize: 10 },
  stripDivider: { width: 1, backgroundColor: '#FFFFFF30' },

  dateFilterBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 4, marginTop: 10 },
  dateTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  dateTabText: { fontSize: 12, fontWeight: '600' },
  overdueCount: { backgroundColor: '#EF4444', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  overdueCountText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },

  statusBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusChipText: { fontSize: 12, fontWeight: '600' },

  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 40 },
  emptyIconBg: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyHint: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

export default TasksScreen;
