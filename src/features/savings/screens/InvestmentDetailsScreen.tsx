/**
 * Investment Details Screen
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
import DatePicker from 'react-native-date-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import {
  useInvestment,
  useAddContribution,
  useDeleteContribution,
  useCloseInvestment,
  useDeleteInvestment,
} from '../../../hooks/api/useInvestments';
import { Spinner, ErrorState, useGuide } from '../../../components/common';
import { useConfirm } from '../../../components/common/ConfirmModal';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from '../../../utils/formatters';

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  fd: { icon: 'business-outline', color: '#F97316', label: 'FD' },
  dps: { icon: 'repeat-outline', color: '#3B82F6', label: 'DPS' },
  sip: { icon: 'trending-up-outline', color: '#8B5CF6', label: 'SIP' },
  sanchayapatra: { icon: 'document-text-outline', color: '#10B981', label: 'Sanchayapatra' },
  bond: { icon: 'ribbon-outline', color: '#06B6D4', label: 'Bond' },
  insurance: { icon: 'shield-checkmark-outline', color: '#EF4444', label: 'Insurance' },
  custom: { icon: 'cube-outline', color: '#64748B', label: 'Custom' },
};

const InvestmentDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { GuideButton, GuideView } = useGuide('investmentDetails');
  const { confirm } = useConfirm();

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const textTer = isDark ? '#475569' : '#CBD5E1';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const { investmentId } = (route.params as any) || {};

  const [showContribModal, setShowContribModal] = useState(false);
  const [contribAmount, setContribAmount] = useState('');
  const [contribDate, setContribDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: inv, isLoading, error, refetch, isRefetching } = useInvestment(investmentId ?? '');
  const addContribMutation = useAddContribution();
  const deleteContribMutation = useDeleteContribution();
  const closeMutation = useCloseInvestment();
  const deleteMutation = useDeleteInvestment();

  const handleAddContribution = async () => {
    const val = parseFloat(contribAmount);
    if (isNaN(val) || val <= 0) return;
    await addContribMutation.mutateAsync({
      investmentId,
      amount: val,
      date: contribDate.toISOString(),
    });
    setContribAmount('');
    setContribDate(new Date());
    setShowContribModal(false);
  };

  const handleDeleteContribution = async (contribId: string) => {
    const ok = await confirm({
      title: 'Delete Contribution',
      message: 'Remove this contribution record?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) deleteContribMutation.mutate({ investmentId, contribId });
  };

  const handleClose = async () => {
    const ok = await confirm({
      title: 'Close Investment',
      message: 'Mark this investment as matured/closed?',
      confirmText: 'Close',
      variant: 'danger',
    });
    if (ok) closeMutation.mutate(investmentId);
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete Investment',
      message: 'This will permanently delete this investment and all its records.',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) {
      await deleteMutation.mutateAsync(investmentId);
      navigation.goBack();
    }
  };

  if (isLoading) return <View style={[st.container, { backgroundColor: colors.background }]}><Spinner text="Loading..." /></View>;
  if (error || !inv) return <View style={[st.container, { backgroundColor: colors.background }]}><ErrorState title="Investment not found" message="Unable to load" onRetry={() => navigation.goBack()} /></View>;

  const tc = TYPE_CONFIG[inv.type] || TYPE_CONFIG.custom;
  const totalDeposited = inv.totalDeposited ?? 0;
  const maturityAmount = inv.maturityAmount ?? 0;
  const pct = maturityAmount > 0 ? Math.min((totalDeposited / maturityAmount) * 100, 100) : 0;
  const contributions = inv.contributions ?? [];

  // Tenure progress
  const startDate = inv.startDate ? new Date(inv.startDate) : null;
  const tenure = inv.tenure ?? 0;
  const maturityDate = inv.maturityDate ? new Date(inv.maturityDate) : null;
  const isRecurring = inv.isRecurring;

  // For recurring: progress = contributions paid / total tenure
  // For lump sum: progress = time elapsed / total tenure
  const paidInstallments = isRecurring ? contributions.length : 0;
  const elapsed = isRecurring
    ? paidInstallments
    : startDate ? Math.max(0, (Date.now() - startDate.getTime()) / (30.44 * 86400000)) : 0;
  const tenurePct = tenure > 0 ? Math.min((elapsed / tenure) * 100, 100) : 0;
  const monthsRemaining = Math.max(0, Math.ceil(tenure - elapsed));

  return (
    <View style={[st.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + 8, backgroundColor: surfaceC, borderBottomColor: borderC }]}>
        <TouchableOpacity style={st.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={textPri} />
        </TouchableOpacity>
        <Text style={[st.headerTitle, { color: textPri }]}>Investment Details</Text>
        {!inv.isClosed && (
          <TouchableOpacity
            style={st.headerBtn}
            onPress={() => (navigation as any).navigate('AddInvestment', { mode: 'edit', investmentId })}
          >
            <Icon name="create-outline" size={20} color={tc.color} />
          </TouchableOpacity>
        )}
        {inv.isClosed && <View style={{ width: 36 }} />}
        <GuideButton color={textPri} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[tc.color]} tintColor={tc.color} />}
      >
        {/* Hero Card */}
        <View style={[st.hero, { backgroundColor: surfaceC, borderColor: borderC }]}>
          {/* Top: Icon + Name + Type */}
          <View style={st.heroTop}>
            <View style={[st.heroIcon, { backgroundColor: `${tc.color}15` }]}>
              <Icon name={tc.icon} size={20} color={tc.color} />
            </View>
            <View style={st.heroInfo}>
              <Text style={[st.heroTitle, { color: textPri }]} numberOfLines={1}>{inv.name}</Text>
              {inv.institution ? <Text style={[st.heroDesc, { color: textSec }]} numberOfLines={1}>{inv.institution}</Text> : null}
            </View>
            <View style={[st.typeBadge, { backgroundColor: `${tc.color}15` }]}>
              <Text style={[st.typeBadgeText, { color: tc.color }]}>{tc.label}</Text>
            </View>
          </View>

          {inv.isClosed && (
            <View style={[st.completedBadge, { backgroundColor: '#10B98115' }]}>
              <Icon name="checkmark-circle" size={14} color="#10B981" />
              <Text style={[st.completedText, { color: '#10B981' }]}>Matured / Closed</Text>
            </View>
          )}
        </View>

        {/* Overview Cards — 2x2 grid */}
        <View style={st.overviewGrid}>
          <View style={[st.ovCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Text style={[st.ovLabel, { color: textSec }]}>Total Deposited</Text>
            <Text style={[st.ovValue, { color: colors.primary }]}>{formatCurrency(totalDeposited)}</Text>
            {isRecurring && <Text style={[st.ovSub, { color: textSec }]}>{contributions.length} of {tenure} installments</Text>}
          </View>
          <View style={[st.ovCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Text style={[st.ovLabel, { color: textSec }]}>Maturity Value</Text>
            <Text style={[st.ovValue, { color: textPri }]}>{formatCurrency(maturityAmount)}</Text>
            <Text style={[st.ovSub, { color: '#10B981' }]}>+{formatCurrency(maturityAmount - totalDeposited)} profit</Text>
          </View>
          <View style={[st.ovCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Text style={[st.ovLabel, { color: textSec }]}>Interest Rate</Text>
            <Text style={[st.ovValue, { color: textPri }]}>{inv.interestRate ?? 0}%</Text>
            <Text style={[st.ovSub, { color: textSec }]}>per year</Text>
          </View>
          <View style={[st.ovCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Text style={[st.ovLabel, { color: textSec }]}>{isRecurring ? 'Installments Left' : 'Time Left'}</Text>
            <Text style={[st.ovValue, { color: monthsRemaining <= 3 ? '#F59E0B' : textPri }]}>{monthsRemaining} months</Text>
            <Text style={[st.ovSub, { color: textSec }]}>of {tenure} months total</Text>
          </View>
        </View>

        {/* Deposit Progress */}
        <View style={[st.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={[st.cardTitle, { color: textPri }]}>Deposit Progress</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>{pct.toFixed(0)}%</Text>
          </View>
          <View style={[st.tenureTrack, { backgroundColor: `${colors.primary}12` }]}>
            <View style={[st.tenureFill, { width: `${pct}%` as any, backgroundColor: colors.primary }]} />
          </View>
          <View style={st.tenureRow}>
            <Text style={[st.tenureText, { color: textSec }]}>
              {formatCurrency(totalDeposited)} deposited
            </Text>
            <Text style={[st.tenureText, { color: textSec }]}>
              {formatCurrency(maturityAmount)} target
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={[st.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={[st.cardTitle, { color: textPri }]}>Timeline</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: tc.color }}>{tenurePct.toFixed(0)}%</Text>
          </View>
          <View style={[st.tenureTrack, { backgroundColor: `${tc.color}12` }]}>
            <View style={[st.tenureFill, { width: `${tenurePct}%` as any, backgroundColor: tc.color }]} />
          </View>
          <View style={st.tenureRow}>
            <Text style={[st.tenureText, { color: textSec }]}>
              {startDate ? formatDate(startDate.toISOString(), 'dd MMM yyyy') : '--'}
            </Text>
            <Text style={[st.tenureText, { color: textSec }]}>
              {maturityDate ? formatDate(maturityDate.toISOString(), 'dd MMM yyyy') : '--'}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={[st.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <Text style={[st.cardTitle, { color: textPri }]}>Details</Text>
          {[
            { label: 'Start Date', value: startDate ? formatDate(startDate.toISOString(), 'dd MMM yyyy') : '--', icon: 'calendar-outline' },
            { label: 'Maturity Date', value: maturityDate ? formatDate(maturityDate.toISOString(), 'dd MMM yyyy') : '--', icon: 'flag-outline' },
            ...(isRecurring ? [{ label: 'Monthly Amount', value: formatCurrency(inv.amount), icon: 'cash-outline' }] : []),
            ...(inv.recurringDay ? [{ label: 'Payment Day', value: `${inv.recurringDay}th of every month`, icon: 'repeat-outline' }] : []),
            ...(inv.note ? [{ label: 'Note', value: inv.note, icon: 'document-text-outline' }] : []),
          ].map((row, idx) => (
            <View key={idx} style={[st.infoRow, idx > 0 && { borderTopWidth: 1, borderTopColor: borderC }]}>
              <View style={[st.infoIcon, { backgroundColor: `${colors.primary}10` }]}>
                <Icon name={row.icon} size={14} color={colors.primary} />
              </View>
              <View style={st.infoContent}>
                <Text style={[st.infoLabel, { color: textSec }]}>{row.label}</Text>
                <Text style={[st.infoValue, { color: textPri }]}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Contributions */}
        <View style={st.section}>
          <View style={st.sectionHeader}>
            <Text style={[st.sectionTitle, { color: textPri }]}>Contributions</Text>
            <Text style={[st.sectionCount, { color: textSec }]}>{contributions.length}</Text>
          </View>

          {contributions.length > 0 ? (
            contributions.map((c: any) => (
              <TouchableOpacity
                key={c._id}
                style={[st.contribRow, { borderBottomColor: borderC }]}
                onLongPress={() => handleDeleteContribution(c._id)}
                activeOpacity={0.7}
              >
                <View style={[st.contribIcon, { backgroundColor: `${tc.color}10` }]}>
                  <Icon name="add-circle" size={14} color={tc.color} />
                </View>
                <View style={st.contribInfo}>
                  <Text style={[st.contribAmt, { color: textPri }]}>{formatCurrency(c.amount)}</Text>
                  {c.note ? <Text style={[st.contribNote, { color: textSec }]} numberOfLines={1}>{c.note}</Text> : null}
                </View>
                <Text style={[st.contribDate, { color: textTer }]}>{formatRelativeTime(c.date)}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={st.emptyWrap}>
              <Icon name="wallet-outline" size={32} color={textTer} />
              <Text style={[st.emptyText, { color: textSec }]}>No contributions yet</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={st.actionSection}>
          {!inv.isClosed && (
            <TouchableOpacity
              style={[st.actionBtn, { backgroundColor: '#F59E0B' }]}
              onPress={handleClose}
            >
              <Icon name="checkmark-circle-outline" size={18} color="#FFF" />
              <Text style={st.actionBtnText}>Close / Mature</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[st.actionBtn, { backgroundColor: '#EF4444' }]}
            onPress={handleDelete}
          >
            <Icon name="trash-outline" size={18} color="#FFF" />
            <Text style={st.actionBtnText}>Delete Investment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer — Add Contribution */}
      {!inv.isClosed && (
        <View style={[st.footer, { backgroundColor: surfaceC, borderTopColor: borderC, paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={[st.addBtn, { backgroundColor: tc.color }]}
            onPress={() => setShowContribModal(true)}
            activeOpacity={0.8}
          >
            <Icon name="add-circle-outline" size={18} color="#FFF" />
            <Text style={st.addBtnText}>Add Contribution</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Contribute Modal */}
      <Modal visible={showContribModal} transparent animationType="slide" onRequestClose={() => setShowContribModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.modalOverlay}>
          <View style={[st.modalSheet, { backgroundColor: surfaceC }]}>
            <View style={[st.modalHeader, { borderBottomColor: borderC }]}>
              <View style={st.modalTitleRow}>
                <View style={[st.modalIcon, { backgroundColor: `${tc.color}12` }]}>
                  <Icon name={tc.icon} size={16} color={tc.color} />
                </View>
                <Text style={[st.modalTitle, { color: textPri }]}>{inv.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowContribModal(false)}>
                <Icon name="close" size={20} color={textSec} />
              </TouchableOpacity>
            </View>

            {/* Amount */}
            <View style={[st.amountRow, { borderColor: tc.color, backgroundColor: colors.background }]}>
              <Text style={[st.currency, { color: textSec }]}>{'\u09F3'}</Text>
              <TextInput
                style={[st.amountInput, { color: textPri }]}
                value={contribAmount}
                onChangeText={setContribAmount}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={textTer}
                autoFocus
              />
            </View>

            {/* Date */}
            <TouchableOpacity
              style={[st.dateSelector, { borderColor: borderC, backgroundColor: colors.background }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon name="calendar-outline" size={16} color={textSec} />
              <Text style={[st.dateSelectorText, { color: textPri }]}>
                {contribDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View style={st.modalBtns}>
              <TouchableOpacity style={[st.modalBtn, st.modalCancelBtn, { borderColor: borderC }]} onPress={() => setShowContribModal(false)}>
                <Text style={[st.modalCancelText, { color: textSec }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.modalBtn, { backgroundColor: tc.color, opacity: addContribMutation.isPending ? 0.6 : 1 }]}
                onPress={handleAddContribution}
                disabled={addContribMutation.isPending}
              >
                <Text style={st.modalAddText}>{addContribMutation.isPending ? 'Adding...' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={st.modalOverlay}>
          <View style={[st.pickerSheet, { backgroundColor: surfaceC }]}>
            <View style={[st.pickerHeader, { borderBottomColor: borderC }]}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={[st.pickerCancel, { color: textSec }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[st.pickerTitle, { color: textPri }]}>Contribution Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={[st.pickerDone, { color: tc.color }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <DatePicker
              date={contribDate}
              onDateChange={setContribDate}
              mode="date"
              theme={isDark ? 'dark' : 'light'}
            />
          </View>
        </View>
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

  hero: { marginHorizontal: 16, marginTop: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  heroInfo: { flex: 1 },
  heroTitle: { fontSize: 16, fontWeight: '700' },
  heroDesc: { fontSize: 11, marginTop: 2 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginTop: 10, alignSelf: 'flex-start' },
  completedText: { fontSize: 11, fontWeight: '700' },

  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginTop: 12, marginBottom: 4 },
  ovCard: { width: '48.5%' as any, borderRadius: 12, borderWidth: 1, padding: 12 },
  ovLabel: { fontSize: 11, marginBottom: 4 },
  ovValue: { fontSize: 16, fontWeight: '700' },
  ovSub: { fontSize: 10, marginTop: 2 },

  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },

  tenureTrack: { height: 5, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  tenureFill: { height: '100%', borderRadius: 3 },
  tenureRow: { flexDirection: 'row', justifyContent: 'space-between' },
  tenureText: { fontSize: 10 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  infoIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, marginBottom: 2 },
  infoValue: { fontSize: 13, fontWeight: '600' },

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

  actionSection: { paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 42, borderRadius: 12 },
  actionBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  footer: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 12 },
  addBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000055' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, marginBottom: 12 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  modalIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  amountRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, height: 44, marginBottom: 10 },
  currency: { fontSize: 16, fontWeight: '700', marginRight: 4 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: '800' },
  dateSelector: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 42, marginBottom: 14 },
  dateSelectorText: { flex: 1, fontSize: 13 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  modalCancelBtn: { borderWidth: 1 },
  modalCancelText: { fontSize: 13, fontWeight: '600' },
  modalAddText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  pickerSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 16 },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  pickerTitle: { fontSize: 14, fontWeight: '700' },
  pickerCancel: { fontSize: 13 },
  pickerDone: { fontSize: 13, fontWeight: '700' },
});

export default InvestmentDetailsScreen;
