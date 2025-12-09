import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import {
  //   DrawerContentScrollView,
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
  const { state, navigation } = props;
  const { colors, spacing, textStyles, borderRadius } = useTheme();
  const { user } = useAuthStore();

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: 'home-outline', route: 'HomeTabs' },
    { name: 'Budget', icon: 'stats-chart-outline', route: 'Budget' },
    { name: 'Savings Goals', icon: 'trophy-outline', route: 'Savings' },
    { name: 'Tasks', icon: 'checkmark-circle-outline', route: 'Tasks' },
    { name: 'Notes', icon: 'document-text-outline', route: 'Notes' },
    { name: 'Chat', icon: 'chatbubbles-outline', route: 'Chat', badge: 3 },
    { name: 'Settings', icon: 'settings-outline', route: 'Settings' },
  ];

  const currentRoute = state.routeNames[state.index];

  const handleNavigate = (route: string) => {
    navigation.navigate(route);
  };

  const styles = createStyles(colors, spacing, textStyles, borderRadius);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>
          {user?.email || 'user@example.com'}
        </Text>
      </View>

      <ScrollView
        style={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item, index) => {
          const isActive = currentRoute === item.route;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => handleNavigate(item.route)}
              activeOpacity={0.7}
            >
              <Icon
                name={item.icon}
                size={22}
                color={isActive ? colors.primary : colors.text.secondary}
              />
              <Text
                style={[styles.menuText, isActive && styles.menuTextActive]}
              >
                {item.name}
              </Text>
              {item.badge && item.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <Icon name="log-out-outline" size={22} color={colors.danger} />
          <Text style={[styles.menuText, { color: colors.danger }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </View>
  );
};

const createStyles = (
  colors: any,
  spacing: any,
  textStyles: any,
  borderRadius: any,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: spacing.lg,
      paddingTop: spacing['3xl'],
      backgroundColor: colors.primary,
      alignItems: 'center',
      borderBottomLeftRadius: borderRadius.lg,
      borderBottomRightRadius: borderRadius.lg,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarText: {
      ...textStyles.h2,
      color: colors.primary,
      fontWeight: '700',
    },
    userName: {
      ...textStyles.h4,
      color: colors.text.inverse,
      marginBottom: spacing.xs,
    },
    userEmail: {
      ...textStyles.caption,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    menuContainer: {
      flex: 1,
      paddingVertical: spacing.md,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      marginHorizontal: spacing.md,
      borderRadius: borderRadius.md,
    },
    menuItemActive: {
      backgroundColor: `${colors.primary}15`,
    },
    menuText: {
      ...textStyles.bodyMedium,
      marginLeft: spacing.md,
      flex: 1,
      color: colors.text.primary,
    },
    menuTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    badge: {
      backgroundColor: colors.danger,
      borderRadius: borderRadius.full,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xs,
    },
    badgeText: {
      ...textStyles.caption,
      color: colors.text.inverse,
      fontSize: 10,
      fontWeight: '700',
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: spacing.md,
      marginHorizontal: spacing.lg,
    },
    footer: {
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      alignItems: 'center',
    },
    version: {
      ...textStyles.caption,
      color: colors.text.secondary,
    },
  });

export default CustomDrawer;
