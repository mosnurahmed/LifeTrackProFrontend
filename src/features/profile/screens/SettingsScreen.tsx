/**
 * Settings Screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const textPri  = isDark ? '#F1F5F9' : '#1E293B';
  const textSec  = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC  = isDark ? '#334155' : '#F1F5F9';

  const ROWS = [
    {
      icon: 'notifications-outline',
      iconColor: '#8B5CF6',
      iconBg: '#8B5CF615',
      title: 'Notifications',
      subtitle: 'Manage push notification preferences',
      onPress: () => (navigation as any).navigate('NotificationSettings'),
      showArrow: true,
    },
    {
      icon: isDark ? 'sunny-outline' : 'moon-outline',
      iconColor: isDark ? '#F59E0B' : '#6366F1',
      iconBg: isDark ? '#F59E0B15' : '#6366F115',
      title: 'Dark Mode',
      subtitle: isDark ? 'Currently enabled' : 'Currently disabled',
      onPress: toggleTheme,
      showSwitch: true,
      switchValue: isDark,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, {
        paddingTop: insets.top + 12,
        backgroundColor: surfaceC,
        borderBottomColor: borderC,
      }]}>
        <Text style={[styles.headerTitle, { color: textPri }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        <View style={[styles.section, { backgroundColor: surfaceC, marginTop: 16 }]}>
          {ROWS.map((row, idx) => (
            <TouchableOpacity
              key={row.title}
              style={[styles.row, { borderBottomColor: idx < ROWS.length - 1 ? borderC : 'transparent' }]}
              onPress={row.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, { backgroundColor: row.iconBg }]}>
                <Icon name={row.icon} size={22} color={row.iconColor} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: textPri }]}>{row.title}</Text>
                <Text style={[styles.rowSub, { color: textSec }]}>{row.subtitle}</Text>
              </View>
              {row.showSwitch && (
                <Switch
                  value={row.switchValue}
                  onValueChange={row.onPress}
                  trackColor={{ false: isDark ? '#334155' : '#E2E8F0', true: row.iconColor + '80' }}
                  thumbColor={row.switchValue ? row.iconColor : (isDark ? '#64748B' : '#CBD5E1')}
                />
              )}
              {row.showArrow && (
                <Icon name="chevron-forward" size={18} color={textSec} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.version, { color: textSec }]}>LifeTrack v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  section:     { marginHorizontal: 0 },
  row:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, gap: 14 },
  iconWrap:    { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  rowContent:  { flex: 1 },
  rowTitle:    { fontSize: 15, fontWeight: '600' },
  rowSub:      { fontSize: 12, marginTop: 2 },
  version:     { textAlign: 'center', fontSize: 12, marginTop: 32 },
});

export default SettingsScreen;
