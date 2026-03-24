/**
 * Notifications List Screen
 * Shows all notifications except chat messages.
 */

import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
  useClearAllNotifications,
} from '../../../hooks/api/useNotifications';
import { formatRelativeTime } from '../../../utils/formatters';

// ─── Icon / color config per type ─────────────────────────────────────────────

const TYPE_META: Record<string, { icon: string; color: string; bg: string }> = {
  expense_added:      { icon: 'wallet',             color: '#EF4444', bg: '#EF444415' },
  income_added:       { icon: 'cash',               color: '#10B981', bg: '#10B98115' },
  budget_warning:     { icon: 'warning',            color: '#F97316', bg: '#F9731615' },
  budget_exceeded:    { icon: 'alert-circle',       color: '#EF4444', bg: '#EF444415' },
  task_reminder:      { icon: 'alarm',              color: '#06B6D4', bg: '#06B6D415' },
  task_due_today:     { icon: 'time',               color: '#F59E0B', bg: '#F59E0B15' },
  savings_milestone:  { icon: 'trending-up',        color: '#10B981', bg: '#10B98115' },
  savings_completed:  { icon: 'trophy',             color: '#F59E0B', bg: '#F59E0B15' },
  default:            { icon: 'notifications',      color: '#8B5CF6', bg: '#8B5CF615' },
};

const getMeta = (type: string) => TYPE_META[type] ?? TYPE_META.default;

// ─── Single Row ───────────────────────────────────────────────────────────────

const NotifRow = ({
  item, isDark, borderC, textPri, textSec, surfaceC,
  onPress, onDelete,
}: {
  item: any;
  isDark: boolean;
  borderC: string;
  textPri: string;
  textSec: string;
  surfaceC: string;
  onPress: () => void;
  onDelete: () => void;
}) => {
  const meta = getMeta(item.type);

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: surfaceC, borderBottomColor: borderC }]}
      onPress={onPress}
      onLongPress={() =>
        Alert.alert('Delete', 'Remove this notification?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: onDelete },
        ])
      }
      activeOpacity={0.75}
    >
      {/* Unread dot */}
      {!item.isRead && <View style={styles.unreadDot} />}

      <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
        <Icon name={meta.icon} size={20} color={meta.color} />
      </View>

      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: textPri, fontWeight: item.isRead ? '500' : '700' }]}>
          {item.title}
        </Text>
        <Text style={[styles.rowBody, { color: textSec }]} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={[styles.rowTime, { color: isDark ? '#475569' : '#94A3B8' }]}>
          {formatRelativeTime(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const NotificationsListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const { data: notifications = [], isRefetching, refetch } = useNotifications();
  const { mutate: markRead }    = useMarkRead();
  const { mutate: markAllRead } = useMarkAllRead();
  const { mutate: deleteNotif } = useDeleteNotification();
  const { mutate: clearAll }    = useClearAllNotifications();

  const textPri  = isDark ? '#F1F5F9' : '#1E293B';
  const textSec  = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC  = isDark ? '#334155' : '#F1F5F9';
  const bgColor  = colors.background;

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handlePress = (item: any) => {
    if (!item.isRead) markRead(item._id);
  };

  const handleClearAll = () => {
    Alert.alert('Clear All', 'Remove all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearAll() },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, {
        paddingTop: insets.top + 10,
        backgroundColor: surfaceC,
        borderBottomColor: borderC,
      }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={textPri} />
        </TouchableOpacity>

        <View>
          <Text style={[styles.headerTitle, { color: textPri }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[styles.headerSub, { color: textSec }]}>{unreadCount} unread</Text>
          )}
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.iconBtn} onPress={() => markAllRead()}>
              <Icon name="checkmark-done" size={22} color="#8B5CF6" />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity style={styles.iconBtn} onPress={handleClearAll}>
              <Icon name="trash-outline" size={20} color={textSec} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => (
          <NotifRow
            item={item}
            isDark={isDark}
            borderC={borderC}
            textPri={textPri}
            textSec={textSec}
            surfaceC={surfaceC}
            onPress={() => handlePress(item)}
            onDelete={() => deleteNotif(item._id)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
        contentContainerStyle={[
          { paddingBottom: insets.bottom + 24 },
          notifications.length === 0 && styles.emptyContainer,
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
              <Icon name="notifications-off-outline" size={40} color={textSec} />
            </View>
            <Text style={[styles.emptyTitle, { color: textPri }]}>All caught up!</Text>
            <Text style={[styles.emptyDesc, { color: textSec }]}>
              No notifications yet. They'll appear here when you have activity.
            </Text>
          </View>
        }
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:   { flex: 1 },

  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 12, borderBottomWidth: 1, gap: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSub:   { fontSize: 12, marginTop: 1 },
  iconBtn:     { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerActions:{ flexDirection: 'row', marginLeft: 'auto' },

  row:         { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 12 },
  unreadDot:   { position: 'absolute', left: 6, top: 20, width: 7, height: 7, borderRadius: 4, backgroundColor: '#8B5CF6' },
  iconWrap:    { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  rowContent:  { flex: 1 },
  rowTitle:    { fontSize: 14, marginBottom: 3 },
  rowBody:     { fontSize: 13, lineHeight: 19 },
  rowTime:     { fontSize: 11, marginTop: 5 },

  emptyContainer: { flex: 1 },
  empty:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon:   { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle:  { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyDesc:   { fontSize: 14, textAlign: 'center', lineHeight: 21 },
});

export default NotificationsListScreen;
