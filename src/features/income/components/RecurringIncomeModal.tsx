/**
 * Recurring Income Modal Component - FIXED
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import { useTheme } from '../../../hooks/useTheme';
import { Button } from '../../../components/common';

interface RecurringIncomeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const RecurringIncomeModal: React.FC<RecurringIncomeModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  // ✅ Fixed useState declarations
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<
    'daily' | 'weekly' | 'monthly' | 'yearly'
  >('monthly');
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  const handleSave = () => {
    if (!isRecurring) {
      onSave(null);
      onClose();
      return;
    }

    onSave({
      isRecurring: true,
      recurringFrequency: frequency,
      recurringEndDate: endDate?.toISOString(),
    });
    onClose();
  };

  const handleReset = () => {
    setIsRecurring(false);
    setFrequency('monthly');
    setEndDate(undefined);
    setShowEndDatePicker(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Recurring Income</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Enable Recurring Toggle */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsRecurring(!isRecurring)}
              activeOpacity={0.7}
            >
              <View style={styles.toggleLeft}>
                <Icon
                  name="repeat"
                  size={20}
                  color={isRecurring ? colors.success : colors.text.secondary}
                />
                <Text style={styles.toggleText}>
                  Make this income recurring
                </Text>
              </View>
              <View
                style={[
                  styles.switch,
                  isRecurring && { backgroundColor: colors.success },
                ]}
              >
                <View
                  style={[
                    styles.switchThumb,
                    isRecurring && styles.switchThumbActive,
                  ]}
                />
              </View>
            </TouchableOpacity>

            {isRecurring && (
              <>
                {/* Frequency Selector */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Frequency</Text>
                  <View style={styles.frequencyOptions}>
                    {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(
                      freq => (
                        <TouchableOpacity
                          key={freq}
                          style={[
                            styles.frequencyOption,
                            frequency === freq && styles.frequencyOptionActive,
                          ]}
                          onPress={() => setFrequency(freq)}
                          activeOpacity={0.7}
                        >
                          <Icon
                            name={
                              freq === 'daily'
                                ? 'today'
                                : freq === 'weekly'
                                ? 'calendar-outline'
                                : freq === 'monthly'
                                ? 'calendar'
                                : 'calendar-sharp'
                            }
                            size={20}
                            color={
                              frequency === freq
                                ? colors.success
                                : colors.text.secondary
                            }
                          />
                          <Text
                            style={[
                              styles.frequencyText,
                              frequency === freq && styles.frequencyTextActive,
                            ]}
                          >
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>

                {/* End Date */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>End Date (Optional)</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="calendar-outline"
                      size={20}
                      color={colors.text.primary}
                    />
                    <Text style={styles.dateButtonText}>
                      {endDate
                        ? endDate.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'No end date'}
                    </Text>
                  </TouchableOpacity>
                  {endDate && (
                    <TouchableOpacity
                      onPress={() => setEndDate(undefined)}
                      style={styles.clearDate}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.clearDateText}>Clear Date</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Button
              variant="outline"
              onPress={handleReset}
              style={{ flex: 1, marginRight: spacing.sm }}
            >
              Reset
            </Button>
            <Button
              onPress={handleSave}
              style={{ flex: 1, marginLeft: spacing.sm }}
            >
              Save
            </Button>
          </View>
        </View>
      </View>

      {/* Date Picker Modal */}
      <Modal visible={showEndDatePicker} transparent animationType="fade">
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select End Date</Text>
            </View>
            <DatePicker
              date={endDate || new Date()}
              onDateChange={setEndDate}
              mode="date"
              minimumDate={new Date()}
            />
            <View style={styles.datePickerFooter}>
              <Button
                variant="outline"
                onPress={() => setShowEndDatePicker(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              >
                Cancel
              </Button>
              <Button
                onPress={() => setShowEndDatePicker(false)}
                style={{ flex: 1, marginLeft: spacing.sm }}
              >
                Done
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const createStyles = (
  colors: any,
  textStyles: any,
  spacing: any,
  borderRadius: any,
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
      paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
      padding: spacing.lg,
    },
    toggleButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      marginBottom: spacing.lg,
    },
    toggleLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    toggleText: {
      ...textStyles.body,
      color: colors.text.primary,
    },
    switch: {
      width: 48,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.border,
      justifyContent: 'center',
      paddingHorizontal: 2,
    },
    switchThumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.text.inverse,
    },
    switchThumbActive: {
      alignSelf: 'flex-end',
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    frequencyOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    frequencyOption: {
      flex: 1,
      minWidth: '45%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
    },
    frequencyOptionActive: {
      borderColor: colors.success,
      backgroundColor: `${colors.success}10`,
    },
    frequencyText: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    frequencyTextActive: {
      color: colors.success,
      fontWeight: '600',
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
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
    footer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    datePickerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    datePickerContainer: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      width: '90%',
      maxWidth: 400,
    },
    datePickerHeader: {
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    datePickerTitle: {
      ...textStyles.h4,
      color: colors.text.primary,
    },
    datePickerFooter: {
      flexDirection: 'row',
      marginTop: spacing.lg,
    },
  });

export default RecurringIncomeModal;
