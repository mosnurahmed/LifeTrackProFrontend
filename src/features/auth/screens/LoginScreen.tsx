/**
 * Login Screen
 *
 * User authentication
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store';
// import { useTheme } from '@hooks/useTheme';
// import { useAuthStore } from '@store/authStore';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius } = useTheme();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: Implement actual login
    // Mock login for now
    setAuth(
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        currency: 'BDT',
      },
      'mock-access-token',
      'mock-refresh-token',
    );
  };

  const styles = createStyles(colors, textStyles, spacing, borderRadius);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🍃</Text>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to continue</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input - Placeholder */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.input}>
              <Text style={styles.inputPlaceholder}>
                Email input will be here
              </Text>
            </View>
          </View>

          {/* Password Input - Placeholder */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.input}>
              <Text style={styles.inputPlaceholder}>
                Password input will be here
              </Text>
            </View>
          </View>

          {/* Login Button - Placeholder */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register' as never)}
            >
              <Text style={styles.link}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
    },
    logoContainer: {
      alignItems: 'center',
      marginTop: spacing['2xl'],
      marginBottom: spacing['2xl'],
    },
    logo: {
      fontSize: 64,
      marginBottom: spacing.md,
    },
    title: {
      ...textStyles.h2,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    form: {
      flex: 1,
    },
    inputContainer: {
      marginBottom: spacing.lg,
    },
    label: {
      ...textStyles.bodyMedium,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.surface,
    },
    inputPlaceholder: {
      ...textStyles.body,
      color: colors.text.tertiary,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    buttonText: {
      ...textStyles.button,
      color: colors.text.inverse,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.xl,
    },
    footerText: {
      ...textStyles.body,
      color: colors.text.secondary,
    },
    link: {
      ...textStyles.bodyMedium,
      color: colors.primary,
    },
  });

export default LoginScreen;
