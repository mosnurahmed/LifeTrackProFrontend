/**
 * Chat Store (Zustand)
 */

import { create } from 'zustand';
import { ChatState, Message, SocketMessage } from '../types/chat.types';
import * as chatAPI from '../api/chatEndpoints';
import socketService from '../services/socketService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const useChatStore = create<ChatState>((set, get) => ({
  // Initial State
  conversations: [],
  currentMessages: [],
  unreadCount: 0,
  loading: false,
  sending: false,
  isTyping: false,
  onlineUsers: [],
  currentChatUserId: null,

  // Setters
  setConversations: (conversations) => set({ conversations }),
  
  setMessages: (messages) => set({ currentMessages: messages }),
  
  addMessage: (message) =>
    set((state) => ({
      currentMessages: [...state.currentMessages, message]
    })),
  
  updateMessage: (messageId, updates) =>
    set((state) => ({
      currentMessages: state.currentMessages.map((msg) =>
        msg._id === messageId ? { ...msg, ...updates } : msg
      )
    })),
  
  removeMessage: (messageId) =>
    set((state) => ({
      currentMessages: state.currentMessages.filter((msg) => msg._id !== messageId)
    })),
  
  setUnreadCount: (count) => set({ unreadCount: count }),
  
  setLoading: (loading) => set({ loading }),
  
  setSending: (sending) => set({ sending }),
  
  setIsTyping: (isTyping) => set({ isTyping }),
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: [...state.onlineUsers, userId],
      conversations: state.conversations.map((conv) =>
        conv.userId === userId ? { ...conv, isOnline: true } : conv
      )
    })),
  
  removeOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((id) => id !== userId),
      conversations: state.conversations.map((conv) =>
        conv.userId === userId ? { ...conv, isOnline: false } : conv
      )
    })),
  
  setCurrentChatUserId: (userId) => set({ currentChatUserId: userId }),

  // API Actions
  
  /**
   * Fetch All Conversations
   */
  fetchConversations: async () => {
    try {
      set({ loading: true });
      const data = await chatAPI.getAllConversations();
      
      // Add online status
      const { onlineUsers } = get();
      const conversationsWithStatus = data.map((conv) => ({
        ...conv,
        isOnline: onlineUsers.includes(conv.userId)
      }));
      
      set({ conversations: conversationsWithStatus });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load conversations');
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Fetch Messages
   */
  fetchMessages: async (userId, page = 1) => {
    try {
      set({ loading: true });
      const response = await chatAPI.getConversation(userId, page);
      
      if (page === 1) {
        set({ currentMessages: response.data });
      } else {
        // Prepend older messages
        set((state) => ({
          currentMessages: [...response.data, ...state.currentMessages]
        }));
      }
      
      // Join socket room
      socketService.joinChat(userId);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load messages');
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Send Message
   */
  sendMessage: async (data) => {
    try {
      set({ sending: true });
      
      // Send via API
      const newMessage = await chatAPI.sendMessage(data);
      
      // Send via Socket for real-time
      socketService.sendMessage(data.receiverId, data.message);
      
      // Add to messages
      get().addMessage(newMessage);
      
      // Refresh conversations
      await get().fetchConversations();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send message');
      throw error;
    } finally {
      set({ sending: false });
    }
  },

  /**
   * Mark Messages as Read
   */
  markMessagesAsRead: async (userId) => {
    try {
      await chatAPI.markMessagesAsRead(userId);
      
      // Update messages
      set((state) => ({
        currentMessages: state.currentMessages.map((msg) =>
          msg.senderId === userId
            ? { ...msg, isRead: true, readAt: new Date().toISOString() }
            : msg
        ),
        conversations: state.conversations.map((conv) =>
          conv.userId === userId ? { ...conv, unreadCount: 0 } : conv
        )
      }));
      
      // Update unread count
      await get().fetchUnreadCount();
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  },

  /**
   * Delete Message
   */
  deleteMessage: async (messageId) => {
    try {
      await chatAPI.deleteMessage(messageId);
      get().removeMessage(messageId);
      Alert.alert('Success', 'Message deleted');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Cannot delete message');
    }
  },

  /**
   * Fetch Unread Count
   */
  fetchUnreadCount: async () => {
    try {
      const count = await chatAPI.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      console.error('Unread count error:', error);
    }
  },

  /**
   * Reset Store
   */
  reset: () =>
    set({
      conversations: [],
      currentMessages: [],
      unreadCount: 0,
      loading: false,
      sending: false,
      isTyping: false,
      onlineUsers: [],
      currentChatUserId: null
    })
}));

/**
 * Initialize Socket Listeners
 */
export const initializeChatSocket = async () => {
  const store = useChatStore.getState();
  
  // Get current user ID
  const user = await AsyncStorage.getItem('user');
  let currentUserId = '';
  if (user) {
    const userData = JSON.parse(user);
    currentUserId = userData._id;
  }

  // Connect socket
  await socketService.connect();

  // Listen for incoming messages
  socketService.onReceiveMessage((socketMsg: SocketMessage) => {
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
        email: ''
      }
    };

    store.addMessage(newMessage);
    store.fetchConversations();
  });

  // Listen for typing
  socketService.onUserTyping((event) => {
    store.setIsTyping(event.isTyping);
  });

  // Listen for online status
  socketService.onUserOnline((event) => {
    store.addOnlineUser(event.userId);
  });

  socketService.onUserOffline((event) => {
    store.removeOnlineUser(event.userId);
  });

  // Get online users
  socketService.getOnlineUsers((users) => {
    store.setOnlineUsers(users);
  });
};

/**
 * Cleanup Socket
 */
export const cleanupChatSocket = () => {
  socketService.offReceiveMessage();
  socketService.offUserTyping();
  socketService.disconnect();
};

export default useChatStore;