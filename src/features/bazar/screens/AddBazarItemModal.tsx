/**
 * Add/Edit Bazar Item Modal
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
  useAddItem,
  useUpdateItem,
  useBazarList,
} from '../../../hooks/api/useBazar';
import { Button, Input, Spinner } from '../../../components/common';
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
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const { listId, itemId, mode } = (route.params as any) || { mode: 'create' };
  const isEditMode = mode === 'edit';

  const { data: listData, isLoading: listLoading } = useBazarList(listId);
  const addMutation = useAddItem();
  const updateMutation = useUpdateItem();

  const item = listData?.data?.items?.find((i: any) => i._id === itemId);

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
      unit: 'pcs',
      estimatedPrice: undefined,
      category: '',
      notes: '',
    },
  });

  const selectedUnit = watch('unit');
  const selectedCategory = watch('category');

  useEffect(() => {
    if (isEditMode && item) {
      setValue('name', item.name);
      setValue('quantity', item.quantity);
      setValue('unit', item.unit);
      setValue('estimatedPrice', item.estimatedPrice);
      setValue('category', item.category || '');
      setValue('notes', item.notes || '');
    }
  }, [item, isEditMode]);

  const onSubmit = async (data: any) => {
    const formattedData = {
      ...data,
      quantity: parseFloat(data.quantity),
      estimatedPrice: data.estimatedPrice
        ? parseFloat(data.estimatedPrice)
        : undefined,
    };

    if (isEditMode) {
      await updateMutation.mutateAsync({
        listId,
        itemId,
        data: formattedData,
      });
    } else {
      await addMutation.mutateAsync({ listId, data: formattedData });
    }
    navigation.goBack();
  };

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  if (listLoading && isEditMode) {
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
          {isEditMode ? 'Edit Item' : 'Add Item'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Item Name */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Item Name *"
              placeholder="e.g., Tomatoes, Milk, Rice"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
              leftIcon="cube-outline"
            />
          )}
        />

        {/* Quantity and Unit */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Controller
              control={control}
              name="quantity"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Quantity *"
                  placeholder="1"
                  type="number"
                  value={value?.toString()}
                  onChangeText={onChange}
                  error={errors.quantity?.message}
                />
              )}
            />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.label}>Unit *</Text>
            <Controller
              control={control}
              name="unit"
              render={({ field: { onChange, value } }) => (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.unitScroll}
                >
                  {UNITS.map(unit => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitChip,
                        value === unit && styles.unitChipSelected,
                      ]}
                      onPress={() => onChange(unit)}
                    >
                      <Text
                        style={[
                          styles.unitChipText,
                          value === unit && styles.unitChipTextSelected,
                        ]}
                      >
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            />
          </View>
        </View>

        {/* Estimated Price */}
        <Controller
          control={control}
          name="estimatedPrice"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Estimated Price (Optional)"
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
          <Text style={styles.label}>Category (Optional)</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      value === cat && styles.categoryChipSelected,
                    ]}
                    onPress={() => onChange(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        value === cat && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          />
        </View>

        {/* Notes */}
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Notes (Optional)"
              placeholder="Any specific brand or details"
              value={value}
              onChangeText={onChange}
              type="multiline"
              leftIcon="document-text-outline"
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
          loading={addMutation.isPending || updateMutation.isPending}
          style={{ flex: 1, marginLeft: spacing.sm }}
        >
          {isEditMode ? 'Update' : 'Add'}
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
    row: {
      flexDirection: 'row',
    },
    label: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    section: {
      marginBottom: spacing.xl,
    },
    unitScroll: {
      marginTop: spacing.sm,
    },
    unitChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginRight: spacing.sm,
    },
    unitChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    unitChipText: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    unitChipTextSelected: {
      color: colors.text.inverse,
      fontWeight: '600',
    },
    categoryChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginRight: spacing.sm,
    },
    categoryChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryChipText: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    categoryChipTextSelected: {
      color: colors.text.inverse,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });

export default AddBazarItemModal;
