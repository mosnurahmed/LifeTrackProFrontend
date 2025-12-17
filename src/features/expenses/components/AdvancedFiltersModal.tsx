/**
 * Advanced Filters Modal
 *
 * Complete filtering options:
 * - Date range
 * - Amount range
 * - Categories
 * - Payment methods
 * - Tags
 * - Sort options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import { useTheme } from '../../../hooks/useTheme';
import { Button, Input } from '../../../components/common';
import { Category } from '../../../api/endpoints/categories';
import { formatDate } from '../../../utils/formatters';

interface AdvancedFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  categories: Category[];
  currentFilters: any;
}

const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  visible,
  onClose,
  onApply,
  categories,
  currentFilters,
}) => {
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState(
    currentFilters.categoryId,
  );
  const [startDate, setStartDate] = useState<Date | null>(
    currentFilters.startDate ? new Date(currentFilters.startDate) : null,
  );
  const [endDate, setEndDate] = useState<Date | null>(
    currentFilters.endDate ? new Date(currentFilters.endDate) : null,
  );
  const [minAmount, setMinAmount] = useState(
    currentFilters.minAmount?.toString() || '',
  );
  const [maxAmount, setMaxAmount] = useState(
    currentFilters.maxAmount?.toString() || '',
  );
  const [search, setSearch] = useState(currentFilters.search || '');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    currentFilters.paymentMethod,
  );
  const [sortBy, setSortBy] = useState(currentFilters.sortBy || 'date');
  const [sortOrder, setSortOrder] = useState(
    currentFilters.sortOrder || 'desc',
  );

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: 'cash-outline' },
    { id: 'card', label: 'Card', icon: 'card-outline' },
    {
      id: 'mobile_banking',
      label: 'Mobile Banking',
      icon: 'phone-portrait-outline',
    },
  ];

  const sortOptions = [
    { id: 'date', label: 'Date' },
    { id: 'amount', label: 'Amount' },
    { id: 'category', label: 'Category' },
  ];

  const handleApply = () => {
    onApply({
      categoryId: selectedCategory,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      search: search || undefined,
      paymentMethod: selectedPaymentMethod,
      sortBy,
      sortOrder,
    });
  };

  const handleReset = () => {
    setSelectedCategory(undefined);
    setStartDate(null);
    setEndDate(null);
    setMinAmount('');
    setMaxAmount('');
    setSearch('');
    setSelectedPaymentMethod(undefined);
    setSortBy('date');
    setSortOrder('desc');
  };

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Advanced Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Search */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Search</Text>
              <Input
                placeholder="Search description, tags, location..."
                value={search}
                onChangeText={setSearch}
                leftIcon="search-outline"
              />
            </View>

            {/* Date Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date Range</Text>
              <View style={styles.dateRow}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Icon
                    name="calendar-outline"
                    size={20}
                    color={colors.text.secondary}
                  />
                  <Text style={styles.dateButtonText}>
                    {startDate ? formatDate(startDate) : 'Start Date'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.dateSeparator}>to</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Icon
                    name="calendar-outline"
                    size={20}
                    color={colors.text.secondary}
                  />
                  <Text style={styles.dateButtonText}>
                    {endDate ? formatDate(endDate) : 'End Date'}
                  </Text>
                </TouchableOpacity>
              </View>
              {(startDate || endDate) && (
                <TouchableOpacity
                  onPress={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  style={styles.clearDates}
                >
                  <Text style={styles.clearDatesText}>Clear Dates</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Amount Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amount Range</Text>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Input
                    placeholder="Min"
                    value={minAmount}
                    onChangeText={setMinAmount}
                    type="number"
                    leftIcon="cash-outline"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Input
                    placeholder="Max"
                    value={maxAmount}
                    onChangeText={setMaxAmount}
                    type="number"
                    leftIcon="cash-outline"
                  />
                </View>
              </View>
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.categoriesGrid}>
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    !selectedCategory && styles.categoryChipSelected,
                  ]}
                  onPress={() => setSelectedCategory(undefined)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      !selectedCategory && styles.categoryChipTextSelected,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat._id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat._id &&
                        styles.categoryChipSelected,
                    ]}
                    onPress={() => setSelectedCategory(cat._id)}
                  >
                    <Icon name={cat.icon} size={20} color={cat.color} />
                    {/* <Text style={{ fontSize: 16, marginRight: 4 }}>
                      {cat.icon}
                    </Text> */}
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === cat._id &&
                          styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <View style={styles.paymentMethods}>
                <TouchableOpacity
                  style={[
                    styles.paymentMethod,
                    !selectedPaymentMethod && styles.paymentMethodSelected,
                  ]}
                  onPress={() => setSelectedPaymentMethod(undefined)}
                >
                  <Text
                    style={[
                      styles.paymentMethodText,
                      !selectedPaymentMethod &&
                        styles.paymentMethodTextSelected,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {paymentMethods.map(method => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethod,
                      selectedPaymentMethod === method.id &&
                        styles.paymentMethodSelected,
                    ]}
                    onPress={() => setSelectedPaymentMethod(method.id)}
                  >
                    <Icon
                      name={method.icon}
                      size={20}
                      color={
                        selectedPaymentMethod === method.id
                          ? colors.text.inverse
                          : colors.text.secondary
                      }
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        selectedPaymentMethod === method.id &&
                          styles.paymentMethodTextSelected,
                      ]}
                    >
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.sortOptions}>
                {sortOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.sortOption,
                      sortBy === option.id && styles.sortOptionSelected,
                    ]}
                    onPress={() => setSortBy(option.id)}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        sortBy === option.id && styles.sortOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sort Order */}
              <View style={styles.sortOrder}>
                <TouchableOpacity
                  style={[
                    styles.sortOrderButton,
                    sortOrder === 'desc' && styles.sortOrderButtonSelected,
                  ]}
                  onPress={() => setSortOrder('desc')}
                >
                  <Icon
                    name="arrow-down"
                    size={16}
                    color={
                      sortOrder === 'desc'
                        ? colors.text.inverse
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.sortOrderText,
                      sortOrder === 'desc' && styles.sortOrderTextSelected,
                    ]}
                  >
                    Descending
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortOrderButton,
                    sortOrder === 'asc' && styles.sortOrderButtonSelected,
                  ]}
                  onPress={() => setSortOrder('asc')}
                >
                  <Icon
                    name="arrow-up"
                    size={16}
                    color={
                      sortOrder === 'asc'
                        ? colors.text.inverse
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.sortOrderText,
                      sortOrder === 'asc' && styles.sortOrderTextSelected,
                    ]}
                  >
                    Ascending
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              variant="outline"
              onPress={handleReset}
              style={{ flex: 1, marginRight: spacing.sm }}
            >
              Reset All
            </Button>
            <Button
              onPress={handleApply}
              style={{ flex: 1, marginLeft: spacing.sm }}
            >
              Apply Filters
            </Button>
          </View>

          {/* Date Pickers */}
          <Modal
            visible={showStartDatePicker}
            transparent
            animationType="slide"
          >
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(false)}
                  >
                    <Text style={styles.pickerCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerTitle}>Start Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowStartDatePicker(false)}
                  >
                    <Text style={styles.pickerDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DatePicker
                  date={startDate || new Date()}
                  onDateChange={setStartDate}
                  mode="date"
                  maximumDate={endDate || new Date()}
                />
              </View>
            </View>
          </Modal>

          <Modal visible={showEndDatePicker} transparent animationType="slide">
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                    <Text style={styles.pickerCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerTitle}>End Date</Text>
                  <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                    <Text style={styles.pickerDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DatePicker
                  date={endDate || new Date()}
                  onDateChange={setEndDate}
                  mode="date"
                  minimumDate={startDate || undefined}
                  maximumDate={new Date()}
                />
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (
  colors: any,
  textStyles: any,
  spacing: any,
  borderRadius: any,
  shadows: any,
) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: '90%',
      ...shadows.lg,
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
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    dateButton: {
      flex: 1,
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
    dateButtonText: {
      ...textStyles.body,
      color: colors.text.primary,
      flex: 1,
    },
    dateSeparator: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    clearDates: {
      alignSelf: 'flex-end',
      marginTop: spacing.sm,
    },
    clearDatesText: {
      ...textStyles.caption,
      color: colors.danger,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    categoryChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryChipText: {
      ...textStyles.caption,
      color: colors.text.primary,
    },
    categoryChipTextSelected: {
      color: colors.text.inverse,
    },
    paymentMethods: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    paymentMethod: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.xs,
    },
    paymentMethodSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    paymentMethodText: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    paymentMethodTextSelected: {
      color: colors.text.inverse,
    },
    sortOptions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    sortOption: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    sortOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sortOptionText: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    sortOptionTextSelected: {
      color: colors.text.inverse,
    },
    sortOrder: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    sortOrderButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.xs,
    },
    sortOrderButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sortOrderText: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    sortOrderTextSelected: {
      color: colors.text.inverse,
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
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
  });

export default AdvancedFiltersModal;
