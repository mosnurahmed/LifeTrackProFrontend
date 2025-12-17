/**
 * Recurring Expense Setup Modal
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
import { formatDate } from '../../../utils/formatters';

interface RecurringExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const RecurringExpenseModal: React.FC<RecurringExpenseModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const [frequency, setFrequency] = useState<
    'daily' | 'weekly' | 'monthly' | 'yearly'
  >('monthly');
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const frequencies = [
    { id: 'daily' as const, label: 'Daily', icon: 'calendar-outline' },
    { id: 'weekly' as const, label: 'Weekly', icon: 'calendar-outline' },
    { id: 'monthly' as const, label: 'Monthly', icon: 'calendar-outline' },
    { id: 'yearly' as const, label: 'Yearly', icon: 'calendar-outline' },
  ];

  const handleSave = () => {
    onSave({
      isRecurring: true,
      recurringFrequency: frequency,
      recurringEndDate: endDate?.toISOString(),
    });
    onClose();
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
          <View style={styles.header}>
            <Text style={styles.title}>Recurring Expense</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyGrid}>
              {frequencies.map(freq => (
                <TouchableOpacity
                  key={freq.id}
                  style={[
                    styles.frequencyOption,
                    frequency === freq.id && styles.frequencyOptionSelected,
                  ]}
                  onPress={() => setFrequency(freq.id)}
                >
                  <Icon
                    name={freq.icon}
                    size={24}
                    color={
                      frequency === freq.id
                        ? colors.text.inverse
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.frequencyLabel,
                      frequency === freq.id && styles.frequencyLabelSelected,
                    ]}
                  >
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>End Date (Optional)</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon
                  name="calendar-outline"
                  size={20}
                  color={colors.text.secondary}
                />
                <Text style={styles.dateButtonText}>
                  {endDate ? formatDate(endDate) : 'No end date'}
                </Text>
              </TouchableOpacity>
              {endDate && (
                <TouchableOpacity
                  onPress={() => setEndDate(null)}
                  style={styles.clearDate}
                >
                  <Text style={styles.clearDateText}>Clear end date</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.infoBox}>
              <Icon
                name="information-circle-outline"
                size={20}
                color={colors.info}
              />
              <Text style={styles.infoText}>
                This expense will be automatically created {frequency} until{' '}
                {endDate ? formatDate(endDate) : 'you stop it'}.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              variant="outline"
              onPress={onClose}
              style={{ flex: 1, marginRight: spacing.sm }}
            >
              Cancel
            </Button>
            <Button
              onPress={handleSave}
              style={{ flex: 1, marginLeft: spacing.sm }}
            >
              Save
            </Button>
          </View>

          <Modal visible={showDatePicker} transparent animationType="slide">
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.pickerCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerTitle}>End Date</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.pickerDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DatePicker
                  date={endDate || new Date()}
                  onDateChange={setEndDate}
                  mode="date"
                  minimumDate={new Date()}
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
      maxHeight: '70%',
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
    label: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    frequencyGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    frequencyOption: {
      width: '47%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: spacing.sm,
    },
    frequencyOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    frequencyLabel: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    frequencyLabelSelected: {
      color: colors.text.inverse,
      fontWeight: '600',
    },
    section: {
      marginBottom: spacing.xl,
    },
    dateButton: {
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
    clearDate: {
      alignSelf: 'flex-end',
      marginTop: spacing.sm,
    },
    clearDateText: {
      ...textStyles.caption,
      color: colors.danger,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: `${colors.info}15`,
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    infoText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      flex: 1,
      lineHeight: 20,
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

export default RecurringExpenseModal;
