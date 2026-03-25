/**
 * Add/Edit Savings Goal Modal
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import {
  useCreateSavingsGoal,
  useUpdateSavingsGoal,
  useSavingsGoal,
} from '../../../hooks/api/useSavingsGoals';
import { Spinner } from '../../../components/common';
import { savingsGoalSchema } from '../../../utils/validation/schemas';

const ICONS = [
  'wallet', 'home', 'car', 'airplane', 'gift', 'school', 'medical',
  'restaurant', 'basketball', 'business', 'desktop', 'phone-portrait',
  'camera', 'shirt', 'watch', 'diamond', 'bicycle', 'boat',
  'game-controller', 'paw',
];

const COLORS = [
  '#2ECC71', '#3498DB', '#9B59B6', '#E74C3C', '#F39C12', '#1ABC9C',
  '#E67E22', '#34495E', '#16A085', '#27AE60', '#2980B9', '#8E44AD',
  '#C0392B', '#D35400',
];

const PRIORITIES: { key: 'high' | 'medium' | 'low'; label: string; color: string }[] = [
  { key: 'high', label: 'High', color: '#EF4444' },
  { key: 'medium', label: 'Medium', color: '#F97316' },
  { key: 'low', label: 'Low', color: '#22C55E' },
];

const AddSavingsGoalModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#E2E8F0';
  const bgC = colors.background;

  const { mode, goalId } = (route.params as any) || { mode: 'create' };
  const isEditMode = mode === 'edit';

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const { data: goalData, isLoading: goalLoading } = useSavingsGoal(goalId);
  const createMutation = useCreateSavingsGoal();
  const updateMutation = useUpdateSavingsGoal();
  const goal = goalData?.data?.data;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(savingsGoalSchema),
    defaultValues: {
      title: '',
      description: '',
      targetAmount: 0,
      targetDate: undefined,
      icon: 'wallet',
      color: '#2ECC71',
      priority: 'medium' as 'high' | 'medium' | 'low',
    },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');
  const targetDate = watch('targetDate');

  useEffect(() => {
    if (isEditMode && goal) {
      setValue('title', goal.title);
      setValue('description', goal.description || '');
      setValue('targetAmount', goal.targetAmount);
      setValue('targetDate', goal.targetDate ? new Date(goal.targetDate) : undefined);
      setValue('icon', goal.icon);
      setValue('color', goal.color);
      setValue('priority', goal.priority);
    }
  }, [goal, isEditMode]);

  const onSubmit = async (data: any) => {
    const formatted = {
      ...data,
      targetDate: data.targetDate ? data.targetDate.toISOString() : undefined,
      targetAmount: parseFloat(data.targetAmount),
    };
    if (isEditMode) {
      await updateMutation.mutateAsync({ id: goalId, data: formatted });
    } else {
      await createMutation.mutateAsync(formatted);
    }
    navigation.goBack();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (goalLoading && isEditMode) {
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
          {isEditMode ? 'Edit Goal' : 'New Goal'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 24 }]}>
        {/* Preview + Icon/Color */}
        <View style={s.previewRow}>
          <TouchableOpacity
            style={[s.previewCircle, { backgroundColor: `${selectedColor}12` }]}
            onPress={() => setShowIconPicker(true)}
          >
            <Icon name={selectedIcon} size={28} color={selectedColor} />
            <View style={[s.editBadge, { backgroundColor: surfaceC, borderColor: borderC }]}>
              <Icon name="pencil" size={9} color={textSec} />
            </View>
          </TouchableOpacity>

          {/* Color row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.colorRow}>
            {COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[s.colorDot, { backgroundColor: c }, selectedColor === c && s.colorDotActive]}
                onPress={() => setValue('color', c)}
              >
                {selectedColor === c && <Icon name="checkmark" size={12} color="#FFF" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Title */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Title *</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[s.input, { backgroundColor: surfaceC, borderColor: errors.title ? '#EF4444' : borderC, color: textPri }]}
                placeholder="e.g., Buy a Car"
                placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.title && <Text style={s.error}>{errors.title.message as string}</Text>}
        </View>

        {/* Description */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Description</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[s.input, s.inputMulti, { backgroundColor: surfaceC, borderColor: borderC, color: textPri }]}
                placeholder="Optional details"
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

        {/* Target Amount */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Target Amount *</Text>
          <Controller
            control={control}
            name="targetAmount"
            render={({ field: { onChange, value } }) => (
              <View style={[s.amountRow, { backgroundColor: surfaceC, borderColor: errors.targetAmount ? '#EF4444' : borderC }]}>
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
          {errors.targetAmount && <Text style={s.error}>{errors.targetAmount.message as string}</Text>}
        </View>

        {/* Target Date */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Target Date</Text>
          <TouchableOpacity
            style={[s.selector, { backgroundColor: surfaceC, borderColor: borderC }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar-outline" size={16} color={textSec} />
            <Text style={[s.selectorText, { color: targetDate ? textPri : (isDark ? '#475569' : '#CBD5E1') }]}>
              {targetDate
                ? targetDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : 'No deadline'}
            </Text>
            {targetDate && (
              <TouchableOpacity onPress={() => setValue('targetDate', undefined)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="close-circle" size={16} color={textSec} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Priority */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Priority</Text>
          <Controller
            control={control}
            name="priority"
            render={({ field: { onChange, value } }) => (
              <View style={s.priorityRow}>
                {PRIORITIES.map(p => {
                  const active = value === p.key;
                  return (
                    <TouchableOpacity
                      key={p.key}
                      style={[
                        s.priorityChip,
                        { borderColor: active ? p.color : borderC, backgroundColor: active ? `${p.color}12` : surfaceC },
                      ]}
                      onPress={() => onChange(p.key)}
                    >
                      <View style={[s.priorityDot, { backgroundColor: p.color }]} />
                      <Text style={[s.priorityText, { color: active ? p.color : textSec }]}>{p.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
          style={[s.footerBtn, s.createBtn, { backgroundColor: selectedColor, opacity: isPending ? 0.6 : 1 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          <Text style={s.createBtnText}>{isPending ? 'Saving...' : isEditMode ? 'Update' : 'Create Goal'}</Text>
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
              <Text style={[s.pickerTitle, { color: textPri }]}>Target Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={[s.pickerDone, { color: selectedColor }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <DatePicker
              date={targetDate || new Date()}
              onDateChange={d => setValue('targetDate', d)}
              mode="date"
              minimumDate={new Date()}
            />
          </View>
        </View>
      </Modal>

      {/* Icon Picker */}
      <Modal visible={showIconPicker} transparent animationType="slide">
        <View style={s.pickerOverlay}>
          <View style={[s.pickerSheet, { backgroundColor: surfaceC, maxHeight: '70%' }]}>
            <View style={[s.pickerHeader, { borderBottomColor: borderC }]}>
              <TouchableOpacity onPress={() => setShowIconPicker(false)}>
                <Icon name="close" size={20} color={textPri} />
              </TouchableOpacity>
              <Text style={[s.pickerTitle, { color: textPri }]}>Select Icon</Text>
              <View style={{ width: 20 }} />
            </View>
            <ScrollView contentContainerStyle={s.iconGrid}>
              {ICONS.map(icon => {
                const active = selectedIcon === icon;
                return (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      s.iconItem,
                      { borderColor: active ? selectedColor : borderC, backgroundColor: active ? `${selectedColor}12` : surfaceC },
                    ]}
                    onPress={() => { setValue('icon', icon); setShowIconPicker(false); }}
                  >
                    <Icon name={icon} size={22} color={active ? selectedColor : textSec} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  footerBtn: { flex: 1, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { borderWidth: 1 },
  cancelBtnText: { fontSize: 13, fontWeight: '600' },
  createBtn: {},
  createBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  scroll: { padding: 16 },

  previewRow: { alignItems: 'center', marginBottom: 20 },
  previewCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  editBadge: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  colorRow: { maxHeight: 30 },
  colorDot: { width: 24, height: 24, borderRadius: 12, marginHorizontal: 4, justifyContent: 'center', alignItems: 'center' },
  colorDotActive: { borderWidth: 2, borderColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2 },

  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  inputMulti: { minHeight: 70, paddingTop: 10 },
  error: { fontSize: 11, color: '#EF4444', marginTop: 4 },

  amountRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 44 },
  currency: { fontSize: 16, fontWeight: '700', marginRight: 4 },
  amountInput: { flex: 1, fontSize: 20, fontWeight: '800' },

  selector: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 42 },
  selectorText: { flex: 1, fontSize: 13 },

  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityText: { fontSize: 12, fontWeight: '600' },

  pickerOverlay: { flex: 1, backgroundColor: '#00000055', justifyContent: 'flex-end' },
  pickerSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 16 },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  pickerTitle: { fontSize: 14, fontWeight: '700' },
  pickerCancel: { fontSize: 13 },
  pickerDone: { fontSize: 13, fontWeight: '700' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8 },
  iconItem: { width: 48, height: 48, borderRadius: 10, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
});

export default AddSavingsGoalModal;
