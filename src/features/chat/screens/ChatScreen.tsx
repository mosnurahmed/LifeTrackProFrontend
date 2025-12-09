import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

const ChatScreen: React.FC = () => {
  const { colors, textStyles } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[textStyles.h2, { color: colors.text.primary }]}>Chat</Text>
      <Text style={[textStyles.body, { color: colors.text.secondary }]}>
        Coming Soon
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;
