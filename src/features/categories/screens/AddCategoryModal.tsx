/**
 * Add/Edit Category Modal - With Type Selection
 */

import React, { useEffect, useState } from 'react';
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

// Ionicons Names - Popular categories
const CATEGORY_ICONS = [
  'restaurant',
  'fast-food',
  'pizza',
  'cafe',
  'beer',
  'cart',
  'car',
  'bus',
  'medical',
  'fitness',
  'home',
  'bulb',
  'phone-portrait',
  'laptop',
  'shirt',
  'footsteps',
  'film',
  'game-controller',
  'book',
  'airplane',
  'barbell',
  'briefcase',
  'document-text',
  'school',
  'paw',
  'gift',
  'cash',
  'stats-chart',
  'hammer',
  'color-palette',
  'wallet',
  'trending-up',
  'business',
];

const CATEGORY_COLORS = [
  '#10B981',
  '#3B82F6',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#6366F1',
  '#84CC16',
  '#06B6D4',
  '#F43F5E',
  '#8B5CF6',
  '#A855F7',
  '#D946EF',
];

const AddCategoryModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const { mode, categoryId, defaultType } = (route.params as any) || {
    mode: 'create',
    defaultType: 'expense', // ✅ Default to expense
  };
  const isEditMode = mode === 'edit';

  const { data: categoryData, isLoading: categoryLoading } =
    useCategory(categoryId);
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
      type: defaultType || 'expense', // ✅ Use defaultType from route params
      monthlyBudget: undefined,
      monthlyIncome: undefined, // ✅ NEW
    },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');
  const selectedType = watch('type'); // ✅ Watch type

  useEffect(() => {
    if (isEditMode && category) {
      setValue('name', category.name);
      setValue('icon', category.icon);
      setValue('color', category.color);
      setValue('type', category.type); // ✅ Set type
      setValue('monthlyBudget', category.monthlyBudget);
      setValue('monthlyIncome', category.monthlyIncome); // ✅ Set monthlyIncome
    }
  }, [category, isEditMode]);

  const onSubmit = async (data: any) => {
    const formattedData = {
      ...data,
      monthlyBudget: data.monthlyBudget
        ? parseFloat(data.monthlyBudget)
        : undefined,
      monthlyIncome: data.monthlyIncome
        ? parseFloat(data.monthlyIncome)
        : undefined, // ✅ Format income
    };

    // ✅ Remove fields based on type
    if (formattedData.type === 'expense') {
      delete formattedData.monthlyIncome;
    }
    if (formattedData.type === 'income') {
      delete formattedData.monthlyBudget;
    }

    if (isEditMode) {
      await updateMutation.mutateAsync({ id: categoryId, data: formattedData });
    } else {
      await createMutation.mutateAsync(formattedData);
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditMode ? 'Edit Category' : 'Add Category'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* ✅ Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Type *</Text>
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    value === 'expense' && styles.typeButtonActive,
                    { borderColor: colors.danger },
                  ]}
                  onPress={() => onChange('expense')}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="trending-down"
                    size={24}
                    color={
                      value === 'expense'
                        ? colors.danger
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      value === 'expense' && {
                        color: colors.danger,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    Expense
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    value === 'income' && styles.typeButtonActive,
                    { borderColor: colors.success },
                  ]}
                  onPress={() => onChange('income')}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="trending-up"
                    size={24}
                    color={
                      value === 'income'
                        ? colors.success
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      value === 'income' && {
                        color: colors.success,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    value === 'both' && styles.typeButtonActive,
                    { borderColor: colors.info },
                  ]}
                  onPress={() => onChange('both')}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="swap-horizontal"
                    size={24}
                    color={
                      value === 'both' ? colors.info : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      value === 'both' && {
                        color: colors.info,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    Both
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.type && (
            <Text style={styles.errorText}>
              {errors.type.message as string}
            </Text>
          )}
        </View>

        {/* Name */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Category Name *"
              placeholder="e.g., Food, Salary, Transport"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
              leftIcon="text-outline"
            />
          )}
        />

        {/* Icon Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Icon *</Text>
          <Controller
            control={control}
            name="icon"
            render={({ field: { onChange, value } }) => (
              <View style={styles.iconGrid}>
                {CATEGORY_ICONS.map((iconName, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.iconButton,
                      value === iconName && {
                        backgroundColor: selectedColor,
                        borderColor: selectedColor,
                      },
                    ]}
                    onPress={() => onChange(iconName)}
                  >
                    <Icon
                      name={iconName}
                      size={28}
                      color={
                        value === iconName
                          ? colors.text.inverse
                          : colors.text.primary
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color *</Text>
          <Controller
            control={control}
            name="color"
            render={({ field: { onChange, value } }) => (
              <View style={styles.colorGrid}>
                {CATEGORY_COLORS.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      value === color && styles.colorButtonSelected,
                    ]}
                    onPress={() => onChange(color)}
                  >
                    {value === color && (
                      <Icon name="checkmark" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* Preview */}
        <Card style={styles.preview}>
          <View style={styles.previewContent}>
            <View
              style={[
                styles.previewIcon,
                { backgroundColor: `${selectedColor}15` },
              ]}
            >
              <Icon name={selectedIcon} size={40} color={selectedColor} />
            </View>
            <Text style={styles.previewText}>Preview</Text>
            <View
              style={[
                styles.previewTypeBadge,
                {
                  backgroundColor:
                    selectedType === 'income'
                      ? `${colors.success}15`
                      : selectedType === 'both'
                      ? `${colors.info}15`
                      : `${colors.danger}15`,
                },
              ]}
            >
              <Text
                style={[
                  styles.previewTypeBadgeText,
                  {
                    color:
                      selectedType === 'income'
                        ? colors.success
                        : selectedType === 'both'
                        ? colors.info
                        : colors.danger,
                  },
                ]}
              >
                {selectedType}
              </Text>
            </View>
          </View>
        </Card>

        {/* ✅ Conditional Fields Based on Type */}
        {(selectedType === 'expense' || selectedType === 'both') && (
          <Controller
            control={control}
            name="monthlyBudget"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Monthly Budget (Optional)"
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
        )}

        {/* ✅ NEW: Monthly Income Target */}
        {(selectedType === 'income' || selectedType === 'both') && (
          <Controller
            control={control}
            name="monthlyIncome"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Monthly Income Target (Optional)"
                placeholder="0"
                type="number"
                value={value?.toString()}
                onChangeText={text =>
                  onChange(text ? parseFloat(text) : undefined)
                }
                leftIcon="trending-up-outline"
              />
            )}
          />
        )}
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

const createStyles = (
  colors: any,
  textStyles: any,
  spacing: any,
  borderRadius: any,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      ...textStyles.h3,
      color: colors.text.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    // ✅ Type Selection Styles
    typeButtons: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    typeButton: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      gap: spacing.xs,
    },
    typeButtonActive: {
      borderWidth: 2,
    },
    typeButtonText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    iconGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    iconButton: {
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    colorButton: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    colorButtonSelected: {
      borderColor: colors.text.primary,
    },
    preview: {
      marginBottom: spacing.xl,
    },
    previewContent: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    previewIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    previewText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    },
    previewTypeBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    previewTypeBadgeText: {
      ...textStyles.caption,
      fontWeight: '700',
      textTransform: 'uppercase',
      fontSize: 10,
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    errorText: {
      ...textStyles.caption,
      color: colors.danger,
      marginTop: spacing.xs,
    },
  });

export default AddCategoryModal;
