/**
 * Add/Edit Bazar Item Modal — Professional Minimal
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import {
  useAddItem,
  useUpdateItem,
  useBazarList,
} from '../../../hooks/api/useBazar';
import { Button, Input, SafeScreen, Spinner, useGuide } from '../../../components/common';
import { bazarItemSchema } from '../../../utils/validation/schemas';

const UNITS = ['kg', 'g', 'L', 'mL', 'pcs', 'dozen', 'pack', 'box', 'bag'];
const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Meat',
  'Fish',
  'Dairy',
  'Bakery',
  'Snacks',
  'Beverages',
  'Household',
  'Other',
];

const AddBazarItemModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { GuideButton, GuideView } = useGuide('addBazarItem');

  const { listId, itemId, mode } = (route.params as any) || { mode: 'create' };
  const isEditMode = mode === 'edit';

  const { data: listData, isLoading: listLoading } = useBazarList(listId);
  const addMutation = useAddItem();
  const updateMutation = useUpdateItem();

  const list = (listData as any)?.data?.data ?? (listData as any)?.data ?? null;
  const item = list?.items?.find((i: any) => i._id === itemId);

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const borderC = isDark ? '#334155' : '#E2E8F0';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bazarItemSchema),
    defaultValues: {
      name: '',
      quantity: 1,
      unit: 'kg',
      actualPrice: undefined,
      category: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (isEditMode && item) {
      setValue('name', item.name);
      setValue('quantity', item.quantity);
      setValue('unit', item.unit);
      setValue('actualPrice', item.actualPrice);
      setValue('category', item.category || '');
      setValue('notes', item.notes || '');
    }
  }, [item, isEditMode]);

  const onSubmit = async (data: any) => {
    const formatted = {
      ...data,
      quantity: parseFloat(data.quantity),
      actualPrice: data.actualPrice
        ? parseFloat(data.actualPrice)
        : undefined,
      category: data.category || undefined,
    };
    if (isEditMode) {
      await updateMutation.mutateAsync({ listId, itemId, data: formatted });
    } else {
      await addMutation.mutateAsync({ listId, data: formatted });
    }
    navigation.goBack();
  };

  if (listLoading && isEditMode) {
    return (
      <SafeScreen>
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <Spinner text="Loading..." />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderC }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="close" size={22} color={textPri} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textPri }]}>
            {isEditMode ? 'Edit Item' : 'Add Item'}
          </Text>
          <GuideButton color={textPri} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Item Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Item Name *"
                placeholder="e.g., Tomatoes, Milk"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                leftIcon="cube-outline"
              />
            )}
          />

          {/* Quantity + Unit */}
          <View style={styles.qtySection}>
            <Text style={[styles.label, { color: textSec }]}>
              Quantity & Unit *
            </Text>
            <View style={styles.qtyRow}>
              <Controller
                control={control}
                name="quantity"
                render={({ field: { onChange, value } }) => (
                  <View
                    style={[
                      styles.qtyInput,
                      { borderColor: borderC, backgroundColor: surfaceC },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => {
                        const v = Math.max(
                          parseFloat(value?.toString() || '1') - 1,
                          0.5,
                        );
                        onChange(v);
                      }}
                    >
                      <Icon name="remove" size={16} color={textSec} />
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.qtyVal, { color: textPri }]}
                      value={String(value)}
                      onChangeText={t => {
                        const n = parseFloat(t);
                        if (!isNaN(n) && n > 0) onChange(n);
                        else if (t === '' || t === '0') onChange(t as any);
                      }}
                      onBlur={() => {
                        const n = parseFloat(String(value));
                        if (isNaN(n) || n <= 0) onChange(1);
                      }}
                      keyboardType="numeric"
                      selectTextOnFocus
                      textAlign="center"
                    />
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => {
                        const v = parseFloat(value?.toString() || '1') + 1;
                        onChange(v);
                      }}
                    >
                      <Icon name="add" size={16} color={textPri} />
                    </TouchableOpacity>
                  </View>
                )}
              />
              <Controller
                control={control}
                name="unit"
                render={({ field: { onChange, value } }) => (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.unitRow}
                    style={{ flex: 1 }}
                  >
                    {UNITS.map(u => (
                      <TouchableOpacity
                        key={u}
                        style={[
                          styles.chip,
                          { borderColor: borderC, backgroundColor: surfaceC },
                          value === u && {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                          },
                        ]}
                        onPress={() => onChange(u)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { color: textSec },
                            value === u && { color: '#FFF', fontWeight: '700' },
                          ]}
                        >
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              />
            </View>
            {errors.quantity && (
              <Text style={styles.errorText}>{errors.quantity.message}</Text>
            )}
          </View>

          {/* Price */}
          <Controller
            control={control}
            name="actualPrice"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Price"
                placeholder="0"
                type="number"
                value={value?.toString()}
                onChangeText={text =>
                  onChange(text ? parseFloat(text) : undefined)
                }
                leftIcon="cash-outline"
              />
            )}
          />

          {/* Category */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: textSec }]}>Category</Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <View style={styles.chipWrap}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catChip,
                        { borderColor: borderC, backgroundColor: surfaceC },
                        value === cat && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                      ]}
                      onPress={() => onChange(value === cat ? '' : cat)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: textSec },
                          value === cat && { color: '#FFF', fontWeight: '700' },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          {/* Notes */}
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Notes"
                placeholder="Brand, details..."
                value={value}
                onChangeText={onChange}
                type="multiline"
                leftIcon="document-text-outline"
              />
            )}
          />

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: borderC }]}>
          <Button
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{ flex: 1, marginRight: 6 }}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSubmit(onSubmit)}
            loading={addMutation.isPending || updateMutation.isPending}
            style={{ flex: 1, marginLeft: 6 }}
          >
            {isEditMode ? 'Update' : 'Add'}
          </Button>
        </View>
        <GuideView />
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  qtySection: { marginBottom: 16 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    height: 38,
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 34,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyVal: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 4 },
  section: { marginBottom: 16 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  unitRow: { gap: 6 },
  chip: {
    paddingHorizontal: 10,
    height: 34,
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});

export default AddBazarItemModal;
