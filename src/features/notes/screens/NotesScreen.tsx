import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

const NotesScreen: React.FC = () => {
  const { colors, textStyles } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[textStyles.h2, { color: colors.text.primary }]}>Notes</Text>
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

export default NotesScreen;
