/**
 * Chat API Endpoints
 */

import apiClient from '../client';
import {
  Message,
  ConversationInfo,
  SendMessageDTO,
  MessagesResponse
} from '../../types/chat.types';

export const sendMessage = async (data: SendMessageDTO): Promise<Message> => {
  const response = await apiClient.post('/chat/send', data);
  return response.data.data;
};

export const getAllConversations = async (): Promise<ConversationInfo[]> => {
  const response = await apiClient.get('/chat/conversations');
  return response.data.data;
};

export const getConversation = async (
  userId: string,
  page: number = 1,
  limit: number = 50
): Promise<MessagesResponse> => {
  const response = await apiClient.get(`/chat/conversation/${userId}`, {
    params: { page, limit }
  });
  return response.data;
};

export const markMessagesAsRead = async (userId: string): Promise<number> => {
  const response = await apiClient.put(`/chat/read/${userId}`);
  return response.data.data.count;
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get('/chat/unread-count');
  return response.data.data.count;
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  await apiClient.delete(`/chat/message/${messageId}`);
};

export const searchMessages = async (
  userId: string,
  query: string
): Promise<Message[]> => {
  const response = await apiClient.get(`/chat/search/${userId}`, {
    params: { q: query }
  });
  return response.data.data;
};