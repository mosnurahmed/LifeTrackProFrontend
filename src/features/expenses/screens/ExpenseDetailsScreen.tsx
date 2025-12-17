/* eslint-disable react-native/no-inline-styles */
/**
 * Expense Details Screen - Fixed for Backend Structure
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import {
  useExpense,
  useDeleteExpense,
  // useDuplicateExpense,
} from '../../../hooks/api/useExpenses';
import { Card, Button, Spinner, ErrorState } from '../../../components/common';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from '../../../utils/formatters';

const ExpenseDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const { expenseId } = (route.params as any) || {};

  const { data: expenseData, isLoading, error } = useExpense(expenseId);
  const deleteMutation = useDeleteExpense();
  // const duplicateMutation = useDuplicateExpense();
  const expense = expenseData?.data;

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    // shadows,
  );

  const handleEdit = () => {
    (navigation as any).navigate('AddExpense', { mode: 'edit', expenseId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMutation.mutateAsync(expenseId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  // const handleDuplicate = async () => {
  //   await duplicateMutation.mutateAsync(expenseId);
  //   navigation.goBack();
  // };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Spinner text="Loading expense..." />
      </View>
    );
  }

  if (error || !expense) {
    return (
      <View style={styles.container}>
        <ErrorState
          title="Expense not found"
          message="Unable to load expense details"
          onRetry={() => navigation.goBack()}
        />
      </View>
    );
  }

  // ✅ Get category from either category or categoryId field
  const category = expense.category || expense.categoryId;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Details</Text>
        <TouchableOpacity onPress={handleEdit}>
          <Icon name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Amount Card */}
        <Card
          variant="elevated"
          style={[styles.amountCard, { backgroundColor: colors.danger }]}
        >
          <View style={styles.amountContent}>
            <View
              style={[
                styles.categoryIconLarge,
                { backgroundColor: 'rgba(255,255,255,0.2)' },
              ]}
            >
              {/* ✅ Use Icon component for Ionicons */}
              <Icon
                name={category?.icon || 'cash'}
                size={40}
                color={colors.text.inverse}
              />
            </View>
            <View style={styles.amountInfo}>
              <Text style={styles.categoryName}>
                {category?.name || 'Uncategorized'}
              </Text>
              <Text style={styles.amountLarge}>
                {formatCurrency(expense.amount)}
              </Text>
              <Text style={styles.dateText}>
                {formatDate(expense.date, 'dd MMM yyyy')}
              </Text>
            </View>
          </View>
        </Card>

        {/* Details Card */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Details</Text>

          {/* Description */}
          {expense.description && expense.description.trim() !== '' && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon
                  name="document-text-outline"
                  size={20}
                  color={colors.text.secondary}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{expense.description}</Text>
              </View>
            </View>
          )}

          {/* Category */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon
                name="apps-outline"
                size={20}
                color={colors.text.secondary}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Category</Text>
              <View style={styles.categoryRow}>
                <View
                  style={[
                    styles.categoryIconSmall,
                    {
                      backgroundColor: `${category?.color || colors.primary}15`,
                    },
                  ]}
                >
                  <Icon
                    name={category?.icon || 'cash'}
                    size={16}
                    color={category?.color || colors.primary}
                  />
                </View>
                <Text style={styles.detailValue}>
                  {category?.name || 'Uncategorized'}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Method */}
          {expense.paymentMethod && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon
                  name={
                    expense.paymentMethod === 'cash'
                      ? 'cash-outline'
                      : expense.paymentMethod === 'card'
                      ? 'card-outline'
                      : 'phone-portrait-outline'
                  }
                  size={20}
                  color={colors.text.secondary}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Payment Method</Text>
                <Text style={styles.detailValue}>
                  {expense.paymentMethod === 'cash'
                    ? 'Cash'
                    : expense.paymentMethod === 'card'
                    ? 'Card'
                    : 'Mobile Banking'}
                </Text>
              </View>
            </View>
          )}

          {/* Location */}
          {expense.location?.address && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon
                  name="location-outline"
                  size={20}
                  color={colors.text.secondary}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>
                  {expense.location.address}
                </Text>
              </View>
            </View>
          )}

          {/* Tags */}
          {expense.tags && expense.tags.length > 0 && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon
                  name="pricetag-outline"
                  size={20}
                  color={colors.text.secondary}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {expense.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Recurring */}
          {expense.isRecurring && expense.recurringConfig && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="repeat-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Recurring</Text>
                <Text style={styles.detailValue}>
                  {expense.recurringConfig.interval.charAt(0).toUpperCase() +
                    expense.recurringConfig.interval.slice(1)}
                  {expense.recurringConfig.endDate &&
                    ` until ${formatDate(
                      expense.recurringConfig.endDate,
                      'dd MMM yyyy',
                    )}`}
                </Text>
              </View>
            </View>
          )}

          {/* Created At */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon
                name="time-outline"
                size={20}
                color={colors.text.secondary}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>
                {formatRelativeTime(expense.createdAt)}
              </Text>
            </View>
          </View>

          {/* Updated At */}
          {expense.updatedAt !== expense.createdAt && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon
                  name="sync-outline"
                  size={20}
                  color={colors.text.secondary}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Last Updated</Text>
                <Text style={styles.detailValue}>
                  {formatRelativeTime(expense.updatedAt)}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Attachments */}
        {expense.receiptImage && (
          <Card style={styles.attachmentsCard}>
            <Text style={styles.sectionTitle}>Receipt</Text>
            <View style={styles.attachmentsGrid}>
              <TouchableOpacity style={styles.attachment}>
                <Image
                  source={{ uri: expense.receiptImage }}
                  style={styles.attachmentImage}
                />
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Actions */}
        <Card style={styles.actionsCard}>
          {/* <Button
            variant="outline"
            icon="copy-outline"
            onPress={handleDuplicate}
            loading={duplicateMutation.isPending}
            fullWidth
            style={{ marginBottom: spacing.md }}
          >
            Duplicate Expense
          </Button> */}
          <Button
            variant="danger"
            icon="trash-outline"
            onPress={handleDelete}
            loading={deleteMutation.isPending}
            fullWidth
          >
            Delete Expense
          </Button>
        </Card>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const createStyles = (
  colors: any,
  textStyles: any,
  spacing: any,
  borderRadius: any,
  // shadows: any,
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
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      ...textStyles.h3,
      color: colors.text.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    amountCard: {
      marginBottom: spacing.lg,
    },
    amountContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    categoryIconLarge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    amountInfo: {
      flex: 1,
    },
    categoryName: {
      ...textStyles.caption,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: spacing.xs,
    },
    amountLarge: {
      ...textStyles.h1,
      color: colors.text.inverse,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    dateText: {
      ...textStyles.body,
      color: 'rgba(255,255,255,0.9)',
    },
    detailsCard: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      ...textStyles.h4,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    detailRow: {
      flexDirection: 'row',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailIcon: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 2,
    },
    detailContent: {
      flex: 1,
    },
    detailLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    detailValue: {
      ...textStyles.body,
      color: colors.text.primary,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    categoryIconSmall: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: 4,
    },
    tag: {
      backgroundColor: `${colors.primary}15`,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    tagText: {
      ...textStyles.caption,
      color: colors.primary,
    },
    attachmentsCard: {
      marginBottom: spacing.lg,
    },
    attachmentsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    attachment: {
      width: '100%',
      aspectRatio: 1.5,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    attachmentImage: {
      width: '100%',
      height: '100%',
    },
    actionsCard: {
      marginBottom: spacing.lg,
    },
  });

export default ExpenseDetailsScreen;
