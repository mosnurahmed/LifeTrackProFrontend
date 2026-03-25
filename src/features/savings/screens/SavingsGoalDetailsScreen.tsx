/**
 * Savings Goal Details Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import {
  useSavingsGoal,
  useContributions,
  useAddContribution,
} from '../../../hooks/api/useSavingsGoals';
import { Spinner, ErrorState } from '../../../components/common';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from '../../../utils/formatters';

const PRIORITY_MAP: Record<string, { color: string; label: string }> = {
  high: { color: '#EF4444', label: 'High' },
  medium: { color: '#F97316', label: 'Medium' },
  low: { color: '#22C55E', label: 'Low' },
};

const SavingsGoalDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const textTer = isDark ? '#475569' : '#CBD5E1';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const { goalId } = (route.params as any) || {};

  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const { data: goalData, isLoading, error, refetch, isRefetching } = useSavingsGoal(goalId);
  const { data: contributionsData } = useContributions(goalId);
  const addMutation = useAddContribution();

  const goal = goalData?.data?.data;
  const contributions = contributionsData?.data?.data || [];

  const handleAdd = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    await addMutation.mutateAsync({ id: goalId, data: { amount: val, note: note.trim() || undefined } });
    setAmount('');
    setNote('');
    setShowModal(false);
  };

  const getDaysLeft = (d: string) => {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    return diff > 0 ? diff : 0;
  };

  if (isLoading) return <View style={[st.container, { backgroundColor: colors.background }]}><Spinner text="Loading..." /></View>;
  if (error || !goal) return <View style={[st.container, { backgroundColor: colors.background }]}><ErrorState title="Goal not found" message="Unable to load" onRetry={() => navigation.goBack()} /></View>;

  const pct = Math.min(goal.progress ?? 0, 100);
  const remaining = goal.remainingAmount ?? (goal.targetAmount - goal.currentAmount);
  const priority = PRIORITY_MAP[goal.priority] ?? PRIORITY_MAP.medium;

  return (
    <View style={[st.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + 8, backgroundColor: surfaceC, borderBottomColor: borderC }]}>
        <TouchableOpacity style={st.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={textPri} />
        </TouchableOpacity>
        <Text style={[st.headerTitle, { color: textPri }]}>Goal Details</Text>
        {!goal.isCompleted ? (
          <TouchableOpacity
            style={st.headerBtn}
            onPress={() => (navigation as any).navigate('AddSavingsGoal', { mode: 'edit', goalId })}
          >
            <Icon name="create-outline" size={20} color={goal.color} />
          </TouchableOpacity>
        ) : <View style={{ width: 36 }} />}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[goal.color]} tintColor={goal.color} />}
      >
        {/* Hero Gradient Card */}
        <LinearGradient
          colors={[goal.color, `${goal.color}CC`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={st.hero}
        >
          {/* Icon + Title top row */}
          <View style={st.heroTop}>
            <View style={st.heroIcon}>
              <Icon name={goal.icon} size={20} color="#FFF" />
            </View>
            <View style={st.heroInfo}>
              <Text style={st.heroTitle} numberOfLines={1}>{goal.title}</Text>
              {goal.description ? <Text style={st.heroDesc} numberOfLines={1}>{goal.description}</Text> : null}
            </View>
          </View>

          {/* Centered Amount */}
          <View style={st.heroCenter}>
            <Text style={st.heroAmount}>{formatCurrency(goal.currentAmount)}</Text>
            <Text style={st.heroTarget}>of {formatCurrency(goal.targetAmount)}</Text>
          </View>

          {/* Progress bar */}
          <View style={st.progressTrack}>
            <View style={[st.progressFill, { width: `${pct}%` as any }]} />
          </View>

          {/* Bottom row: percentage + remaining */}
          <View style={st.heroBottom}>
            <Text style={st.heroPctText}>{pct.toFixed(1)}% saved</Text>
            <Text style={st.heroRemaining}>{formatCurrency(remaining)} left</Text>
          </View>

          {goal.isCompleted && (
            <View style={st.completedBadge}>
              <Icon name="checkmark-circle" size={14} color="#FFF" />
              <Text style={st.completedText}>
                Completed {goal.completedAt ? formatDate(goal.completedAt, 'dd MMM yyyy') : ''}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Stats row */}
        <View style={st.statsRow}>
          <View style={[st.statCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Icon name="wallet-outline" size={16} color="#3B82F6" />
            <Text style={[st.statVal, { color: textPri }]}>{formatCurrency(remaining)}</Text>
            <Text style={[st.statLabel, { color: textSec }]}>Remaining</Text>
          </View>
          <View style={[st.statCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <View style={[st.priorityDot, { backgroundColor: priority.color }]} />
            <Text style={[st.statVal, { color: priority.color }]}>{priority.label}</Text>
            <Text style={[st.statLabel, { color: textSec }]}>Priority</Text>
          </View>
          <View style={[st.statCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Icon name="calendar-outline" size={16} color="#F59E0B" />
            <Text style={[st.statVal, { color: textPri }]}>
              {goal.targetDate ? `${getDaysLeft(goal.targetDate)}d` : '—'}
            </Text>
            <Text style={[st.statLabel, { color: textSec }]}>
              {goal.targetDate ? formatDate(goal.targetDate, 'dd MMM') : 'No deadline'}
            </Text>
          </View>
        </View>

        {/* Contributions */}
        <View style={st.section}>
          <View style={st.sectionHeader}>
            <Text style={[st.sectionTitle, { color: textPri }]}>Contributions</Text>
            <Text style={[st.sectionCount, { color: textSec }]}>{contributions.length}</Text>
          </View>

          {contributions.length > 0 ? (
            contributions.map((c: any) => (
              <View key={c._id} style={[st.contribRow, { borderBottomColor: borderC }]}>
                <View style={[st.contribIcon, { backgroundColor: '#22C55E10' }]}>
                  <Icon name="add-circle" size={14} color="#22C55E" />
                </View>
                <View style={st.contribInfo}>
                  <Text style={[st.contribAmt, { color: textPri }]}>{formatCurrency(c.amount)}</Text>
                  {c.note ? <Text style={[st.contribNote, { color: textSec }]} numberOfLines={1}>{c.note}</Text> : null}
                </View>
                <Text style={[st.contribDate, { color: textTer }]}>{formatRelativeTime(c.date)}</Text>
              </View>
            ))
          ) : (
            <View style={st.emptyWrap}>
              <Icon name="wallet-outline" size={32} color={textTer} />
              <Text style={[st.emptyText, { color: textSec }]}>No contributions yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer button */}
      {!goal.isCompleted && (
        <View style={[st.footer, { backgroundColor: surfaceC, borderTopColor: borderC, paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={[st.addBtn, { backgroundColor: goal.color }]}
            onPress={() => setShowModal(true)}
            activeOpacity={0.8}
          >
            <Icon name="add-circle-outline" size={18} color="#FFF" />
            <Text style={st.addBtnText}>Add Contribution</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Contribute Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.modalOverlay}>
          <View style={[st.modalSheet, { backgroundColor: surfaceC }]}>
            <View style={[st.modalHeader, { borderBottomColor: borderC }]}>
              <View style={st.modalTitleRow}>
                <View style={[st.modalIcon, { backgroundColor: `${goal.color}12` }]}>
                  <Icon name={goal.icon} size={16} color={goal.color} />
                </View>
                <Text style={[st.modalTitle, { color: textPri }]}>{goal.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="close" size={20} color={textSec} />
              </TouchableOpacity>
            </View>

            {/* Progress preview */}
            <View style={[st.modalProgress, { backgroundColor: colors.background }]}>
              <Text style={[st.modalProgressText, { color: textSec }]}>
                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
              </Text>
              <View style={[st.modalProgressTrack, { backgroundColor: `${goal.color}12` }]}>
                <View style={[st.modalProgressFill, { width: `${pct}%` as any, backgroundColor: goal.color }]} />
              </View>
            </View>

            {/* Amount */}
            <View style={[st.amountRow, { borderColor: goal.color, backgroundColor: colors.background }]}>
              <Text style={[st.currency, { color: textSec }]}>৳</Text>
              <TextInput
                style={[st.amountInput, { color: textPri }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={textTer}
                autoFocus
              />
            </View>

            {/* Note */}
            <TextInput
              style={[st.noteInput, { borderColor: borderC, backgroundColor: colors.background, color: textPri }]}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note (optional)"
              placeholderTextColor={textTer}
            />

            {/* Buttons */}
            <View style={st.modalBtns}>
              <TouchableOpacity style={[st.modalBtn, st.modalCancelBtn, { borderColor: borderC }]} onPress={() => setShowModal(false)}>
                <Text style={[st.modalCancelText, { color: textSec }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.modalBtn, { backgroundColor: goal.color, opacity: addMutation.isPending ? 0.6 : 1 }]}
                onPress={handleAdd}
                disabled={addMutation.isPending}
              >
                <Text style={st.modalAddText}>{addMutation.isPending ? 'Adding...' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const st = StyleSheet.create({
  container: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: 1 },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '700', textAlign: 'center' },

  hero: { marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  heroIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFFFFF20', justifyContent: 'center', alignItems: 'center' },
  heroInfo: { flex: 1 },
  heroTitle: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  heroDesc: { fontSize: 11, color: '#FFFFFFB0', marginTop: 2 },
  heroCenter: { alignItems: 'center', marginBottom: 14 },
  heroAmount: { fontSize: 26, fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },
  heroTarget: { fontSize: 12, color: '#FFFFFFC0', marginTop: 2 },
  progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden', backgroundColor: '#FFFFFF30', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: '#FFF' },
  heroBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroPctText: { fontSize: 12, fontWeight: '700', color: '#FFFFFFE6' },
  heroRemaining: { fontSize: 12, fontWeight: '600', color: '#FFFFFFCC' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFFFFF20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginTop: 10, alignSelf: 'flex-start' },
  completedText: { fontSize: 11, fontWeight: '600', color: '#FFF' },

  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: 4, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1, gap: 4 },
  statVal: { fontSize: 13, fontWeight: '700' },
  statLabel: { fontSize: 10 },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },

  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  sectionCount: { fontSize: 12 },

  contribRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  contribIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  contribInfo: { flex: 1 },
  contribAmt: { fontSize: 13, fontWeight: '700' },
  contribNote: { fontSize: 11, marginTop: 1 },
  contribDate: { fontSize: 10 },

  emptyWrap: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText: { fontSize: 12 },

  footer: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 12 },
  addBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000055' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, marginBottom: 12 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  modalIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  modalProgress: { padding: 10, borderRadius: 10, marginBottom: 12 },
  modalProgressText: { fontSize: 11, textAlign: 'center', marginBottom: 6 },
  modalProgressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  modalProgressFill: { height: '100%', borderRadius: 2 },
  amountRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 44, marginBottom: 10 },
  currency: { fontSize: 16, fontWeight: '700', marginRight: 4 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: '800' },
  noteInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 14 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  modalCancelBtn: { borderWidth: 1 },
  modalCancelText: { fontSize: 13, fontWeight: '600' },
  modalAddText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});

export default SavingsGoalDetailsScreen;
