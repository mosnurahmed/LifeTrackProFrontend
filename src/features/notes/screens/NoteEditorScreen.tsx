/**
 * Note Editor Screen — Create & Edit
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../hooks/useTheme';
import {
  useNote, useCreateNote, useUpdateNote, useDeleteNote,
  useTogglePin, useToggleArchive,
} from '../../../hooks/api/useNotes';

// ─── Color Palette ────────────────────────────────────────────────────────────

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

// ─── Main Screen ──────────────────────────────────────────────────────────────

const NoteEditorScreen: React.FC = () => {
  const navigation = useNavigation();
  const route      = useRoute();
  const insets     = useSafeAreaInsets();
  const { colors } = useTheme();

  const { mode, noteId } = (route.params as any) || {};
  const isEdit = mode === 'edit' && !!noteId;

  const { data: noteData } = useNote(noteId ?? '');
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();
  const pinMutation    = useTogglePin();
  const archiveMutation = useToggleArchive();

  const [title,     setTitle]     = useState('');
  const [content,   setContent]   = useState('');
  const [color,     setColor]     = useState('#FFFFFF');
  const [tags,      setTags]      = useState<string[]>([]);
  const [tagInput,  setTagInput]  = useState('');
  const [isPinned,  setIsPinned]  = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const contentRef = useRef<TextInput>(null);
  const colorAnim  = useRef(new Animated.Value(0)).current;

  // Load existing note
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

  const toggleColors = () => {
    const toVal = showColors ? 0 : 1;
    setShowColors(!showColors);
    Animated.spring(colorAnim, { toValue: toVal, useNativeDriver: false }).start();
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags(prev => [...prev, t]);
      setIsDirty(true);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!content.trim() && !title.trim()) {
      navigation.goBack();
      return;
    }
    const payload = {
      title:      title.trim(),
      content:    content.trim() || ' ',
      color,
      tags,
      isPinned,
      isArchived,
    };
    if (isEdit) {
      updateMutation.mutate({ id: noteId, data: payload }, { onSuccess: () => navigation.goBack() });
    } else {
      createMutation.mutate(payload, { onSuccess: () => navigation.goBack() });
    }
  };

  const handleBack = () => {
    if (isDirty || (!isEdit && (title.trim() || content.trim()))) {
      Alert.alert('Save note?', 'You have unsaved changes.', [
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        { text: 'Save', onPress: handleSave },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      navigation.goBack();
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Note', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        deleteMutation.mutate(noteId, { onSuccess: () => navigation.goBack() });
      }},
    ]);
  };

  const isDark    = colors.background === '#0F172A';
  const bgColor   = isDark ? colors.surface : (color !== '#FFFFFF' ? color : colors.background);
  const textColor = isDark ? colors.text.primary : '#1E293B';
  const subColor  = isDark ? colors.text.secondary : '#64748B';
  const isSaving  = createMutation.isPending || updateMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: `${textColor}15` }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          {/* Pin */}
          <TouchableOpacity
            style={[styles.headerActionBtn, isPinned && { backgroundColor: '#8B5CF620' }]}
            onPress={() => {
              if (isEdit) { pinMutation.mutate(noteId); setIsPinned(p => !p); }
              else setIsPinned(p => !p);
              setIsDirty(true);
            }}
          >
            <Icon name={isPinned ? 'pin' : 'pin-outline'} size={20} color={isPinned ? '#8B5CF6' : subColor} />
          </TouchableOpacity>

          {/* Archive */}
          {isEdit && (
            <TouchableOpacity
              style={[styles.headerActionBtn, isArchived && { backgroundColor: '#F59E0B20' }]}
              onPress={() => {
                archiveMutation.mutate(noteId, { onSuccess: () => {
                  setIsArchived(p => !p);
                  if (!isArchived) navigation.goBack();
                }});
              }}
            >
              <Icon name={isArchived ? 'archive' : 'archive-outline'} size={20}
                color={isArchived ? '#F59E0B' : subColor} />
            </TouchableOpacity>
          )}

          {/* Delete */}
          {isEdit && (
            <TouchableOpacity style={styles.headerActionBtn} onPress={handleDelete}>
              <Icon name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: '#8B5CF6' }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveBtnText}>{isSaving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <TextInput
          style={[styles.titleInput, { color: textColor }]}
          placeholder="Title"
          placeholderTextColor={`${textColor}50`}
          value={title}
          onChangeText={t => { setTitle(t); setIsDirty(true); }}
          multiline
          returnKeyType="next"
          onSubmitEditing={() => contentRef.current?.focus()}
        />

        {/* Content */}
        <TextInput
          ref={contentRef}
          style={[styles.contentInput, { color: textColor }]}
          placeholder="Start writing…"
          placeholderTextColor={`${textColor}40`}
          value={content}
          onChangeText={t => { setContent(t); setIsDirty(true); }}
          multiline
          textAlignVertical="top"
          scrollEnabled={false}
        />

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tagsWrap}>
            {tags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.tagPill, { backgroundColor: '#8B5CF625', borderColor: '#8B5CF640' }]}
                onPress={() => removeTag(tag)}
              >
                <Text style={[styles.tagPillText, { color: isDark ? '#C4B5FD' : '#7C3AED' }]}>#{tag}</Text>
                <Icon name="close" size={11} color="#8B5CF6" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tag input */}
        {showTagInput && (
          <View style={[styles.tagInputRow, { borderColor: '#8B5CF650', backgroundColor: `${textColor}08` }]}>
            <Icon name="pricetag-outline" size={15} color="#8B5CF6" />
            <TextInput
              style={[styles.tagInputField, { color: textColor }]}
              placeholder="Add tag…"
              placeholderTextColor={`${textColor}40`}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              returnKeyType="done"
              autoFocus
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={addTag}>
              <Icon name="add-circle" size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        )}

        {/* Color Picker */}
        {showColors && (
          <View style={styles.colorGrid}>
            {COLORS.map(c => (
              <TouchableOpacity
                key={c.hex}
                style={[styles.colorSwatch, {
                  backgroundColor: isDark ? colors.border : c.hex,
                  borderColor: color === c.hex ? '#8B5CF6' : `${textColor}25`,
                  borderWidth: color === c.hex ? 2.5 : 1,
                }]}
                onPress={() => { setColor(c.hex); setIsDirty(true); }}
              >
                {color === c.hex && <Icon name="checkmark" size={14} color="#8B5CF6" />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Toolbar */}
      <View style={[styles.toolbar, {
        backgroundColor: bgColor,
        borderTopColor: `${textColor}15`,
        paddingBottom: insets.bottom + 8,
      }]}>
        <TouchableOpacity style={styles.toolBtn} onPress={toggleColors}>
          <View style={[styles.colorPreview, { backgroundColor: color, borderColor: `${textColor}30` }]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolBtn, showTagInput && { backgroundColor: '#8B5CF620', borderRadius: 10 }]}
          onPress={() => setShowTagInput(v => !v)}
        >
          <Icon name="pricetag-outline" size={20} color={showTagInput ? '#8B5CF6' : subColor} />
        </TouchableOpacity>

        <View style={styles.toolSpacer} />

        <Text style={[styles.charCount, { color: subColor }]}>
          {content.length} chars
        </Text>

        {isEdit && (
          <Text style={[styles.lastSaved, { color: subColor }]}>
            {existingNote ? `Edited ${new Date(existingNote.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerBtn:       { padding: 4 },
  headerActions:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerActionBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  saveBtn:         { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  saveBtnText:     { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  body:        { flex: 1, paddingHorizontal: 20 },
  titleInput:  { fontSize: 22, fontWeight: '700', paddingTop: 18, paddingBottom: 8, lineHeight: 30 },
  contentInput: { fontSize: 16, lineHeight: 26, paddingBottom: 16, minHeight: 200 },

  tagsWrap:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 12 },
  tagPill:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  tagPillText: { fontSize: 12, fontWeight: '600' },

  tagInputRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  tagInputField: { flex: 1, fontSize: 14 },

  colorGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 16 },
  colorSwatch: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  toolbar:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, borderTopWidth: 1, gap: 4 },
  toolBtn:      { padding: 8 },
  toolSpacer:   { flex: 1 },
  colorPreview: { width: 22, height: 22, borderRadius: 11, borderWidth: 1 },
  charCount:    { fontSize: 11 },
  lastSaved:    { fontSize: 11, marginLeft: 10 },
});

export default NoteEditorScreen;
