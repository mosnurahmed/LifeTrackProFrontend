/**
 * Add/Edit Category Modal - Fixed (No Type Field)
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

  const { mode, categoryId } = (route.params as any) || { mode: 'create' };
  const isEditMode = mode === 'edit';

  const { data: category, isLoading: categoryLoading } =
    useCategory(categoryId);
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
      monthlyBudget: undefined,
    },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  useEffect(() => {
    if (isEditMode && category) {
      setValue('name', category.name);
      setValue('icon', category.icon);
      setValue('color', category.color);
      setValue('monthlyBudget', category.monthlyBudget);
    }
  }, [category, isEditMode]);

  const onSubmit = async (data: any) => {
    const formattedData = {
      ...data,
      monthlyBudget: data.monthlyBudget
        ? parseFloat(data.monthlyBudget)
        : undefined,
    };

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
        {/* Name */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Category Name *"
              placeholder="e.g., Food, Transport, Shopping"
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
          </View>
        </Card>

        {/* Monthly Budget (Optional) */}
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
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });

export default AddCategoryModal;
