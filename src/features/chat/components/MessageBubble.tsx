/**
 * Message Bubble Component
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Message } from '../../../types/chat.types';
import { format } from 'date-fns';
import { useTheme } from '../../../hooks/useTheme';

interface Props {
  message: Message;
  isOwnMessage: boolean;
  onDelete?: (messageId: string) => void;
}

export const MessageBubble: React.FC<Props> = ({
  message,
  isOwnMessage,
  onDelete,
}) => {
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const handleLongPress = () => {
    if (!isOwnMessage || !onDelete) return;

    // Check if within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const messageTime = new Date(message.createdAt);

    if (messageTime < fiveMinutesAgo) {
      Alert.alert(
        'Cannot Delete',
        'You can only delete messages within 5 minutes',
      );
      return;
    }

    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(message._id),
        },
      ],
    );
  };

  const formatTime = (date: string) => {
    try {
      return format(new Date(date), 'HH:mm');
    } catch {
      return '';
    }
  };

  const styles = createStyles(
    colors,
    textStyles,
    spacing,
    borderRadius,
    isOwnMessage,
  );

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        <Text
          style={[
            styles.message,
            isOwnMessage ? styles.ownText : styles.otherText,
          ]}
        >
          {message.message}
        </Text>

        <View style={styles.footer}>
          <Text
            style={[
              styles.time,
              isOwnMessage ? styles.ownTime : styles.otherTime,
            ]}
          >
            {formatTime(message.createdAt)}
          </Text>

          {/* Read Receipt (only for own messages) */}
          {isOwnMessage && (
            <Text style={styles.readReceipt}>
              {message.isRead ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (
  colors: any,
  textStyles: any,
  spacing: any,
  borderRadius: any,
  isOwnMessage: boolean,
) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      maxWidth: '80%',
    },
    ownMessage: {
      alignSelf: 'flex-end',
    },
    otherMessage: {
      alignSelf: 'flex-start',
    },
    bubble: {
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    ownBubble: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: borderRadius.sm,
    },
    otherBubble: {
      backgroundColor: colors.border,
      borderBottomLeftRadius: borderRadius.sm,
    },
    message: {
      ...textStyles.body,
      lineHeight: 20,
    },
    ownText: {
      color: colors.text.inverse,
    },
    otherText: {
      color: colors.text.primary,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    time: {
      ...textStyles.caption,
      fontSize: 11,
      marginRight: spacing.xs,
    },
    ownTime: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    otherTime: {
      color: colors.text.secondary,
    },
    readReceipt: {
      fontSize: 11,
      color: 'rgba(255, 255, 255, 0.9)',
    },
  });

export default MessageBubble;
