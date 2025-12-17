/**
 * Expense Filter Modal
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
import { useTheme } from '../../../hooks/useTheme';
import { Button, Input } from '../../../components/common';
import { Category } from '../../../api/endpoints/categories';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  categories: Category[];
  currentFilters: any;
}

const FilterModal: React.FC<FilterModalProps> = ({
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
  const [search, setSearch] = useState(currentFilters.search || '');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const handleApply = () => {
    onApply({
      categoryId: selectedCategory,
      search: search || undefined,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
    });
  };

  const handleReset = () => {
    setSelectedCategory(undefined);
    setSearch('');
    setMinAmount('');
    setMaxAmount('');
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
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Search */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Search</Text>
              <Input
                placeholder="Search description, tags..."
                value={search}
                onChangeText={setSearch}
                leftIcon="search-outline"
              />
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
                    <Text style={{ fontSize: 16, marginRight: 4 }}>
                      {cat.icon}
                    </Text>
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
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              variant="outline"
              onPress={handleReset}
              style={{ flex: 1, marginRight: spacing.sm }}
            >
              Reset
            </Button>
            <Button
              onPress={handleApply}
              style={{ flex: 1, marginLeft: spacing.sm }}
            >
              Apply Filters
            </Button>
          </View>
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
      maxHeight: '80%',
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });

export default FilterModal;
