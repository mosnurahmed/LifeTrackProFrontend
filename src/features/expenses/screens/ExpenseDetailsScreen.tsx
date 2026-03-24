/**
 * Expense Details Screen - Professional Minimal
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import {
  useExpense,
  useDeleteExpense,
} from '../../../hooks/api/useExpenses';
import { Spinner, ErrorState, useConfirm } from '../../../components/common';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from '../../../utils/formatters';

const ExpenseDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const { expenseId } = (route.params as any) || {};

  const { data: expenseData, isLoading, error } = useExpense(expenseId);
  const deleteMutation = useDeleteExpense();
  const { confirm } = useConfirm();
  const expense = expenseData?.data;

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';
  const bgColor = colors.background;

  const handleEdit = () => {
    (navigation as any).navigate('AddExpense', { mode: 'edit', expenseId });
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete Expense',
      message: 'This action cannot be undone. Are you sure?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) {
      await deleteMutation.mutateAsync(expenseId);
      navigation.goBack();
    }
  };

  const category = expense?.category || expense?.categoryId;
  const catColor = category?.color || '#8B5CF6';
  const catIcon = category?.icon || 'wallet-outline';
  const catName = category?.name || 'Uncategorized';

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <Spinner text="Loading..." />
      </View>
    );
  }

  if (error || !expense) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <ErrorState
          title="Not found"
          message="Unable to load expense"
          onRetry={() => navigation.goBack()}
        />
      </View>
    );
  }

  const PAYMENT_LABELS: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    mobile_banking: 'Mobile Banking',
    bank_transfer: 'Bank Transfer',
  };

  const renderDetailRow = (icon: string, label: string, value: string) => (
    <View style={[styles.detailRow, { borderBottomColor: borderC }]}>
      <Icon name={icon} size={18} color={textSec} />
      <Text style={[styles.detailLabel, { color: textSec }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: textPri }]} numberOfLines={2}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: surfaceC, borderBottomColor: borderC }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={textPri} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPri }]}>Details</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleEdit}>
          <Icon name="create-outline" size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* Amount Hero */}
        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: catColor + '18' }]}>
            <Icon name={catIcon} size={28} color={catColor} />
          </View>
          <Text style={[styles.heroAmount, { color: textPri }]}>
            {formatCurrency(expense.amount)}
          </Text>
          <Text style={[styles.heroCat, { color: catColor }]}>{catName}</Text>
          <Text style={[styles.heroDate, { color: textSec }]}>
            {formatDate(expense.date, 'dd MMM yyyy')}
          </Text>
        </View>

        {/* Details Card */}
        <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
          {expense.description && expense.description.trim() !== '' &&
            renderDetailRow('document-text-outline', 'Description', expense.description)}
          {renderDetailRow('apps-outline', 'Category', catName)}
          {expense.paymentMethod &&
            renderDetailRow(
              expense.paymentMethod === 'cash' ? 'cash-outline' : expense.paymentMethod === 'card' ? 'card-outline' : 'phone-portrait-outline',
              'Payment',
              PAYMENT_LABELS[expense.paymentMethod] || expense.paymentMethod
            )}
          {expense.location?.address &&
            renderDetailRow('location-outline', 'Location', expense.location.address)}
          {expense.isRecurring && expense.recurringConfig &&
            renderDetailRow('repeat-outline', 'Recurring',
              expense.recurringConfig.interval.charAt(0).toUpperCase() + expense.recurringConfig.interval.slice(1))}
          {renderDetailRow('time-outline', 'Created', formatRelativeTime(expense.createdAt))}
        </View>

        {/* Tags */}
        {expense.tags && expense.tags.length > 0 && (
          <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Text style={[styles.cardLabel, { color: textSec }]}>Tags</Text>
            <View style={styles.tagsWrap}>
              {expense.tags.map((tag: string, i: number) => (
                <View key={i} style={[styles.tag, { backgroundColor: '#8B5CF615' }]}>
                  <Text style={[styles.tagText, { color: '#8B5CF6' }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Receipt */}
        {expense.receiptImage && (
          <View style={[styles.card, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Text style={[styles.cardLabel, { color: textSec }]}>Receipt</Text>
            <Image source={{ uri: expense.receiptImage }} style={styles.receipt} resizeMode="cover" />
          </View>
        )}

        {/* Delete */}
        <TouchableOpacity
          style={[styles.deleteBtn, { borderColor: '#EF444440' }]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Icon name="trash-outline" size={18} color="#EF4444" />
          <Text style={styles.deleteBtnText}>Delete Expense</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700' },

  hero: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  heroCat: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroDate: {
    fontSize: 13,
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    gap: 10,
  },
  detailLabel: {
    fontSize: 13,
    width: 90,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },

  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },

  receipt: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },

  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default ExpenseDetailsScreen;
