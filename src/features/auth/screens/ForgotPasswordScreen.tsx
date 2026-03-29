/* eslint-disable react-native/no-inline-styles */
/**
 * Forgot Password Screen
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import client from '../../../api/client';
import Toast from 'react-native-toast-message';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#E2E8F0';
  const primary = colors.primary;

  const handleSend = async () => {
    if (!email.trim()) return;
    try {
      setIsLoading(true);
      await client.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      Toast.show({ type: 'success', text1: 'Code Sent', text2: 'Check your email' });
      (navigation as any).navigate('VerifyOTP', { email: email.trim().toLowerCase(), purpose: 'password-reset' });
    } catch (error: any) {
      Toast.show({
        type: 'error', text1: 'Error',
        text2: error.response?.data?.error || 'Failed to send code',
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
          <Icon name="lock-closed-outline" size={28} color={primary} />
        </View>
        <Text style={[styles.title, { color: textPri }]}>Forgot Password?</Text>
        <Text style={[styles.subtitle, { color: textSec }]}>
          Enter your email and we'll send you a code to reset your password.
        </Text>
      </View>

      <View style={[styles.inputWrap, { backgroundColor: surfaceC, borderColor: borderC }]}>
        <Icon name="mail-outline" size={18} color={textSec} />
        <TextInput
          style={[styles.input, { color: textPri }]}
          placeholder="Enter your email"
          placeholderTextColor={`${textSec}80`}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>

      <TouchableOpacity
        style={[styles.sendBtn, { backgroundColor: primary, opacity: isLoading || !email.trim() ? 0.6 : 1 }]}
        onPress={handleSend}
        disabled={isLoading || !email.trim()}
      >
        {isLoading
          ? <ActivityIndicator color="#FFF" size="small" />
          : <Text style={styles.sendText}>Send Reset Code</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
        <Text style={[styles.backLinkText, { color: primary }]}>Back to Login</Text>
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
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21, paddingHorizontal: 16 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 50, marginBottom: 20,
  },
  input: { flex: 1, fontSize: 15 },

  sendBtn: { height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  sendText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  backLink: { alignItems: 'center' },
  backLinkText: { fontSize: 14, fontWeight: '600' },
});

export default ForgotPasswordScreen;
