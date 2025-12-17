/**
 * Export Expenses Modal
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { Button } from '../../../components/common';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  onExport: (format: 'csv' | 'pdf') => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  onExport,
}) => {
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'pdf'>('csv');

  const formats = [
    {
      id: 'csv' as const,
      label: 'CSV File',
      description: 'Excel compatible spreadsheet',
      icon: 'document-text-outline',
    },
    {
      id: 'pdf' as const,
      label: 'PDF Document',
      description: 'Printable report',
      icon: 'document-outline',
    },
  ];

  const handleExport = () => {
    onExport(selectedFormat);
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
            <Text style={styles.title}>Export Expenses</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Select Format</Text>
            {formats.map(format => (
              <TouchableOpacity
                key={format.id}
                style={[
                  styles.formatOption,
                  selectedFormat === format.id && styles.formatOptionSelected,
                ]}
                onPress={() => setSelectedFormat(format.id)}
              >
                <Icon
                  name={format.icon}
                  size={32}
                  color={
                    selectedFormat === format.id
                      ? colors.primary
                      : colors.text.secondary
                  }
                />
                <View style={styles.formatInfo}>
                  <Text style={styles.formatLabel}>{format.label}</Text>
                  <Text style={styles.formatDescription}>
                    {format.description}
                  </Text>
                </View>
                {selectedFormat === format.id && (
                  <Icon
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Button
              variant="outline"
              onPress={onClose}
              style={{ flex: 1, marginRight: spacing.sm }}
            >
              Cancel
            </Button>
            <Button
              onPress={handleExport}
              style={{ flex: 1, marginLeft: spacing.sm }}
            >
              Export
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
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    container: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      width: '100%',
      maxWidth: 400,
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
      padding: spacing.lg,
    },
    label: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    formatOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: spacing.md,
      gap: spacing.md,
    },
    formatOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}10`,
    },
    formatInfo: {
      flex: 1,
    },
    formatLabel: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: 4,
    },
    formatDescription: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });

export default ExportModal;
