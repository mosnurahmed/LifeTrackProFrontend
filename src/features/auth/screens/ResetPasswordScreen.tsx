/* eslint-disable react-native/no-inline-styles */
/**
 * Reset Password Screen
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import client from '../../../api/client';
import Toast from 'react-native-toast-message';

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, otp } = route.params as { email: string; otp: string };
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#E2E8F0';
  const primary = colors.primary;

  const canSubmit = password.length >= 6 && password === confirmPassword;

  const handleReset = async () => {
    if (!canSubmit) return;
    try {
      setIsLoading(true);
      await client.post('/auth/reset-password', { email, otp, newPassword: password });
      Toast.show({ type: 'success', text1: 'Password Reset!', text2: 'Please login with your new password' });
      (navigation as any).reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error: any) {
      Toast.show({
        type: 'error', text1: 'Error',
        text2: error.response?.data?.error || 'Failed to reset password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={22} color={textPri} />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${primary}15` }]}>
          <Icon name="shield-checkmark-outline" size={28} color={primary} />
        </View>
        <Text style={[styles.title, { color: textPri }]}>New Password</Text>
        <Text style={[styles.subtitle, { color: textSec }]}>
          Create a strong password for your account
        </Text>
      </View>

      {/* Password */}
      <View style={[styles.inputWrap, { backgroundColor: surfaceC, borderColor: borderC }]}>
        <Icon name="lock-closed-outline" size={18} color={textSec} />
        <TextInput
          style={[styles.input, { color: textPri }]}
          placeholder="New password"
          placeholderTextColor={`${textSec}80`}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPass}
        />
        <TouchableOpacity onPress={() => setShowPass(!showPass)}>
          <Icon name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={textSec} />
        </TouchableOpacity>
      </View>

      {/* Confirm */}
      <View style={[styles.inputWrap, { backgroundColor: surfaceC, borderColor: borderC }]}>
        <Icon name="lock-closed-outline" size={18} color={textSec} />
        <TextInput
          style={[styles.input, { color: textPri }]}
          placeholder="Confirm password"
          placeholderTextColor={`${textSec}80`}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPass}
        />
        {confirmPassword.length > 0 && (
          <Icon
            name={password === confirmPassword ? 'checkmark-circle' : 'close-circle'}
            size={18}
            color={password === confirmPassword ? '#10B981' : '#EF4444'}
          />
        )}
      </View>

      <Text style={[styles.hint, { color: textSec }]}>Must be at least 6 characters</Text>

      <TouchableOpacity
        style={[styles.resetBtn, { backgroundColor: primary, opacity: isLoading || !canSubmit ? 0.6 : 1 }]}
        onPress={handleReset}
        disabled={isLoading || !canSubmit}
      >
        {isLoading
          ? <ActivityIndicator color="#FFF" size="small" />
          : <Text style={styles.resetText}>Reset Password</Text>
        }
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', marginTop: 8 },
  header: { alignItems: 'center', marginTop: 32, marginBottom: 40 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 50, marginBottom: 14,
  },
  input: { flex: 1, fontSize: 15 },
  hint: { fontSize: 12, marginBottom: 24, marginLeft: 4 },

  resetBtn: { height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  resetText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default ResetPasswordScreen;
