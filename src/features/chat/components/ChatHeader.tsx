/**
 * Chat Header Component
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';

interface Props {
  userName: string;
  userAvatar?: string;
  isOnline?: boolean;
  isTyping?: boolean;
  onBack: () => void;
  onUserPress?: () => void;
}

export const ChatHeader: React.FC<Props> = ({
  userName,
  userAvatar,
  isOnline,
  isTyping,
  onBack,
  onUserPress,
}) => {
  const { colors, textStyles, spacing, borderRadius } = useTheme();

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.userInfo}
        onPress={onUserPress}
        disabled={!onUserPress}
      >
        <View style={styles.avatarContainer}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Online Indicator */}
          {isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.nameContainer}>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
          {isTyping ? (
            <Text style={styles.typingText}>typing...</Text>
          ) : (
            <Text style={styles.statusText}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (
  colors: any,
  textStyles: any,
  spacing: any,
  borderRadius: any,
) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: spacing.sm,
    },
    userInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      position: 'relative',
      marginRight: spacing.sm,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    avatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: colors.text.inverse,
      ...textStyles.bodyMedium,
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.success,
      borderWidth: 2,
      borderColor: colors.surface,
    },
    nameContainer: {
      flex: 1,
    },
    userName: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
    },
    statusText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      marginTop: 2,
    },
    typingText: {
      ...textStyles.caption,
      color: colors.primary,
      marginTop: 2,
      fontStyle: 'italic',
    },
  });

export default ChatHeader;
