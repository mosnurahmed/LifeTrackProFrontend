/**
 * Profile Screen — Professional minimal design
 */

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store';
import { AppHeader, useGuide } from '../../../components/common';

// ─── Menu Row ────────────────────────────────────────────────────────────────

const MenuRow = ({
  icon, label, color, chevron = true, right, onPress, textColor, iconBg,
}: {
  icon: string; label: string; color: string; chevron?: boolean;
  right?: React.ReactNode; onPress?: () => void; textColor?: string; iconBg?: string;
}) => (
  <TouchableOpacity
    style={styles.menuRow}
    onPress={onPress}
    activeOpacity={onPress ? 0.6 : 1}
    disabled={!onPress && !right}
  >
    <View style={[styles.menuIcon, { backgroundColor: iconBg || `${color}14` }]}>
      <Icon name={icon} size={18} color={color} />
    </View>
    <Text style={[styles.menuLabel, { color: textColor || '#1E293B' }]}>{label}</Text>
    {right || (chevron && (
      <Icon name="chevron-forward" size={16} color="#CBD5E1" />
    ))}
  </TouchableOpacity>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

const ProfileScreen: React.FC = () => {
  const { colors, toggleTheme, isDark } = useTheme();
  const { user, clearAuth } = useAuthStore();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const { GuideButton, GuideView } = useGuide('profile');

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';
  const bgColor = colors.background;
  const primary = colors.primary;

  const initial = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <AppHeader title="Profile" showDrawer />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      >
        {/* ── Profile Card ──────────────────────────────────────── */}
        <View style={[styles.profileCard, { backgroundColor: surfaceC, borderColor: borderC }]}>
          <View style={[styles.avatar, { backgroundColor: primary }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: textPri }]}>{user?.name || 'User'}</Text>
            <Text style={[styles.userEmail, { color: textSec }]}>{user?.email || 'user@example.com'}</Text>
          </View>
          <TouchableOpacity style={[styles.editBtn, { borderColor: `${primary}40` }]}
            onPress={() => (navigation as any).navigate('EditProfile')}>
            <Icon name="create-outline" size={14} color={primary} />
            <Text style={[styles.editBtnText, { color: primary }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── Preferences ───────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textSec }]}>PREFERENCES</Text>
          <View style={[styles.menuGroup, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <MenuRow
              icon="moon-outline" label="Dark Mode" color="#8B5CF6"
              textColor={textPri} chevron={false}
              right={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: borderC, true: primary }}
                  thumbColor="#FFFFFF"
                  style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                />
              }
            />
            <View style={[styles.divider, { backgroundColor: borderC }]} />
            <MenuRow icon="cash-outline" label="Currency" color="#10B981" textColor={textPri}
              right={<Text style={[styles.menuValue, { color: textSec }]}>BDT (৳)</Text>}
            />
            <View style={[styles.divider, { backgroundColor: borderC }]} />
            <MenuRow icon="notifications-outline" label="Notifications" color="#F59E0B" textColor={textPri}
              onPress={() => (navigation as any).navigate('NotificationsList')}
            />
          </View>
        </View>

        {/* ── General ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textSec }]}>GENERAL</Text>
          <View style={[styles.menuGroup, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <MenuRow icon="key-outline" label="Change Password" color="#F59E0B" textColor={textPri}
              onPress={() => (navigation as any).navigate('ChangePassword')}
            />
            <View style={[styles.divider, { backgroundColor: borderC }]} />
            <MenuRow icon="shield-checkmark-outline" label="Privacy & Security" color="#06B6D4" textColor={textPri} />
            <View style={[styles.divider, { backgroundColor: borderC }]} />
            <MenuRow icon="help-circle-outline" label="Help & Support" color="#3B82F6" textColor={textPri} />
            <View style={[styles.divider, { backgroundColor: borderC }]} />
            <MenuRow icon="information-circle-outline" label="About" color="#8B5CF6" textColor={textPri}
              right={<Text style={[styles.menuValue, { color: textSec }]}>v1.0.0</Text>}
            />
          </View>
        </View>

        {/* ── Logout ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: isDark ? '#7F1D1D20' : '#FEF2F2', borderColor: isDark ? '#7F1D1D40' : '#FECACA' }]}
            onPress={clearAuth}
            activeOpacity={0.7}
          >
            <Icon name="log-out-outline" size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Profile card
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 12, marginBottom: 8,
    padding: 16, borderRadius: 14, borderWidth: 1,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  profileInfo: { flex: 1, marginLeft: 14 },
  userName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  userEmail: { fontSize: 12 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  editBtnText: { fontSize: 12, fontWeight: '600' },

  // Sections
  section: { marginTop: 16, marginHorizontal: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },

  // Menu group
  menuGroup: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13,
  },
  menuIcon: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500', marginLeft: 12 },
  menuValue: { fontSize: 13, marginRight: 4 },
  divider: { height: 1, marginLeft: 58 },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1,
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
});

export default ProfileScreen;
