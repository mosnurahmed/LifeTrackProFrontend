/**
 * Register Screen
 *
 * New user registration
 */

import React from 'react';
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
// import { useTheme } from '@hooks/useTheme';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius } = useTheme();

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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Input - Placeholder */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.input}>
              <Text style={styles.inputPlaceholder}>
                Name input will be here
              </Text>
            </View>
          </View>

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

          {/* Register Button - Placeholder */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}>Login</Text>
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

export default RegisterScreen;
