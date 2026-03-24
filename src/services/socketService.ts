/**
 * Socket.io Client Service
 */

import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SocketMessage,
  TypingEvent,
  UserStatusEvent
} from '../types/chat.types';

// TODO: Update with your backend URL
const SOCKET_URL = 'http://192.168.110.125:5000';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  async connect(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token');
      }

      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
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
      this.socket.on('receive_message', callback);
    }
  }

  offReceiveMessage(): void {
    if (this.socket) {
      this.socket.off('receive_message');
    }
  }

  startTyping(receiverId: string): void {
    if (this.socket) {
      this.socket.emit('typing_start', { receiverId });
    }
  }

  stopTyping(receiverId: string): void {
    if (this.socket) {
      this.socket.emit('typing_stop', { receiverId });
    }
  }

  onUserTyping(callback: (event: TypingEvent) => void): void {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  offUserTyping(): void {
    if (this.socket) {
      this.socket.off('user_typing');
    }
  }

  onUserOnline(callback: (event: UserStatusEvent) => void): void {
    if (this.socket) {
      this.socket.on('user_online', callback);
    }
  }

  onUserOffline(callback: (event: UserStatusEvent) => void): void {
    if (this.socket) {
      this.socket.on('user_offline', callback);
    }
  }

  getOnlineUsers(callback: (userIds: string[]) => void): void {
    if (this.socket) {
      this.socket.emit('get_online_users');
      this.socket.once('online_users_list', callback);
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new SocketService();