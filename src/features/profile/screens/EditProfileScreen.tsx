/* eslint-disable react-native/no-inline-styles */
/**
 * Edit Profile Screen — name, phone editable, email readonly
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
import { useAuthStore } from '../../../store';
import client from '../../../api/client';
import Toast from 'react-native-toast-message';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { GuideButton, GuideView } = useGuide('editProfile');
  const { user, setAuth } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [isLoading, setIsLoading] = useState(false);

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#E2E8F0';
  const primary = colors.primary;

  const hasChanges = name !== (user?.name || '') || phone !== (user?.phoneNumber || '');

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      setIsLoading(true);
      const res = await client.put('/auth/profile', { name: name.trim(), phoneNumber: phone.trim() || null });
      const updatedUser = res.data.data;

      // Update local store
      setAuth({ ...user, ...updatedUser } as any, undefined as any, undefined as any);

      Toast.show({ type: 'success', text1: 'Profile Updated' });
      navigation.goBack();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.error || 'Update failed' });
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
        <Text style={[styles.headerTitle, { color: textPri }]}>Edit Profile</Text>
        <GuideButton color={textPri} />
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: primary, opacity: hasChanges && !isLoading ? 1 : 0.5 }]}
          onPress={handleSave}
          disabled={!hasChanges || isLoading}
        >
          {isLoading
            ? <ActivityIndicator color="#FFF" size="small" />
            : <Text style={styles.saveText}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: primary }]}>
            <Text style={styles.avatarText}>{name?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
        </View>

        {/* Full Name */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: textSec }]}>Full Name</Text>
          <View style={[styles.inputWrap, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Icon name="person-outline" size={18} color={textSec} />
            <TextInput style={[styles.input, { color: textPri }]} value={name} onChangeText={setName} placeholderTextColor={`${textSec}60`} />
          </View>
        </View>

        {/* Email (readonly) */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: textSec }]}>Email</Text>
          <View style={[styles.inputWrap, { backgroundColor: surfaceC, borderColor: borderC, opacity: 0.6 }]}>
            <Icon name="mail-outline" size={18} color={textSec} />
            <TextInput style={[styles.input, { color: textPri }]} value={user?.email || ''} editable={false} />
            <Icon name="lock-closed" size={14} color={textSec} />
          </View>
        </View>

        {/* Phone */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: textSec }]}>Phone</Text>
          <View style={[styles.inputWrap, { backgroundColor: surfaceC, borderColor: borderC }]}>
            <Icon name="call-outline" size={18} color={textSec} />
            <TextInput style={[styles.input, { color: textPri }]} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={`${textSec}60`} />
          </View>
        </View>
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
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  content: { padding: 20 },

  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#FFF' },

  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48,
  },
  input: { flex: 1, fontSize: 14 },
});

export default EditProfileScreen;
