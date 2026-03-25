/**
 * Note Editor Screen — Create & Edit
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import { useConfirm } from '../../../components/common/ConfirmModal';
import {
  useNote, useCreateNote, useUpdateNote, useDeleteNote,
  useTogglePin, useToggleArchive,
} from '../../../hooks/api/useNotes';

const COLORS = [
  { hex: '#FFFFFF', label: 'Default' },
  { hex: '#FEF08A', label: 'Yellow' },
  { hex: '#BBF7D0', label: 'Green' },
  { hex: '#BAE6FD', label: 'Blue' },
  { hex: '#DDD6FE', label: 'Purple' },
  { hex: '#FECACA', label: 'Red' },
  { hex: '#FED7AA', label: 'Orange' },
  { hex: '#F0ABFC', label: 'Pink' },
  { hex: '#E2E8F0', label: 'Gray' },
];

const NoteEditorScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { confirm } = useConfirm();
  const primary = colors.primary;

  const { mode, noteId } = (route.params as any) || {};
  const isEdit = mode === 'edit' && !!noteId;

  const { data: noteData } = useNote(noteId ?? '');
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();
  const pinMutation = useTogglePin();
  const archiveMutation = useToggleArchive();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#FFFFFF');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [showColorSheet, setShowColorSheet] = useState(false);
  const [showTagSheet, setShowTagSheet] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const contentRef = useRef<TextInput>(null);

  const existingNote = (noteData as any)?.data?.data ?? (noteData as any)?.data;
  useEffect(() => {
    if (existingNote && isEdit) {
      setTitle(existingNote.title ?? '');
      setContent(existingNote.content ?? '');
      setColor(existingNote.color ?? '#FFFFFF');
      setTags(existingNote.tags ?? []);
      setIsPinned(existingNote.isPinned ?? false);
      setIsArchived(existingNote.isArchived ?? false);
    }
  }, [existingNote, isEdit]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 10) { setTags(prev => [...prev, t]); setIsDirty(true); }
    setTagInput('');
  };

  const removeTag = (tag: string) => { setTags(prev => prev.filter(t => t !== tag)); setIsDirty(true); };

  const handleSave = () => {
    if (!content.trim() && !title.trim()) { navigation.goBack(); return; }
    const payload = { title: title.trim(), content: content.trim() || ' ', color, tags, isPinned, isArchived };
    if (isEdit) updateMutation.mutate({ id: noteId, data: payload }, { onSuccess: () => navigation.goBack() });
    else createMutation.mutate(payload, { onSuccess: () => navigation.goBack() });
  };

  const handleBack = async () => {
    if (isDirty || (!isEdit && (title.trim() || content.trim()))) {
      const ok = await confirm({ title: 'Save note?', message: 'You have unsaved changes.', confirmText: 'Save', cancelText: 'Discard', variant: 'warning' });
      if (ok) handleSave(); else navigation.goBack();
    } else navigation.goBack();
  };

  const handleDelete = async () => {
    const ok = await confirm({ title: 'Delete Note', message: 'This cannot be undone.', confirmText: 'Delete', variant: 'danger' });
    if (ok) deleteMutation.mutate(noteId, { onSuccess: () => navigation.goBack() });
  };

  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const bgColor = isDark ? colors.surface : (color !== '#FFFFFF' ? color : colors.background);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <KeyboardAvoidingView style={[s.container, { backgroundColor: bgColor }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8, borderBottomColor: `${textPri}10` }]}>
        <TouchableOpacity style={s.headerBtn} onPress={handleBack}>
          <Icon name="arrow-back" size={22} color={textPri} />
        </TouchableOpacity>

        <View style={s.headerActions}>
          <TouchableOpacity
            style={[s.actionBtn, isPinned && { backgroundColor: `${primary}15` }]}
            onPress={() => { if (isEdit) { pinMutation.mutate(noteId); setIsPinned(p => !p); } else setIsPinned(p => !p); setIsDirty(true); }}
          >
            <Icon name={isPinned ? 'pin' : 'pin-outline'} size={18} color={isPinned ? primary : textSec} />
          </TouchableOpacity>

          {isEdit && (
            <TouchableOpacity
              style={[s.actionBtn, isArchived && { backgroundColor: '#F59E0B15' }]}
              onPress={() => archiveMutation.mutate(noteId, { onSuccess: () => { setIsArchived(p => !p); if (!isArchived) navigation.goBack(); } })}
            >
              <Icon name={isArchived ? 'archive' : 'archive-outline'} size={18} color={isArchived ? '#F59E0B' : textSec} />
            </TouchableOpacity>
          )}

          {isEdit && (
            <TouchableOpacity style={s.actionBtn} onPress={handleDelete}>
              <Icon name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[s.saveBtn, { backgroundColor: primary, opacity: isSaving ? 0.6 : 1 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={s.saveBtnText}>{isSaving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
        <TextInput
          style={[s.titleInput, { color: textPri }]}
          placeholder="Title"
          placeholderTextColor={`${textPri}40`}
          value={title}
          onChangeText={t => { setTitle(t); setIsDirty(true); }}
          multiline
          returnKeyType="next"
          onSubmitEditing={() => contentRef.current?.focus()}
        />

        <TextInput
          ref={contentRef}
          style={[s.contentInput, { color: textPri }]}
          placeholder="Start writing…"
          placeholderTextColor={`${textPri}30`}
          value={content}
          onChangeText={t => { setContent(t); setIsDirty(true); }}
          multiline
          textAlignVertical="top"
          scrollEnabled={false}
        />

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Toolbar */}
      <View style={[s.toolbar, { backgroundColor: bgColor, borderTopColor: `${textPri}10`, paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={s.toolBtn} onPress={() => setShowColorSheet(true)}>
          <View style={[s.colorPreview, { backgroundColor: color, borderColor: `${textPri}25` }]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.toolBtn, showTagSheet && { backgroundColor: `${primary}15`, borderRadius: 8 }]}
          onPress={() => setShowTagSheet(true)}
        >
          <Icon name="pricetag-outline" size={18} color={showTagSheet ? primary : textSec} />
        </TouchableOpacity>

        <View style={s.toolSpacer} />

        <Text style={[s.charCount, { color: textSec }]}>{content.length} chars</Text>

        {isEdit && existingNote && (
          <Text style={[s.lastSaved, { color: textSec }]}>
            Edited {new Date(existingNote.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </Text>
        )}
      </View>

      {/* Color Picker Bottom Sheet */}
      <Modal visible={showColorSheet} transparent animationType="slide" onRequestClose={() => setShowColorSheet(false)}>
        <TouchableOpacity style={s.sheetOverlay} activeOpacity={1} onPress={() => setShowColorSheet(false)}>
          <View style={[s.sheetContent, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <View style={[s.sheetHandle, { backgroundColor: isDark ? '#475569' : '#CBD5E1' }]} />
            <Text style={[s.sheetTitle, { color: textPri }]}>Note Color</Text>
            <View style={s.colorGrid}>
              {COLORS.map(c => (
                <TouchableOpacity
                  key={c.hex}
                  style={[s.colorItem, {
                    backgroundColor: isDark ? (c.hex === '#FFFFFF' ? '#334155' : `${c.hex}40`) : c.hex,
                    borderColor: color === c.hex ? primary : (isDark ? '#475569' : '#E2E8F0'),
                    borderWidth: color === c.hex ? 2.5 : 1,
                  }]}
                  onPress={() => { setColor(c.hex); setIsDirty(true); setShowColorSheet(false); }}
                >
                  {color === c.hex && <Icon name="checkmark" size={16} color={primary} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Tag Bottom Sheet */}
      <Modal visible={showTagSheet} transparent animationType="slide" onRequestClose={() => setShowTagSheet(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={s.sheetOverlay} activeOpacity={1} onPress={() => setShowTagSheet(false)}>
            <View style={[s.sheetContent, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]} onStartShouldSetResponder={() => true}>
              <View style={[s.sheetHandle, { backgroundColor: isDark ? '#475569' : '#CBD5E1' }]} />
              <Text style={[s.sheetTitle, { color: textPri }]}>Tags</Text>

              {/* Tag Input */}
              <View style={[s.tagInputRow, { borderColor: `${primary}40`, backgroundColor: `${textPri}06` }]}>
                <Icon name="pricetag-outline" size={14} color={primary} />
                <TextInput
                  style={[s.tagInputField, { color: textPri }]}
                  placeholder="Type tag and press add…"
                  placeholderTextColor={`${textPri}35`}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                  autoFocus
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={addTag}>
                  <Icon name="add-circle" size={20} color={primary} />
                </TouchableOpacity>
              </View>

              {/* Existing Tags */}
              {tags.length > 0 ? (
                <View style={s.tagsWrap}>
                  {tags.map(tag => (
                    <TouchableOpacity
                      key={tag}
                      style={[s.tagPill, { backgroundColor: `${primary}12`, borderColor: `${primary}30` }]}
                      onPress={() => removeTag(tag)}
                    >
                      <Text style={[s.tagPillText, { color: primary }]}>#{tag}</Text>
                      <Icon name="close" size={10} color={primary} />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={[s.tagEmpty, { color: textSec }]}>No tags yet — type above to add</Text>
              )}

              {/* Done button */}
              <TouchableOpacity
                style={[s.tagDoneBtn, { backgroundColor: primary }]}
                onPress={() => { setShowTagSheet(false); setTagInput(''); }}
              >
                <Text style={s.tagDoneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 10, borderBottomWidth: 1 },
  headerBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtn: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  saveBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  body: { flex: 1, paddingHorizontal: 18 },
  titleInput: { fontSize: 20, fontWeight: '700', paddingTop: 16, paddingBottom: 6, lineHeight: 28 },
  contentInput: { fontSize: 14, lineHeight: 23, paddingBottom: 14, minHeight: 200 },

  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingBottom: 10 },
  tagPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  tagPillText: { fontSize: 11, fontWeight: '600' },

  tagInputRow: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 10 },
  tagInputField: { flex: 1, fontSize: 13 },

  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, borderTopWidth: 1, gap: 4 },
  toolBtn: { padding: 6 },
  toolSpacer: { flex: 1 },
  colorPreview: { width: 20, height: 20, borderRadius: 10, borderWidth: 1 },
  charCount: { fontSize: 10 },
  lastSaved: { fontSize: 10, marginLeft: 8 },

  sheetOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000040' },
  sheetContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 14, fontWeight: '700', marginBottom: 14 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorItem: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

  tagEmpty: { fontSize: 12, textAlign: 'center', paddingVertical: 12 },
  tagDoneBtn: { height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  tagDoneBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});

export default NoteEditorScreen;
