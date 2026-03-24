/**
 * Chat Screen — One-to-one messaging
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import {
  useMessages,
  useSendMessage,
  useMarkAsRead,
  useDeleteMessage,
} from '../../../hooks/api/useChat';
import { TypingIndicator } from '../components/TypingIndicator';
import socketService from '../../../services/socketService';

interface RouteParams {
  userId: string;
  userName: string;
  userAvatar?: string;
  isOnline?: boolean;
}

// ─── Message Bubble ────────────────────────────────────────────────────────────

const Bubble = ({
  msg,
  isOwn,
  onDelete,
  isDark,
}: {
  msg: any;
  isOwn: boolean;
  onDelete?: () => void;
  isDark: boolean;
}) => {
  const time = (() => {
    try {
      return new Date(msg.createdAt).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  })();

  const handleLongPress = () => {
    if (!isOwn || !onDelete) return;
    const fiveMin = new Date(Date.now() - 5 * 60 * 1000);
    if (new Date(msg.createdAt) < fiveMin) {
      Alert.alert(
        'Cannot Delete',
        'Only messages within 5 minutes can be deleted.',
      );
      return;
    }
    Alert.alert('Delete Message', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity
      style={[bStyles.row, isOwn ? bStyles.rowOwn : bStyles.rowOther]}
      onLongPress={handleLongPress}
      activeOpacity={0.85}
    >
      <View
        style={[
          bStyles.bubble,
          isOwn
            ? [bStyles.ownBubble, { backgroundColor: '#8B5CF6' }]
            : [
                bStyles.otherBubble,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ],
        ]}
      >
        <Text
          style={[
            bStyles.msgText,
            { color: isOwn ? '#FFFFFF' : isDark ? '#F1F5F9' : '#1E293B' },
          ]}
        >
          {msg.message}
        </Text>
        <View style={bStyles.meta}>
          <Text
            style={[
              bStyles.timeText,
              {
                color: isOwn
                  ? 'rgba(255,255,255,0.65)'
                  : isDark
                  ? '#64748B'
                  : '#94A3B8',
              },
            ]}
          >
            {time}
          </Text>
          {isOwn && <Text style={bStyles.tick}>{msg.isRead ? '✓✓' : '✓'}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const bStyles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 3, maxWidth: '80%' },
  rowOwn: { alignSelf: 'flex-end' },
  rowOther: { alignSelf: 'flex-start' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  ownBubble: { borderBottomRightRadius: 4 },
  otherBubble: { borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 22 },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 3,
  },
  timeText: { fontSize: 11 },
  tick: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
});

// ─── Chat Screen ───────────────────────────────────────────────────────────────

const ChatScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    userId,
    userName,
    isOnline: initOnline,
  } = route.params as RouteParams;

  const { data: messagesData, isLoading } = useMessages(userId);
  const sendMutation = useSendMessage();
  const markMutation = useMarkAsRead();
  const deleteMutation = useDeleteMessage();

  const [currentUserId, setCurrentUserId] = useState('');
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(initOnline ?? false);
  const [inputText, setInputText] = useState('');

  const flatRef = useRef<FlatList>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDark = colors.background === '#0F172A';
  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const borderC = isDark ? '#334155' : '#E2E8F0';
  const inputBg = isDark ? '#0F172A' : '#F1F5F9';

  useEffect(() => {
    AsyncStorage.getItem('user').then(raw => {
      if (raw) setCurrentUserId(JSON.parse(raw)._id);
    });
  }, []);

  useEffect(() => {
    const raw = (messagesData as any)?.data;
    if (Array.isArray(raw)) setLocalMessages(raw);
  }, [messagesData]);

  useEffect(() => {
    socketService.joinChat(userId);

    socketService.onReceiveMessage((socketMsg: any) => {
      if (socketMsg.senderId === userId) {
        setLocalMessages(prev => [
          ...prev,
          {
            _id: Date.now().toString(),
            senderId: socketMsg.senderId,
            receiverId: currentUserId,
            message: socketMsg.message,
            isRead: false,
            createdAt: new Date(socketMsg.timestamp).toISOString(),
            updatedAt: new Date(socketMsg.timestamp).toISOString(),
          },
        ]);
        scrollToBottom();
      }
    });

    socketService.onUserTyping((e: any) => {
      if (e.userId === userId) {
        setIsTyping(e.isTyping);
        if (e.isTyping) {
          if (typingTimeout.current) clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => setIsTyping(false), 3000);
        }
      }
    });

    socketService.onUserOnline((e: any) => {
      if (e.userId === userId) setIsOnline(true);
    });
    socketService.onUserOffline((e: any) => {
      if (e.userId === userId) setIsOnline(false);
    });

    markMutation.mutate(userId);

    return () => {
      socketService.offReceiveMessage();
      socketService.offUserTyping();
    };
  }, [userId, currentUserId]);

  useEffect(() => {
    if (localMessages.length > 0) scrollToBottom();
  }, [localMessages]);

  const scrollToBottom = () => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    socketService.stopTyping(userId);

    const temp = {
      _id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: userId,
      message: text,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLocalMessages(prev => [...prev, temp]);
    scrollToBottom();

    try {
      await sendMutation.mutateAsync({ receiverId: userId, message: text });
      socketService.sendMessage(userId, text);
    } catch {
      setLocalMessages(prev => prev.filter(m => m._id !== temp._id));
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleTextChange = (t: string) => {
    setInputText(t);
    if (t.length > 0) {
      socketService.startTyping(userId);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(
        () => socketService.stopTyping(userId),
        3000,
      );
    } else {
      socketService.stopTyping(userId);
    }
  };

  const handleDelete = async (msgId: string) => {
    await deleteMutation.mutateAsync(msgId);
    setLocalMessages(prev => prev.filter(m => m._id !== msgId));
  };

  const initials = userName
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
            backgroundColor: surfaceC,
            borderBottomColor: borderC,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={textPri} />
        </TouchableOpacity>

        <View style={styles.headerUser}>
          <View style={[styles.avatar, { backgroundColor: '#8B5CF6' }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={[styles.headerName, { color: textPri }]}>
              {userName}
            </Text>
            <Text
              style={[
                styles.headerStatus,
                { color: isOnline ? '#22C55E' : textSec },
              ]}
            >
              {isTyping ? 'typing...' : isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#8B5CF6" size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={localMessages}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <Bubble
              msg={item}
              isOwn={item.senderId === currentUserId}
              onDelete={() => handleDelete(item._id)}
              isDark={isDark}
            />
          )}
          contentContainerStyle={styles.msgList}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          onContentSizeChange={scrollToBottom}
        />
      )}

      {/* Input Bar */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: surfaceC,
            borderTopColor: borderC,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: inputBg, borderColor: borderC },
          ]}
        >
          <TextInput
            style={[styles.input, { color: textPri }]}
            placeholder="Type a message..."
            placeholderTextColor={textSec}
            value={inputText}
            onChangeText={handleTextChange}
            multiline
            maxLength={5000}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: inputText.trim() ? '#8B5CF6' : borderC },
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || sendMutation.isPending}
        >
          <Icon
            name="send"
            size={18}
            color={inputText.trim() ? '#FFFFFF' : textSec}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, marginRight: 10 },
  headerUser: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  headerName: { fontSize: 16, fontWeight: '700' },
  headerStatus: { fontSize: 12, marginTop: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  msgList: { paddingVertical: 12, paddingBottom: 8 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  inputWrap: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  input: { fontSize: 15, lineHeight: 20 },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;
