/* eslint-disable react-native/no-inline-styles */
/**
 * Change Password Screen
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useGuide } from '../../../components/common';
import client from '../../../api/client';
import Toast from 'react-native-toast-message';

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { GuideButton, GuideView } = useGuide('changePassword');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#E2E8F0';
  const primary = colors.primary;

  const canSubmit = currentPass.length >= 6 && newPass.length >= 6 && newPass === confirmPass;

  const handleChange = async () => {
    if (!canSubmit) return;
    try {
      setIsLoading(true);
      await client.put('/auth/change-password', {
        currentPassword: currentPass,
        newPassword: newPass,
      });
      Toast.show({ type: 'success', text1: 'Password Changed', text2: 'Your password has been updated' });
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error', text1: 'Error',
        text2: error.response?.data?.error || 'Failed to change password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: surfaceC, borderBottomColor: borderC }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={textPri} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPri }]}>Change Password</Text>
        <GuideButton color={textPri} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.infoCard, { backgroundColor: `${primary}10`, borderColor: `${primary}25` }]}>
          <Icon name="information-circle-outline" size={18} color={primary} />
          <Text style={[styles.infoText, { color: textSec }]}>
            Password must be at least 6 characters
          </Text>
        </View>

        {/* Current Password */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: textSec }]}>Current Password</Text>
          <View style={[styles.inputWrap, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Icon name="lock-closed-outline" size={18} color={textSec} />
            <TextInput style={[styles.input, { color: textPri }]} placeholder="Enter current password" placeholderTextColor={`${textSec}60`} value={currentPass} onChangeText={setCurrentPass} secureTextEntry={!showCurrent} />
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
              <Icon name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={18} color={textSec} />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: textSec }]}>New Password</Text>
          <View style={[styles.inputWrap, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Icon name="lock-closed-outline" size={18} color={textSec} />
            <TextInput style={[styles.input, { color: textPri }]} placeholder="Enter new password" placeholderTextColor={`${textSec}60`} value={newPass} onChangeText={setNewPass} secureTextEntry={!showNew} />
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              <Icon name={showNew ? 'eye-off-outline' : 'eye-outline'} size={18} color={textSec} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: textSec }]}>Confirm New Password</Text>
          <View style={[styles.inputWrap, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Icon name="lock-closed-outline" size={18} color={textSec} />
            <TextInput
              style={[styles.input, { color: textPri }]}
              placeholder="Confirm new password"
              placeholderTextColor={`${textSec}60`}
              value={confirmPass}
              onChangeText={setConfirmPass}
              secureTextEntry={!showNew}
            />
            {confirmPass.length > 0 && (
              <Icon
                name={newPass === confirmPass ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={newPass === confirmPass ? '#10B981' : '#EF4444'}
              />
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: primary, opacity: canSubmit && !isLoading ? 1 : 0.5 }]}
          onPress={handleChange}
          disabled={!canSubmit || isLoading}
        >
          {isLoading
            ? <ActivityIndicator color="#FFF" size="small" />
            : <Text style={styles.saveText}>Update Password</Text>
          }
        </TouchableOpacity>
      </ScrollView>
      <GuideView />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingBottom: 12,
    borderBottomWidth: 1, gap: 8,
  },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', textAlign: 'center' },

  content: { padding: 20 },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 24,
  },
  infoText: { fontSize: 12, flex: 1 },

  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48,
  },
  input: { flex: 1, fontSize: 14 },

  saveBtn: { height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  saveText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default ChangePasswordScreen;
