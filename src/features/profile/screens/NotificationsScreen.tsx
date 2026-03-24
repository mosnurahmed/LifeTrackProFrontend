/**
 * Notifications Settings Screen
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';
import notificationService from '../../../services/notificationService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotifPrefs {
  expense:  boolean;
  chat:     boolean;
  budget:   boolean;
  task:     boolean;
  savings:  boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  expense: true,
  chat:    true,
  budget:  true,
  task:    true,
  savings: true,
};

const PREFS_KEY = 'notification_prefs';

// ─── Notification Categories Config ──────────────────────────────────────────

const CATEGORIES = [
  {
    key: 'chat' as const,
    icon: 'chatbubbles',
    iconColor: '#8B5CF6',
    iconBg: '#8B5CF615',
    title: 'Chat Messages',
    desc: 'When someone sends you a new message',
  },
  {
    key: 'expense' as const,
    icon: 'wallet',
    iconColor: '#EF4444',
    iconBg: '#EF444415',
    title: 'Expense Added',
    desc: 'Confirmation when an expense is recorded',
  },
  {
    key: 'budget' as const,
    icon: 'pie-chart',
    iconColor: '#F97316',
    iconBg: '#F9731615',
    title: 'Budget Alerts',
    desc: 'When you reach 80% or exceed your budget',
  },
  {
    key: 'task' as const,
    icon: 'checkmark-circle',
    iconColor: '#0EA5E9',
    iconBg: '#0EA5E915',
    title: 'Task Reminders',
    desc: 'Reminders for upcoming and due tasks',
  },
  {
    key: 'savings' as const,
    icon: 'trending-up',
    iconColor: '#22C55E',
    iconBg: '#22C55E15',
    title: 'Savings Milestones',
    desc: 'When you hit 25%, 50%, 75% or 100% of a goal',
  },
];

// ─── Row Component ────────────────────────────────────────────────────────────

const PrefRow = ({
  cat, value, onChange, isDark, borderC, textPri, textSec,
}: {
  cat: typeof CATEGORIES[0];
  value: boolean;
  onChange: (v: boolean) => void;
  isDark: boolean;
  borderC: string;
  textPri: string;
  textSec: string;
}) => (
  <View style={[styles.row, { borderBottomColor: borderC }]}>
    <View style={[styles.iconWrap, { backgroundColor: cat.iconBg }]}>
      <Icon name={cat.icon} size={22} color={cat.iconColor} />
    </View>
    <View style={styles.rowContent}>
      <Text style={[styles.rowTitle, { color: textPri }]}>{cat.title}</Text>
      <Text style={[styles.rowDesc, { color: textSec }]} numberOfLines={2}>{cat.desc}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: isDark ? '#334155' : '#E2E8F0', true: cat.iconColor + '80' }}
      thumbColor={value ? cat.iconColor : (isDark ? '#64748B' : '#CBD5E1')}
    />
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [permGranted, setPermGranted] = useState<boolean | null>(null);
  const [testing, setTesting] = useState(false);

  const isDark   = colors.background === '#0F172A';
  const textPri  = isDark ? '#F1F5F9' : '#1E293B';
  const textSec  = isDark ? '#94A3B8' : '#64748B';
  const bgColor  = colors.background;
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC  = isDark ? '#334155' : '#F1F5F9';

  useEffect(() => {
    // Load saved prefs
    AsyncStorage.getItem(PREFS_KEY).then(raw => {
      if (raw) setPrefs(JSON.parse(raw));
    });
    // Check permission
    notificationService.checkPermission().then(setPermGranted);
  }, []);

  const savePrefs = useCallback(async (updated: NotifPrefs) => {
    setPrefs(updated);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  }, []);

  const togglePref = (key: keyof NotifPrefs) => {
    savePrefs({ ...prefs, [key]: !prefs[key] });
  };

  const enableAll = () => savePrefs({ expense: true, chat: true, budget: true, task: true, savings: true });
  const disableAll = () => savePrefs({ expense: false, chat: false, budget: false, task: false, savings: false });

  const requestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermGranted(granted);
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device Settings to receive alerts.',
        [{ text: 'OK' }],
      );
    }
  };

  const sendTestNotification = async () => {
    if (!permGranted) { requestPermission(); return; }
    setTesting(true);
    try {
      await notificationService.displayNotification(
        '🔔 Test Notification',
        'LifeTrack notifications are working correctly!',
        { type: 'default' },
      );
      Alert.alert('Sent!', 'Check your notification tray.');
    } catch {
      Alert.alert('Error', 'Could not send test notification.');
    } finally {
      setTesting(false);
    }
  };

  const allOn  = Object.values(prefs).every(Boolean);
  const allOff = Object.values(prefs).every(v => !v);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, {
        paddingTop: insets.top + 12,
        backgroundColor: surfaceC,
        borderBottomColor: borderC,
      }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={textPri} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPri }]}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>

        {/* Permission Banner */}
        {permGranted === false && (
          <TouchableOpacity
            style={styles.permBanner}
            onPress={requestPermission}
          >
            <Icon name="warning" size={18} color="#FFFFFF" />
            <Text style={styles.permBannerText}>
              Notifications are disabled. Tap to enable.
            </Text>
            <Icon name="chevron-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {permGranted === true && (
          <View style={[styles.permOkBanner, { backgroundColor: '#22C55E15' }]}>
            <Icon name="checkmark-circle" size={18} color="#22C55E" />
            <Text style={[styles.permOkText, { color: '#22C55E' }]}>
              Notifications are enabled
            </Text>
          </View>
        )}

        {/* Quick controls */}
        <View style={[styles.section, { backgroundColor: surfaceC }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: borderC }]}>
            <Text style={[styles.sectionTitle, { color: textPri }]}>Notification Types</Text>
            <View style={styles.quickBtns}>
              <TouchableOpacity
                style={[styles.quickBtn, { backgroundColor: allOn ? '#8B5CF620' : (isDark ? '#334155' : '#F1F5F9') }]}
                onPress={allOn ? disableAll : enableAll}
              >
                <Text style={[styles.quickBtnText, { color: allOn ? '#8B5CF6' : textSec }]}>
                  {allOn ? 'Disable All' : 'Enable All'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {CATEGORIES.map((cat, idx) => (
            <PrefRow
              key={cat.key}
              cat={cat}
              value={prefs[cat.key]}
              onChange={() => togglePref(cat.key)}
              isDark={isDark}
              borderC={idx === CATEGORIES.length - 1 ? 'transparent' : borderC}
              textPri={textPri}
              textSec={textSec}
            />
          ))}
        </View>

        {/* How it works */}
        <View style={[styles.section, { backgroundColor: surfaceC, marginTop: 12 }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: borderC }]}>
            <Text style={[styles.sectionTitle, { color: textPri }]}>How It Works</Text>
          </View>
          {[
            { icon: 'phone-portrait-outline', text: 'Notifications appear even when the app is closed' },
            { icon: 'volume-high-outline',    text: 'Tap a notification to open the relevant screen' },
            { icon: 'moon-outline',           text: 'Preferences are saved and applied immediately' },
          ].map((item, i) => (
            <View key={i} style={[styles.infoRow, { borderBottomColor: i < 2 ? borderC : 'transparent' }]}>
              <Icon name={item.icon} size={18} color={textSec} style={{ marginRight: 12 }} />
              <Text style={[styles.infoText, { color: textSec }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Test button */}
        <TouchableOpacity
          style={[styles.testBtn, { opacity: testing ? 0.7 : 1 }]}
          onPress={sendTestNotification}
          disabled={testing}
        >
          {testing
            ? <ActivityIndicator color="#FFFFFF" />
            : <>
                <Icon name="notifications" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.testBtnText}>Send Test Notification</Text>
              </>
          }
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:       { flex: 1 },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn:         { padding: 4 },
  headerTitle:     { fontSize: 18, fontWeight: '700' },

  permBanner:      { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EF4444', paddingHorizontal: 20, paddingVertical: 14 },
  permBannerText:  { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  permOkBanner:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 12 },
  permOkText:      { fontSize: 13, fontWeight: '600' },

  section:         { marginTop: 12, borderRadius: 0 },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  sectionTitle:    { fontSize: 15, fontWeight: '700' },
  quickBtns:       { flexDirection: 'row', gap: 8 },
  quickBtn:        { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  quickBtnText:    { fontSize: 12, fontWeight: '600' },

  row:             { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, gap: 14 },
  iconWrap:        { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  rowContent:      { flex: 1 },
  rowTitle:        { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  rowDesc:         { fontSize: 12, lineHeight: 18 },

  infoRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 13, borderBottomWidth: 1 },
  infoText:        { fontSize: 13, flex: 1, lineHeight: 19 },

  testBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 20, backgroundColor: '#8B5CF6', paddingVertical: 16, borderRadius: 16 },
  testBtnText:     { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default NotificationsScreen;
