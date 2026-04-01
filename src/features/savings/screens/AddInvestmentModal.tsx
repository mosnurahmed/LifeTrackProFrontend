/**
 * Add/Edit Investment Modal
 */

import React, { useEffect, useState, useMemo } from 'react';
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
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import {
  useCreateInvestment,
  useUpdateInvestment,
  useInvestment,
} from '../../../hooks/api/useInvestments';
import { Spinner, useGuide } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

const TYPES: { key: string; label: string; icon: string; color: string }[] = [
  { key: 'fd', label: 'FD', icon: 'business-outline', color: '#F97316' },
  { key: 'dps', label: 'DPS', icon: 'repeat-outline', color: '#3B82F6' },
  { key: 'sip', label: 'SIP', icon: 'trending-up-outline', color: '#8B5CF6' },
  { key: 'sanchayapatra', label: 'Sanchayapatra', icon: 'document-text-outline', color: '#10B981' },
  { key: 'bond', label: 'Bond', icon: 'ribbon-outline', color: '#06B6D4' },
  { key: 'insurance', label: 'Insurance', icon: 'shield-checkmark-outline', color: '#EF4444' },
  { key: 'custom', label: 'Custom', icon: 'cube-outline', color: '#64748B' },
];

const TYPE_MAP = Object.fromEntries(TYPES.map(t => [t.key, t]));

const isRecurring = (type: string) => ['dps', 'sip', 'insurance'].includes(type);

interface FormValues {
  name: string;
  institution: string;
  type: string;
  amount: string;
  interestRate: string;
  tenureMonths: string;
  startDate: Date;
  recurringDay: string;
  paidInstallments: string;
  note: string;
}

const AddInvestmentModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { GuideButton, GuideView } = useGuide('addInvestment');

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#E2E8F0';
  const bgC = colors.background;

  const { mode, investmentId } = (route.params as any) || { mode: 'create' };
  const isEditMode = mode === 'edit';

  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: investment, isLoading: investmentLoading } = useInvestment(investmentId ?? '');
  const createMutation = useCreateInvestment();
  const updateMutation = useUpdateInvestment();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      institution: '',
      type: 'fd',
      amount: '',
      interestRate: '',
      tenureMonths: '',
      startDate: new Date(),
      recurringDay: '',
      paidInstallments: '',
      note: '',
    },
  });

  const selectedType = watch('type');
  const amount = watch('amount');
  const interestRate = watch('interestRate');
  const tenureMonths = watch('tenureMonths');
  const startDate = watch('startDate');
  const typeInfo = TYPE_MAP[selectedType] || TYPE_MAP.custom;

  useEffect(() => {
    if (isEditMode && investment) {
      setValue('name', investment.name || '');
      setValue('institution', investment.institution || '');
      setValue('type', investment.type || 'fd');
      setValue('amount', String(investment.amount || ''));
      setValue('interestRate', String(investment.interestRate || ''));
      setValue('tenureMonths', String(investment.tenure || ''));
      setValue('startDate', investment.startDate ? new Date(investment.startDate) : new Date());
      setValue('recurringDay', investment.recurringDay ? String(investment.recurringDay) : '');
      setValue('note', investment.note || '');
    }
  }, [investment, isEditMode]);

  const maturityAmount = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    const rate = parseFloat(interestRate) || 0;
    const months = parseInt(tenureMonths) || 0;
    if (amt <= 0 || months <= 0) return 0;

    const r = rate / 100 / 12;
    if (isRecurring(selectedType)) {
      // FV of annuity: PMT * ((1+r)^n - 1) / r
      if (r === 0) return amt * months;
      return amt * ((Math.pow(1 + r, months) - 1) / r);
    } else {
      // FV = PV * (1 + r)^n
      return amt * Math.pow(1 + r, months);
    }
  }, [amount, interestRate, tenureMonths, selectedType]);

  const onSubmit = async (data: FormValues) => {
    const payload: any = {
      name: data.name.trim(),
      type: data.type,
      amount: parseFloat(data.amount),
      interestRate: parseFloat(data.interestRate) || 0,
      tenure: parseInt(data.tenureMonths) || 0,
      startDate: data.startDate.toISOString(),
    };
    if (data.institution.trim()) payload.institution = data.institution.trim();
    if (data.note.trim()) payload.note = data.note.trim();
    if (isRecurring(data.type) && data.recurringDay) {
      payload.recurringDay = parseInt(data.recurringDay);
    }
    if (!isEditMode && isRecurring(data.type) && data.paidInstallments) {
      payload.paidInstallments = parseInt(data.paidInstallments);
    }

    if (isEditMode) {
      await updateMutation.mutateAsync({ id: investmentId, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    navigation.goBack();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (investmentLoading && isEditMode) {
    return (
      <View style={[s.container, { backgroundColor: bgC }]}>
        <Spinner text="Loading..." />
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: bgC }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8, backgroundColor: surfaceC, borderBottomColor: borderC }]}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="close" size={22} color={textPri} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: textPri }]}>
          {isEditMode ? 'Edit Investment' : 'New Investment'}
        </Text>
        <GuideButton color={textPri} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 24 }]}>
        {/* Type Selector */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Type *</Text>
          <View style={s.typeGrid}>
            {TYPES.map(t => {
              const active = selectedType === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    s.typeChip,
                    { borderColor: active ? t.color : borderC, backgroundColor: active ? `${t.color}12` : surfaceC },
                  ]}
                  onPress={() => setValue('type', t.key)}
                >
                  <Icon name={t.icon} size={16} color={active ? t.color : textSec} />
                  <Text style={[s.typeChipText, { color: active ? t.color : textSec }]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Name */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Name *</Text>
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Name is required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[s.input, { backgroundColor: surfaceC, borderColor: errors.name ? '#EF4444' : borderC, color: textPri }]}
                placeholder="e.g., Islami Bank DPS"
                placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.name && <Text style={s.error}>{errors.name.message}</Text>}
        </View>

        {/* Institution */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Institution</Text>
          <Controller
            control={control}
            name="institution"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[s.input, { backgroundColor: surfaceC, borderColor: borderC, color: textPri }]}
                placeholder="e.g., Islami Bank"
                placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        {/* Amount */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>
            {isRecurring(selectedType) ? 'Installment Amount *' : 'Deposit Amount *'}
          </Text>
          <Controller
            control={control}
            name="amount"
            rules={{ required: 'Amount is required', validate: v => parseFloat(v) > 0 || 'Must be > 0' }}
            render={({ field: { onChange, value } }) => (
              <View style={[s.amountRow, { backgroundColor: surfaceC, borderColor: errors.amount ? '#EF4444' : borderC }]}>
                <Text style={[s.currency, { color: textSec }]}>{'\u09F3'}</Text>
                <TextInput
                  style={[s.amountInput, { color: textPri }]}
                  placeholder="0"
                  placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
                  keyboardType="decimal-pad"
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.amount && <Text style={s.error}>{errors.amount.message}</Text>}
        </View>

        {/* Interest Rate */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Interest Rate (% / year)</Text>
          <Controller
            control={control}
            name="interestRate"
            render={({ field: { onChange, value } }) => (
              <View style={[s.inputRow, { backgroundColor: surfaceC, borderColor: borderC }]}>
                <TextInput
                  style={[s.input, { flex: 1, borderWidth: 0, backgroundColor: 'transparent', color: textPri }]}
                  placeholder="0"
                  placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
                  keyboardType="decimal-pad"
                  value={value}
                  onChangeText={onChange}
                />
                <Text style={[s.suffix, { color: textSec }]}>%</Text>
              </View>
            )}
          />
        </View>

        {/* Tenure */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Tenure (months) *</Text>
          <Controller
            control={control}
            name="tenureMonths"
            rules={{ required: 'Tenure is required', validate: v => parseInt(v) > 0 || 'Must be > 0' }}
            render={({ field: { onChange, value } }) => (
              <View style={[s.inputRow, { backgroundColor: surfaceC, borderColor: errors.tenureMonths ? '#EF4444' : borderC }]}>
                <TextInput
                  style={[s.input, { flex: 1, borderWidth: 0, backgroundColor: 'transparent', color: textPri }]}
                  placeholder="0"
                  placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
                  keyboardType="number-pad"
                  value={value}
                  onChangeText={onChange}
                />
                <Text style={[s.suffix, { color: textSec }]}>months</Text>
              </View>
            )}
          />
          {errors.tenureMonths && <Text style={s.error}>{errors.tenureMonths.message}</Text>}
        </View>

        {/* Start Date */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Start Date</Text>
          <TouchableOpacity
            style={[s.selector, { backgroundColor: surfaceC, borderColor: borderC }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar-outline" size={16} color={textSec} />
            <Text style={[s.selectorText, { color: textPri }]}>
              {startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recurring Day */}
        {isRecurring(selectedType) && (
          <View style={s.field}>
            <Text style={[s.label, { color: textSec }]}>Recurring Day (1-28)</Text>
            <Controller
              control={control}
              name="recurringDay"
              rules={{ validate: v => !v || (parseInt(v) >= 1 && parseInt(v) <= 28) || 'Must be 1-28' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[s.input, { backgroundColor: surfaceC, borderColor: errors.recurringDay ? '#EF4444' : borderC, color: textPri }]}
                  placeholder="e.g., 5"
                  placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
                  keyboardType="number-pad"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.recurringDay && <Text style={s.error}>{errors.recurringDay.message}</Text>}
          </View>
        )}

        {/* Already Paid Installments (only for new recurring) */}
        {!isEditMode && isRecurring(selectedType) && (
          <View style={s.field}>
            <Text style={[s.label, { color: textSec }]}>Already Paid Installments</Text>
            <Text style={[s.hint, { color: isDark ? '#475569' : '#94A3B8' }]}>
              If you started this before using the app, enter how many months you've already paid
            </Text>
            <Controller
              control={control}
              name="paidInstallments"
              rules={{ validate: v => !v || (parseInt(v) >= 0 && parseInt(v) < 999) || 'Invalid' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[s.input, { backgroundColor: surfaceC, borderColor: borderC, color: textPri }]}
                  placeholder="0 (skip if new)"
                  placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
                  keyboardType="number-pad"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
        )}

        {/* Maturity Preview */}
        {maturityAmount > 0 && (
          <View style={[s.maturityCard, { backgroundColor: `${typeInfo.color}10`, borderColor: `${typeInfo.color}30` }]}>
            <View style={s.maturityRow}>
              <Icon name="trending-up-outline" size={16} color={typeInfo.color} />
              <Text style={[s.maturityLabel, { color: textSec }]}>Est. Maturity Amount</Text>
            </View>
            <Text style={[s.maturityAmount, { color: typeInfo.color }]}>
              {formatCurrency(maturityAmount)}
            </Text>
            {parseFloat(amount) > 0 && (
              <Text style={[s.maturitySub, { color: textSec }]}>
                Interest: {formatCurrency(maturityAmount - (isRecurring(selectedType) ? (parseFloat(amount) || 0) * (parseInt(tenureMonths) || 0) : (parseFloat(amount) || 0)))}
              </Text>
            )}
          </View>
        )}

        {/* Note */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Note</Text>
          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[s.input, s.inputMulti, { backgroundColor: surfaceC, borderColor: borderC, color: textPri }]}
                placeholder="Optional notes"
                placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            )}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[s.footer, { borderTopColor: borderC, paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={[s.footerBtn, s.cancelBtn, { borderColor: borderC }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[s.cancelBtnText, { color: textSec }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.footerBtn, s.createBtn, { backgroundColor: typeInfo.color, opacity: isPending ? 0.6 : 1 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          <Text style={s.createBtnText}>{isPending ? 'Saving...' : isEditMode ? 'Update' : 'Create'}</Text>
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
              <Text style={[s.pickerTitle, { color: textPri }]}>Start Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={[s.pickerDone, { color: typeInfo.color }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <DatePicker
              date={startDate}
              onDateChange={d => setValue('startDate', d)}
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

const s = StyleSheet.create({
  container: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: 1 },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  footerBtn: { flex: 1, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { borderWidth: 1 },
  cancelBtnText: { fontSize: 13, fontWeight: '600' },
  createBtn: {},
  createBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  scroll: { padding: 16 },

  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  inputMulti: { minHeight: 70, paddingTop: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingRight: 12 },
  suffix: { fontSize: 12, fontWeight: '600' },
  error: { fontSize: 11, color: '#EF4444', marginTop: 4 },
  hint: { fontSize: 11, lineHeight: 16, marginBottom: 8 },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeChipText: { fontSize: 12, fontWeight: '600' },

  amountRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 44 },
  currency: { fontSize: 16, fontWeight: '700', marginRight: 4 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: '800' },

  selector: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 42 },
  selectorText: { flex: 1, fontSize: 13 },

  maturityCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16, alignItems: 'center' },
  maturityRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  maturityLabel: { fontSize: 12, fontWeight: '600' },
  maturityAmount: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  maturitySub: { fontSize: 11, marginTop: 4 },

  pickerOverlay: { flex: 1, backgroundColor: '#00000055', justifyContent: 'flex-end' },
  pickerSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 16 },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  pickerTitle: { fontSize: 14, fontWeight: '700' },
  pickerCancel: { fontSize: 13 },
  pickerDone: { fontSize: 13, fontWeight: '700' },
});

export default AddInvestmentModal;
