/* eslint-disable react-native/no-inline-styles */
/**
 * Transfer Screen — Fund transfers + Payment method balances
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import {
  useTransfers, usePaymentBalances, useCreateTransfer, useDeleteTransfer,
} from '../../../hooks/api/useTransfers';
import { AppHeader, useConfirm, useGuide } from '../../../components/common';
import { Spinner } from '../../../components/common';
import { formatCurrency, formatRelativeTime } from '../../../utils/formatters';
import { usePrivacy } from '../../../store/privacyStore';

const METHODS = [
  { key: 'cash', label: 'Cash', icon: 'cash-outline', color: '#22C55E' },
  { key: 'card', label: 'Card', icon: 'card-outline', color: '#3B82F6' },
  { key: 'mobile_banking', label: 'Mobile', icon: 'phone-portrait-outline', color: '#8B5CF6' },
  { key: 'bank_transfer', label: 'Bank', icon: 'business-outline', color: '#F59E0B' },
];

const getMethod = (key: string) => METHODS.find(m => m.key === key) || METHODS[0];

const TransferScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { confirm } = useConfirm();
  const { GuideButton, GuideView } = useGuide('transfers');
  const { mask } = usePrivacy();

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const { data: transfers = [], isLoading, refetch, isRefetching } = useTransfers();
  const { data: balanceData } = usePaymentBalances();
  const createMutation = useCreateTransfer();
  const deleteMutation = useDeleteTransfer();

  const [showModal, setShowModal] = useState(false);
  const [fromMethod, setFromMethod] = useState('card');
  const [toMethod, setToMethod] = useState('cash');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleCreate = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || fromMethod === toMethod) return;
    await createMutation.mutateAsync({ fromMethod, toMethod, amount: val, note: note.trim() || undefined });
    setAmount(''); setNote(''); setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: 'Delete Transfer', message: 'Remove this transfer?', confirmText: 'Delete', variant: 'danger' });
    if (ok) deleteMutation.mutate(id);
  };

  const balances = balanceData?.balances || {};

  if (isLoading) return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Transfers" />
      <Spinner />
    </View>
  );

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Transfers"
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <GuideButton color={textPri} />
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        {/* Payment Method Balances */}
        <View style={[s.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <Text style={[s.cardTitle, { color: textPri }]}>Wallet Balances</Text>
          {METHODS.map((m, i) => {
            const bal = balances[m.key]?.balance ?? 0;
            return (
              <View key={m.key} style={[s.balanceRow, i < METHODS.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderC }]}>
                <View style={[s.methodIcon, { backgroundColor: `${m.color}15` }]}>
                  <Icon name={m.icon} size={16} color={m.color} />
                </View>
                <Text style={[s.methodLabel, { color: textPri }]}>{m.label}</Text>
                <Text style={[s.balanceVal, { color: bal >= 0 ? '#10B981' : '#EF4444' }]}>
                  {mask(formatCurrency(bal))}
                </Text>
              </View>
            );
          })}
          <View style={[s.totalRow, { borderTopColor: borderC }]}>
            <Text style={[s.totalLabel, { color: textSec }]}>Total</Text>
            <Text style={[s.totalVal, { color: textPri }]}>
              {mask(formatCurrency(balanceData?.totalBalance ?? 0))}
            </Text>
          </View>
        </View>

        {/* Transfer History */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: textPri }]}>Recent Transfers</Text>
            <Text style={[s.sectionCount, { color: textSec }]}>{(transfers as any[]).length}</Text>
          </View>

          {(transfers as any[]).length === 0 ? (
            <View style={s.emptyWrap}>
              <Icon name="swap-horizontal-outline" size={36} color={textSec} />
              <Text style={[s.emptyText, { color: textSec }]}>No transfers yet</Text>
            </View>
          ) : (
            (transfers as any[]).map((t: any) => {
              const from = getMethod(t.fromMethod);
              const to = getMethod(t.toMethod);
              return (
                <TouchableOpacity
                  key={t._id}
                  style={[s.transferRow, { backgroundColor: surfaceC, borderColor: borderC }]}
                  onLongPress={() => handleDelete(t._id)}
                  activeOpacity={0.7}
                >
                  <View style={[s.methodIcon, { backgroundColor: `${from.color}15` }]}>
                    <Icon name={from.icon} size={14} color={from.color} />
                  </View>
                  <Icon name="arrow-forward" size={14} color={textSec} />
                  <View style={[s.methodIcon, { backgroundColor: `${to.color}15` }]}>
                    <Icon name={to.icon} size={14} color={to.color} />
                  </View>
                  <View style={s.transferInfo}>
                    <Text style={[s.transferLabel, { color: textPri }]}>{from.label} → {to.label}</Text>
                    <Text style={[s.transferDate, { color: textSec }]}>
                      {formatRelativeTime(t.date)}{t.note ? ` · ${t.note}` : ''}
                    </Text>
                  </View>
                  <Text style={[s.transferAmount, { color: textPri }]}>{mask(formatCurrency(t.amount))}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[s.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <Icon name="swap-horizontal" size={22} color="#FFF" />
      </TouchableOpacity>

      {/* Transfer Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[s.modalSheet, { backgroundColor: surfaceC, paddingBottom: insets.bottom + 20 }]}>
            <View style={[s.modalHeader, { borderBottomColor: borderC }]}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={[s.modalCancel, { color: textSec }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[s.modalTitle, { color: textPri }]}>New Transfer</Text>
              <TouchableOpacity onPress={handleCreate}>
                <Text style={[s.modalDone, { color: colors.primary }]}>Transfer</Text>
              </TouchableOpacity>
            </View>

            {/* From / To */}
            <View style={s.modalBody}>
              <Text style={[s.fieldLabel, { color: textSec }]}>From</Text>
              <View style={s.methodRow}>
                {METHODS.map(m => (
                  <TouchableOpacity
                    key={m.key}
                    style={[s.methodChip, { borderColor: fromMethod === m.key ? m.color : borderC, backgroundColor: fromMethod === m.key ? `${m.color}12` : 'transparent' }]}
                    onPress={() => setFromMethod(m.key)}
                  >
                    <Icon name={m.icon} size={14} color={fromMethod === m.key ? m.color : textSec} />
                    <Text style={[s.methodChipText, { color: fromMethod === m.key ? m.color : textSec }]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.fieldLabel, { color: textSec, marginTop: 14 }]}>To</Text>
              <View style={s.methodRow}>
                {METHODS.filter(m => m.key !== fromMethod).map(m => (
                  <TouchableOpacity
                    key={m.key}
                    style={[s.methodChip, { borderColor: toMethod === m.key ? m.color : borderC, backgroundColor: toMethod === m.key ? `${m.color}12` : 'transparent' }]}
                    onPress={() => setToMethod(m.key)}
                  >
                    <Icon name={m.icon} size={14} color={toMethod === m.key ? m.color : textSec} />
                    <Text style={[s.methodChipText, { color: toMethod === m.key ? m.color : textSec }]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.fieldLabel, { color: textSec, marginTop: 14 }]}>Amount</Text>
              <View style={[s.inputRow, { borderColor: borderC, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Text style={[s.currency, { color: textSec }]}>৳</Text>
                <TextInput
                  style={[s.input, { color: textPri }]}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
                  autoFocus
                />
              </View>

              <Text style={[s.fieldLabel, { color: textSec, marginTop: 14 }]}>Note (optional)</Text>
              <TextInput
                style={[s.noteInput, { borderColor: borderC, backgroundColor: isDark ? '#0F172A' : '#F8FAFC', color: textPri }]}
                value={note}
                onChangeText={setNote}
                placeholder="e.g., ATM withdrawal"
                placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <GuideView />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },

  card: { margin: 16, borderRadius: 14, borderWidth: 1, padding: 14 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  methodIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  methodLabel: { flex: 1, fontSize: 13, fontWeight: '600' },
  balanceVal: { fontSize: 14, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 4, borderTopWidth: 1 },
  totalLabel: { fontSize: 12, fontWeight: '600' },
  totalVal: { fontSize: 15, fontWeight: '800' },

  section: { paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  sectionCount: { fontSize: 12 },

  transferRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  transferInfo: { flex: 1, marginLeft: 4 },
  transferLabel: { fontSize: 13, fontWeight: '600' },
  transferDate: { fontSize: 11, marginTop: 2 },
  transferAmount: { fontSize: 14, fontWeight: '700' },

  emptyWrap: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 13 },

  fab: {
    position: 'absolute', bottom: 90, right: 20,
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  modalCancel: { fontSize: 14 },
  modalTitle: { fontSize: 15, fontWeight: '700' },
  modalDone: { fontSize: 14, fontWeight: '700' },
  modalBody: { padding: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  methodChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  methodChipText: { fontSize: 12, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 50 },
  currency: { fontSize: 18, fontWeight: '700', marginRight: 8 },
  input: { flex: 1, fontSize: 22, fontWeight: '700' },
  noteInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
});

export default TransferScreen;
