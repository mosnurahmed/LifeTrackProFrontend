/**
 * Profile Screen
 *
 * User profile and settings
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store';

const ProfileScreen: React.FC = () => {
  const {
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
    toggleTheme,
    isDark,
  } = useTheme();
  const { user, clearAuth } = useAuthStore();

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
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.card, styles.profileCard]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>
            {user?.email || 'user@example.com'}
          </Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          {/* Dark Mode */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="moon-outline" size={24} color={colors.text.primary} />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          {/* Currency */}
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="cash-outline" size={24} color={colors.text.primary} />
              <Text style={styles.settingText}>Currency</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>BDT (৳)</Text>
              <Icon
                name="chevron-forward"
                size={20}
                color={colors.text.tertiary}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Other Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon
                name="help-circle-outline"
                size={24}
                color={colors.text.primary}
              />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon
                name="information-circle-outline"
                size={24}
                color={colors.text.primary}
              />
              <Text style={styles.settingText}>About</Text>
            </View>
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={clearAuth}>
            <View style={styles.settingLeft}>
              <Icon name="log-out-outline" size={24} color={colors.danger} />
              <Text style={[styles.settingText, { color: colors.danger }]}>
                Logout
              </Text>
            </View>
          </TouchableOpacity>
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
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      margin: spacing.lg,
      ...shadows.md,
    },
    profileCard: {
      alignItems: 'center',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    avatarText: {
      ...textStyles.h2,
      color: colors.text.inverse,
    },
    userName: {
      ...textStyles.h3,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    userEmail: {
      ...textStyles.body,
      color: colors.text.secondary,
      marginBottom: spacing.lg,
    },
    editButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    editButtonText: {
      ...textStyles.bodyMedium,
      color: colors.primary,
    },
    section: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      ...textStyles.h4,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      ...shadows.sm,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingText: {
      ...textStyles.body,
      color: colors.text.primary,
      marginLeft: spacing.md,
    },
    settingRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingValue: {
      ...textStyles.body,
      color: colors.text.secondary,
      marginRight: spacing.sm,
    },
  });

export default ProfileScreen;
