/**
 * Dashboard Screen
 *
 * Home screen with overview
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
// import { useTheme } from '@hooks/useTheme';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation as any).openDrawer()}
          style={styles.menuButton}
        >
          <Icon name="menu" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Icon
            name="notifications-outline"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <View style={[styles.card, styles.welcomeCard]}>
          <Text style={styles.welcomeText}>Welcome back! 👋</Text>
          <Text style={styles.userName}>John Doe</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.card, styles.statCard]}>
            <Text style={styles.statLabel}>Total Expenses</Text>
            <Text style={[styles.statValue, { color: colors.danger }]}>
              ৳15,500
            </Text>
            <Text style={styles.statSubtext}>This month</Text>
          </View>

          <View style={[styles.card, styles.statCard]}>
            <Text style={styles.statLabel}>Savings</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>
              ৳25,000
            </Text>
            <Text style={styles.statSubtext}>Total saved</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: `${colors.primary}20` },
              ]}
            >
              <Icon name="add" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: `${colors.success}20` },
              ]}
            >
              <Icon name="trophy" size={24} color={colors.success} />
            </View>
            <Text style={styles.actionText}>Savings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: `${colors.info}20` },
              ]}
            >
              <Icon name="checkmark-circle" size={24} color={colors.info} />
            </View>
            <Text style={styles.actionText}>Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: `${colors.warning}20` },
              ]}
            >
              <Icon name="cart" size={24} color={colors.warning} />
            </View>
            <Text style={styles.actionText}>Shopping</Text>
          </TouchableOpacity>
        </View>

        {/* Placeholder for charts */}
        <Text style={styles.sectionTitle}>Expense Trends</Text>
        <View style={[styles.card, styles.chartPlaceholder]}>
          <Text style={styles.placeholderText}>Chart will be here</Text>
        </View>
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
    menuButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
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
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...shadows.md,
    },
    welcomeCard: {
      marginBottom: spacing.lg,
      backgroundColor: colors.primary,
    },
    welcomeText: {
      ...textStyles.body,
      color: colors.text.inverse,
      marginBottom: spacing.xs,
    },
    userName: {
      ...textStyles.h3,
      color: colors.text.inverse,
    },
    statsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    statCard: {
      flex: 1,
    },
    statLabel: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    statValue: {
      ...textStyles.h2,
      marginBottom: spacing.xs,
    },
    statSubtext: {
      ...textStyles.caption,
      color: colors.text.tertiary,
    },
    sectionTitle: {
      ...textStyles.h4,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    actionCard: {
      width: '47%',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      alignItems: 'center',
      ...shadows.sm,
    },
    actionIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    actionText: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
    },
    chartPlaceholder: {
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    placeholderText: {
      ...textStyles.body,
      color: colors.text.tertiary,
    },
  });

export default DashboardScreen;
