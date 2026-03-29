/**
 * Loan Details Screen
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
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import {
  useLoan,
  useAddPayment,
  useDeletePayment,
  useToggleSettled,
  useDeleteLoan,
} from '../../../hooks/api/useLoans';
import { Spinner, ErrorState, useGuide, useConfirm } from '../../../components/common';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from '../../../utils/formatters';

const LoanDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { GuideButton, GuideView } = useGuide('loanDetails');
  const { confirm } = useConfirm();

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const textTer = isDark ? '#475569' : '#CBD5E1';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const { loanId } = (route.params as any) || {};

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const { data: loanData, isLoading, error, refetch, isRefetching } = useLoan(loanId);
  const addPaymentMutation = useAddPayment();
  const deletePaymentMutation = useDeletePayment();
  const toggleSettledMutation = useToggleSettled();
  const deleteLoanMutation = useDeleteLoan();

  // useLoan has select → data is already the loan object
  const loan = loanData;
  const payments = loan?.payments ?? [];

  const handleAddPayment = async () => {
    const val = parseFloat(paymentAmount);
    if (isNaN(val) || val <= 0) return;
    await addPaymentMutation.mutateAsync({
      loanId,
      amount: val,
      note: paymentNote.trim() || undefined,
    });
    setPaymentAmount('');
    setPaymentNote('');
    setShowPaymentModal(false);
  };

  const handleDeletePayment = async (paymentId: string) => {
    const ok = await confirm({
      title: 'Delete Payment',
      message: 'Remove this payment record?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) deletePaymentMutation.mutate({ loanId, paymentId });
  };

  const handleToggleSettled = async () => {
    const action = loan?.isSettled ? 'reopen' : 'settle';
    const ok = await confirm({
      title: loan?.isSettled ? 'Reopen Loan' : 'Mark as Settled',
      message: loan?.isSettled
        ? 'This will reopen the loan as active.'
        : 'Mark this loan as fully settled?',
      confirmText: loan?.isSettled ? 'Reopen' : 'Settle',
      variant: loan?.isSettled ? 'default' : 'default',
    });
    if (ok) toggleSettledMutation.mutate(loanId);
  };

  const handleDeleteLoan = async () => {
    const ok = await confirm({
      title: 'Delete Loan',
      message: 'This will permanently delete this loan and all its payments. Are you sure?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) {
      await deleteLoanMutation.mutateAsync(loanId);
      navigation.goBack();
    }
  };

  const getDaysLeft = (d: string) => {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    return diff;
  };

  if (isLoading) return <View style={[st.container, { backgroundColor: colors.background }]}><Spinner text="Loading..." /></View>;
  if (error || !loan) return <View style={[st.container, { backgroundColor: colors.background }]}><ErrorState title="Loan not found" message="Unable to load" onRetry={() => navigation.goBack()} /></View>;

  const isGiven = loan.type === 'given';
  const typeColor = isGiven ? '#10B981' : '#EF4444';
  const totalPaid = payments.reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const remaining = loan.remainingAmount ?? (loan.amount - totalPaid);
  const pct = loan.amount > 0 ? Math.min((totalPaid / loan.amount) * 100, 100) : 0;
  const daysLeft = loan.deadline ? getDaysLeft(loan.deadline) : null;

  return (
    <View style={[st.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + 8, backgroundColor: surfaceC, borderBottomColor: borderC }]}>
        <TouchableOpacity style={st.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={textPri} />
        </TouchableOpacity>
        <Text style={[st.headerTitle, { color: textPri }]}>Loan Details</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {!loan.isSettled && (
            <TouchableOpacity
              style={st.headerBtn}
              onPress={() => (navigation as any).navigate('AddLoan', { mode: 'edit', loanId })}
            >
              <Icon name="create-outline" size={20} color={typeColor} />
            </TouchableOpacity>
          )}
          <GuideButton color={textPri} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[typeColor]} tintColor={typeColor} />}
      >
        {/* Hero Section */}
        <View style={[st.hero, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <View style={st.heroTop}>
            <View style={[st.heroIcon, { backgroundColor: `${typeColor}12` }]}>
              <Icon
                name={isGiven ? 'arrow-up-circle' : 'arrow-down-circle'}
                size={22}
                color={typeColor}
              />
            </View>
            <View style={st.heroInfo}>
              <Text style={[st.heroName, { color: textPri }]} numberOfLines={1}>
                {loan.personName}
              </Text>
              <View style={[st.typeBadge, { backgroundColor: `${typeColor}12` }]}>
                <Text style={[st.typeBadgeText, { color: typeColor }]}>
                  {isGiven ? 'Given' : 'Taken'}
                </Text>
              </View>
            </View>
            {loan.isSettled && (
              <View style={[st.settledBadge, { backgroundColor: '#22C55E12' }]}>
                <Icon name="checkmark-circle" size={12} color="#22C55E" />
                <Text style={st.settledText}>Settled</Text>
              </View>
            )}
          </View>

          {/* Amount Center */}
          <View style={st.heroCenter}>
            <Text style={[st.heroAmount, { color: typeColor }]}>
              {formatCurrency(loan.amount)}
            </Text>
            <Text style={[st.heroSub, { color: textSec }]}>Total Amount</Text>
          </View>

          {/* Progress Bar */}
          <View style={[st.progressTrack, { backgroundColor: `${typeColor}12` }]}>
            <View style={[st.progressFill, { width: `${pct}%` as any, backgroundColor: typeColor }]} />
          </View>
          <View style={st.heroBottom}>
            <Text style={[st.heroPaid, { color: textSec }]}>
              {formatCurrency(totalPaid)} paid
            </Text>
            <Text style={[st.heroRemaining, { color: typeColor }]}>
              {formatCurrency(remaining)} left
            </Text>
          </View>
        </View>

        {/* Info Rows */}
        <View style={[st.infoCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <View style={[st.infoRow, { borderBottomColor: borderC }]}>
            <View style={st.infoLeft}>
              <Icon name="calendar-outline" size={16} color={textSec} />
              <Text style={[st.infoLabel, { color: textSec }]}>Date</Text>
            </View>
            <Text style={[st.infoValue, { color: textPri }]}>
              {formatDate(loan.date, 'dd MMM yyyy')}
            </Text>
          </View>

          {loan.deadline && (
            <View style={[st.infoRow, { borderBottomColor: borderC }]}>
              <View style={st.infoLeft}>
                <Icon name="time-outline" size={16} color={textSec} />
                <Text style={[st.infoLabel, { color: textSec }]}>Deadline</Text>
              </View>
              <View style={st.infoRight}>
                <Text style={[st.infoValue, { color: textPri }]}>
                  {formatDate(loan.deadline, 'dd MMM yyyy')}
                </Text>
                {daysLeft !== null && !loan.isSettled && (
                  <Text style={[st.countdown, { color: daysLeft < 0 ? '#EF4444' : daysLeft < 7 ? '#F59E0B' : '#10B981' }]}>
                    {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
                  </Text>
                )}
              </View>
            </View>
          )}

          {loan.phone && (
            <View style={[st.infoRow, { borderBottomColor: borderC }]}>
              <View style={st.infoLeft}>
                <Icon name="call-outline" size={16} color={textSec} />
                <Text style={[st.infoLabel, { color: textSec }]}>Phone</Text>
              </View>
              <Text style={[st.infoValue, { color: textPri }]}>{loan.phone}</Text>
            </View>
          )}

          {loan.note && (
            <View style={st.infoRow}>
              <View style={st.infoLeft}>
                <Icon name="document-text-outline" size={16} color={textSec} />
                <Text style={[st.infoLabel, { color: textSec }]}>Note</Text>
              </View>
              <Text style={[st.infoValue, { color: textPri, flex: 1, textAlign: 'right' }]} numberOfLines={3}>
                {loan.note}
              </Text>
            </View>
          )}
        </View>

        {/* Payment History */}
        <View style={st.section}>
          <View style={st.sectionHeader}>
            <Text style={[st.sectionTitle, { color: textPri }]}>Payments</Text>
            <Text style={[st.sectionCount, { color: textSec }]}>{payments.length}</Text>
          </View>

          {payments.length > 0 ? (
            payments.map((p: any) => (
              <TouchableOpacity
                key={p._id}
                style={[st.paymentRow, { borderBottomColor: borderC }]}
                onLongPress={() => handleDeletePayment(p._id)}
                activeOpacity={0.7}
              >
                <View style={[st.paymentIcon, { backgroundColor: `${typeColor}10` }]}>
                  <Icon name="add-circle" size={14} color={typeColor} />
                </View>
                <View style={st.paymentInfo}>
                  <Text style={[st.paymentAmt, { color: textPri }]}>{formatCurrency(p.amount)}</Text>
                  {p.note ? <Text style={[st.paymentNote, { color: textSec }]} numberOfLines={1}>{p.note}</Text> : null}
                </View>
                <Text style={[st.paymentDate, { color: textTer }]}>{formatRelativeTime(p.date)}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={st.emptyWrap}>
              <Icon name="wallet-outline" size={32} color={textTer} />
              <Text style={[st.emptyText, { color: textSec }]}>No payments yet</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={st.actionsSection}>
          {!loan.isSettled && (
            <TouchableOpacity
              style={[st.actionBtn, { backgroundColor: `${typeColor}12`, borderColor: typeColor }]}
              onPress={handleToggleSettled}
            >
              <Icon name="checkmark-circle-outline" size={18} color={typeColor} />
              <Text style={[st.actionBtnText, { color: typeColor }]}>Mark as Settled</Text>
            </TouchableOpacity>
          )}
          {loan.isSettled && (
            <TouchableOpacity
              style={[st.actionBtn, { backgroundColor: '#3B82F612', borderColor: '#3B82F6' }]}
              onPress={handleToggleSettled}
            >
              <Icon name="refresh-outline" size={18} color="#3B82F6" />
              <Text style={[st.actionBtnText, { color: '#3B82F6' }]}>Reopen Loan</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[st.actionBtn, { backgroundColor: '#EF444412', borderColor: '#EF4444' }]}
            onPress={handleDeleteLoan}
          >
            <Icon name="trash-outline" size={18} color="#EF4444" />
            <Text style={[st.actionBtnText, { color: '#EF4444' }]}>Delete Loan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Payment Footer */}
      {!loan.isSettled && (
        <View style={[st.footer, { backgroundColor: surfaceC, borderTopColor: borderC, paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={[st.addPaymentBtn, { backgroundColor: typeColor }]}
            onPress={() => setShowPaymentModal(true)}
            activeOpacity={0.8}
          >
            <Icon name="add-circle-outline" size={18} color="#FFF" />
            <Text style={st.addPaymentText}>Add Payment</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} transparent animationType="slide" onRequestClose={() => setShowPaymentModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.modalOverlay}>
          <View style={[st.modalSheet, { backgroundColor: surfaceC }]}>
            <View style={[st.modalHeader, { borderBottomColor: borderC }]}>
              <View style={st.modalTitleRow}>
                <View style={[st.modalIcon, { backgroundColor: `${typeColor}12` }]}>
                  <Icon name="cash-outline" size={16} color={typeColor} />
                </View>
                <Text style={[st.modalTitle, { color: textPri }]}>Record Payment</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Icon name="close" size={20} color={textSec} />
              </TouchableOpacity>
            </View>

            {/* Progress preview */}
            <View style={[st.modalProgress, { backgroundColor: colors.background }]}>
              <Text style={[st.modalProgressText, { color: textSec }]}>
                {formatCurrency(totalPaid)} / {formatCurrency(loan.amount)}
              </Text>
              <View style={[st.modalProgressTrack, { backgroundColor: `${typeColor}12` }]}>
                <View style={[st.modalProgressFill, { width: `${pct}%` as any, backgroundColor: typeColor }]} />
              </View>
            </View>

            {/* Amount */}
            <View style={[st.modalAmountRow, { borderColor: typeColor, backgroundColor: colors.background }]}>
              <Text style={[st.modalCurrency, { color: textSec }]}>৳</Text>
              <TextInput
                style={[st.modalAmountInput, { color: textPri }]}
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={textTer}
                autoFocus
              />
            </View>

            {/* Note */}
            <TextInput
              style={[st.modalNoteInput, { borderColor: borderC, backgroundColor: colors.background, color: textPri }]}
              value={paymentNote}
              onChangeText={setPaymentNote}
              placeholder="Add a note (optional)"
              placeholderTextColor={textTer}
            />

            {/* Buttons */}
            <View style={st.modalBtns}>
              <TouchableOpacity style={[st.modalBtn, st.modalCancelBtn, { borderColor: borderC }]} onPress={() => setShowPaymentModal(false)}>
                <Text style={[st.modalCancelText, { color: textSec }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.modalBtn, { backgroundColor: typeColor, opacity: addPaymentMutation.isPending ? 0.6 : 1 }]}
                onPress={handleAddPayment}
                disabled={addPaymentMutation.isPending}
              >
                <Text style={st.modalAddText}>{addPaymentMutation.isPending ? 'Adding...' : 'Add'}</Text>
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

  // Hero
  hero: { marginHorizontal: 16, marginTop: 12, borderRadius: 14, borderWidth: 1, padding: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  heroIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  heroInfo: { flex: 1 },
  heroName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },
  settledBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  settledText: { fontSize: 10, fontWeight: '700', color: '#22C55E' },
  heroCenter: { alignItems: 'center', marginBottom: 14 },
  heroAmount: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  heroSub: { fontSize: 12, marginTop: 2 },
  progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 3 },
  heroBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroPaid: { fontSize: 12, fontWeight: '600' },
  heroRemaining: { fontSize: 12, fontWeight: '700' },

  // Info card
  infoCard: { marginHorizontal: 16, marginTop: 12, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoRight: { alignItems: 'flex-end' },
  infoLabel: { fontSize: 13, fontWeight: '500' },
  infoValue: { fontSize: 13, fontWeight: '600' },
  countdown: { fontSize: 11, fontWeight: '700', marginTop: 2 },

  // Payment history
  section: { paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  sectionCount: { fontSize: 12 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  paymentIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  paymentInfo: { flex: 1 },
  paymentAmt: { fontSize: 13, fontWeight: '700' },
  paymentNote: { fontSize: 11, marginTop: 1 },
  paymentDate: { fontSize: 10 },
  emptyWrap: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText: { fontSize: 12 },

  // Actions
  actionsSection: { paddingHorizontal: 16, marginTop: 8, gap: 8, marginBottom: 16 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 14, fontWeight: '700' },

  // Footer
  footer: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  addPaymentBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 12 },
  addPaymentText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  // Payment Modal
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
  modalAmountRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 44, marginBottom: 10 },
  modalCurrency: { fontSize: 16, fontWeight: '700', marginRight: 4 },
  modalAmountInput: { flex: 1, fontSize: 20, fontWeight: '800' },
  modalNoteInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 14 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  modalCancelBtn: { borderWidth: 1 },
  modalCancelText: { fontSize: 13, fontWeight: '600' },
  modalAddText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});

export default LoanDetailsScreen;
