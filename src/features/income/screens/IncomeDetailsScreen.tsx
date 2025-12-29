/**
 * Income Details Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useIncome, useDeleteIncome } from '../../../hooks/api/useIncome';
import { Card, Button, Spinner, ErrorState } from '../../../components/common';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const IncomeDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const { incomeId } = (route.params as any) || {};

  const { data: incomeData, isLoading, error } = useIncome(incomeId);
  const deleteMutation = useDeleteIncome();

  const income = incomeData?.data;

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  const handleEdit = () => {
    (navigation as any).navigate('AddIncome', {
      mode: 'edit',
      incomeId,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Income',
      `Delete "${income?.source}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMutation.mutateAsync(incomeId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Spinner text="Loading..." />
      </View>
    );
  }

  if (error || !income) {
    return (
      <View style={styles.container}>
        <ErrorState
          title="Income not found"
          message="Unable to load income details"
          onRetry={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Income Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Icon name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Icon name="trash-outline" size={24} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Amount Card */}
        <Card style={styles.amountCard}>
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountValue}>
              {formatCurrency(income.amount)}
            </Text>
            <Text style={styles.amountDate}>
              {formatDate(income.date, 'dd MMMM yyyy')}
            </Text>
          </View>
        </Card>

        {/* Category & Source Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Icon name="apps" size={20} color={colors.text.secondary} />
              <Text style={styles.infoLabelText}>Category</Text>
            </View>
            <View style={styles.infoValue}>
              <View
                style={[
                  styles.categoryIconSmall,
                  {
                    backgroundColor: `${
                      income.categoryId?.color ||
                      income.category?.color ||
                      colors.primary
                    }15`,
                  },
                ]}
              >
                <Icon
                  name={
                    income.categoryId?.icon || income.category?.icon || 'wallet'
                  }
                  size={16}
                  color={
                    income.categoryId?.color ||
                    income.category?.color ||
                    colors.primary
                  }
                />
              </View>
              <Text style={styles.infoValueText}>
                {income.categoryId?.name ||
                  income.category?.name ||
                  'Uncategorized'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Icon name="briefcase" size={20} color={colors.text.secondary} />
              <Text style={styles.infoLabelText}>Source</Text>
            </View>
            <Text style={styles.infoValueText}>{income.source}</Text>
          </View>

          {income.description && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Icon name="text" size={20} color={colors.text.secondary} />
                <Text style={styles.infoLabelText}>Description</Text>
              </View>
              <Text style={[styles.infoValueText, styles.descriptionText]}>
                {income.description}
              </Text>
            </View>
          )}

          {income.paymentMethod && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Icon
                  name={
                    income.paymentMethod === 'cash'
                      ? 'cash'
                      : income.paymentMethod === 'card'
                      ? 'card'
                      : income.paymentMethod === 'mobile_banking'
                      ? 'phone-portrait'
                      : 'business'
                  }
                  size={20}
                  color={colors.text.secondary}
                />
                <Text style={styles.infoLabelText}>Payment Method</Text>
              </View>
              <Text style={styles.infoValueText}>
                {income.paymentMethod === 'cash'
                  ? 'Cash'
                  : income.paymentMethod === 'card'
                  ? 'Card'
                  : income.paymentMethod === 'mobile_banking'
                  ? 'Mobile Banking'
                  : 'Bank Transfer'}
              </Text>
            </View>
          )}
        </Card>

        {/* Recurring Info */}
        {income.isRecurring && income.recurringConfig && (
          <Card style={styles.recurringCard}>
            <View style={styles.recurringHeader}>
              <Icon name="repeat" size={20} color={colors.info} />
              <Text style={styles.recurringTitle}>Recurring Income</Text>
            </View>
            <View style={styles.recurringInfo}>
              <View style={styles.recurringRow}>
                <Text style={styles.recurringLabel}>Interval:</Text>
                <Text style={styles.recurringValue}>
                  {income.recurringConfig.interval.charAt(0).toUpperCase() +
                    income.recurringConfig.interval.slice(1)}
                </Text>
              </View>
              {income.recurringConfig.endDate && (
                <View style={styles.recurringRow}>
                  <Text style={styles.recurringLabel}>End Date:</Text>
                  <Text style={styles.recurringValue}>
                    {formatDate(income.recurringConfig.endDate, 'dd MMM yyyy')}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Tags */}
        {income.tags && income.tags.length > 0 && (
          <Card style={styles.tagsCard}>
            <Text style={styles.tagsTitle}>Tags</Text>
            <View style={styles.tags}>
              {income.tags.map((tag: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Icon name="pricetag" size={12} color={colors.primary} />
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Receipt */}
        {income.receiptImage && (
          <Card style={styles.receiptCard}>
            <Text style={styles.receiptTitle}>Receipt</Text>
            <Image
              source={{ uri: income.receiptImage }}
              style={styles.receiptImage}
              resizeMode="cover"
            />
          </Card>
        )}

        {/* Timestamps */}
        <Card style={styles.timestampCard}>
          <View style={styles.timestampRow}>
            <Text style={styles.timestampLabel}>Created:</Text>
            <Text style={styles.timestampValue}>
              {formatDate(income.createdAt, 'dd MMM yyyy, HH:mm')}
            </Text>
          </View>
          {income.updatedAt && income.updatedAt !== income.createdAt && (
            <View style={styles.timestampRow}>
              <Text style={styles.timestampLabel}>Last Updated:</Text>
              <Text style={styles.timestampValue}>
                {formatDate(income.updatedAt, 'dd MMM yyyy, HH:mm')}
              </Text>
            </View>
          )}
        </Card>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
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
      flex: 1,
      marginLeft: spacing.md,
    },
    headerRight: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    headerButton: {
      padding: spacing.xs,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    amountCard: {
      marginBottom: spacing.lg,
    },
    amountSection: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    amountLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    },
    amountValue: {
      ...textStyles.h1,
      color: colors.success,
      fontWeight: '700',
      marginBottom: spacing.sm,
    },
    amountDate: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    infoCard: {
      marginBottom: spacing.lg,
    },
    infoRow: {
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    infoLabelText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    infoValue: {
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
    infoValueText: {
      ...textStyles.body,
      color: colors.text.primary,
    },
    descriptionText: {
      lineHeight: 22,
    },
    recurringCard: {
      backgroundColor: `${colors.info}10`,
      borderWidth: 1,
      borderColor: `${colors.info}30`,
      marginBottom: spacing.lg,
    },
    recurringHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    recurringTitle: {
      ...textStyles.bodyMedium,
      color: colors.info,
      fontWeight: '600',
    },
    recurringInfo: {
      gap: spacing.sm,
    },
    recurringRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    recurringLabel: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    recurringValue: {
      ...textStyles.body,
      color: colors.text.primary,
      fontWeight: '600',
    },
    tagsCard: {
      marginBottom: spacing.lg,
    },
    tagsTitle: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      backgroundColor: `${colors.primary}15`,
    },
    tagText: {
      ...textStyles.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    receiptCard: {
      marginBottom: spacing.lg,
    },
    receiptTitle: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    receiptImage: {
      width: '100%',
      height: 200,
      borderRadius: borderRadius.md,
    },
    timestampCard: {
      backgroundColor: colors.background,
      marginBottom: spacing.lg,
    },
    timestampRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },
    timestampLabel: {
      ...textStyles.caption,
      color: colors.text.tertiary,
    },
    timestampValue: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
  });

export default IncomeDetailsScreen;
