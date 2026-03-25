/**
 * Task Item Component
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { Task } from '../../../api/endpoints/tasks';
import { formatRelativeTime } from '../../../utils/formatters';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
}

const PRIORITY_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  urgent: { color: '#EF4444', label: 'Urgent', icon: 'flame' },
  high:   { color: '#F97316', label: 'High',   icon: 'arrow-up-circle' },
  medium: { color: '#F59E0B', label: 'Medium', icon: 'remove-circle' },
  low:    { color: '#64748B', label: 'Low',    icon: 'arrow-down-circle' },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  todo:        { color: '#64748B', label: 'To Do' },
  in_progress: { color: '#3B82F6', label: 'In Progress' },
  completed:   { color: '#22C55E', label: 'Done' },
  cancelled:   { color: '#94A3B8', label: 'Cancelled' },
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onPress, onDelete, onToggleStatus }) => {
  const { colors, isDark } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
  const status   = STATUS_CONFIG[task.status]     ?? STATUS_CONFIG.todo;
  const isDone   = task.status === 'completed';
  const subtasksDone = task.subtasks?.filter(s => s.completed).length ?? 0;
  const subtasksTotal = task.subtasks?.length ?? 0;

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [72, 0] });
    return (
      <Animated.View style={[st.swipeDelete, { transform: [{ translateX }] }]}>
        <TouchableOpacity style={st.swipeDeleteBtn} onPress={() => {
          swipeableRef.current?.close();
          onDelete?.();
        }}>
          <Icon name="trash" size={18} color="#FFFFFF" />
          <Text style={st.swipeDeleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity
        style={[st.card, { backgroundColor: surfaceC, borderColor: borderC, opacity: isDone ? 0.7 : 1 }]}
        onPress={onPress}
        activeOpacity={0.78}
      >
        {/* Checkbox */}
        <TouchableOpacity
          style={[st.checkbox, isDone
            ? { backgroundColor: '#22C55E', borderColor: '#22C55E' }
            : { backgroundColor: 'transparent', borderColor: borderC }]}
          onPress={onToggleStatus}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isDone && <Icon name="checkmark" size={12} color="#FFFFFF" />}
        </TouchableOpacity>

        <View style={st.content}>
          <Text style={[st.title, { color: textPri }, isDone && st.titleDone]} numberOfLines={2}>
            {task.title}
          </Text>

          {task.description ? (
            <Text style={[st.desc, { color: isDark ? '#475569' : '#CBD5E1' }]} numberOfLines={1}>
              {task.description}
            </Text>
          ) : null}

          <View style={st.metaRow}>
            <View style={[st.badge, { backgroundColor: `${priority.color}10` }]}>
              <Icon name={priority.icon} size={9} color={priority.color} />
              <Text style={[st.badgeText, { color: priority.color }]}>{priority.label}</Text>
            </View>

            <View style={[st.badge, { backgroundColor: `${status.color}10` }]}>
              <Text style={[st.badgeText, { color: status.color }]}>{status.label}</Text>
            </View>

            {task.dueDate ? (
              <View style={[st.badge, { backgroundColor: task.isOverdue ? '#EF444410' : (isDark ? '#334155' : '#F8FAFC') }]}>
                <Icon name="calendar-outline" size={9} color={task.isOverdue ? '#EF4444' : textSec} />
                <Text style={[st.badgeText, { color: task.isOverdue ? '#EF4444' : textSec }]}>
                  {formatRelativeTime(task.dueDate)}
                </Text>
              </View>
            ) : null}

            {subtasksTotal > 0 ? (
              <View style={[st.badge, { backgroundColor: isDark ? '#334155' : '#F8FAFC' }]}>
                <Icon name="list-outline" size={9} color={textSec} />
                <Text style={[st.badgeText, { color: textSec }]}>{subtasksDone}/{subtasksTotal}</Text>
              </View>
            ) : null}

            {task.reminder?.enabled && <Icon name="notifications-outline" size={11} color="#F59E0B" />}
            {task.repeat?.enabled && <Icon name="repeat-outline" size={11} color="#3B82F6" />}
          </View>

          {subtasksTotal > 0 ? (
            <View style={[st.subBar, { backgroundColor: borderC }]}>
              <View style={[st.subBarFill, { width: `${(subtasksDone / subtasksTotal) * 100}%` as any, backgroundColor: '#22C55E' }]} />
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const st = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 8, gap: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginTop: 1, flexShrink: 0 },
  content: { flex: 1 },
  title: { fontSize: 13, fontWeight: '600', marginBottom: 2, lineHeight: 18 },
  titleDone: { textDecorationLine: 'line-through' },
  desc: { fontSize: 11, marginBottom: 5 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: '700' },
  subBar: { height: 3, borderRadius: 2, overflow: 'hidden', marginTop: 6 },
  subBarFill: { height: '100%', borderRadius: 2 },
  swipeDelete: { width: 68, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EF4444', borderRadius: 10, marginBottom: 8 },
  swipeDeleteBtn: { alignItems: 'center', padding: 10 },
  swipeDeleteText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', marginTop: 2 },
});

export default TaskItem;
