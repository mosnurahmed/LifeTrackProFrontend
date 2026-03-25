/**
 * Chat Screen — One-to-one messaging (polling-based)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View, FlatList, StyleSheet, KeyboardAvoidingView, Platform,
  Text, TouchableOpacity, TextInput, ActivityIndicator, Keyboard,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../store/authStore';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useConfirm } from '../../../components/common/ConfirmModal';
import {
  useMessages, useSendMessage, useMarkAsRead, useDeleteMessage,
  useOnlineStatus, useHeartbeat,
} from '../../../hooks/api/useChat';
import { useQueryClient } from '@tanstack/react-query';

interface RouteParams {
  userId: string;
  userName: string;
}

// ─── Bubble ───────────────────────────────────────────────────────────────────

const Bubble = ({ msg, isOwn, onDelete, isDark, primary }: {
  msg: any; isOwn: boolean; onDelete?: () => void; isDark: boolean; primary: string;
}) => {
  const time = (() => {
    try { return new Date(msg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  })();

  return (
    <TouchableOpacity
      style={[bSt.row, isOwn ? bSt.rowOwn : bSt.rowOther]}
      onLongPress={onDelete}
      activeOpacity={0.85}
    >
      <View style={[bSt.bubble, isOwn
        ? [bSt.ownBubble, { backgroundColor: primary }]
        : [bSt.otherBubble, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]
      ]}>
        <Text style={[bSt.msgText, { color: isOwn ? '#FFFFFF' : isDark ? '#F1F5F9' : '#1E293B' }]}>
          {msg.message}
        </Text>
        <View style={bSt.meta}>
          <Text style={[bSt.timeText, { color: isOwn ? 'rgba(255,255,255,0.65)' : isDark ? '#64748B' : '#94A3B8' }]}>
            {time}
          </Text>
          {isOwn && <Text style={bSt.tick}>{msg.isRead ? '✓✓' : '✓'}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const bSt = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 3, maxWidth: '80%' },
  rowOwn: { alignSelf: 'flex-end' },
  rowOther: { alignSelf: 'flex-start' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  ownBubble: { borderBottomRightRadius: 4 },
  otherBubble: { borderBottomLeftRadius: 4 },
  msgText: { fontSize: 14, lineHeight: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 3 },
  timeText: { fontSize: 10 },
  tick: { fontSize: 10, color: 'rgba(255,255,255,0.8)' },
});

// ─── Chat Screen ──────────────────────────────────────────────────────────────

const ChatScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#E2E8F0';
  const inputBg = isDark ? '#0F172A' : '#F1F5F9';

  const { userId, userName } = route.params as RouteParams;
  const currentUserId = useAuthStore(s => s.user?.id ?? '');

  const [inputText, setInputText] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatRef = useRef<FlatList>(null);

  // Queries with polling
  const { data: messagesData, isLoading } = useMessages(userId);
  const { data: onlineData } = useOnlineStatus(userId);
  const sendMutation = useSendMessage();
  const markMutation = useMarkAsRead();
  const deleteMutation = useDeleteMessage();
  const heartbeatMutation = useHeartbeat();

  const messages: any[] = (() => {
    const raw = (messagesData as any)?.data;
    return Array.isArray(raw) ? raw : [];
  })();

  const isOnline = onlineData?.isOnline ?? false;

  const initials = userName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  // Keyboard tracking
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Mark as read + heartbeat on mount
  useEffect(() => {
    markMutation.mutate(userId);
    heartbeatMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Polling: refetch messages every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['messages', userId] });
      heartbeatMutation.mutate();
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    try {
      await sendMutation.mutateAsync({ receiverId: userId, message: text });
      queryClient.invalidateQueries({ queryKey: ['messages', userId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch {}
  };

  const handleDelete = async (msgId: string) => {
    const fiveMin = new Date(Date.now() - 5 * 60 * 1000);
    const msg = messages.find(m => m._id === msgId);
    if (msg && new Date(msg.createdAt) < fiveMin) return;
    const ok = await confirm({ title: 'Delete Message', message: 'Delete this message?', confirmText: 'Delete', variant: 'danger' });
    if (ok) deleteMutation.mutate(msgId);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: surfaceC, borderBottomColor: borderC }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={textPri} />
        </TouchableOpacity>
        <View style={styles.headerUser}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={[styles.headerName, { color: textPri }]}>{userName}</Text>
            <Text style={[styles.headerStatus, { color: isOnline ? '#22C55E' : textSec }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <Bubble
              msg={item}
              isOwn={item.senderId === currentUserId}
              onDelete={item.senderId === currentUserId ? () => handleDelete(item._id) : undefined}
              isDark={isDark}
              primary={colors.primary}
            />
          )}
          contentContainerStyle={styles.msgList}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />
      )}

      {/* Input Bar */}
      <View style={[styles.inputBar, { backgroundColor: surfaceC, borderTopColor: borderC, paddingBottom: keyboardVisible ? 8 : insets.bottom + 8 }]}>
        <View style={[styles.inputWrap, { backgroundColor: inputBg, borderColor: borderC }]}>
          <TextInput
            style={[styles.input, { color: textPri }]}
            placeholder="Type a message..."
            placeholderTextColor={textSec}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={5000}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: inputText.trim() ? colors.primary : borderC }]}
          onPress={handleSend}
          disabled={!inputText.trim() || sendMutation.isPending}
        >
          <Icon name="send" size={16} color={inputText.trim() ? '#FFFFFF' : textSec} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerUser: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  headerName: { fontSize: 14, fontWeight: '700' },
  headerStatus: { fontSize: 11, marginTop: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  msgList: { paddingVertical: 12, paddingBottom: 8 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingTop: 8, borderTopWidth: 1, gap: 8 },
  inputWrap: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, maxHeight: 100 },
  input: { fontSize: 14, lineHeight: 20, maxHeight: 80 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
});

export default ChatScreen;
