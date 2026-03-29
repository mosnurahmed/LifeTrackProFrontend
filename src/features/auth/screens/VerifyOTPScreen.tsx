/* eslint-disable react-native/no-inline-styles */
/**
 * OTP Verification Screen
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store';
import client from '../../../api/client';
import Toast from 'react-native-toast-message';

const OTP_LENGTH = 6;

const VerifyOTPScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, purpose } = route.params as { email: string; purpose: 'verification' | 'password-reset' };
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#E2E8F0';
  const primary = colors.primary;

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every(d => d !== '') && newOtp.join('').length === OTP_LENGTH) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== OTP_LENGTH) return;

    try {
      setIsLoading(true);

      if (purpose === 'verification') {
        const res = await client.post('/auth/verify-otp', { email, otp: otpCode });
        const { user, tokens } = res.data.data;
        setAuth(user, tokens.accessToken, tokens.refreshToken);
        Toast.show({ type: 'success', text1: 'Verified!', text2: 'Welcome to LifeTrack' });
      } else {
        // Password reset — navigate to reset screen with OTP
        (navigation as any).navigate('ResetPassword', { email, otp: otpCode });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error', text1: 'Verification Failed',
        text2: error.response?.data?.error || 'Invalid code',
      });
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await client.post('/auth/resend-otp', { email, purpose });
      setResendTimer(60);
      Toast.show({ type: 'success', text1: 'Code Resent', text2: 'Check your email' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.error || 'Failed to resend' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={22} color={textPri} />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${primary}15` }]}>
          <Icon name={purpose === 'verification' ? 'mail-outline' : 'key-outline'} size={28} color={primary} />
        </View>
        <Text style={[styles.title, { color: textPri }]}>
          {purpose === 'verification' ? 'Verify Your Email' : 'Enter Reset Code'}
        </Text>
        <Text style={[styles.subtitle, { color: textSec }]}>
          We sent a 6-digit code to{'\n'}
          <Text style={{ color: textPri, fontWeight: '600' }}>{email}</Text>
        </Text>
      </View>

      {/* OTP Input */}
      <View style={styles.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={r => (inputRefs.current[i] = r)}
            style={[
              styles.otpBox,
              {
                backgroundColor: surfaceC,
                borderColor: digit ? primary : borderC,
                color: textPri,
              },
            ]}
            value={digit}
            onChangeText={t => handleChange(t.replace(/[^0-9]/g, ''), i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {/* Verify Button */}
      <TouchableOpacity
        style={[styles.verifyBtn, { backgroundColor: primary, opacity: isLoading ? 0.7 : 1 }]}
        onPress={() => handleVerify()}
        disabled={isLoading}
      >
        {isLoading
          ? <ActivityIndicator color="#FFF" size="small" />
          : <Text style={styles.verifyText}>Verify</Text>
        }
      </TouchableOpacity>

      {/* Resend */}
      <View style={styles.resendRow}>
        <Text style={[styles.resendLabel, { color: textSec }]}>Didn't receive the code? </Text>
        {resendTimer > 0 ? (
          <Text style={[styles.resendTimer, { color: textSec }]}>Resend in {resendTimer}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <Text style={[styles.resendLink, { color: primary }]}>Resend</Text>
          </TouchableOpacity>
        )}
      </View>
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

  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 32 },
  otpBox: {
    width: 48, height: 56, borderRadius: 12, borderWidth: 1.5,
    textAlign: 'center', fontSize: 22, fontWeight: '700',
  },

  verifyBtn: { height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  verifyText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  resendLabel: { fontSize: 13 },
  resendTimer: { fontSize: 13, fontWeight: '600' },
  resendLink: { fontSize: 13, fontWeight: '700' },
});

export default VerifyOTPScreen;
