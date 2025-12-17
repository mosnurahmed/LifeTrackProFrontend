/**
 * Custom Drawer Navigator
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';

interface MenuItem {
  name: string;
  icon: string;
  route: string;
  badge?: number;
}

const CustomDrawer: React.FC<DrawerContentComponentProps> = props => {
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();
  const { user, clearAuth } = useAuthStore();

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'home-outline', route: 'HomeTabs' },
    { name: 'Expenses', icon: 'wallet-outline', route: 'Expenses' },
    { name: 'Categories', icon: 'apps-outline', route: 'Categories' },
    { name: 'Budget', icon: 'stats-chart-outline', route: 'Budget' },
    { name: 'Bazar Lists', icon: 'list-outline', route: 'Bazar' },
    { name: 'Savings Goals', icon: 'trophy-outline', route: 'Savings' },
    { name: 'Tasks', icon: 'checkmark-circle-outline', route: 'Tasks' },
    { name: 'Notes', icon: 'document-text-outline', route: 'Notes' },
    { name: 'Chat', icon: 'chatbubbles-outline', route: 'Chat', badge: 3 },
    { name: 'Settings', icon: 'settings-outline', route: 'Settings' },
  ];

  const handleLogout = () => {
    clearAuth();
  };

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => {
            const isFocused = props.state.index === index;

            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.menuItem, isFocused && styles.menuItemActive]}
                onPress={() => props.navigation.navigate(item.route)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <Icon
                    name={item.icon}
                    size={24}
                    color={isFocused ? colors.primary : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      isFocused && styles.menuItemTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>
                {item.badge !== undefined && item.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* Logout Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color={colors.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
    scrollContent: {
      flexGrow: 1,
    },
    profileSection: {
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    avatarContainer: {
      marginBottom: spacing.md,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.primary,
    },
    avatarText: {
      ...textStyles.h2,
      color: colors.text.inverse,
      fontWeight: '700',
    },
    userName: {
      ...textStyles.h4,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    userEmail: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
    menuSection: {
      paddingVertical: spacing.md,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginHorizontal: spacing.md,
      marginVertical: spacing.xs,
      borderRadius: borderRadius.md,
    },
    menuItemActive: {
      backgroundColor: `${colors.primary}15`,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    menuItemText: {
      ...textStyles.body,
      color: colors.text.secondary,
      marginLeft: spacing.md,
    },
    menuItemTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    badge: {
      backgroundColor: colors.danger,
      borderRadius: borderRadius.full,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xs,
    },
    badgeText: {
      ...textStyles.caption,
      fontSize: 12,
      color: colors.text.inverse,
      fontWeight: '700',
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: spacing.lg,
      backgroundColor: colors.surface,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
    },
    logoutText: {
      ...textStyles.bodyMedium,
      color: colors.danger,
      marginLeft: spacing.md,
    },
  });

export default CustomDrawer;
