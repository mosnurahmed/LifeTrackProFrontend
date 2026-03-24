/**
 * Add/Edit Category Modal
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import {
  useCreateCategory,
  useUpdateCategory,
  useCategory,
} from '../../../hooks/api/useCategories';
import { Button, Input, Card, Spinner } from '../../../components/common';
import { categorySchema } from '../../../utils/validation/schemas';

const CATEGORY_ICONS = [
  // Food & Drink
  'restaurant', 'fast-food', 'pizza', 'cafe', 'wine', 'beer', 'ice-cream', 'nutrition',
  // Transport
  'car', 'bus', 'train', 'airplane', 'bicycle', 'boat', 'walk',
  // Shopping
  'cart', 'bag-handle', 'shirt', 'gift', 'diamond', 'storefront',
  // Home & Utilities
  'home', 'bed', 'bulb', 'flame', 'water', 'hammer', 'construct', 'leaf',
  // Health & Fitness
  'medical', 'fitness', 'heart', 'bandage', 'barbell', 'body',
  // Entertainment
  'film', 'game-controller', 'musical-notes', 'headset', 'tv', 'camera',
  // Finance & Work
  'cash', 'card', 'wallet', 'trending-up', 'stats-chart', 'briefcase', 'business', 'bank',
  // Education & Personal
  'school', 'book', 'pencil', 'calculator', 'people', 'person', 'paw',
  // Tech
  'laptop', 'phone-portrait', 'wifi', 'cloud',
];

const CATEGORY_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#F43F5E', '#A855F7', '#D946EF', '#0EA5E9',
];

const AddCategoryModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const { mode, categoryId, defaultType } = (route.params as any) || {
    mode: 'create',
    defaultType: 'expense',
  };
  const isEditMode = mode === 'edit';

  const { data: categoryData, isLoading: categoryLoading } = useCategory(categoryId);
  const category = categoryData?.data;

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: 'cash',
      color: '#10B981',
      type: defaultType || 'expense',
    },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');
  const selectedType = watch('type');

  useEffect(() => {
    if (isEditMode && category) {
      setValue('name', category.name);
      setValue('icon', category.icon);
      setValue('color', category.color);
      setValue('type', category.type);
    }
  }, [category, isEditMode]);

  const onSubmit = async (data: any) => {
    if (isEditMode) {
      await updateMutation.mutateAsync({ id: categoryId, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    navigation.goBack();
  };

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  if (categoryLoading) {
    return (
      <View style={styles.container}>
        <Spinner text="Loading..." />
      </View>
    );
  }

  const typeColor =
    selectedType === 'income' ? colors.success :
    selectedType === 'both' ? colors.info :
    colors.danger;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Icon name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditMode ? 'Edit Category' : 'New Category'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type</Text>
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <View style={styles.typeRow}>
                {[
                  { key: 'expense', label: 'Expense', icon: 'trending-down', color: colors.danger },
                  { key: 'income', label: 'Income', icon: 'trending-up', color: colors.success },
                  { key: 'both', label: 'Both', icon: 'swap-horizontal', color: colors.info },
                ].map(item => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.typeBtn,
                      value === item.key && { backgroundColor: `${item.color}18`, borderColor: item.color, borderWidth: 2 },
                    ]}
                    onPress={() => onChange(item.key)}
                    activeOpacity={0.7}
                  >
                    <Icon name={item.icon} size={20} color={value === item.key ? item.color : colors.text.secondary} />
                    <Text style={[styles.typeBtnText, value === item.key && { color: item.color, fontWeight: '700' }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Category Name"
                placeholder="e.g., Food, Salary, Transport"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                leftIcon="text-outline"
              />
            )}
          />
        </View>

        {/* Icon Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Icon</Text>
          <Controller
            control={control}
            name="icon"
            render={({ field: { onChange, value } }) => (
              <View style={styles.iconGrid}>
                {CATEGORY_ICONS.map((iconName, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.iconBtn,
                      value === iconName && { backgroundColor: selectedColor, borderColor: selectedColor },
                    ]}
                    onPress={() => onChange(iconName)}
                  >
                    <Icon
                      name={iconName}
                      size={24}
                      color={value === iconName ? '#FFFFFF' : colors.text.secondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color</Text>
          <Controller
            control={control}
            name="color"
            render={({ field: { onChange, value } }) => (
              <View style={styles.colorGrid}>
                {CATEGORY_COLORS.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorBtn,
                      { backgroundColor: color },
                      value === color && styles.colorBtnSelected,
                    ]}
                    onPress={() => onChange(color)}
                  >
                    {value === color && (
                      <Icon name="checkmark" size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* Preview */}
        <View style={styles.previewCard}>
          <View style={[styles.previewIconWrap, { backgroundColor: `${selectedColor}20` }]}>
            <Icon name={selectedIcon} size={36} color={selectedColor} />
          </View>
          <View style={styles.previewInfo}>
            <Text style={styles.previewName} numberOfLines={1}>
              {watch('name') || 'Category Name'}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: `${typeColor}18` }]}>
              <Icon name={
                selectedType === 'income' ? 'trending-up' :
                selectedType === 'both' ? 'swap-horizontal' : 'trending-down'
              } size={12} color={typeColor} />
              <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          variant="outline"
          onPress={() => navigation.goBack()}
          style={{ flex: 1, marginRight: spacing.sm }}
        >
          Cancel
        </Button>
        <Button
          onPress={handleSubmit(onSubmit)}
          loading={createMutation.isPending || updateMutation.isPending}
          style={{ flex: 1, marginLeft: spacing.sm }}
        >
          {isEditMode ? 'Update' : 'Create'}
        </Button>
      </View>
    </View>
  );
};

const createStyles = (colors: any, textStyles: any, spacing: any, borderRadius: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeBtn: { width: 40, height: 40, justifyContent: 'center' },
    title: { ...textStyles.h3, color: colors.text.primary },
    content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
    section: { marginBottom: spacing.xl },
    sectionTitle: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      fontWeight: '600',
      marginBottom: spacing.md,
    },
    typeRow: { flexDirection: 'row', gap: spacing.sm },
    typeBtn: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      gap: 4,
    },
    typeBtnText: {
      fontSize: 12,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    iconBtn: {
      width: 52,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    colorBtn: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    colorBtnSelected: { borderColor: colors.text.primary },
    previewCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewIconWrap: {
      width: 64,
      height: 64,
      borderRadius: borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewInfo: { flex: 1 },
    previewName: { ...textStyles.h4, color: colors.text.primary, marginBottom: spacing.xs },
    typeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
      alignSelf: 'flex-start',
    },
    typeBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });

export default AddCategoryModal;
