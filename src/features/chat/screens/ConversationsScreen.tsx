/**
 * Conversations Screen
 *
 * Purpose: Show list of all conversations
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import { useConversations, useUnreadCount } from '../../../hooks/api/useChat';
import { ConversationItem } from '../components/ConversationItem';
import { ConversationInfo } from '../../../types/chat.types';
import { Spinner, EmptyState } from '../../../components/common';
import socketService from '../../../services/socketService';

const ConversationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius, shadows } = useTheme();

  const { data: conversationsData, isLoading, refetch } = useConversations();
  const { data: unreadData } = useUnreadCount();

  const conversations = conversationsData?.data || [];
  const unreadCount = unreadData?.data?.count || 0;

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Initialize Socket
  useEffect(() => {
    const initSocket = async () => {
      await socketService.connect();

      // Listen for online/offline status
      socketService.onUserOnline(event => {
        setOnlineUsers(prev => [...prev, event.userId]);
      });

      socketService.onUserOffline(event => {
        setOnlineUsers(prev => prev.filter(id => id !== event.userId));
      });

      // Get initial online users
      socketService.getOnlineUsers(users => {
        setOnlineUsers(users);
      });
    };

    initSocket();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleConversationPress = (conversation: ConversationInfo) => {
    (navigation as any).navigate('Chat', {
      userId: conversation.userId,
      userName: conversation.userName,
      userAvatar: conversation.userAvatar,
      isOnline: onlineUsers.includes(conversation.userId),
    });
  };

  const renderItem = ({ item }: { item: ConversationInfo }) => {
    const isOnline = onlineUsers.includes(item.userId);

    return (
      <ConversationItem
        conversation={{ ...item, isOnline }}
        onPress={() => handleConversationPress({ ...item, isOnline })}
      />
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <Spinner />
        </View>
      );
    }

    return (
      <EmptyState
        icon="chatbubbles-outline"
        title="No conversations yet"
        message="Start chatting with someone!"
      />
    );
  };

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    shadows,
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={item => item.userId}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={conversations.length === 0 && styles.emptyList}
      />
    </View>
  );
};

const createStyles = (
  colors: any,
  textStyles: any,
  spacing: any,
  borderRadius: any,
  shadows: any,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      ...textStyles.h2,
      color: colors.text.primary,
    },
    badge: {
      backgroundColor: colors.danger,
      borderRadius: borderRadius.full,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xs,
    },
    badgeText: {
      ...textStyles.caption,
      color: colors.text.inverse,
      fontWeight: textStyles.bodySemiBold.fontWeight,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    emptyList: {
      flexGrow: 1,
    },
  });

export default ConversationsScreen;
