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
import { useTheme } from '../../../hooks/useTheme';
import {
  useCreateSavingsGoal,
  useUpdateSavingsGoal,
  useSavingsGoal,
} from '../../../hooks/api/useSavingsGoals';
import { Button, Input, Spinner } from '../../../components/common';
import { savingsGoalSchema } from '../../../utils/validation/schemas';

const ICONS = [
  'wallet',
  'home',
  'car',
  'airplane',
  'gift',
  'school',
  'medical',
  'restaurant',
  'basketball',
  'business',
  'desktop',
  'phone-portrait',
  'camera',
  'shirt',
  'watch',
  'diamond',
  'bicycle',
  'boat',
  'game-controller',
  'paw',
];

const COLORS = [
  '#2ECC71',
  '#3498DB',
  '#9B59B6',
  '#E74C3C',
  '#F39C12',
  '#1ABC9C',
  '#E67E22',
  '#34495E',
  '#16A085',
  '#27AE60',
  '#2980B9',
  '#8E44AD',
  '#C0392B',
  '#D35400',
];

const AddSavingsGoalModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, textStyles, spacing, borderRadius } = useTheme();

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
  const selectedPriority = watch('priority');
  const targetDate = watch('targetDate');

  useEffect(() => {
    if (isEditMode && goal) {
      setValue('title', goal.title);
      setValue('description', goal.description || '');
      setValue('targetAmount', goal.targetAmount);
      setValue(
        'targetDate',
        goal.targetDate ? new Date(goal.targetDate) : undefined,
      );
      setValue('icon', goal.icon);
      setValue('color', goal.color);
      setValue('priority', goal.priority);
    }
  }, [goal, isEditMode]);

  const onSubmit = async (data: any) => {
    const formattedData = {
      ...data,
      targetDate: data.targetDate ? data.targetDate.toISOString() : undefined,
      targetAmount: parseFloat(data.targetAmount),
    };

    if (isEditMode) {
      await updateMutation.mutateAsync({ id: goalId, data: formattedData });
    } else {
      await createMutation.mutateAsync(formattedData);
    }
    navigation.goBack();
  };

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  if (goalLoading && isEditMode) {
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
          {isEditMode ? 'Edit Savings Goal' : 'New Savings Goal'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Icon & Color Preview */}
        <View style={styles.previewSection}>
          <View
            style={[styles.preview, { backgroundColor: `${selectedColor}15` }]}
          >
            <Icon name={selectedIcon} size={48} color={selectedColor} />
          </View>
        </View>

        {/* Icon Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Icon</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowIconPicker(true)}
          >
            <Icon name={selectedIcon} size={24} color={selectedColor} />
            <Text style={styles.selectorText}>Select Icon</Text>
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Color Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  {
                    backgroundColor: color,
                    borderWidth: selectedColor === color ? 3 : 0,
                    borderColor: colors.text.inverse,
                  },
                ]}
                onPress={() => setValue('color', color)}
              >
                {selectedColor === color && (
                  <Icon
                    name="checkmark"
                    size={20}
                    color={colors.text.inverse}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Goal Title *"
                placeholder="e.g., Buy a Car, Emergency Fund"
                value={value}
                onChangeText={onChange}
                error={errors.title?.message}
                leftIcon="text-outline"
              />
            )}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Description (Optional)"
                placeholder="Add details about your goal"
                value={value}
                onChangeText={onChange}
                type="multiline"
                leftIcon="document-text-outline"
              />
            )}
          />
        </View>

        {/* Target Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Amount *</Text>
          <Controller
            control={control}
            name="targetAmount"
            render={({ field: { onChange, value } }) => (
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={value > 0 ? value.toString() : ''}
                  onChangeText={text => {
                    const numValue = parseFloat(text);
                    onChange(isNaN(numValue) ? 0 : numValue);
                  }}
                  style={styles.amountTextInput}
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
            )}
          />
          {errors.targetAmount && (
            <Text style={styles.errorText}>
              {errors.targetAmount.message as string}
            </Text>
          )}
        </View>

        {/* Target Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Date (Optional)</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon
              name="calendar-outline"
              size={20}
              color={colors.text.primary}
            />
            <Text style={styles.dateSelectorText}>
              {targetDate
                ? targetDate.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'No deadline'}
            </Text>
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
          {targetDate && (
            <TouchableOpacity
              onPress={() => setValue('targetDate', undefined)}
              style={styles.clearDate}
            >
              <Text style={styles.clearDateText}>Clear Date</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority</Text>
          <View style={styles.priorityOptions}>
            <Controller
              control={control}
              name="priority"
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    style={[
                      styles.priorityOption,
                      value === 'high' && styles.priorityOptionActive,
                    ]}
                    onPress={() => onChange('high')}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        value === 'high' && styles.priorityTextActive,
                      ]}
                    >
                      High
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.priorityOption,
                      value === 'medium' && styles.priorityOptionActive,
                    ]}
                    onPress={() => onChange('medium')}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        value === 'medium' && styles.priorityTextActive,
                      ]}
                    >
                      Medium
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.priorityOption,
                      value === 'low' && styles.priorityOptionActive,
                    ]}
                    onPress={() => onChange('low')}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        value === 'low' && styles.priorityTextActive,
                      ]}
                    >
                      Low
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            />
          </View>
        </View>
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
          {isEditMode ? 'Update' : 'Create Goal'}
        </Button>
      </View>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.pickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Target Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DatePicker
              date={targetDate || new Date()}
              onDateChange={date => setValue('targetDate', date)}
              mode="date"
              minimumDate={new Date()}
            />
          </View>
        </View>
      </Modal>

      {/* Icon Picker Modal */}
      <Modal visible={showIconPicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowIconPicker(false)}>
                <Icon name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Icon</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView contentContainerStyle={styles.iconGrid}>
              {ICONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    selectedIcon === icon && {
                      backgroundColor: `${selectedColor}15`,
                      borderColor: selectedColor,
                    },
                  ]}
                  onPress={() => {
                    setValue('icon', icon);
                    setShowIconPicker(false);
                  }}
                >
                  <Icon
                    name={icon}
                    size={32}
                    color={
                      selectedIcon === icon
                        ? selectedColor
                        : colors.text.secondary
                    }
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    },
    previewSection: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    preview: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    selector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      gap: spacing.md,
    },
    selectorText: {
      ...textStyles.body,
      color: colors.text.primary,
      flex: 1,
    },
    colorOption: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    amountInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
    },
    currencySymbol: {
      ...textStyles.h3,
      color: colors.text.secondary,
      marginRight: spacing.sm,
    },
    amountTextInput: {
      ...textStyles.h3,
      color: colors.text.primary,
      flex: 1,
      paddingVertical: spacing.md,
    },
    dateSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      gap: spacing.md,
    },
    dateSelectorText: {
      ...textStyles.body,
      color: colors.text.primary,
      flex: 1,
    },
    clearDate: {
      alignSelf: 'flex-end',
      marginTop: spacing.sm,
    },
    clearDateText: {
      ...textStyles.caption,
      color: colors.danger,
    },
    priorityOptions: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    priorityOption: {
      flex: 1,
      paddingVertical: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
    },
    priorityOptionActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    priorityText: {
      ...textStyles.body,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    priorityTextActive: {
      color: colors.text.inverse,
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
    pickerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    pickerContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg,
      maxHeight: '80%',
    },
    pickerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    pickerTitle: {
      ...textStyles.h4,
      color: colors.text.primary,
    },
    pickerCancel: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    pickerDone: {
      ...textStyles.bodyMedium,
      color: colors.primary,
    },
    iconGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: spacing.lg,
      gap: spacing.md,
    },
    iconOption: {
      width: 64,
      height: 64,
      borderRadius: borderRadius.md,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
  });

export default AddSavingsGoalModal;
