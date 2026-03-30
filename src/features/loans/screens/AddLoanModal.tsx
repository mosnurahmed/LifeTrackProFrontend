/**
 * Add/Edit Loan Modal
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import {
  useLoan,
  useCreateLoan,
  useUpdateLoan,
} from '../../../hooks/api/useLoans';
import { Spinner, useGuide } from '../../../components/common';
import { formatCurrency } from '../../../utils/formatters';

interface LoanFormData {
  type: 'given' | 'taken';
  personName: string;
  phone: string;
  amount: number;
  date: Date;
  deadline: Date | undefined;
  note: string;
}

const AddLoanModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { GuideButton, GuideView } = useGuide('addLoan');

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#E2E8F0';
  const bgC = colors.background;

  const { mode, loanId } = (route.params as any) || { mode: 'create' };
  const isEditMode = mode === 'edit';

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  const { data: loanData, isLoading: loanLoading } = useLoan(loanId);
  const createMutation = useCreateLoan();
  const updateMutation = useUpdateLoan();
  // useLoan has select → data is already the loan object
  const loan = loanData;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoanFormData>({
    defaultValues: {
      type: 'given',
      personName: '',
      phone: '',
      amount: 0,
      date: new Date(),
      deadline: undefined,
      note: '',
    },
  });

  const selectedType = watch('type');
  const date = watch('date');
  const deadline = watch('deadline');
  const typeColor = selectedType === 'given' ? '#10B981' : '#EF4444';

  useEffect(() => {
    if (isEditMode && loan) {
      setValue('type', loan.type);
      setValue('personName', loan.personName);
      setValue('phone', loan.personPhone || '');
      setValue('amount', loan.amount);
      setValue('date', loan.date ? new Date(loan.date) : new Date());
      setValue('deadline', loan.deadline ? new Date(loan.deadline) : undefined);
      setValue('note', loan.note || '');
    }
  }, [loan, isEditMode]);

  const onSubmit = async (data: LoanFormData) => {
    const { phone, ...rest } = data;
    const formatted = {
      ...rest,
      amount: parseFloat(String(data.amount)),
      date: data.date.toISOString(),
      deadline: data.deadline ? data.deadline.toISOString() : undefined,
      personPhone: phone?.trim() || undefined,
      note: data.note?.trim() || undefined,
    };
    if (isEditMode) {
      await updateMutation.mutateAsync({ id: loanId, ...formatted });
    } else {
      await createMutation.mutateAsync(formatted);
    }
    navigation.goBack();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (loanLoading && isEditMode) {
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
          {isEditMode ? 'Edit Loan' : 'New Loan'}
        </Text>
        <GuideButton color={textPri} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 24 }]}>
        {/* Type Selector */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Type *</Text>
          <Controller
            control={control}
            name="type"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View style={s.typeRow}>
                <TouchableOpacity
                  style={[
                    s.typeBtn,
                    {
                      borderColor: value === 'given' ? '#10B981' : borderC,
                      backgroundColor: value === 'given' ? '#10B98112' : surfaceC,
                    },
                  ]}
                  onPress={() => onChange('given')}
                >
                  <Icon name="arrow-up-circle" size={18} color={value === 'given' ? '#10B981' : textSec} />
                  <Text style={[s.typeText, { color: value === 'given' ? '#10B981' : textSec }]}>I Gave</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    s.typeBtn,
                    {
                      borderColor: value === 'taken' ? '#EF4444' : borderC,
                      backgroundColor: value === 'taken' ? '#EF444412' : surfaceC,
                    },
                  ]}
                  onPress={() => onChange('taken')}
                >
                  <Icon name="arrow-down-circle" size={18} color={value === 'taken' ? '#EF4444' : textSec} />
                  <Text style={[s.typeText, { color: value === 'taken' ? '#EF4444' : textSec }]}>I Took</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        {/* Person Name */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Person Name *</Text>
          <Controller
            control={control}
            name="personName"
            rules={{ required: 'Name is required' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[s.input, { backgroundColor: surfaceC, borderColor: errors.personName ? '#EF4444' : borderC, color: textPri }]}
                placeholder="e.g., John Doe"
                placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.personName && <Text style={s.error}>{errors.personName.message as string}</Text>}
        </View>

        {/* Phone */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Phone (optional)</Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[s.input, { backgroundColor: surfaceC, borderColor: borderC, color: textPri }]}
                placeholder="Phone number"
                placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
              />
            )}
          />
        </View>

        {/* Amount */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Amount *</Text>
          <Controller
            control={control}
            name="amount"
            rules={{ required: 'Amount is required', min: { value: 1, message: 'Amount must be > 0' } }}
            render={({ field: { onChange, value } }) => (
              <View style={[s.amountRow, { backgroundColor: surfaceC, borderColor: errors.amount ? '#EF4444' : borderC }]}>
                <Text style={[s.currency, { color: textSec }]}>৳</Text>
                <TextInput
                  style={[s.amountInput, { color: textPri }]}
                  placeholder="0"
                  placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
                  keyboardType="decimal-pad"
                  value={value > 0 ? value.toString() : ''}
                  onChangeText={t => {
                    const n = parseFloat(t);
                    onChange(isNaN(n) ? 0 : n);
                  }}
                />
              </View>
            )}
          />
          {errors.amount && <Text style={s.error}>{errors.amount.message as string}</Text>}
        </View>

        {/* Date */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Date *</Text>
          <TouchableOpacity
            style={[s.selector, { backgroundColor: surfaceC, borderColor: borderC }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar-outline" size={16} color={textSec} />
            <Text style={[s.selectorText, { color: textPri }]}>
              {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Deadline */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Deadline (optional)</Text>
          <TouchableOpacity
            style={[s.selector, { backgroundColor: surfaceC, borderColor: borderC }]}
            onPress={() => setShowDeadlinePicker(true)}
          >
            <Icon name="time-outline" size={16} color={textSec} />
            <Text style={[s.selectorText, { color: deadline ? textPri : (isDark ? '#475569' : '#CBD5E1') }]}>
              {deadline
                ? deadline.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : 'No deadline'}
            </Text>
            {deadline && (
              <TouchableOpacity onPress={() => setValue('deadline', undefined)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="close-circle" size={16} color={textSec} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Note */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Note (optional)</Text>
          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[s.input, s.inputMulti, { backgroundColor: surfaceC, borderColor: borderC, color: textPri }]}
                placeholder="Any details about this loan"
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
          style={[s.footerBtn, s.createBtn, { backgroundColor: typeColor, opacity: isPending ? 0.6 : 1 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          <Text style={s.createBtnText}>{isPending ? 'Saving...' : isEditMode ? 'Update' : 'Save Loan'}</Text>
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
              <Text style={[s.pickerTitle, { color: textPri }]}>Loan Date</Text>
              <TouchableOpacity onPress={() => {
                if (!date) setValue('date', new Date());
                setShowDatePicker(false);
              }}>
                <Text style={[s.pickerDone, { color: typeColor }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <DatePicker
              date={date || new Date()}
              onDateChange={d => setValue('date', d)}
              mode="date"
              theme={isDark ? 'dark' : 'light'}
            />
          </View>
        </View>
      </Modal>

      {/* Deadline Picker */}
      <Modal visible={showDeadlinePicker} transparent animationType="slide">
        <View style={s.pickerOverlay}>
          <View style={[s.pickerSheet, { backgroundColor: surfaceC }]}>
            <View style={[s.pickerHeader, { borderBottomColor: borderC }]}>
              <TouchableOpacity onPress={() => setShowDeadlinePicker(false)}>
                <Text style={[s.pickerCancel, { color: textSec }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[s.pickerTitle, { color: textPri }]}>Deadline</Text>
              <TouchableOpacity onPress={() => {
                if (!deadline) setValue('deadline', new Date());
                setShowDeadlinePicker(false);
              }}>
                <Text style={[s.pickerDone, { color: typeColor }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <DatePicker
              date={deadline || new Date()}
              onDateChange={d => setValue('deadline', d)}
              mode="date"
              minimumDate={new Date()}
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

  scroll: { padding: 16 },

  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  inputMulti: { minHeight: 70, paddingTop: 10 },
  error: { fontSize: 11, color: '#EF4444', marginTop: 4 },

  // Type selector
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  typeText: { fontSize: 14, fontWeight: '700' },

  // Amount
  amountRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 44 },
  currency: { fontSize: 16, fontWeight: '700', marginRight: 4 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: '800' },

  // Selector
  selector: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 42 },
  selectorText: { flex: 1, fontSize: 13 },

  // Footer
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  footerBtn: { flex: 1, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { borderWidth: 1 },
  cancelBtnText: { fontSize: 13, fontWeight: '600' },
  createBtn: {},
  createBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  // Picker
  pickerOverlay: { flex: 1, backgroundColor: '#00000055', justifyContent: 'flex-end' },
  pickerSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 16 },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  pickerTitle: { fontSize: 14, fontWeight: '700' },
  pickerCancel: { fontSize: 13 },
  pickerDone: { fontSize: 13, fontWeight: '700' },
});

export default AddLoanModal;
