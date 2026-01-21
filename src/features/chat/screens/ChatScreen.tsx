/**
 * Chat Screen
 *
 * Purpose: One-to-one chat interface
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../../hooks/useTheme';
import {
  useMessages,
  useSendMessage,
  useMarkAsRead,
  useDeleteMessage,
} from '../../../hooks/api/useChat';
import { ChatHeader } from '../components/ChatHeader';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { TypingIndicator } from '../components/TypingIndicator';
import { Spinner } from '../../../components/common';
import { Message, SocketMessage } from '../../../types/chat.types';
import socketService from '../../../services/socketService';

interface RouteParams {
  userId: string;
  userName: string;
  userAvatar?: string;
  isOnline?: boolean;
}

const ChatScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();

  const {
    userId,
    userName,
    userAvatar,
    isOnline: initialOnline,
  } = route.params as RouteParams;

  const { data: messagesData, isLoading, refetch } = useMessages(userId);
  const sendMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();
  const deleteMutation = useDeleteMessage();

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(initialOnline || false);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current user ID
  useEffect(() => {
    const getUserId = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setCurrentUserId(userData._id);
      }
    };
    getUserId();
  }, []);

  // Load messages from API
  useEffect(() => {
    if (messagesData?.data?.data) {
      setLocalMessages(messagesData.data.data);
    }
  }, [messagesData]);

  // Socket initialization
  useEffect(() => {
    // Join chat room
    socketService.joinChat(userId);

    // Listen for incoming messages
    const handleIncomingMessage = (socketMsg: SocketMessage) => {
      if (socketMsg.senderId === userId) {
        const newMessage: Message = {
          _id: Date.now().toString(),
          senderId: socketMsg.senderId,
          receiverId: currentUserId,
          message: socketMsg.message,
          isRead: false,
          createdAt: socketMsg.timestamp.toString(),
          updatedAt: socketMsg.timestamp.toString(),
          senderInfo: {
            _id: socketMsg.senderId,
            name: socketMsg.senderName,
            email: '',
          },
        };

        setLocalMessages(prev => [...prev, newMessage]);
        scrollToBottom();
      }
    };

    socketService.onReceiveMessage(handleIncomingMessage);

    // Listen for typing
    const handleTyping = (event: any) => {
      if (event.userId === userId) {
        setIsTyping(event.isTyping);

        if (event.isTyping) {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      }
    };

    socketService.onUserTyping(handleTyping);

    // Listen for online status
    socketService.onUserOnline(event => {
      if (event.userId === userId) {
        setIsOnline(true);
      }
    });

    socketService.onUserOffline(event => {
      if (event.userId === userId) {
        setIsOnline(false);
      }
    });

    // Mark as read
    markAsReadMutation.mutate(userId);

    return () => {
      socketService.offReceiveMessage();
      socketService.offUserTyping();
    };
  }, [userId, currentUserId]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Scroll when messages change
  useEffect(() => {
    if (localMessages.length > 0) {
      scrollToBottom();
    }
  }, [localMessages]);

  const handleSend = async (message: string) => {
    try {
      // Optimistic update
      const tempMessage: Message = {
        _id: Date.now().toString(),
        senderId: currentUserId,
        receiverId: userId,
        message,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setLocalMessages(prev => [...prev, tempMessage]);
      scrollToBottom();

      // Send via API
      await sendMutation.mutateAsync({ receiverId: userId, message });

      // Send via Socket
      socketService.sendMessage(userId, message);

      // Stop typing
      socketService.stopTyping(userId);
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  const handleDelete = async (messageId: string) => {
    await deleteMutation.mutateAsync(messageId);
    setLocalMessages(prev => prev.filter(msg => msg._id !== messageId));
  };

  const handleTypingStart = () => {
    socketService.startTyping(userId);
  };

  const handleTypingStop = () => {
    socketService.stopTyping(userId);
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === currentUserId;

    return (
      <MessageBubble
        message={item}
        isOwnMessage={isOwnMessage}
        onDelete={isOwnMessage ? handleDelete : undefined}
      />
    );
  };

  const renderFooter = () => {
    if (isTyping) {
      return <TypingIndicator />;
    }
    return null;
  };

  const styles = createStyles(colors);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ChatHeader
        userName={userName}
        userAvatar={userAvatar}
        isOnline={isOnline}
        isTyping={isTyping}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        ref={flatListRef}
        data={localMessages}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.messagesList}
        ListFooterComponent={renderFooter}
        onContentSizeChange={scrollToBottom}
      />

      <MessageInput
        onSend={handleSend}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        disabled={sendMutation.isPending}
      />
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    messagesList: {
      paddingVertical: 8,
    },
  });

export default ChatScreen;
