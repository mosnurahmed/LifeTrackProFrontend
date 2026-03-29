/**
 * Conversations Screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import {
  useConversations,
  useUnreadCount,
  useSearchUser,
  useSendMessage,
} from '../../../hooks/api/useChat';
import { ConversationItem } from '../components/ConversationItem';
import { ConversationsSkeleton } from '../../../components/common/Loading/ScreenSkeletons';
import { useGuide } from '../../../components/common';

// ─── New Chat Modal ────────────────────────────────────────────────────────────

const NewChatModal = ({
  visible,
  onClose,
  onStartChat,
  colors,
  insets,
}: {
  visible: boolean;
  onClose: () => void;
  onStartChat: (userId: string, userName: string) => void;
  colors: any;
  insets: any;
}) => {
  const [email, setEmail] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [firstMsg, setFirstMsg] = useState('');
  const [step, setStep] = useState<'search' | 'confirm'>('search');
  const searchMutation = useSearchUser();
  const sendMutation = useSendMessage();

  const isDark = colors.background === '#0F172A';
  const primary = colors.primary || '#10B981';

  const reset = () => {
    setEmail('');
    setFoundUser(null);
    setFirstMsg('');
    setStep('search');
    searchMutation.reset?.();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSearch = () => {
    if (!email.trim()) return;
    searchMutation.mutate(email.trim(), {
      onSuccess: (user: any) => {
        setFoundUser(user);
        setStep('confirm');
      },
      onError: () => {
        Alert.alert('Not Found', 'No user found with that email address.');
      },
    });
  };

  const handleStart = async () => {
    if (!foundUser) return;
    if (firstMsg.trim()) {
      sendMutation.mutate(
        { receiverId: foundUser._id, message: firstMsg.trim() },
        {
          onSuccess: () => {
            handleClose();
            onStartChat(foundUser._id, foundUser.name);
          },
          onError: () => Alert.alert('Error', 'Failed to send message'),
        },
      );
    } else {
      handleClose();
      onStartChat(foundUser._id, foundUser.name);
    }
  };

  const surfaceBg = isDark ? '#1E293B' : '#FFFFFF';
  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const inputBg = isDark ? '#0F172A' : '#F8FAFC';
  const borderC = isDark ? '#334155' : '#E2E8F0';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={mStyles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={mStyles.backdrop}
          onPress={handleClose}
          activeOpacity={1}
        />

        <View
          style={[
            mStyles.sheet,
            { backgroundColor: surfaceBg, paddingBottom: insets.bottom + 24 },
          ]}
        >
          {/* Handle */}
          <View style={[mStyles.handle, { backgroundColor: borderC }]} />

          {/* Title row */}
          <View style={mStyles.titleRow}>
            <Text style={[mStyles.title, { color: textPri }]}>
              New Conversation
            </Text>
            <TouchableOpacity onPress={handleClose} style={mStyles.closeBtn}>
              <Icon name="close" size={20} color={textSec} />
            </TouchableOpacity>
          </View>

          {step === 'search' ? (
            <>
              <Text style={[mStyles.label, { color: textSec }]}>
                Find by email address
              </Text>
              <View
                style={[
                  mStyles.inputRow,
                  { backgroundColor: inputBg, borderColor: borderC },
                ]}
              >
                <Icon
                  name="mail-outline"
                  size={18}
                  color={textSec}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={[mStyles.input, { color: textPri }]}
                  placeholder="Enter email address..."
                  placeholderTextColor={textSec}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                />
                {email.length > 0 && (
                  <TouchableOpacity onPress={() => setEmail('')}>
                    <Icon name="close-circle" size={16} color={textSec} />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[
                  mStyles.primaryBtn,
                  {
                    backgroundColor: primary,
                    opacity:
                      !email.trim() || searchMutation.isPending ? 0.6 : 1,
                  },
                ]}
                onPress={handleSearch}
                disabled={!email.trim() || searchMutation.isPending}
              >
                {searchMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={mStyles.primaryBtnText}>Find User</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Found User Card */}
              <View
                style={[
                  mStyles.userCard,
                  { backgroundColor: inputBg, borderColor: `${primary}40` },
                ]}
              >
                <View style={[mStyles.avatar, { backgroundColor: primary }]}>
                  <Text style={mStyles.avatarText}>
                    {foundUser?.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[mStyles.userName, { color: textPri }]}>
                    {foundUser?.name}
                  </Text>
                  <Text style={[mStyles.userEmail, { color: textSec }]}>
                    {foundUser?.email}
                  </Text>
                </View>
                <Icon name="checkmark-circle" size={22} color="#22C55E" />
              </View>

              <Text style={[mStyles.label, { color: textSec }]}>
                Optional — send a first message
              </Text>
              <View
                style={[
                  mStyles.inputRow,
                  mStyles.msgInput,
                  { backgroundColor: inputBg, borderColor: borderC },
                ]}
              >
                <TextInput
                  style={[mStyles.input, { color: textPri }]}
                  placeholder="Say hello..."
                  placeholderTextColor={textSec}
                  value={firstMsg}
                  onChangeText={setFirstMsg}
                  multiline
                  maxLength={500}
                />
              </View>

              <View style={mStyles.btnRow}>
                <TouchableOpacity
                  style={[mStyles.outlineBtn, { borderColor: borderC }]}
                  onPress={() => setStep('search')}
                >
                  <Text style={[mStyles.outlineBtnText, { color: textSec }]}>
                    Back
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    mStyles.primaryBtn,
                    {
                      flex: 1,
                      backgroundColor: primary,
                      opacity: sendMutation.isPending ? 0.6 : 1,
                    },
                  ]}
                  onPress={handleStart}
                  disabled={sendMutation.isPending}
                >
                  {sendMutation.isPending ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Icon
                        name="chatbubble-ellipses"
                        size={16}
                        color="#FFFFFF"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={mStyles.primaryBtnText}>Start Chat</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const ConversationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [showNewChat, setShowNewChat] = useState(false);
  const { GuideButton, GuideView } = useGuide('chat');

  const {
    data: conversationsData,
    isLoading,
    refetch,
    isRefetching,
  } = useConversations();
  const { data: unreadData } = useUnreadCount();

  const conversations: any[] = Array.isArray(conversationsData)
    ? (conversationsData as any[])
    : [];
  const unreadCount: number =
    typeof unreadData === 'number' ? (unreadData as number) : 0;

  const isDark = colors.background === '#0F172A';
  const primary = colors.primary || '#10B981';
  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const bgColor = colors.background;
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#E2E8F0';

  // Polling: refetch conversations every 5s
  useEffect(() => {
    const interval = setInterval(() => refetch(), 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToChat = (userId: string, userName: string) => {
    (navigation.getParent() as any)?.navigate('Chat', { userId, userName });
  };

  const renderItem = ({ item }: { item: any }) => (
    <ConversationItem
      conversation={item}
      onPress={() => goToChat(item.userId, item.userName)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <View style={[styles.emptyBg, { backgroundColor: `${primary}12` }]}>
        <Icon name="chatbubbles-outline" size={52} color={primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: textPri }]}>
        No conversations yet
      </Text>
      <Text style={[styles.emptyHint, { color: textSec }]}>
        Start chatting with someone new
      </Text>
      <TouchableOpacity
        style={[styles.emptyBtn, { backgroundColor: primary }]}
        onPress={() => setShowNewChat(true)}
      >
        <Icon name="add" size={18} color="#FFFFFF" />
        <Text style={styles.emptyBtnText}>New Conversation</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 12,
              backgroundColor: surfaceC,
              borderBottomColor: borderC,
            },
          ]}
        >
          <View>
            <Text style={[styles.headerTitle, { color: textPri }]}>Messages</Text>
          </View>
          <TouchableOpacity
            style={[styles.newBtn, { backgroundColor: primary }]}
            onPress={() => setShowNewChat(true)}
          >
            <Icon name="create-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <ConversationsSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            backgroundColor: surfaceC,
            borderBottomColor: borderC,
          },
        ]}
      >
        <View>
          <Text style={[styles.headerTitle, { color: textPri }]}>Messages</Text>
          {unreadCount > 0 && (
            <Text style={[styles.headerSub, { color: primary }]}>
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: primary }]}
          onPress={() => setShowNewChat(true)}
        >
          <Icon name="create-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={item => item.userId}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        contentContainerStyle={
          conversations.length === 0 ? { flexGrow: 1 } : { paddingBottom: 20 }
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[primary]}
            tintColor={primary}
          />
        }
      />

      <NewChatModal
        visible={showNewChat}
        onClose={() => setShowNewChat(false)}
        onStartChat={(userId, userName) => goToChat(userId, userName)}
        colors={colors}
        insets={insets}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyHint: { fontSize: 14, textAlign: 'center' },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

const mStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: '700' },
  closeBtn: { padding: 4 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  msgInput: { alignItems: 'flex-start', minHeight: 80 },
  input: { flex: 1, fontSize: 15 },
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  btnRow: { flexDirection: 'row', gap: 10 },
  outlineBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineBtnText: { fontSize: 14, fontWeight: '600' },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  userName: { fontSize: 15, fontWeight: '700' },
  userEmail: { fontSize: 12, marginTop: 2 },
});

export default ConversationsScreen;
