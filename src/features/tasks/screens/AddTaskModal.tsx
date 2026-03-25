/**
 * Add/Edit Task Modal
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Platform, TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useCreateTask, useUpdateTask, useTask } from '../../../hooks/api/useTasks';
import { Spinner } from '../../../components/common';
import { taskSchema } from '../../../utils/validation/schemas';
import { formatDate } from '../../../utils/formatters';

const PRIORITIES: { key: string; label: string; icon: string; color: string }[] = [
  { key: 'urgent', label: 'Urgent', icon: 'flame', color: '#EF4444' },
  { key: 'high', label: 'High', icon: 'arrow-up-circle', color: '#F97316' },
  { key: 'medium', label: 'Medium', icon: 'remove-circle', color: '#F59E0B' },
  { key: 'low', label: 'Low', icon: 'arrow-down-circle', color: '#64748B' },
];

const STATUSES: { key: string; label: string; color: string }[] = [
  { key: 'todo', label: 'To Do', color: '#64748B' },
  { key: 'in_progress', label: 'In Progress', color: '#3B82F6' },
  { key: 'completed', label: 'Done', color: '#22C55E' },
  { key: 'cancelled', label: 'Cancelled', color: '#94A3B8' },
];

const REPEATS: { key: string; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

const AddTaskModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#E2E8F0';

  const { mode, taskId } = (route.params as any) || { mode: 'create' };
  const isEdit = mode === 'edit';

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date | undefined>(undefined);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const { data: taskData, isLoading: taskLoading } = useTask(taskId);
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const task = taskData?.data;

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues: {
      title: '', description: '',
      priority: 'medium' as 'urgent' | 'high' | 'medium' | 'low',
      status: 'todo' as 'todo' | 'in_progress' | 'completed' | 'cancelled',
      dueDate: undefined as Date | undefined,
      tags: [] as string[],
    },
  });

  const dueDate = watch('dueDate');
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (isEdit && task) {
      setValue('title', task.title);
      setValue('description', task.description || '');
      setValue('priority', task.priority);
      setValue('status', task.status);
      setValue('dueDate', task.dueDate ? new Date(task.dueDate) : undefined);
      setValue('tags', task.tags || []);
      if (task.reminder?.enabled) { setReminderEnabled(true); setReminderTime(new Date(task.reminder.time)); }
      if (task.repeat?.enabled) { setRepeatEnabled(true); setRepeatInterval(task.repeat.interval); }
    }
  }, [task, isEdit]);

  const onSubmit = async (data: any) => {
    const payload: any = {
      ...data,
      dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
      reminder: reminderEnabled ? { enabled: true, time: reminderTime?.toISOString() || new Date().toISOString() } : undefined,
      repeat: repeatEnabled ? { enabled: true, interval: repeatInterval } : undefined,
      tags: data.tags?.filter((t: string) => t.trim()) || [],
    };
    Object.keys(payload).forEach(k => { if (payload[k] === undefined) delete payload[k]; });
    if (isEdit) await updateMutation.mutateAsync({ id: taskId, data: payload });
    else await createMutation.mutateAsync(payload);
    navigation.goBack();
  };

  if (isEdit && taskLoading) {
    return <View style={[s.container, { backgroundColor: colors.background }]}><Spinner text="Loading..." /></View>;
  }

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8, backgroundColor: surfaceC, borderBottomColor: borderC }]}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="close" size={22} color={textPri} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: textPri }]}>{isEdit ? 'Edit Task' : 'New Task'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 80 }]}>
        {/* Title */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Title *</Text>
          <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
            <TextInput
              style={[s.input, { backgroundColor: surfaceC, borderColor: errors.title ? '#EF4444' : borderC, color: textPri }]}
              placeholder="Enter task title"
              placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
              value={value}
              onChangeText={onChange}
            />
          )} />
          {errors.title && <Text style={s.error}>{errors.title.message as string}</Text>}
        </View>

        {/* Description */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Description</Text>
          <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
            <TextInput
              style={[s.input, s.inputMulti, { backgroundColor: surfaceC, borderColor: borderC, color: textPri }]}
              placeholder="Add details (optional)"
              placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          )} />
        </View>

        {/* Priority */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Priority</Text>
          <Controller control={control} name="priority" render={({ field: { onChange, value } }) => (
            <View style={s.chipRow}>
              {PRIORITIES.map(p => {
                const active = value === p.key;
                return (
                  <TouchableOpacity
                    key={p.key}
                    style={[s.chip, { borderColor: active ? p.color : borderC, backgroundColor: active ? `${p.color}10` : surfaceC }]}
                    onPress={() => onChange(p.key)}
                  >
                    <Icon name={p.icon} size={14} color={active ? p.color : textSec} />
                    <Text style={[s.chipText, { color: active ? p.color : textSec }]}>{p.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )} />
        </View>

        {/* Status (edit only) */}
        {isEdit && (
          <View style={s.field}>
            <Text style={[s.label, { color: textSec }]}>Status</Text>
            <Controller control={control} name="status" render={({ field: { onChange, value } }) => (
              <View style={s.chipRow}>
                {STATUSES.map(st => {
                  const active = value === st.key;
                  return (
                    <TouchableOpacity
                      key={st.key}
                      style={[s.chip, { borderColor: active ? st.color : borderC, backgroundColor: active ? `${st.color}10` : surfaceC }]}
                      onPress={() => onChange(st.key)}
                    >
                      <View style={[s.chipDot, { backgroundColor: st.color }]} />
                      <Text style={[s.chipText, { color: active ? st.color : textSec }]}>{st.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )} />
          </View>
        )}

        {/* Due Date */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Due Date</Text>
          <TouchableOpacity style={[s.selector, { backgroundColor: surfaceC, borderColor: borderC }]} onPress={() => setShowDatePicker(true)}>
            <Icon name="calendar-outline" size={16} color={textSec} />
            <Text style={[s.selectorText, { color: dueDate ? textPri : (isDark ? '#475569' : '#CBD5E1') }]}>
              {dueDate ? formatDate(dueDate, 'dd MMM yyyy') : 'No due date'}
            </Text>
            {dueDate && (
              <TouchableOpacity onPress={() => setValue('dueDate', undefined)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="close-circle" size={16} color={textSec} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Reminder */}
        <View style={s.field}>
          <TouchableOpacity style={[s.toggle, { backgroundColor: surfaceC, borderColor: borderC }]} onPress={() => setReminderEnabled(!reminderEnabled)}>
            <Icon name="notifications-outline" size={16} color={reminderEnabled ? '#F59E0B' : textSec} />
            <Text style={[s.toggleText, { color: textPri }]}>Reminder</Text>
            <Icon name={reminderEnabled ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={reminderEnabled ? '#F59E0B' : textSec} />
          </TouchableOpacity>
          {reminderEnabled && (
            <TouchableOpacity style={[s.selector, { backgroundColor: surfaceC, borderColor: borderC, marginTop: 8 }]} onPress={() => setShowReminderPicker(true)}>
              <Icon name="time-outline" size={16} color={textSec} />
              <Text style={[s.selectorText, { color: reminderTime ? textPri : (isDark ? '#475569' : '#CBD5E1') }]}>
                {reminderTime ? reminderTime.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Set time'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Repeat */}
        <View style={s.field}>
          <TouchableOpacity style={[s.toggle, { backgroundColor: surfaceC, borderColor: borderC }]} onPress={() => setRepeatEnabled(!repeatEnabled)}>
            <Icon name="repeat-outline" size={16} color={repeatEnabled ? '#3B82F6' : textSec} />
            <Text style={[s.toggleText, { color: textPri }]}>Repeat</Text>
            <Icon name={repeatEnabled ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={repeatEnabled ? '#3B82F6' : textSec} />
          </TouchableOpacity>
          {repeatEnabled && (
            <View style={[s.chipRow, { marginTop: 8 }]}>
              {REPEATS.map(r => {
                const active = repeatInterval === r.key;
                return (
                  <TouchableOpacity
                    key={r.key}
                    style={[s.chip, { borderColor: active ? '#3B82F6' : borderC, backgroundColor: active ? '#3B82F610' : surfaceC }]}
                    onPress={() => setRepeatInterval(r.key as any)}
                  >
                    <Text style={[s.chipText, { color: active ? '#3B82F6' : textSec }]}>{r.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[s.footer, { borderTopColor: borderC, paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={[s.footerBtn, s.cancelBtn, { borderColor: borderC }]} onPress={() => navigation.goBack()}>
          <Text style={[s.cancelBtnText, { color: textSec }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.footerBtn, { backgroundColor: colors.primary, opacity: isPending ? 0.6 : 1 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          <Text style={s.saveBtnText}>{isPending ? 'Saving...' : isEdit ? 'Update' : 'Create Task'}</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={s.pickerOverlay}>
          <View style={[s.pickerSheet, { backgroundColor: surfaceC }]}>
            <View style={[s.pickerHeader, { borderBottomColor: borderC }]}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={[s.pickerCancel, { color: textSec }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[s.pickerTitle, { color: textPri }]}>Due Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={[s.pickerDone, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <DatePicker date={dueDate || new Date()} onDateChange={d => setValue('dueDate', d)} mode="date" minimumDate={new Date()} />
          </View>
        </View>
      </Modal>

      {/* Reminder Picker */}
      <Modal visible={showReminderPicker} transparent animationType="slide">
        <View style={s.pickerOverlay}>
          <View style={[s.pickerSheet, { backgroundColor: surfaceC }]}>
            <View style={[s.pickerHeader, { borderBottomColor: borderC }]}>
              <TouchableOpacity onPress={() => setShowReminderPicker(false)}>
                <Text style={[s.pickerCancel, { color: textSec }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[s.pickerTitle, { color: textPri }]}>Reminder</Text>
              <TouchableOpacity onPress={() => setShowReminderPicker(false)}>
                <Text style={[s.pickerDone, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <DatePicker date={reminderTime || new Date()} onDateChange={setReminderTime} mode="datetime" minimumDate={new Date()} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: 1 },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '700', textAlign: 'center' },

  scroll: { padding: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  inputMulti: { minHeight: 70, paddingTop: 10 },
  error: { fontSize: 11, color: '#EF4444', marginTop: 4 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },
  chipDot: { width: 7, height: 7, borderRadius: 4 },

  selector: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 42 },
  selectorText: { flex: 1, fontSize: 13 },

  toggle: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 42 },
  toggleText: { flex: 1, fontSize: 13, fontWeight: '500' },

  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  footerBtn: { flex: 1, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { borderWidth: 1 },
  cancelBtnText: { fontSize: 13, fontWeight: '600' },
  saveBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  pickerOverlay: { flex: 1, backgroundColor: '#00000055', justifyContent: 'flex-end' },
  pickerSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 16 },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  pickerTitle: { fontSize: 14, fontWeight: '700' },
  pickerCancel: { fontSize: 13 },
  pickerDone: { fontSize: 13, fontWeight: '700' },
});

export default AddTaskModal;
