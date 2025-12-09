/**
 * Bazar Screen
 *
 * Shopping lists
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@hooks/useTheme';

const BazarScreen: React.FC = () => {
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const mockLists = [
    {
      id: '1',
      title: 'Weekly Groceries',
      items: 8,
      completed: 3,
      budget: 2000,
    },
    {
      id: '2',
      title: 'Party Shopping',
      items: 12,
      completed: 12,
      budget: 5000,
    },
  ];

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.listCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.listTitle}>{item.title}</Text>
        <Icon
          name={
            item.completed === item.items ? 'checkmark-circle' : 'time-outline'
          }
          size={24}
          color={
            item.completed === item.items ? colors.success : colors.warning
          }
        />
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(item.completed / item.items) * 100}%` },
          ]}
        />
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.itemsText}>
          {item.completed}/{item.items} items
        </Text>
        <Text style={styles.budgetText}>Budget: ৳{item.budget}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Lists</Text>
        <TouchableOpacity>
          <Icon name="search" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={mockLists}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Icon name="add" size={28} color={colors.text.inverse} />
      </TouchableOpacity>
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
    },
    listContent: {
      padding: spacing.lg,
    },
    listCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    listTitle: {
      ...textStyles.h4,
      color: colors.text.primary,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: borderRadius.full,
      marginBottom: spacing.md,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: borderRadius.full,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    itemsText: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    budgetText: {
      ...textStyles.captionMedium,
      color: colors.primary,
    },
    fab: {
      position: 'absolute',
      bottom: 80,
      right: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.lg,
    },
  });

export default BazarScreen;
