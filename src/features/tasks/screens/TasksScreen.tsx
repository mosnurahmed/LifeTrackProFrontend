/**
 * Tasks Screen - Main List View (FIXED)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import {
  useTasks,
  useDeleteTask,
  useTaskStats,
  useUpdateTaskStatus,
} from '../../../hooks/api/useTasks';
import { Card, EmptyState, ErrorState } from '../../../components/common';
import { SkeletonList } from '../../../components/common/Loading';
import TaskItem from '../components/TaskItem';

const TasksScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  // ✅ Fixed useState with explicit types
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'today' | 'upcoming' | 'overdue'
  >('all');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined,
  );

  const filters: any = {};
  if (selectedFilter === 'today') filters.dueDate = 'today';
  if (selectedFilter === 'upcoming') filters.dueDate = 'upcoming';
  if (selectedFilter === 'overdue') filters.dueDate = 'overdue';
  if (selectedStatus && selectedStatus !== 'all')
    filters.status = selectedStatus;

  const {
    data: tasksData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useTasks(filters);
  const { data: statsData } = useTaskStats();
  const deleteMutation = useDeleteTask();
  const updateStatusMutation = useUpdateTaskStatus();

  const tasks = tasksData?.data?.data || [];
  console.log('task data,', tasks);
  const stats = statsData?.data;

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  const handleAddTask = () => {
    (navigation as any).navigate('AddTask', { mode: 'create' });
  };

  const handleEditTask = (id: string) => {
    (navigation as any).navigate('TaskDetails', { taskId: id });
  };

  const handleDeleteTask = (id: string, title: string) => {
    Alert.alert('Delete Task', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  const handleToggleStatus = async (
    id: string,
    currentStatus: 'todo' | 'in_progress' | 'completed' | 'cancelled',
  ) => {
    const nextStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    updateStatusMutation.mutate({ id, status: nextStatus });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tasks</Text>
        </View>
        <SkeletonList count={5} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tasks</Text>
        </View>
        <ErrorState
          title="Failed to load tasks"
          message="Please try again"
          onRetry={refetch}
        />
      </View>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tasks</Text>
        </View>
        <EmptyState
          icon="checkmark-done-outline"
          title="No Tasks Yet"
          message="Start organizing your tasks"
          actionLabel="Add Task"
          onAction={handleAddTask}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tasks</Text>
          <Text style={styles.headerSubtitle}>{tasks.length} tasks</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => (navigation as any).navigate('TaskStats')}
          >
            <Icon name="stats-chart" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              /* TODO: Add search */
            }}
          >
            <Icon name="search" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Overview */}
      {stats && (
        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.todo}</Text>
                <Text style={styles.statLabel}>To Do</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.inProgress}
                </Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {stats.completed}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.danger }]}>
                  {stats.overdue}
                </Text>
                <Text style={styles.statLabel}>Overdue</Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>View</Text>
        <View style={styles.filters}>
          {[
            { key: 'all', label: 'All', icon: 'list' },
            { key: 'today', label: 'Today', icon: 'today' },
            { key: 'upcoming', label: 'Upcoming', icon: 'calendar' },
            { key: 'overdue', label: 'Overdue', icon: 'alert-circle' },
          ].map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
            >
              <Icon
                name={filter.icon}
                size={16}
                color={
                  selectedFilter === filter.key
                    ? colors.primary
                    : colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Status Filter */}
      <View style={styles.statusFilters}>
        {[
          { key: 'all', label: 'All' },
          { key: 'todo', label: 'To Do' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'completed', label: 'Completed' },
        ].map(status => (
          <TouchableOpacity
            key={status.key}
            style={[
              styles.statusChip,
              selectedStatus === status.key && styles.statusChipActive,
            ]}
            onPress={() =>
              setSelectedStatus(status.key === 'all' ? undefined : status.key)
            }
          >
            <Text
              style={[
                styles.statusChipText,
                selectedStatus === status.key && styles.statusChipTextActive,
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onPress={() => handleEditTask(item._id)}
            onDelete={() => handleDeleteTask(item._id, item.title)}
            onToggleStatus={() => handleToggleStatus(item._id, item.status)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAddTask}
        activeOpacity={0.8}
      >
        <Icon name="add" size={28} color={colors.text.inverse} />
      </TouchableOpacity>
    </View>
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
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      ...textStyles.h3,
      color: colors.text.primary,
    },
    headerSubtitle: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    headerRight: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    headerButton: {
      padding: spacing.sm,
    },
    searchButton: {
      padding: spacing.sm,
    },
    statsContainer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    statsCard: {
      padding: spacing.md,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      ...textStyles.h3,
      color: colors.text.primary,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    statLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontSize: 10,
    },
    filtersContainer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    filtersTitle: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
      fontWeight: '600',
    },
    filters: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: `${colors.primary}15`,
      borderColor: colors.primary,
    },
    filterChipText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    filterChipTextActive: {
      color: colors.primary,
    },
    statusFilters: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      gap: spacing.sm,
    },
    statusChip: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    statusChipText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontSize: 10,
      fontWeight: '600',
    },
    statusChipTextActive: {
      color: colors.text.inverse,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: 100,
    },
    fab: {
      position: 'absolute',
      bottom: 80,
      right: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.lg,
    },
  });

export default TasksScreen;
