/**
 * Add/Edit Category Modal
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useCreateCategory, useUpdateCategory, useCategory, useCategories } from '../../../hooks/api/useCategories';
import { Spinner } from '../../../components/common';
import { categorySchema } from '../../../utils/validation/schemas';

const CATEGORY_ICONS = [
  // Food & Drink
  'restaurant', 'fast-food', 'pizza', 'cafe', 'wine', 'beer', 'ice-cream', 'nutrition',
  // Transport
  'car', 'bus', 'train', 'airplane', 'bicycle', 'boat', 'walk', 'speedometer',
  // Shopping
  'cart', 'bag-handle', 'shirt', 'gift', 'diamond', 'storefront', 'pricetag',
  // Home & Utilities
  'home', 'bed', 'bulb', 'flame', 'water', 'hammer', 'construct', 'leaf', 'key',
  // Health & Fitness
  'medical', 'fitness', 'heart', 'bandage', 'barbell', 'body', 'medkit',
  // Entertainment
  'film', 'game-controller', 'musical-notes', 'headset', 'tv', 'camera', 'football',
  // Finance & Work
  'cash', 'card', 'wallet', 'trending-up', 'stats-chart', 'briefcase', 'business',
  // Education & Personal
  'school', 'book', 'pencil', 'calculator', 'people', 'person', 'paw',
  // Family & Responsibility
  'woman', 'man', 'hand-left', 'accessibility', 'ribbon',
  // Tech & Bills
  'laptop', 'phone-portrait', 'wifi', 'cloud', 'receipt', 'document-text',
  // Misc real-life
  'cut', 'color-palette', 'brush', 'umbrella', 'globe', 'map', 'location',
  'rocket', 'shield', 'star', 'trophy', 'sparkles',
];

const CATEGORY_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#F43F5E', '#A855F7', '#D946EF', '#0EA5E9',
];

const AddCategoryModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#E2E8F0';

  const { mode, categoryId, defaultType } = (route.params as any) || { mode: 'create', defaultType: 'expense' };
  const isEdit = mode === 'edit';

  const [showIconSheet, setShowIconSheet] = useState(false);
  const [showColorSheet, setShowColorSheet] = useState(false);

  const { data: categoryData, isLoading: categoryLoading } = useCategory(categoryId);
  const category = categoryData?.data;
  const { data: allCategoriesData } = useCategories();
  const allCategories: any[] = allCategoriesData?.data || [];
  const usedIcons = new Set(
    allCategories
      .filter((c: any) => !isEdit || c._id !== categoryId)
      .map((c: any) => c.icon)
  );
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: { name: '', icon: 'cash', color: '#10B981', type: defaultType || 'expense' },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (isEdit && category) {
      setValue('name', category.name);
      setValue('icon', category.icon);
      setValue('color', category.color);
      setValue('type', category.type);
    }
  }, [category, isEdit]);

  const onSubmit = async (data: any) => {
    if (isEdit) await updateMutation.mutateAsync({ id: categoryId, data });
    else await createMutation.mutateAsync(data);
    navigation.goBack();
  };

  if (categoryLoading && isEdit) return <View style={[s.container, { backgroundColor: colors.background }]}><Spinner text="Loading..." /></View>;

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8, backgroundColor: surfaceC, borderBottomColor: borderC }]}>
        <TouchableOpacity style={s.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="close" size={22} color={textPri} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: textPri }]}>{isEdit ? 'Edit Category' : 'New Category'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 80 }]}>
        {/* Preview */}
        <View style={s.previewRow}>
          <TouchableOpacity style={[s.previewCircle, { backgroundColor: `${selectedColor}12` }]} onPress={() => setShowIconSheet(true)}>
            <Icon name={selectedIcon} size={28} color={selectedColor} />
            <View style={[s.editBadge, { backgroundColor: surfaceC, borderColor: borderC }]}>
              <Icon name="pencil" size={9} color={textSec} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowColorSheet(true)}>
            <View style={[s.colorPreviewDot, { backgroundColor: selectedColor }]}>
              <Icon name="color-palette-outline" size={12} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Type */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Type</Text>
          <Controller control={control} name="type" render={({ field: { onChange, value } }) => (
            <View style={s.chipRow}>
              {[
                { key: 'expense', label: 'Expense', icon: 'trending-down', color: '#EF4444' },
                { key: 'income', label: 'Income', icon: 'trending-up', color: '#22C55E' },
                { key: 'both', label: 'Both', icon: 'swap-horizontal', color: '#3B82F6' },
              ].map(t => {
                const active = value === t.key;
                return (
                  <TouchableOpacity key={t.key} style={[s.chip, { borderColor: active ? t.color : borderC, backgroundColor: active ? `${t.color}10` : surfaceC }]} onPress={() => onChange(t.key)}>
                    <Icon name={t.icon} size={14} color={active ? t.color : textSec} />
                    <Text style={[s.chipText, { color: active ? t.color : textSec }]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )} />
        </View>

        {/* Name */}
        <View style={s.field}>
          <Text style={[s.label, { color: textSec }]}>Name *</Text>
          <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
            <TextInput
              style={[s.input, { backgroundColor: surfaceC, borderColor: errors.name ? '#EF4444' : borderC, color: textPri }]}
              placeholder="e.g., Food, Salary, Transport"
              placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
              value={value}
              onChangeText={onChange}
            />
          )} />
          {errors.name && <Text style={s.error}>{errors.name.message as string}</Text>}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[s.footer, { borderTopColor: borderC, paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={[s.footerBtn, s.cancelBtn, { borderColor: borderC }]} onPress={() => navigation.goBack()}>
          <Text style={[s.cancelBtnText, { color: textSec }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.footerBtn, { backgroundColor: selectedColor, opacity: isPending ? 0.6 : 1 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          <Text style={s.saveBtnText}>{isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}</Text>
        </TouchableOpacity>
      </View>

      {/* Icon Picker Bottom Sheet */}
      <Modal visible={showIconSheet} transparent animationType="slide" onRequestClose={() => setShowIconSheet(false)}>
        <TouchableOpacity style={s.sheetOverlay} activeOpacity={1} onPress={() => setShowIconSheet(false)}>
          <View style={[s.sheetContent, { backgroundColor: surfaceC, maxHeight: '70%' }]} onStartShouldSetResponder={() => true}>
            <View style={[s.sheetHandle, { backgroundColor: isDark ? '#475569' : '#CBD5E1' }]} />
            <Text style={[s.sheetTitle, { color: textPri }]}>Select Icon</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Controller control={control} name="icon" render={({ field: { onChange, value } }) => (
                <View style={s.iconGrid}>
                  {CATEGORY_ICONS.map(icon => {
                    const active = value === icon;
                    const used = usedIcons.has(icon) && !active;
                    return (
                      <TouchableOpacity
                        key={icon}
                        style={[s.iconItem, {
                          borderColor: active ? selectedColor : borderC,
                          backgroundColor: active ? `${selectedColor}12` : used ? (isDark ? '#1E293B' : '#F8FAFC') : surfaceC,
                          opacity: used ? 0.35 : 1,
                        }]}
                        onPress={() => { if (!used) { onChange(icon); setShowIconSheet(false); } }}
                        activeOpacity={used ? 1 : 0.7}
                      >
                        <Icon name={icon} size={20} color={active ? selectedColor : used ? (isDark ? '#475569' : '#CBD5E1') : textSec} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )} />
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Color Picker Bottom Sheet */}
      <Modal visible={showColorSheet} transparent animationType="slide" onRequestClose={() => setShowColorSheet(false)}>
        <TouchableOpacity style={s.sheetOverlay} activeOpacity={1} onPress={() => setShowColorSheet(false)}>
          <View style={[s.sheetContent, { backgroundColor: surfaceC }]} onStartShouldSetResponder={() => true}>
            <View style={[s.sheetHandle, { backgroundColor: isDark ? '#475569' : '#CBD5E1' }]} />
            <Text style={[s.sheetTitle, { color: textPri }]}>Select Color</Text>
            <Controller control={control} name="color" render={({ field: { onChange, value } }) => (
              <View style={s.colorGrid}>
                {CATEGORY_COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[s.colorItem, { backgroundColor: c, borderColor: value === c ? textPri : 'transparent', borderWidth: value === c ? 2.5 : 0 }]}
                    onPress={() => { onChange(c); setShowColorSheet(false); }}
                  >
                    {value === c && <Icon name="checkmark" size={16} color="#FFF" />}
                  </TouchableOpacity>
                ))}
              </View>
            )} />
          </View>
        </TouchableOpacity>
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

  previewRow: { alignItems: 'center', marginBottom: 20, gap: 10 },
  previewCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  colorPreviewDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  error: { fontSize: 11, color: '#EF4444', marginTop: 4 },

  chipRow: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },

  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  footerBtn: { flex: 1, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { borderWidth: 1 },
  cancelBtnText: { fontSize: 13, fontWeight: '600' },
  saveBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  sheetOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000040' },
  sheetContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 14, fontWeight: '700', marginBottom: 14 },

  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 16 },
  iconItem: { width: 44, height: 44, borderRadius: 10, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },

  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorItem: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});

export default AddCategoryModal;
