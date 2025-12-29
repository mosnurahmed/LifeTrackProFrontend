/**
 * Add/Edit Task Modal
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import { useTheme } from '../../../hooks/useTheme';
import {
  useCreateTask,
  useUpdateTask,
  useTask,
} from '../../../hooks/api/useTasks';
import { Button, Input, Spinner } from '../../../components/common';
import { taskSchema } from '../../../utils/validation/schemas';
import { formatDate } from '../../../utils/formatters';

const AddTaskModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const { mode, taskId } = (route.params as any) || { mode: 'create' };
  const isEditMode = mode === 'edit';

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date | undefined>(undefined);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState<
    'daily' | 'weekly' | 'monthly'
  >('daily');

  const { data: taskData, isLoading: taskLoading } = useTask(taskId);
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const task = taskData?.data;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium' as 'urgent' | 'high' | 'medium' | 'low',
      status: 'todo' as 'todo' | 'in_progress' | 'completed' | 'cancelled',
      dueDate: undefined as Date | undefined,
      tags: [] as string[],
    },
  });

  const selectedPriority = watch('priority');
  const selectedStatus = watch('status');
  const dueDate = watch('dueDate');

  useEffect(() => {
    if (isEditMode && task) {
      setValue('title', task.title);
      setValue('description', task.description || '');
      setValue('priority', task.priority);
      setValue('status', task.status);
      setValue('dueDate', task.dueDate ? new Date(task.dueDate) : undefined);
      setValue('tags', task.tags || []);

      if (task.reminder?.enabled) {
        setReminderEnabled(true);
        setReminderTime(new Date(task.reminder.time));
      }

      if (task.repeat?.enabled) {
        setRepeatEnabled(true);
        setRepeatInterval(task.repeat.interval);
      }
    }
  }, [task, isEditMode]);

  const onSubmit = async (data: any) => {
    const formattedData = {
      ...data,
      dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
      reminder: reminderEnabled
        ? {
            enabled: true,
            time: reminderTime?.toISOString() || new Date().toISOString(),
          }
        : undefined,
      repeat: repeatEnabled
        ? {
            enabled: true,
            interval: repeatInterval,
          }
        : undefined,
      tags: data.tags?.filter((t: string) => t.trim()) || [],
    };

    Object.keys(formattedData).forEach(key => {
      if (formattedData[key] === undefined) {
        delete formattedData[key];
      }
    });

    if (isEditMode) {
      await updateMutation.mutateAsync({ id: taskId, data: formattedData });
    } else {
      await createMutation.mutateAsync(formattedData);
    }
    navigation.goBack();
  };

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  if (isEditMode && taskLoading) {
    return (
      <View style={styles.container}>
        <Spinner text="Loading..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditMode ? 'Edit Task' : 'New Task'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Title */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Task Title *"
                placeholder="Enter task title"
                value={value}
                onChangeText={onChange}
                error={errors.title?.message}
                leftIcon="text-outline"
              />
            )}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Description (Optional)"
                placeholder="Add details about this task"
                value={value}
                onChangeText={onChange}
                type="multiline"
                leftIcon="document-text-outline"
              />
            )}
          />
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority</Text>
          <View style={styles.priorityOptions}>
            <Controller
              control={control}
              name="priority"
              render={({ field: { onChange, value } }) => (
                <>
                  {['urgent', 'high', 'medium', 'low'].map(priority => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityOption,
                        value === priority && styles.priorityOptionActive,
                        {
                          borderColor:
                            value === priority
                              ? priority === 'urgent'
                                ? colors.danger
                                : priority === 'high'
                                ? colors.warning
                                : priority === 'medium'
                                ? colors.info
                                : colors.text.tertiary
                              : colors.border,
                        },
                      ]}
                      onPress={() => onChange(priority)}
                    >
                      <Icon
                        name={
                          priority === 'urgent'
                            ? 'alert-circle'
                            : priority === 'high'
                            ? 'arrow-up-circle'
                            : priority === 'medium'
                            ? 'remove-circle'
                            : 'arrow-down-circle'
                        }
                        size={20}
                        color={
                          value === priority
                            ? priority === 'urgent'
                              ? colors.danger
                              : priority === 'high'
                              ? colors.warning
                              : priority === 'medium'
                              ? colors.info
                              : colors.text.tertiary
                            : colors.text.secondary
                        }
                      />
                      <Text
                        style={[
                          styles.priorityText,
                          value === priority && {
                            color:
                              priority === 'urgent'
                                ? colors.danger
                                : priority === 'high'
                                ? colors.warning
                                : priority === 'medium'
                                ? colors.info
                                : colors.text.tertiary,
                          },
                        ]}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            />
          </View>
        </View>

        {/* Status */}
        {isEditMode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusOptions}>
              <Controller
                control={control}
                name="status"
                render={({ field: { onChange, value } }) => (
                  <>
                    {['todo', 'in_progress', 'completed', 'cancelled'].map(
                      status => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusOption,
                            value === status && styles.statusOptionActive,
                          ]}
                          onPress={() => onChange(status)}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              value === status && styles.statusTextActive,
                            ]}
                          >
                            {status === 'in_progress'
                              ? 'In Progress'
                              : status.charAt(0).toUpperCase() +
                                status.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </>
                )}
              />
            </View>
          </View>
        )}

        {/* Due Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Due Date (Optional)</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon
              name="calendar-outline"
              size={20}
              color={colors.text.primary}
            />
            <Text style={styles.dateSelectorText}>
              {dueDate ? formatDate(dueDate, 'dd MMM yyyy') : 'No due date'}
            </Text>
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
          {dueDate && (
            <TouchableOpacity
              onPress={() => setValue('dueDate', undefined)}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Clear Date</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Reminder */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setReminderEnabled(!reminderEnabled)}
          >
            <View style={styles.toggleLeft}>
              <Icon
                name="notifications-outline"
                size={20}
                color={reminderEnabled ? colors.warning : colors.text.secondary}
              />
              <Text style={styles.toggleText}>Set Reminder</Text>
            </View>
            <Icon
              name={reminderEnabled ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={reminderEnabled ? colors.warning : colors.text.secondary}
            />
          </TouchableOpacity>

          {reminderEnabled && (
            <TouchableOpacity
              style={styles.reminderTimeButton}
              onPress={() => setShowReminderPicker(true)}
            >
              <Icon name="time-outline" size={20} color={colors.text.primary} />
              <Text style={styles.reminderTimeText}>
                {reminderTime
                  ? reminderTime.toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Set reminder time'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Repeat */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setRepeatEnabled(!repeatEnabled)}
          >
            <View style={styles.toggleLeft}>
              <Icon
                name="repeat-outline"
                size={20}
                color={repeatEnabled ? colors.info : colors.text.secondary}
              />
              <Text style={styles.toggleText}>Repeat Task</Text>
            </View>
            <Icon
              name={repeatEnabled ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={repeatEnabled ? colors.info : colors.text.secondary}
            />
          </TouchableOpacity>

          {repeatEnabled && (
            <View style={styles.repeatOptions}>
              {['daily', 'weekly', 'monthly'].map(interval => (
                <TouchableOpacity
                  key={interval}
                  style={[
                    styles.repeatOption,
                    repeatInterval === interval && styles.repeatOptionActive,
                  ]}
                  onPress={() => setRepeatInterval(interval as any)}
                >
                  <Text
                    style={[
                      styles.repeatText,
                      repeatInterval === interval && styles.repeatTextActive,
                    ]}
                  >
                    {interval.charAt(0).toUpperCase() + interval.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          variant="outline"
          onPress={() => navigation.goBack()}
          style={{ flex: 1, marginRight: spacing.sm }}
        >
          Cancel
        </Button>
        <Button
          onPress={handleSubmit(onSubmit)}
          loading={createMutation.isPending || updateMutation.isPending}
          style={{ flex: 1, marginLeft: spacing.sm }}
        >
          {isEditMode ? 'Update' : 'Create Task'}
        </Button>
      </View>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.pickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Due Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DatePicker
              date={dueDate || new Date()}
              onDateChange={date => setValue('dueDate', date)}
              mode="date"
              minimumDate={new Date()}
            />
          </View>
        </View>
      </Modal>

      {/* Reminder Time Picker Modal */}
      <Modal visible={showReminderPicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowReminderPicker(false)}>
                <Text style={styles.pickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Reminder Time</Text>
              <TouchableOpacity onPress={() => setShowReminderPicker(false)}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DatePicker
              date={reminderTime || new Date()}
              onDateChange={setReminderTime}
              mode="datetime"
              minimumDate={new Date()}
            />
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
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      ...textStyles.h3,
      color: colors.text.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    section: {
      marginTop: spacing.xl,
    },
    sectionTitle: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    priorityOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    priorityOption: {
      flex: 1,
      minWidth: '45%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
    },
    priorityOptionActive: {
      backgroundColor: `${colors.primary}10`,
    },
    priorityText: {
      ...textStyles.body,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    statusOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    statusOption: {
      flex: 1,
      minWidth: '45%',
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
    },
    statusOptionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    statusText: {
      ...textStyles.body,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    statusTextActive: {
      color: colors.text.inverse,
    },
    dateSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
    },
    dateSelectorText: {
      ...textStyles.body,
      color: colors.text.primary,
      flex: 1,
      marginLeft: spacing.sm,
    },
    clearButton: {
      alignSelf: 'flex-end',
      marginTop: spacing.sm,
    },
    clearButtonText: {
      ...textStyles.caption,
      color: colors.danger,
    },
    toggleButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
    },
    toggleLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    toggleText: {
      ...textStyles.body,
      color: colors.text.primary,
    },
    reminderTimeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      marginTop: spacing.md,
    },
    reminderTimeText: {
      ...textStyles.body,
      color: colors.text.primary,
    },
    repeatOptions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    repeatOption: {
      flex: 1,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
    },
    repeatOptionActive: {
      backgroundColor: colors.info,
      borderColor: colors.info,
    },
    repeatText: {
      ...textStyles.body,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    repeatTextActive: {
      color: colors.text.inverse,
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    pickerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    pickerContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg,
    },
    pickerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pickerTitle: {
      ...textStyles.h4,
      color: colors.text.primary,
    },
    pickerCancel: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    pickerDone: {
      ...textStyles.bodyMedium,
      color: colors.primary,
    },
  });

export default AddTaskModal;
