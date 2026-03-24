/**
 * Conversation Item Component
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

interface ConversationItemProps {
  conversation: {
    userId: string;
    userName: string;
    userAvatar?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
    isOnline?: boolean;
  };
  onPress: () => void;
}

const formatTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-GB', { weekday: 'short' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, onPress }) => {
  const { colors } = useTheme();

  const isDark   = colors.background === '#0F172A';
  const textPri  = isDark ? '#F1F5F9' : '#1E293B';
  const textSec  = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC  = isDark ? '#334155' : '#F1F5F9';

  const initials = conversation.userName
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const hasUnread = (conversation.unreadCount ?? 0) > 0;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: surfaceC, borderBottomColor: borderC }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        {conversation.userAvatar ? (
          <Image source={{ uri: conversation.userAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: '#8B5CF6' }]}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        )}
        {conversation.isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: textPri, fontWeight: hasUnread ? '700' : '600' }]} numberOfLines={1}>
            {conversation.userName}
          </Text>
          <Text style={[styles.time, { color: hasUnread ? '#8B5CF6' : textSec }]}>
            {formatTime(conversation.lastMessageTime)}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <Text
            style={[styles.lastMsg, { color: hasUnread ? textPri : textSec, fontWeight: hasUnread ? '500' : '400' }]}
            numberOfLines={1}
          >
            {conversation.lastMessage || 'No messages yet'}
          </Text>
          {hasUnread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {(conversation.unreadCount ?? 0) > 99 ? '99+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  avatarWrap: { position: 'relative', marginRight: 14 },
  avatar:     { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  initials:   { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  onlineDot:  { position: 'absolute', bottom: 1, right: 1, width: 13, height: 13, borderRadius: 7, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#FFFFFF' },
  content:    { flex: 1 },
  topRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name:       { fontSize: 15, flex: 1, marginRight: 8 },
  time:       { fontSize: 12 },
  bottomRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMsg:    { fontSize: 13, flex: 1, marginRight: 8 },
  badge:      { backgroundColor: '#8B5CF6', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  badgeText:  { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});

export default ConversationItem;
