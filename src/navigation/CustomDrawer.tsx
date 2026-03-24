/**
 * Custom Drawer — Professional Minimal
 */

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';

interface MenuItem {
  name: string;
  icon: string;
  route: string;
}

const MENU: MenuItem[] = [
  { name: 'Dashboard',  icon: 'home-outline',              route: 'HomeTabs' },
  { name: 'Expenses',   icon: 'wallet-outline',            route: 'Expenses' },
  { name: 'Categories', icon: 'grid-outline',              route: 'Categories' },
  { name: 'Budget',     icon: 'pie-chart-outline',         route: 'Budget' },
  { name: 'Bazar',      icon: 'cart-outline',              route: 'Bazar' },
  { name: 'Savings',    icon: 'trending-up-outline',       route: 'Savings' },
  { name: 'Tasks',      icon: 'checkmark-circle-outline',  route: 'Tasks' },
  { name: 'Notes',      icon: 'document-text-outline',     route: 'Notes' },
  { name: 'Chat',       icon: 'chatbubble-outline',        route: 'Chat' },
  { name: 'Settings',   icon: 'settings-outline',          route: 'Settings' },
];

const CustomDrawer: React.FC<DrawerContentComponentProps> = props => {
  const { colors, isDark } = useTheme();
  const { user, clearAuth } = useAuthStore();
  const insets = useSafeAreaInsets();

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const borderC = isDark ? '#334155' : '#F1F5F9';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile */}
        <View style={[styles.profile, { borderBottomColor: borderC, paddingTop: insets.top + 8 }]}>
          <View style={[styles.avatarRing, { borderColor: colors.primary + '40' }]}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarLetter}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: textPri }]} numberOfLines={1}>
              {user?.name || 'User'}
            </Text>
            <Text style={[styles.userEmail, { color: textSec }]} numberOfLines={1}>
              {user?.email || ''}
            </Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU.map((item, index) => {
            const isFocused = props.state.index === index;
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.menuItem, isFocused && { backgroundColor: colors.primary + '12' }]}
                onPress={() => props.navigation.navigate(item.route)}
                activeOpacity={0.7}
              >
                <Icon
                  name={isFocused ? item.icon.replace('-outline', '') || item.icon : item.icon}
                  size={18}
                  color={isFocused ? colors.primary : textSec}
                />
                <Text style={[
                  styles.menuText,
                  { color: isFocused ? colors.primary : textPri },
                  isFocused && { fontWeight: '700' },
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: borderC }]}>
        <TouchableOpacity style={styles.logoutBtn} onPress={clearAuth} activeOpacity={0.7}>
          <Icon name="log-out-outline" size={18} color="#C75050" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingTop: 0 },

  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatarRing: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center',
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarLetter: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  profileInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700' },
  userEmail: { fontSize: 12, marginTop: 1 },

  menu: { paddingVertical: 8, paddingHorizontal: 10 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 11, paddingHorizontal: 14, borderRadius: 10, marginVertical: 1,
  },
  menuText: { fontSize: 14, fontWeight: '500' },

  footer: { borderTopWidth: 1, paddingHorizontal: 18, paddingVertical: 14 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 4 },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#C75050' },
});

export default CustomDrawer;
