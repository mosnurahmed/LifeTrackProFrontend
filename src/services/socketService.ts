/**
 * Socket.io Client Service
 */

import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import { useAuthStore } from '../store/authStore';
import {
  SocketMessage,
  TypingEvent,
  UserStatusEvent
} from '../types/chat.types';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  async connect(): Promise<void> {
    try {
      // Get token from zustand auth store
      const token = useAuthStore.getState().accessToken;

      if (!token) {
        console.warn('⚠️ Socket: No auth token available');
        return;
      }

      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket?.id);
        this.isConnected = true;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });
    } catch (error) {
      console.error('Socket initialization error:', error);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // ─── Chat ────────────────────────────────────────────────────────────

  joinChat(otherUserId: string): void {
    if (this.socket) {
      this.socket.emit('join_chat', { otherUserId });
    }
  }

  sendMessage(receiverId: string, message: string): void {
    if (this.socket) {
      this.socket.emit('send_message', { receiverId, message });
    }
  }

  onReceiveMessage(callback: (message: SocketMessage) => void): void {
    if (this.socket) {
      this.socket.off('receive_message');
      this.socket.on('receive_message', callback);
    }
  }

  offReceiveMessage(): void {
    if (this.socket) {
      this.socket.off('receive_message');
    }
  }

  // ─── Typing ──────────────────────────────────────────────────────────

  startTyping(receiverId: string): void {
    if (this.socket) {
      this.socket.emit('typing', { receiverId, isTyping: true });
    }
  }

  stopTyping(receiverId: string): void {
    if (this.socket) {
      this.socket.emit('typing', { receiverId, isTyping: false });
    }
  }

  onUserTyping(callback: (event: TypingEvent) => void): void {
    if (this.socket) {
      this.socket.off('user_typing');
      this.socket.on('user_typing', callback);
    }
  }

  offUserTyping(): void {
    if (this.socket) {
      this.socket.off('user_typing');
    }
  }

  // ─── Online Status ───────────────────────────────────────────────────

  onUserOnline(callback: (event: UserStatusEvent) => void): void {
    if (this.socket) {
      this.socket.off('user_online');
      this.socket.on('user_online', callback);
    }
  }

  onUserOffline(callback: (event: UserStatusEvent) => void): void {
    if (this.socket) {
      this.socket.off('user_offline');
      this.socket.on('user_offline', callback);
    }
  }

  getOnlineUsers(callback: (userIds: string[]) => void): void {
    if (this.socket) {
      this.socket.emit('get_online_users');
      this.socket.once('online_users_list', callback);
    }
  }

  // ─── Read Receipt ────────────────────────────────────────────────────

  markMessageRead(messageId: string): void {
    if (this.socket) {
      this.socket.emit('message_read', { messageId });
    }
  }

  onMessageRead(callback: (data: { messageId: string }) => void): void {
    if (this.socket) {
      this.socket.off('message_read');
      this.socket.on('message_read', callback);
    }
  }

  // ─── Utils ───────────────────────────────────────────────────────────

  isSocketConnected(): boolean {
    return this.isConnected;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

const socketService = new SocketService();
export default socketService;
