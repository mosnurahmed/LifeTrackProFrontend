/**
 * Task List Item Component
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
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

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onPress,
  onDelete,
  onToggleStatus,
}) => {
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'urgent':
        return colors.danger;
      case 'high':
        return colors.warning;
      case 'medium':
        return colors.info;
      case 'low':
        return colors.text.tertiary;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return colors.success;
      case 'in_progress':
        return colors.primary;
      case 'cancelled':
        return colors.text.tertiary;
      default:
        return colors.text.secondary;
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
  ) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          { backgroundColor: colors.danger, transform: [{ translateX }] },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete?.();
          }}
        >
          <Icon name="trash" size={24} color={colors.text.inverse} />
          <Text
            style={[
              textStyles.caption,
              { color: colors.text.inverse, marginTop: 4 },
            ]}
          >
            Delete
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[
          styles.container,
          task.status === 'completed' && styles.containerCompleted,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Checkbox */}
        <TouchableOpacity
          style={[
            styles.checkbox,
            task.status === 'completed' && {
              backgroundColor: colors.success,
              borderColor: colors.success,
            },
          ]}
          onPress={onToggleStatus}
        >
          {task.status === 'completed' && (
            <Icon name="checkmark" size={16} color={colors.text.inverse} />
          )}
        </TouchableOpacity>

        {/* Priority Bar */}
        <View
          style={[styles.priorityBar, { backgroundColor: getPriorityColor() }]}
        />

        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              task.status === 'completed' && styles.titleCompleted,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          {task.description && (
            <Text style={styles.description} numberOfLines={1}>
              {task.description}
            </Text>
          )}

          {/* Meta Row */}
          <View style={styles.metaRow}>
            {/* Due Date */}
            {task.dueDate && (
              <View
                style={[
                  styles.metaBadge,
                  task.isOverdue && { backgroundColor: `${colors.danger}15` },
                ]}
              >
                <Icon
                  name="calendar-outline"
                  size={12}
                  color={task.isOverdue ? colors.danger : colors.text.secondary}
                />
                <Text
                  style={[
                    styles.metaBadgeText,
                    task.isOverdue && { color: colors.danger },
                  ]}
                >
                  {formatRelativeTime(task.dueDate)}
                </Text>
              </View>
            )}

            {/* Status */}
            <View
              style={[
                styles.metaBadge,
                { backgroundColor: `${getStatusColor()}15` },
              ]}
            >
              <Text style={[styles.metaBadgeText, { color: getStatusColor() }]}>
                {task.status.replace('_', ' ')}
              </Text>
            </View>

            {/* Subtasks Progress */}
            {task.subtasks && task.subtasks.length > 0 && (
              <View style={styles.metaBadge}>
                <Icon name="list" size={12} color={colors.text.secondary} />
                <Text style={styles.metaBadgeText}>
                  {task.subtasks.filter(s => s.completed).length}/
                  {task.subtasks.length}
                </Text>
              </View>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <View style={styles.metaBadge}>
                <Icon name="pricetag" size={12} color={colors.primary} />
                <Text style={styles.metaBadgeText}>{task.tags.length}</Text>
              </View>
            )}

            {/* Reminder */}
            {task.reminder?.enabled && (
              <Icon name="notifications" size={14} color={colors.warning} />
            )}

            {/* Recurring */}
            {task.repeat?.enabled && (
              <Icon name="repeat" size={14} color={colors.info} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const createStyles = (
  colors: any,
  textStyles: any,
  spacing: any,
  borderRadius: any,
  shadows: any,
) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.sm,
    },
    containerCompleted: {
      opacity: 0.7,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    priorityBar: {
      width: 4,
      height: '100%',
      borderRadius: 2,
      marginRight: spacing.md,
    },
    content: {
      flex: 1,
    },
    title: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    titleCompleted: {
      textDecorationLine: 'line-through',
      color: colors.text.secondary,
    },
    description: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    metaBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.background,
    },
    metaBadgeText: {
      ...textStyles.caption,
      fontSize: 10,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    deleteAction: {
      width: 80,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
    },
    deleteButton: {
      alignItems: 'center',
      padding: spacing.md,
    },
  });

export default TaskItem;
