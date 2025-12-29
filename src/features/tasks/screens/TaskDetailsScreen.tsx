/**
 * Task Details Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import {
  useTask,
  useUpdateTaskStatus,
  useDeleteTask,
  useAddSubtask,
  useUpdateSubtask,
  useDeleteSubtask,
} from '../../../hooks/api/useTasks';
import { Card, Button, Spinner, ErrorState } from '../../../components/common';
import { formatDate, formatRelativeTime } from '../../../utils/formatters';

const TaskDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const { taskId } = (route.params as any) || {};

  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const { data: taskData, isLoading, error } = useTask(taskId);
  const updateStatusMutation = useUpdateTaskStatus();
  const deleteMutation = useDeleteTask();
  const addSubtaskMutation = useAddSubtask();
  const updateSubtaskMutation = useUpdateSubtask();
  const deleteSubtaskMutation = useDeleteSubtask();

  const task = taskData?.data;

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  const getPriorityColor = () => {
    switch (task?.priority) {
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
    switch (task?.status) {
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

  const handleUpdateStatus = (
    status: 'todo' | 'in_progress' | 'completed' | 'cancelled',
  ) => {
    updateStatusMutation.mutate({ id: taskId, status });
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteMutation.mutate(taskId);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleAddSubtask = async () => {
    if (newSubtaskTitle.trim()) {
      await addSubtaskMutation.mutateAsync({
        taskId,
        title: newSubtaskTitle.trim(),
      });
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
    }
  };

  const handleToggleSubtask = (subtaskId: string, completed: boolean) => {
    updateSubtaskMutation.mutate({
      taskId,
      subtaskId,
      data: { completed: !completed },
    });
  };

  const handleDeleteSubtask = (subtaskId: string, title: string) => {
    Alert.alert('Delete Subtask', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSubtaskMutation.mutate({ taskId, subtaskId }),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Spinner text="Loading..." />
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={styles.container}>
        <ErrorState
          title="Task not found"
          message="Unable to load task details"
          onRetry={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() =>
              (navigation as any).navigate('AddTask', {
                mode: 'edit',
                taskId,
              })
            }
            style={styles.headerButton}
          >
            <Icon name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Icon name="trash-outline" size={24} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Main Card */}
        <Card style={styles.mainCard}>
          {/* Title */}
          <View style={styles.titleSection}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                task.status === 'completed' && {
                  backgroundColor: colors.success,
                  borderColor: colors.success,
                },
              ]}
              onPress={() =>
                handleUpdateStatus(
                  task.status === 'completed' ? 'todo' : 'completed',
                )
              }
            >
              {task.status === 'completed' && (
                <Icon name="checkmark" size={20} color={colors.text.inverse} />
              )}
            </TouchableOpacity>
            <Text
              style={[
                styles.title,
                task.status === 'completed' && styles.titleCompleted,
              ]}
            >
              {task.title}
            </Text>
          </View>

          {/* Description */}
          {task.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.description}>{task.description}</Text>
            </View>
          )}

          {/* Meta Info */}
          <View style={styles.metaSection}>
            {/* Priority */}
            <View style={styles.metaRow}>
              <Icon name="flag" size={20} color={getPriorityColor()} />
              <Text style={styles.metaLabel}>Priority</Text>
              <View
                style={[
                  styles.metaBadge,
                  { backgroundColor: `${getPriorityColor()}15` },
                ]}
              >
                <Text
                  style={[styles.metaBadgeText, { color: getPriorityColor() }]}
                >
                  {task.priority.charAt(0).toUpperCase() +
                    task.priority.slice(1)}
                </Text>
              </View>
            </View>

            {/* Status */}
            <View style={styles.metaRow}>
              <Icon name="ellipse" size={20} color={getStatusColor()} />
              <Text style={styles.metaLabel}>Status</Text>
              <View
                style={[
                  styles.metaBadge,
                  { backgroundColor: `${getStatusColor()}15` },
                ]}
              >
                <Text
                  style={[styles.metaBadgeText, { color: getStatusColor() }]}
                >
                  {task.status === 'in_progress'
                    ? 'In Progress'
                    : task.status.charAt(0).toUpperCase() +
                      task.status.slice(1)}
                </Text>
              </View>
            </View>

            {/* Due Date */}
            {task.dueDate && (
              <View style={styles.metaRow}>
                <Icon
                  name="calendar"
                  size={20}
                  color={task.isOverdue ? colors.danger : colors.text.secondary}
                />
                <Text style={styles.metaLabel}>Due Date</Text>
                <Text
                  style={[
                    styles.metaValue,
                    task.isOverdue && { color: colors.danger },
                  ]}
                >
                  {formatDate(task.dueDate, 'dd MMM yyyy')}
                  {task.isOverdue && ' (Overdue)'}
                </Text>
              </View>
            )}

            {/* Created */}
            <View style={styles.metaRow}>
              <Icon name="time" size={20} color={colors.text.secondary} />
              <Text style={styles.metaLabel}>Created</Text>
              <Text style={styles.metaValue}>
                {formatRelativeTime(task.createdAt)}
              </Text>
            </View>

            {/* Completed */}
            {task.completedAt && (
              <View style={styles.metaRow}>
                <Icon
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                />
                <Text style={styles.metaLabel}>Completed</Text>
                <Text style={styles.metaValue}>
                  {formatRelativeTime(task.completedAt)}
                </Text>
              </View>
            )}

            {/* Reminder */}
            {task.reminder?.enabled && (
              <View style={styles.metaRow}>
                <Icon name="notifications" size={20} color={colors.warning} />
                <Text style={styles.metaLabel}>Reminder</Text>
                <Text style={styles.metaValue}>
                  {formatDate(task.reminder.time, 'dd MMM, HH:mm')}
                </Text>
              </View>
            )}

            {/* Repeat */}
            {task.repeat?.enabled && (
              <View style={styles.metaRow}>
                <Icon name="repeat" size={20} color={colors.info} />
                <Text style={styles.metaLabel}>Repeat</Text>
                <Text style={styles.metaValue}>
                  {task.repeat.interval.charAt(0).toUpperCase() +
                    task.repeat.interval.slice(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsTitle}>Tags</Text>
              <View style={styles.tags}>
                {task.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Icon name="pricetag" size={12} color={colors.primary} />
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Quick Actions</Text>
          <View style={styles.actions}>
            {task.status !== 'in_progress' && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: `${colors.primary}15` },
                ]}
                onPress={() => handleUpdateStatus('in_progress')}
              >
                <Icon name="play" size={20} color={colors.primary} />
                <Text
                  style={[styles.actionButtonText, { color: colors.primary }]}
                >
                  Start
                </Text>
              </TouchableOpacity>
            )}
            {task.status !== 'completed' && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: `${colors.success}15` },
                ]}
                onPress={() => handleUpdateStatus('completed')}
              >
                <Icon name="checkmark" size={20} color={colors.success} />
                <Text
                  style={[styles.actionButtonText, { color: colors.success }]}
                >
                  Complete
                </Text>
              </TouchableOpacity>
            )}
            {task.status === 'completed' && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: `${colors.warning}15` },
                ]}
                onPress={() => handleUpdateStatus('todo')}
              >
                <Icon name="refresh" size={20} color={colors.warning} />
                <Text
                  style={[styles.actionButtonText, { color: colors.warning }]}
                >
                  Reopen
                </Text>
              </TouchableOpacity>
            )}
            {task.status !== 'cancelled' && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: `${colors.danger}15` },
                ]}
                onPress={() => handleUpdateStatus('cancelled')}
              >
                <Icon name="close" size={20} color={colors.danger} />
                <Text
                  style={[styles.actionButtonText, { color: colors.danger }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Subtasks */}
        <Card style={styles.subtasksCard}>
          <View style={styles.subtasksHeader}>
            <Text style={styles.subtasksTitle}>
              Subtasks (
              {task.subtasks?.filter((s: any) => s.completed).length || 0}/
              {task.subtasks?.length || 0})
            </Text>
            <TouchableOpacity onPress={() => setShowAddSubtask(true)}>
              <Icon name="add-circle" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          {task.subtasks && task.subtasks.length > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${task.subtaskProgress}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{task.subtaskProgress}%</Text>
            </View>
          )}

          {/* Subtask List */}
          {task.subtasks && task.subtasks.length > 0 ? (
            task.subtasks.map((subtask: any) => (
              <View key={subtask._id} style={styles.subtaskItem}>
                <TouchableOpacity
                  style={[
                    styles.subtaskCheckbox,
                    subtask.completed && {
                      backgroundColor: colors.success,
                      borderColor: colors.success,
                    },
                  ]}
                  onPress={() =>
                    handleToggleSubtask(subtask._id, subtask.completed)
                  }
                >
                  {subtask.completed && (
                    <Icon
                      name="checkmark"
                      size={14}
                      color={colors.text.inverse}
                    />
                  )}
                </TouchableOpacity>
                <Text
                  style={[
                    styles.subtaskTitle,
                    subtask.completed && styles.subtaskTitleCompleted,
                  ]}
                >
                  {subtask.title}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    handleDeleteSubtask(subtask._id, subtask.title)
                  }
                >
                  <Icon name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptySubtasks}>No subtasks yet</Text>
          )}
        </Card>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Add Subtask Modal */}
      <Modal visible={showAddSubtask} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Subtask</Text>
              <TouchableOpacity onPress={() => setShowAddSubtask(false)}>
                <Icon name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Subtask title"
              value={newSubtaskTitle}
              onChangeText={setNewSubtaskTitle}
              style={styles.modalInput}
              placeholderTextColor={colors.text.tertiary}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button
                variant="outline"
                onPress={() => setShowAddSubtask(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              >
                Cancel
              </Button>
              <Button
                onPress={handleAddSubtask}
                disabled={!newSubtaskTitle.trim()}
                loading={addSubtaskMutation.isPending}
                style={{ flex: 1, marginLeft: spacing.sm }}
              >
                Add
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
      flex: 1,
      marginLeft: spacing.md,
    },
    headerRight: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    headerButton: {
      padding: spacing.xs,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    mainCard: {
      marginBottom: spacing.lg,
    },
    titleSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    checkbox: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      ...textStyles.h3,
      color: colors.text.primary,
      flex: 1,
    },
    titleCompleted: {
      textDecorationLine: 'line-through',
      color: colors.text.secondary,
    },
    descriptionSection: {
      marginBottom: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    description: {
      ...textStyles.body,
      color: colors.text.secondary,
      lineHeight: 24,
    },
    metaSection: {
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    metaLabel: {
      ...textStyles.body,
      color: colors.text.secondary,
      flex: 1,
    },
    metaValue: {
      ...textStyles.body,
      color: colors.text.primary,
      fontWeight: '600',
    },
    metaBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    metaBadgeText: {
      ...textStyles.caption,
      fontWeight: '700',
      textTransform: 'capitalize',
    },
    tagsSection: {
      marginTop: spacing.lg,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    tagsTitle: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      backgroundColor: `${colors.primary}15`,
    },
    tagText: {
      ...textStyles.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    actionsCard: {
      marginBottom: spacing.lg,
    },
    actionsTitle: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
    },
    actionButtonText: {
      ...textStyles.body,
      fontWeight: '600',
    },
    subtasksCard: {
      marginBottom: spacing.lg,
    },
    subtasksHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    subtasksTitle: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    progressBar: {
      flex: 1,
      height: 8,
      backgroundColor: colors.border,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: borderRadius.full,
    },
    progressText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontWeight: '700',
    },
    subtaskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      gap: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    subtaskCheckbox: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    subtaskTitle: {
      ...textStyles.body,
      color: colors.text.primary,
      flex: 1,
    },
    subtaskTitleCompleted: {
      textDecorationLine: 'line-through',
      color: colors.text.secondary,
    },
    emptySubtasks: {
      ...textStyles.body,
      color: colors.text.tertiary,
      textAlign: 'center',
      paddingVertical: spacing.xl,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      width: '90%',
      maxWidth: 400,
      ...shadows.lg,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    modalTitle: {
      ...textStyles.h4,
      color: colors.text.primary,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      ...textStyles.body,
      color: colors.text.primary,
      backgroundColor: colors.surface,
      marginBottom: spacing.lg,
    },
    modalActions: {
      flexDirection: 'row',
    },
  });

export default TaskDetailsScreen;
