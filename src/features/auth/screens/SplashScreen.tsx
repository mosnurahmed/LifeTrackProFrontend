/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Splash Screen
 *
 * Initial loading screen
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store';
// import { useTheme } from '@hooks/useTheme';
// import { useAuthStore } from '@store/authStore';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing } = useTheme();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' as never }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' as never }],
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const styles = createStyles(colors, textStyles, spacing);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🍃</Text>
      <Text style={styles.title}>LifeTrack Pro</Text>
      <Text style={styles.subtitle}>Your Financial Companion</Text>
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.loader}
      />
    </View>
  );
};

const createStyles = (colors: any, textStyles: any, spacing: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    logo: {
      fontSize: 80,
      marginBottom: spacing.lg,
    },
    title: {
      ...textStyles.h1,
      color: colors.primary,
      marginBottom: spacing.sm,
    },
    subtitle: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    loader: {
      marginTop: spacing.xl,
    },
  });

export default SplashScreen;
