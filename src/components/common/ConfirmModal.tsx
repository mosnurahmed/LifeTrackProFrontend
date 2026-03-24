/**
 * ConfirmModal — Professional global confirmation & action sheet dialog
 *
 * confirm():     2 buttons (cancel/confirm) → returns boolean
 * actionSheet(): N buttons → returns string key or null
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/useTheme';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'default';
  icon?: string;
}

interface ActionButton {
  key: string;
  label: string;
  icon?: string;
  variant?: 'danger' | 'default';
}

interface ActionSheetOptions {
  title: string;
  message?: string;
  actions: ActionButton[];
  icon?: string;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  actionSheet: (options: ActionSheetOptions) => Promise<string | null>;
}

// ─── Context ────────────────────────────────────────────────────────────────

const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: () => Promise.resolve(false),
  actionSheet: () => Promise.resolve(null),
});

export const useConfirm = () => useContext(ConfirmContext);

// ─── Variant config ─────────────────────────────────────────────────────────

const VARIANTS: Record<string, { color: string; icon: string; bg: string }> = {
  danger:  { color: '#EF4444', icon: 'trash-outline',   bg: '#EF444412' },
  warning: { color: '#F59E0B', icon: 'warning-outline', bg: '#F59E0B12' },
  info:    { color: '#3B82F6', icon: 'information-circle-outline', bg: '#3B82F612' },
  default: { color: '#8B5CF6', icon: 'help-circle-outline', bg: '#8B5CF612' },
};

// ─── Provider ───────────────────────────────────────────────────────────────

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors, isDark } = useTheme();

  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'confirm' | 'sheet'>('confirm');
  const [confirmOpts, setConfirmOpts] = useState<ConfirmOptions>({ title: '' });
  const [sheetOpts, setSheetOpts] = useState<ActionSheetOptions>({ title: '', actions: [] });

  const resolveConfirmRef = useRef<(v: boolean) => void>();
  const resolveSheetRef = useRef<(v: string | null) => void>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const show = useCallback(() => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const hide = useCallback((cb: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setVisible(false);
      scaleAnim.setValue(0.9);
      cb();
    });
  }, [fadeAnim, scaleAnim]);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setMode('confirm');
    setConfirmOpts(opts);
    show();
    return new Promise<boolean>(resolve => { resolveConfirmRef.current = resolve; });
  }, [show]);

  const actionSheet = useCallback((opts: ActionSheetOptions): Promise<string | null> => {
    setMode('sheet');
    setSheetOpts(opts);
    show();
    return new Promise<string | null>(resolve => { resolveSheetRef.current = resolve; });
  }, [show]);

  const closeConfirm = (result: boolean) => hide(() => resolveConfirmRef.current?.(result));
  const closeSheet = (result: string | null) => hide(() => resolveSheetRef.current?.(result));

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#E2E8F0';

  return (
    <ConfirmContext.Provider value={{ confirm, actionSheet }}>
      {children}
      <Modal visible={visible} transparent statusBarTranslucent animationType="none">
        <TouchableWithoutFeedback onPress={() => mode === 'confirm' ? closeConfirm(false) : closeSheet(null)}>
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[styles.dialog, { backgroundColor: surfaceC, transform: [{ scale: scaleAnim }] }]}
              >
                {mode === 'confirm' ? (
                  <>
                    {/* Icon */}
                    {(() => {
                      const v = VARIANTS[confirmOpts.variant || 'default'];
                      return (
                        <View style={[styles.iconCircle, { backgroundColor: v.bg }]}>
                          <Icon name={confirmOpts.icon || v.icon} size={28} color={v.color} />
                        </View>
                      );
                    })()}
                    <Text style={[styles.title, { color: textPri }]}>{confirmOpts.title}</Text>
                    {confirmOpts.message && (
                      <Text style={[styles.message, { color: textSec }]}>{confirmOpts.message}</Text>
                    )}
                    <View style={styles.buttons}>
                      <TouchableOpacity
                        style={[styles.btn, styles.cancelBtn, { borderColor: borderC }]}
                        onPress={() => closeConfirm(false)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.cancelText, { color: textSec }]}>
                          {confirmOpts.cancelText || 'Cancel'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btn, { backgroundColor: VARIANTS[confirmOpts.variant || 'default'].color }]}
                        onPress={() => closeConfirm(true)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.confirmText}>
                          {confirmOpts.confirmText || 'Confirm'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Action Sheet */}
                    {sheetOpts.icon && (
                      <View style={[styles.iconCircle, { backgroundColor: '#8B5CF612' }]}>
                        <Icon name={sheetOpts.icon} size={28} color="#8B5CF6" />
                      </View>
                    )}
                    <Text style={[styles.title, { color: textPri }]}>{sheetOpts.title}</Text>
                    {sheetOpts.message && (
                      <Text style={[styles.message, { color: textSec }]}>{sheetOpts.message}</Text>
                    )}
                    <View style={styles.sheetActions}>
                      {sheetOpts.actions.map(action => {
                        const isDanger = action.variant === 'danger';
                        return (
                          <TouchableOpacity
                            key={action.key}
                            style={[styles.sheetBtn, { borderColor: borderC }]}
                            onPress={() => closeSheet(action.key)}
                            activeOpacity={0.7}
                          >
                            {action.icon && (
                              <Icon name={action.icon} size={18} color={isDanger ? '#EF4444' : textPri} />
                            )}
                            <Text style={[styles.sheetBtnText, { color: isDanger ? '#EF4444' : textPri }]}>
                              {action.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                      <TouchableOpacity
                        style={[styles.sheetBtn, styles.sheetCancelBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                        onPress={() => closeSheet(null)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.sheetBtnText, { color: textSec }]}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </ConfirmContext.Provider>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  dialog: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  message: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },

  // Confirm buttons
  buttons: { flexDirection: 'row', gap: 12, width: '100%' },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { borderWidth: 1.5 },
  cancelText: { fontSize: 14, fontWeight: '600' },
  confirmText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  // Action sheet buttons
  sheetActions: { width: '100%', gap: 8 },
  sheetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: 12, borderWidth: 1,
  },
  sheetBtnText: { fontSize: 14, fontWeight: '600' },
  sheetCancelBtn: { borderWidth: 0, marginTop: 4 },
});
