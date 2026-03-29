/**
 * Login Screen - Fixed Token Extraction
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
import { useAuthStore } from '../../../store/authStore';
import { Button, Input } from '../../../components/common';
import { loginSchema } from '../../../utils/validation/schemas';
import client from '../../../api/client';
import Toast from 'react-native-toast-message';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, textStyles, spacing, borderRadius } = useTheme();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema), // ✅ Changed from zodResolver
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);

      const response = await client.post('/auth/login', data);

      console.log('📦 Full Response:', response.data);

      // ✅ CORRECT: Extract user and tokens
      const { user, tokens } = response.data.data;
      const { accessToken, refreshToken } = tokens;

      console.log('👤 User:', user);
      console.log('🔑 Token Preview:', tokens);

      // Save to store
      setAuth(user, accessToken, refreshToken);

      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: `Hi ${user.name}`,
      });
    } catch (error: any) {
      const errMsg = error.response?.data?.error || '';

      // If account not verified, go to OTP screen
      if (errMsg.includes('not verified')) {
        Toast.show({ type: 'info', text1: 'Verify Your Email', text2: 'A new code has been sent' });
        (navigation as any).navigate('VerifyOTP', { email: data.email, purpose: 'verification' });
        return;
      }

      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errMsg || 'Invalid credentials',
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
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🍃</Text>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to continue</Text>
        </View>

        <View style={styles.form}>
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

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
          >
            Login
          </Button>

          <TouchableOpacity
            style={{ alignSelf: 'center', marginTop: spacing.md }}
            onPress={() => (navigation as any).navigate('ForgotPassword')}
          >
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>

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
