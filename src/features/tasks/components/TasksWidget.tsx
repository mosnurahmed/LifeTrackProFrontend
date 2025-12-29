/**
 * Tasks Widget - For Dashboard
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useTasks, useTaskStats } from '../../../hooks/api/useTasks';
import { Card, Spinner } from '../../../components/common';

const TasksWidget: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const { data: statsData, isLoading: statsLoading } = useTaskStats();
  const { data: tasksData } = useTasks({ status: 'todo', dueDate: 'today' });

  const stats = statsData?.data;
  const todayTasks = tasksData?.data || [];

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  if (statsLoading) {
    return (
      <Card style={styles.container}>
        <Spinner size="small" />
      </Card>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <Icon name="checkmark-done" size={20} color={colors.primary} />
          <Text style={styles.title}>Tasks</Text>
        </View>
        <Text style={styles.emptyText}>No tasks yet</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => (navigation as any).navigate('Tasks')}
        >
          <Text style={styles.emptyButtonText}>Add Task</Text>
        </TouchableOpacity>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => (navigation as any).navigate('Tasks')}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <Icon name="checkmark-done" size={20} color={colors.primary} />
          <Text style={styles.title}>Tasks</Text>
          <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: `${colors.warning}15` },
              ]}
            >
              <Icon name="list" size={16} color={colors.warning} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stats.todo}</Text>
              <Text style={styles.statLabel}>To Do</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: `${colors.primary}15` },
              ]}
            >
              <Icon name="play" size={16} color={colors.primary} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stats.inProgress}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: `${colors.success}15` },
              ]}
            >
              <Icon name="checkmark-circle" size={16} color={colors.success} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
          </View>
        </View>

        {/* Alerts */}
        {stats.overdue > 0 && (
          <View style={styles.alertBox}>
            <Icon name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.alertText}>
              {stats.overdue} task{stats.overdue !== 1 ? 's' : ''} overdue
            </Text>
          </View>
        )}

        {stats.dueToday > 0 && (
          <View
            style={[
              styles.alertBox,
              { backgroundColor: `${colors.warning}15` },
            ]}
          >
            <Icon name="today" size={16} color={colors.warning} />
            <Text style={[styles.alertText, { color: colors.warning }]}>
              {stats.dueToday} task{stats.dueToday !== 1 ? 's' : ''} due today
            </Text>
          </View>
        )}

        {/* Today's Tasks Preview */}
        {todayTasks.length > 0 && (
          <View style={styles.todaySection}>
            <Text style={styles.todayTitle}>Today's Tasks</Text>
            {todayTasks.slice(0, 3).map((task: any) => (
              <View key={task._id} style={styles.todayTask}>
                <View
                  style={[
                    styles.priorityDot,
                    {
                      backgroundColor:
                        task.priority === 'urgent'
                          ? colors.danger
                          : task.priority === 'high'
                          ? colors.warning
                          : task.priority === 'medium'
                          ? colors.info
                          : colors.text.tertiary,
                    },
                  ]}
                />
                <Text style={styles.todayTaskText} numberOfLines={1}>
                  {task.title}
                </Text>
              </View>
            ))}
            {todayTasks.length > 3 && (
              <Text style={styles.moreText}>+{todayTasks.length - 3} more</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );
};

const createStyles = (
  colors: any,
  textStyles: any,
  spacing: any,
  borderRadius: any,
) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    content: {
      padding: 0,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    title: {
      ...textStyles.h4,
      color: colors.text.primary,
      flex: 1,
    },
    statsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    statItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.background,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
    },
    statIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statInfo: {
      flex: 1,
    },
    statValue: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '700',
      fontSize: 16,
    },
    statLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontSize: 9,
    },
    alertBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: `${colors.danger}15`,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
    },
    alertText: {
      ...textStyles.caption,
      color: colors.danger,
      fontWeight: '600',
    },
    todaySection: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    todayTitle: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
      fontWeight: '600',
    },
    todayTask: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    todayTaskText: {
      ...textStyles.caption,
      color: colors.text.primary,
      flex: 1,
    },
    moreText: {
      ...textStyles.caption,
      color: colors.text.tertiary,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    emptyText: {
      ...textStyles.body,
      color: colors.text.secondary,
      textAlign: 'center',
      marginVertical: spacing.md,
    },
    emptyButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      alignSelf: 'center',
    },
    emptyButtonText: {
      ...textStyles.body,
      color: colors.text.inverse,
      fontWeight: '600',
    },
  });

export default TasksWidget;
