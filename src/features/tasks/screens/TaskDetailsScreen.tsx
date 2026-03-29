/**
 * Task Details Screen
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import {
  useTask, useUpdateTaskStatus, useDeleteTask,
  useAddSubtask, useUpdateSubtask, useDeleteSubtask,
} from '../../../hooks/api/useTasks';
import { Spinner, ErrorState, useGuide } from '../../../components/common';
import { useConfirm } from '../../../components/common/ConfirmModal';
import { formatDate, formatRelativeTime } from '../../../utils/formatters';

const PRIORITY_MAP: Record<string, { color: string; label: string; icon: string }> = {
  urgent: { color: '#EF4444', label: 'Urgent', icon: 'flame' },
  high:   { color: '#F97316', label: 'High', icon: 'arrow-up-circle' },
  medium: { color: '#F59E0B', label: 'Medium', icon: 'remove-circle' },
  low:    { color: '#64748B', label: 'Low', icon: 'arrow-down-circle' },
};

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  todo:        { color: '#64748B', label: 'To Do' },
  in_progress: { color: '#3B82F6', label: 'In Progress' },
  completed:   { color: '#22C55E', label: 'Done' },
  cancelled:   { color: '#94A3B8', label: 'Cancelled' },
};

const TaskDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { confirm } = useConfirm();
  const { GuideButton, GuideView } = useGuide('taskDetails');

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const { taskId } = (route.params as any) || {};
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState('');

  const { data: taskData, isLoading, error } = useTask(taskId);
  const updateStatus = useUpdateTaskStatus();
  const deleteMutation = useDeleteTask();
  const addSubtask = useAddSubtask();
  const updateSubtask = useUpdateSubtask();
  const deleteSubtask = useDeleteSubtask();

  const task = taskData?.data;

  const handleDelete = async () => {
    const ok = await confirm({ title: 'Delete Task', message: `Delete "${task?.title}"?`, confirmText: 'Delete', variant: 'danger' });
    if (ok) { deleteMutation.mutate(taskId); navigation.goBack(); }
  };

  const handleAddSubtask = async () => {
    if (subtaskTitle.trim()) {
      await addSubtask.mutateAsync({ taskId, title: subtaskTitle.trim() });
      setSubtaskTitle('');
      setShowSubtaskModal(false);
    }
  };

  const handleDeleteSubtask = async (id: string, title: string) => {
    const ok = await confirm({ title: 'Delete Subtask', message: `Delete "${title}"?`, confirmText: 'Delete', variant: 'danger' });
    if (ok) deleteSubtask.mutate({ taskId, subtaskId: id });
  };

  if (isLoading) return <View style={[st.container, { backgroundColor: colors.background }]}><Spinner text="Loading..." /></View>;
  if (error || !task) return <View style={[st.container, { backgroundColor: colors.background }]}><ErrorState title="Task not found" message="Unable to load" onRetry={() => navigation.goBack()} /></View>;

  const priority = PRIORITY_MAP[task.priority] ?? PRIORITY_MAP.medium;
  const status = STATUS_MAP[task.status] ?? STATUS_MAP.todo;
  const isDone = task.status === 'completed';
  const subtasksDone = task.subtasks?.filter((s: any) => s.completed).length ?? 0;
  const subtasksTotal = task.subtasks?.length ?? 0;

  return (
    <View style={[st.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + 8, backgroundColor: surfaceC, borderBottomColor: borderC }]}>
        <TouchableOpacity style={st.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={textPri} />
        </TouchableOpacity>
        <Text style={[st.headerTitle, { color: textPri }]}>Task Details</Text>
        <GuideButton color={textPri} />
        <TouchableOpacity style={st.headerBtn} onPress={() => (navigation as any).navigate('AddTask', { mode: 'edit', taskId })}>
          <Icon name="create-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        {/* Title + Checkbox */}
        <View style={[st.titleRow, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <TouchableOpacity
            style={[st.checkbox, isDone ? { backgroundColor: '#22C55E', borderColor: '#22C55E' } : { borderColor: borderC }]}
            onPress={() => updateStatus.mutate({ id: taskId, status: isDone ? 'todo' : 'completed' })}
          >
            {isDone && <Icon name="checkmark" size={14} color="#FFF" />}
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[st.title, { color: textPri }, isDone && st.titleDone]}>{task.title}</Text>
            {task.description ? <Text style={[st.desc, { color: textSec }]}>{task.description}</Text> : null}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={st.actionsRow}>
          {task.status !== 'in_progress' && (
            <TouchableOpacity style={[st.actionBtn, { backgroundColor: '#3B82F610' }]} onPress={() => updateStatus.mutate({ id: taskId, status: 'in_progress' })}>
              <Icon name="play" size={14} color="#3B82F6" />
              <Text style={[st.actionText, { color: '#3B82F6' }]}>Start</Text>
            </TouchableOpacity>
          )}
          {task.status !== 'completed' && (
            <TouchableOpacity style={[st.actionBtn, { backgroundColor: '#22C55E10' }]} onPress={() => updateStatus.mutate({ id: taskId, status: 'completed' })}>
              <Icon name="checkmark" size={14} color="#22C55E" />
              <Text style={[st.actionText, { color: '#22C55E' }]}>Complete</Text>
            </TouchableOpacity>
          )}
          {task.status === 'completed' && (
            <TouchableOpacity style={[st.actionBtn, { backgroundColor: '#F59E0B10' }]} onPress={() => updateStatus.mutate({ id: taskId, status: 'todo' })}>
              <Icon name="refresh" size={14} color="#F59E0B" />
              <Text style={[st.actionText, { color: '#F59E0B' }]}>Reopen</Text>
            </TouchableOpacity>
          )}
          {task.status !== 'cancelled' && (
            <TouchableOpacity style={[st.actionBtn, { backgroundColor: '#EF444410' }]} onPress={() => updateStatus.mutate({ id: taskId, status: 'cancelled' })}>
              <Icon name="close" size={14} color="#EF4444" />
              <Text style={[st.actionText, { color: '#EF4444' }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Meta Details */}
        <View style={[st.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          {/* Priority */}
          <View style={st.metaRow}>
            <View style={[st.metaIcon, { backgroundColor: `${priority.color}10` }]}>
              <Icon name={priority.icon} size={14} color={priority.color} />
            </View>
            <Text style={[st.metaLabel, { color: textSec }]}>Priority</Text>
            <View style={[st.metaBadge, { backgroundColor: `${priority.color}10` }]}>
              <Text style={[st.metaBadgeText, { color: priority.color }]}>{priority.label}</Text>
            </View>
          </View>

          <View style={[st.divider, { backgroundColor: borderC }]} />

          {/* Status */}
          <View style={st.metaRow}>
            <View style={[st.metaIcon, { backgroundColor: `${status.color}10` }]}>
              <View style={[st.statusDot, { backgroundColor: status.color }]} />
            </View>
            <Text style={[st.metaLabel, { color: textSec }]}>Status</Text>
            <View style={[st.metaBadge, { backgroundColor: `${status.color}10` }]}>
              <Text style={[st.metaBadgeText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          {task.dueDate && (
            <>
              <View style={[st.divider, { backgroundColor: borderC }]} />
              <View style={st.metaRow}>
                <View style={[st.metaIcon, { backgroundColor: task.isOverdue ? '#EF444410' : `${textSec}10` }]}>
                  <Icon name="calendar-outline" size={14} color={task.isOverdue ? '#EF4444' : textSec} />
                </View>
                <Text style={[st.metaLabel, { color: textSec }]}>Due</Text>
                <Text style={[st.metaVal, { color: task.isOverdue ? '#EF4444' : textPri }]}>
                  {formatDate(task.dueDate, 'dd MMM yyyy')}{task.isOverdue ? ' (Overdue)' : ''}
                </Text>
              </View>
            </>
          )}

          <View style={[st.divider, { backgroundColor: borderC }]} />
          <View style={st.metaRow}>
            <View style={[st.metaIcon, { backgroundColor: `${textSec}10` }]}>
              <Icon name="time-outline" size={14} color={textSec} />
            </View>
            <Text style={[st.metaLabel, { color: textSec }]}>Created</Text>
            <Text style={[st.metaVal, { color: textPri }]}>{formatRelativeTime(task.createdAt)}</Text>
          </View>

          {task.completedAt && (
            <>
              <View style={[st.divider, { backgroundColor: borderC }]} />
              <View style={st.metaRow}>
                <View style={[st.metaIcon, { backgroundColor: '#22C55E10' }]}>
                  <Icon name="checkmark-circle" size={14} color="#22C55E" />
                </View>
                <Text style={[st.metaLabel, { color: textSec }]}>Completed</Text>
                <Text style={[st.metaVal, { color: textPri }]}>{formatRelativeTime(task.completedAt)}</Text>
              </View>
            </>
          )}

          {task.reminder?.enabled && (
            <>
              <View style={[st.divider, { backgroundColor: borderC }]} />
              <View style={st.metaRow}>
                <View style={[st.metaIcon, { backgroundColor: '#F59E0B10' }]}>
                  <Icon name="notifications-outline" size={14} color="#F59E0B" />
                </View>
                <Text style={[st.metaLabel, { color: textSec }]}>Reminder</Text>
                <Text style={[st.metaVal, { color: textPri }]}>{formatDate(task.reminder.time, 'dd MMM, HH:mm')}</Text>
              </View>
            </>
          )}

          {task.repeat?.enabled && (
            <>
              <View style={[st.divider, { backgroundColor: borderC }]} />
              <View style={st.metaRow}>
                <View style={[st.metaIcon, { backgroundColor: '#3B82F610' }]}>
                  <Icon name="repeat-outline" size={14} color="#3B82F6" />
                </View>
                <Text style={[st.metaLabel, { color: textSec }]}>Repeat</Text>
                <Text style={[st.metaVal, { color: textPri }]}>{task.repeat.interval.charAt(0).toUpperCase() + task.repeat.interval.slice(1)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <View style={[st.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Text style={[st.cardTitle, { color: textPri }]}>Tags</Text>
            <View style={st.tagsRow}>
              {task.tags.map((tag: string, i: number) => (
                <View key={i} style={[st.tag, { backgroundColor: `${colors.primary}10` }]}>
                  <Icon name="pricetag-outline" size={10} color={colors.primary} />
                  <Text style={[st.tagText, { color: colors.primary }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Subtasks */}
        <View style={[st.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <View style={st.subtaskHeader}>
            <Text style={[st.cardTitle, { color: textPri }]}>Subtasks ({subtasksDone}/{subtasksTotal})</Text>
            <TouchableOpacity onPress={() => setShowSubtaskModal(true)}>
              <Icon name="add-circle-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {subtasksTotal > 0 && (
            <View style={[st.subProgress, { backgroundColor: borderC }]}>
              <View style={[st.subProgressFill, { width: `${task.subtaskProgress ?? 0}%` as any, backgroundColor: '#22C55E' }]} />
            </View>
          )}

          {task.subtasks && task.subtasks.length > 0 ? (
            task.subtasks.map((sub: any, idx: number) => (
              <View key={sub._id}>
                {idx > 0 && <View style={[st.divider, { backgroundColor: borderC }]} />}
                <View style={st.subtaskRow}>
                  <TouchableOpacity
                    style={[st.subCheckbox, sub.completed ? { backgroundColor: '#22C55E', borderColor: '#22C55E' } : { borderColor: borderC }]}
                    onPress={() => updateSubtask.mutate({ taskId, subtaskId: sub._id, data: { completed: !sub.completed } })}
                  >
                    {sub.completed && <Icon name="checkmark" size={10} color="#FFF" />}
                  </TouchableOpacity>
                  <Text style={[st.subTitle, { color: textPri }, sub.completed && st.subTitleDone]} numberOfLines={1}>{sub.title}</Text>
                  <TouchableOpacity onPress={() => handleDeleteSubtask(sub._id, sub.title)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon name="trash-outline" size={14} color={textSec} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={[st.emptyText, { color: textSec }]}>No subtasks yet</Text>
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity style={st.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
          <Icon name="trash-outline" size={16} color="#EF4444" />
          <Text style={st.deleteBtnText}>Delete Task</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Subtask Modal */}
      <Modal visible={showSubtaskModal} transparent animationType="slide" onRequestClose={() => setShowSubtaskModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.modalOverlay}>
          <View style={[st.modalSheet, { backgroundColor: surfaceC }]}>
            <View style={[st.modalHeader, { borderBottomColor: borderC }]}>
              <Text style={[st.modalTitle, { color: textPri }]}>Add Subtask</Text>
              <TouchableOpacity onPress={() => setShowSubtaskModal(false)}>
                <Icon name="close" size={20} color={textSec} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[st.modalInput, { backgroundColor: colors.background, borderColor: borderC, color: textPri }]}
              placeholder="Subtask title"
              placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
              value={subtaskTitle}
              onChangeText={setSubtaskTitle}
              autoFocus
            />
            <View style={st.modalBtns}>
              <TouchableOpacity style={[st.modalBtn, st.modalCancelBtn, { borderColor: borderC }]} onPress={() => setShowSubtaskModal(false)}>
                <Text style={[st.modalCancelText, { color: textSec }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.modalBtn, { backgroundColor: colors.primary, opacity: addSubtask.isPending ? 0.6 : 1 }]}
                onPress={handleAddSubtask}
                disabled={addSubtask.isPending || !subtaskTitle.trim()}
              >
                <Text style={st.modalAddText}>{addSubtask.isPending ? 'Adding...' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <GuideView />
    </View>
  );
};

const st = StyleSheet.create({
  container: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: 1 },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  title: { fontSize: 15, fontWeight: '700', lineHeight: 21 },
  titleDone: { textDecorationLine: 'line-through', opacity: 0.6 },
  desc: { fontSize: 12, marginTop: 4, lineHeight: 17 },

  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  divider: { height: 1, marginVertical: 8 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  metaLabel: { flex: 1, fontSize: 12 },
  metaVal: { fontSize: 12, fontWeight: '600' },
  metaBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  metaBadgeText: { fontSize: 10, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 10, fontWeight: '600' },

  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  actionText: { fontSize: 12, fontWeight: '600' },

  subtaskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  subProgress: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 10 },
  subProgressFill: { height: '100%', borderRadius: 2 },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  subCheckbox: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  subTitle: { flex: 1, fontSize: 12 },
  subTitleDone: { textDecorationLine: 'line-through', opacity: 0.5 },
  emptyText: { fontSize: 12, textAlign: 'center', paddingVertical: 12 },

  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EF444430', marginTop: 4 },
  deleteBtnText: { fontSize: 13, fontWeight: '600', color: '#EF4444' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000055' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, marginBottom: 12 },
  modalTitle: { fontSize: 14, fontWeight: '700' },
  modalInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 12 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  modalCancelBtn: { borderWidth: 1 },
  modalCancelText: { fontSize: 13, fontWeight: '600' },
  modalAddText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});

export default TaskDetailsScreen;
