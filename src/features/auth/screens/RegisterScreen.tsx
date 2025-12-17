/**
 * Register Screen - Complete with Validation
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
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTheme } from '../../../hooks/useTheme';
import { Button, Input } from '../../../components/common';
import { registerSchema } from '../../../utils/validation/schemas';
import client from '../../../api/client';
import Toast from 'react-native-toast-message';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);

      const response = await client.post('/auth/register', data);

      console.log('📦 Registration Response:', response.data);

      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Account created successfully. Please login.',
      });

      // Navigate to login
      navigation.navigate('Login' as never);
    } catch (error: any) {
      console.log(
        '❌ Registration Error:',
        error.response?.data || error.message,
      );

      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.response?.data?.error || 'Could not create account',
      });
    } finally {
      setIsLoading(false);
    }
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                leftIcon="person-outline"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
              />
            )}
          />

          {/* Email Input */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                placeholder="Enter your email"
                type="email"
                leftIcon="mail-outline"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />

          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Password"
                placeholder="Enter your password"
                type="password"
                leftIcon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />

          {/* Password Requirements */}
          <View style={styles.passwordHints}>
            <Text style={styles.passwordHintText}>• At least 6 characters</Text>
          </View>

          {/* Register Button */}
          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            style={{ marginTop: spacing.lg }}
          >
            Create Account
          </Button>

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
    passwordHints: {
      marginTop: spacing.xs,
      marginBottom: spacing.md,
    },
    passwordHintText: {
      ...textStyles.caption,
      color: colors.text.secondary,
      lineHeight: 20,
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
