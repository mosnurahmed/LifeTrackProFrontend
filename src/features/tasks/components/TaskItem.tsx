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
  medium: { color: '#8B5CF6', label: 'Medium', icon: 'remove-circle' },
  low:    { color: '#64748B', label: 'Low',    icon: 'arrow-down-circle' },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  todo:        { color: '#64748B', label: 'To Do' },
  in_progress: { color: '#8B5CF6', label: 'In Progress' },
  completed:   { color: '#22C55E', label: 'Done' },
  cancelled:   { color: '#94A3B8', label: 'Cancelled' },
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onPress, onDelete, onToggleStatus }) => {
  const { colors } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
  const status   = STATUS_CONFIG[task.status]     ?? STATUS_CONFIG.todo;
  const isDone   = task.status === 'completed';
  const subtasksDone = task.subtasks?.filter(s => s.completed).length ?? 0;
  const subtasksTotal = task.subtasks?.length ?? 0;

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [80, 0] });
    return (
      <Animated.View style={[styles.swipeDelete, { transform: [{ translateX }] }]}>
        <TouchableOpacity style={styles.swipeDeleteBtn} onPress={() => {
          swipeableRef.current?.close();
          onDelete?.();
        }}>
          <Icon name="trash" size={22} color="#FFFFFF" />
          <Text style={styles.swipeDeleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity
        style={[styles.card, {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: priority.color,
          opacity: isDone ? 0.72 : 1,
        }]}
        onPress={onPress}
        activeOpacity={0.78}
      >
        {/* Checkbox + Content */}
        <TouchableOpacity
          style={[styles.checkbox, isDone
            ? { backgroundColor: '#22C55E', borderColor: '#22C55E' }
            : { backgroundColor: 'transparent', borderColor: colors.border }]}
          onPress={onToggleStatus}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isDone && <Icon name="checkmark" size={14} color="#FFFFFF" />}
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Title */}
          <Text style={[styles.title, { color: colors.text.primary }, isDone && styles.titleDone]}
            numberOfLines={2}>
            {task.title}
          </Text>

          {/* Description */}
          {task.description ? (
            <Text style={[styles.desc, { color: colors.text.tertiary }]} numberOfLines={1}>
              {task.description}
            </Text>
          ) : null}

          {/* Meta Row */}
          <View style={styles.metaRow}>
            {/* Priority */}
            <View style={[styles.badge, { backgroundColor: `${priority.color}15` }]}>
              <Icon name={priority.icon} size={10} color={priority.color} />
              <Text style={[styles.badgeText, { color: priority.color }]}>{priority.label}</Text>
            </View>

            {/* Status */}
            <View style={[styles.badge, { backgroundColor: `${status.color}15` }]}>
              <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
            </View>

            {/* Due Date */}
            {task.dueDate ? (
              <View style={[styles.badge, {
                backgroundColor: task.isOverdue ? '#EF444415' : colors.background,
              }]}>
                <Icon name="calendar-outline" size={10}
                  color={task.isOverdue ? '#EF4444' : colors.text.tertiary} />
                <Text style={[styles.badgeText, {
                  color: task.isOverdue ? '#EF4444' : colors.text.tertiary,
                }]}>
                  {formatRelativeTime(task.dueDate)}
                </Text>
              </View>
            ) : null}

            {/* Subtasks */}
            {subtasksTotal > 0 ? (
              <View style={[styles.badge, { backgroundColor: colors.background }]}>
                <Icon name="list-outline" size={10} color={colors.text.tertiary} />
                <Text style={[styles.badgeText, { color: colors.text.tertiary }]}>
                  {subtasksDone}/{subtasksTotal}
                </Text>
              </View>
            ) : null}

            {/* Indicators */}
            {task.reminder?.enabled ? (
              <Icon name="notifications-outline" size={13} color="#F59E0B" />
            ) : null}
            {task.repeat?.enabled ? (
              <Icon name="repeat-outline" size={13} color="#8B5CF6" />
            ) : null}
          </View>

          {/* Subtask progress bar */}
          {subtasksTotal > 0 ? (
            <View style={[styles.subBar, { backgroundColor: colors.border }]}>
              <View style={[styles.subBarFill, {
                width: `${(subtasksDone / subtasksTotal) * 100}%`,
                backgroundColor: '#8B5CF6',
              }]} />
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 3, lineHeight: 20 },
  titleDone: { textDecorationLine: 'line-through' },
  desc: { fontSize: 12, marginBottom: 7 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  subBar: { height: 3, borderRadius: 2, overflow: 'hidden', marginTop: 8 },
  subBarFill: { height: '100%', borderRadius: 2 },

  swipeDelete: { width: 76, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EF4444', borderRadius: 14, marginBottom: 10 },
  swipeDeleteBtn: { alignItems: 'center', padding: 12 },
  swipeDeleteText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', marginTop: 3 },
});

export default TaskItem;
