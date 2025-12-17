/**
 * Add/Edit Expense Modal - Enhanced with Budget Display
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
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import { useTheme } from '../../../hooks/useTheme';
import {
  useCreateExpense,
  useUpdateExpense,
  useExpense,
} from '../../../hooks/api/useExpenses';
import { useCategories } from '../../../hooks/api/useCategories';
import { Button, Input, Card, Spinner } from '../../../components/common';
import { expenseSchema } from '../../../utils/validation/schemas';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import RecurringExpenseModal from '../components/RecurringExpenseModal';
import { launchImageLibrary } from 'react-native-image-picker';

const AddExpenseModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const { mode, expenseId } = (route.params as any) || { mode: 'create' };
  const isEditMode = mode === 'edit';

  // State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [recurringData, setRecurringData] = useState<any>(null);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);

  // Queries
  const { data: categoryRes, isLoading: categoriesLoading } = useCategories();
  const { data: expenseData, isLoading: expenseLoading } =
    useExpense(expenseId);
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  const categories = categoryRes?.data || [];
  const expense = expenseData?.data;

  // Form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(expenseSchema),
    defaultValues: {
      categoryId: '',
      amount: 0,
      description: '',
      date: new Date(),
      paymentMethod: 'cash' as 'cash' | 'card' | 'mobile_banking',
      location: {
        latitude: undefined,
        longitude: undefined,
        address: '',
      },
      tags: [],
      isRecurring: false,
      recurringConfig: undefined,
      receiptImage: undefined,
    },
  });

  const selectedCategoryId = watch('categoryId');
  const selectedDate = watch('date');
  const selectedCategory = categories?.find(
    (c: any) => c._id === selectedCategoryId,
  );

  // Load expense data in edit mode
  useEffect(() => {
    if (isEditMode && expense) {
      setValue('categoryId', expense.categoryId?._id || expense.categoryId);
      setValue('amount', expense.amount);
      setValue('description', expense.description || '');
      setValue('date', new Date(expense.date));
      setValue('paymentMethod', expense.paymentMethod || 'cash');
      setValue('location', expense.location || '');
      setValue('tags', expense.tags || []);
    }
  }, [expense, isEditMode]);

  const onSubmit = async (data: any) => {
    const formattedData = {
      ...data,
      date: data.date.toISOString(),
      tags: data.tags?.filter((t: string) => t.trim()) || [],
      location: data.location?.address
        ? {
            latitude: data.location.latitude || undefined,
            longitude: data.location.longitude || undefined,
            address: data.location.address,
          }
        : undefined,
      isRecurring: recurringData?.isRecurring || false,
      recurringConfig: recurringData?.isRecurring
        ? {
            interval: recurringData.recurringFrequency,
            endDate: recurringData.recurringEndDate || undefined,
          }
        : undefined,
      receiptImage:
        selectedImages.length > 0 ? selectedImages[0].uri : undefined,
    };

    Object.keys(formattedData).forEach(key => {
      if (formattedData[key] === undefined) {
        delete formattedData[key];
      }
    });

    if (isEditMode) {
      await updateMutation.mutateAsync({ id: expenseId, data: formattedData });
    } else {
      await createMutation.mutateAsync(formattedData);
    }
    navigation.goBack();
  };

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  if (categoriesLoading || (isEditMode && expenseLoading)) {
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
          {isEditMode ? 'Edit Expense' : 'Add Expense'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Controller
            control={control}
            name="amount"
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
          {errors.amount && (
            <Text style={styles.errorText}>
              {errors.amount.message as string}
            </Text>
          )}
        </View>

        {/* Category Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category *</Text>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryPicker(true)}
          >
            {selectedCategory ? (
              <>
                <View
                  style={[
                    styles.categoryIconSmall,
                    { backgroundColor: `${selectedCategory.color}15` },
                  ]}
                >
                  <Icon
                    name={selectedCategory.icon}
                    size={20}
                    color={selectedCategory.color}
                  />
                </View>
                <Text style={styles.categorySelectorText}>
                  {selectedCategory.name}
                </Text>
              </>
            ) : (
              <>
                <Icon
                  name="apps-outline"
                  size={24}
                  color={colors.text.secondary}
                />
                <Text
                  style={[
                    styles.categorySelectorText,
                    { color: colors.text.secondary },
                  ]}
                >
                  Select Category
                </Text>
              </>
            )}
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
          {errors.categoryId && (
            <Text style={styles.errorText}>
              {errors.categoryId.message as string}
            </Text>
          )}

          {/* ✅ Budget Display Below Category */}
          {selectedCategory?.monthlyBudget && (
            <View style={styles.budgetInfo}>
              <View style={styles.budgetRow}>
                <Icon name="wallet" size={14} color={colors.primary} />
                <Text style={styles.budgetLabel}>Monthly Budget:</Text>
                <Text style={styles.budgetValue}>
                  {formatCurrency(selectedCategory.monthlyBudget)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Description"
                placeholder="What did you spend on?"
                value={value}
                onChangeText={onChange}
                type="multiline"
                leftIcon="text-outline"
              />
            )}
          />
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
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
              {formatDate(selectedDate, 'dd MMM yyyy')}
            </Text>
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    style={[
                      styles.paymentMethod,
                      value === 'cash' && styles.paymentMethodSelected,
                    ]}
                    onPress={() => onChange('cash')}
                  >
                    <Icon
                      name="cash-outline"
                      size={24}
                      color={
                        value === 'cash'
                          ? colors.primary
                          : colors.text.secondary
                      }
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        value === 'cash' && styles.paymentMethodTextSelected,
                      ]}
                    >
                      Cash
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentMethod,
                      value === 'card' && styles.paymentMethodSelected,
                    ]}
                    onPress={() => onChange('card')}
                  >
                    <Icon
                      name="card-outline"
                      size={24}
                      color={
                        value === 'card'
                          ? colors.primary
                          : colors.text.secondary
                      }
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        value === 'card' && styles.paymentMethodTextSelected,
                      ]}
                    >
                      Card
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentMethod,
                      value === 'mobile_banking' &&
                        styles.paymentMethodSelected,
                    ]}
                    onPress={() => onChange('mobile_banking')}
                  >
                    <Icon
                      name="phone-portrait-outline"
                      size={24}
                      color={
                        value === 'mobile_banking'
                          ? colors.primary
                          : colors.text.secondary
                      }
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        value === 'mobile_banking' &&
                          styles.paymentMethodTextSelected,
                      ]}
                    >
                      Mobile
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="location.address"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Location (Optional)"
                placeholder="Where did you spend?"
                value={value}
                onChangeText={onChange}
                leftIcon="location-outline"
              />
            )}
          />
        </View>

        {/* Recurring Expense */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.recurringButton}
            onPress={() => setShowRecurringModal(true)}
          >
            <Icon
              name="repeat-outline"
              size={20}
              color={recurringData ? colors.primary : colors.text.secondary}
            />
            <Text
              style={[
                styles.recurringButtonText,
                recurringData && { color: colors.primary, fontWeight: '600' },
              ]}
            >
              {recurringData
                ? `Recurring: ${recurringData.recurringFrequency}`
                : 'Make Recurring'}
            </Text>
          </TouchableOpacity>
          {recurringData && (
            <TouchableOpacity
              onPress={() => setRecurringData(null)}
              style={styles.removeRecurring}
            >
              <Text style={styles.removeRecurringText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Receipt Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipts (Optional)</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={async () => {
              const result = await launchImageLibrary({
                mediaType: 'photo',
                selectionLimit: 5,
              });
              if (result.assets) {
                setSelectedImages(result.assets);
              }
            }}
          >
            <Icon
              name="cloud-upload-outline"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.uploadButtonText}>Upload Receipt Images</Text>
          </TouchableOpacity>
          {selectedImages.length > 0 && (
            <View style={styles.imagesPreview}>
              {selectedImages.map((img, index) => (
                <View key={index} style={styles.imagePreviewItem}>
                  <Image
                    source={{ uri: img.uri }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setSelectedImages(prev =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                    style={styles.removeImage}
                  >
                    <Icon name="close-circle" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <RecurringExpenseModal
          visible={showRecurringModal}
          onClose={() => setShowRecurringModal(false)}
          onSave={data => setRecurringData(data)}
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
          {isEditMode ? 'Update' : 'Add Expense'}
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
              <Text style={styles.pickerTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DatePicker
              date={selectedDate}
              onDateChange={date => setValue('date', date)}
              mode="date"
              maximumDate={new Date()}
            />
          </View>
        </View>
      </Modal>

      {/* ✅ Enhanced Category Picker Modal */}
      <Modal visible={showCategoryPicker} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            {/* Header with Add Category Button */}
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Icon name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Select Category</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCategoryPicker(false);
                  (navigation as any).navigate('AddCategory', {
                    mode: 'create',
                  });
                }}
              >
                <Icon name="add-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {categories?.map((cat: any) => (
                <TouchableOpacity
                  key={cat._id}
                  style={styles.categoryOption}
                  onPress={() => {
                    setValue('categoryId', cat._id);
                    setShowCategoryPicker(false);
                  }}
                >
                  <View style={styles.categoryOptionLeft}>
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: `${cat.color}15` },
                      ]}
                    >
                      <Icon name={cat.icon} size={24} color={cat.color} />
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{cat.name}</Text>
                      {/* ✅ Show Budget in Modal */}
                      {cat.monthlyBudget && (
                        <View style={styles.categoryBudgetBadge}>
                          <Icon
                            name="wallet"
                            size={12}
                            color={colors.primary}
                          />
                          <Text style={styles.categoryBudgetText}>
                            Budget: {formatCurrency(cat.monthlyBudget)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {selectedCategoryId === cat._id && (
                    <Icon name="checkmark" size={24} color={colors.primary} />
                  )}
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
    amountSection: {
      paddingVertical: spacing.xl,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    amountLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    },
    amountInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    currencySymbol: {
      ...textStyles.h1,
      color: colors.text.primary,
      marginRight: spacing.sm,
    },
    amountTextInput: {
      ...textStyles.h1,
      color: colors.text.primary,
      textAlign: 'center',
      minWidth: 150,
      padding: 0,
    },
    section: {
      marginTop: spacing.xl,
    },
    sectionTitle: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    categorySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
    },
    categorySelectorText: {
      ...textStyles.body,
      color: colors.text.primary,
      flex: 1,
      marginLeft: spacing.sm,
    },
    categoryIconSmall: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    // ✅ Budget Info Below Category
    budgetInfo: {
      marginTop: spacing.sm,
      backgroundColor: `${colors.primary}10`,
      padding: spacing.md,
      borderRadius: borderRadius.md,
    },
    budgetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    budgetLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      flex: 1,
    },
    budgetValue: {
      ...textStyles.caption,
      color: colors.primary,
      fontWeight: '700',
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
    },
    dateSelectorText: {
      ...textStyles.body,
      color: colors.text.primary,
      flex: 1,
      marginLeft: spacing.sm,
    },
    paymentMethods: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    paymentMethod: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
    },
    paymentMethodSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}10`,
    },
    paymentMethodText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    paymentMethodTextSelected: {
      color: colors.primary,
      fontWeight: '600',
    },
    recurringButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      gap: spacing.sm,
    },
    recurringButtonText: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    removeRecurring: {
      alignSelf: 'flex-end',
      marginTop: spacing.sm,
    },
    removeRecurringText: {
      ...textStyles.caption,
      color: colors.danger,
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.lg,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      gap: spacing.sm,
    },
    uploadButtonText: {
      ...textStyles.body,
      color: colors.primary,
    },
    imagesPreview: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    imagePreviewItem: {
      position: 'relative',
      width: 80,
      height: 80,
    },
    imagePreview: {
      width: '100%',
      height: '100%',
      borderRadius: borderRadius.md,
    },
    removeImage: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: colors.background,
      borderRadius: 10,
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
    categoryOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryOptionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    categoryIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    // ✅ Category Info Container
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      ...textStyles.body,
      color: colors.text.primary,
      marginBottom: 4,
    },
    // ✅ Budget Badge in Modal
    categoryBudgetBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: `${colors.primary}15`,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
      alignSelf: 'flex-start',
    },
    categoryBudgetText: {
      ...textStyles.caption,
      fontSize: 10,
      color: colors.primary,
      fontWeight: '600',
    },
  });

export default AddExpenseModal;
