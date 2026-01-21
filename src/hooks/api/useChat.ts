/**
 * useChat Hook - React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as chatAPI from '../../api/endpoints/chatEndpoints';
import { SendMessageDTO } from '../../types/chat.types';
import { Alert } from 'react-native';

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: chatAPI.getAllConversations
  });
};

export const useMessages = (userId: string, page: number = 1) => {
  return useQuery({
    queryKey: ['messages', userId, page],
    queryFn: () => chatAPI.getConversation(userId, page),
    enabled: !!userId
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: chatAPI.getUnreadCount
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SendMessageDTO) => chatAPI.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to send message');
    }
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => chatAPI.markMessagesAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    }
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageId: string) => chatAPI.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      Alert.alert('Success', 'Message deleted');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Cannot delete message');
    }
  });
};