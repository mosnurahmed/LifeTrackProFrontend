/**
 * Chat Types
 */

export interface UserInfo {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  senderInfo?: UserInfo;
  receiverInfo?: UserInfo;
}

export interface ConversationInfo {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline?: boolean;
}

export interface SendMessageDTO {
  receiverId: string;
  message: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MessagesResponse {
  data: Message[];
  pagination: PaginationData;
}

export interface SocketMessage {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

export interface TypingEvent {
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface UserStatusEvent {
  userId: string;
  userName?: string;
}