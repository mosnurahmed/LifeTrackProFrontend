/**
 * Notes Screen
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert, TextInput, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import {
  useNotes, useTogglePin, useToggleArchive, useDeleteNote,
} from '../../../hooks/api/useNotes';
import { AppHeader } from '../../../components/common';
import type { Note } from '../../../api/endpoints/notes';

// ─── Note Card ────────────────────────────────────────────────────────────────

const NoteCard = ({
  note, onPress, onPin, onArchive, onDelete, colors,
}: {
  note: Note; onPress: () => void; onPin: () => void;
  onArchive: () => void; onDelete: () => void; colors: any;
}) => {
  const isDark   = colors.background === '#0F172A';
  const bgColor  = isDark ? colors.surface : (note.color !== '#FFFFFF' ? note.color : colors.surface);

  return (
    <TouchableOpacity
      style={[styles.card, {
        backgroundColor: bgColor,
        borderColor: note.isPinned ? '#8B5CF6' : colors.border,
        borderWidth: note.isPinned ? 1.5 : 1,
      }]}
      onPress={onPress}
      onLongPress={() => Alert.alert(note.title || 'Note', 'What would you like to do?', [
        { text: note.isPinned ? 'Unpin' : 'Pin', onPress: onPin },
        { text: note.isArchived ? 'Unarchive' : 'Archive', onPress: onArchive },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
        { text: 'Cancel', style: 'cancel' },
      ])}
      activeOpacity={0.78}
    >
      {note.isPinned && (
        <View style={styles.pinDot}>
          <Icon name="pin" size={11} color="#8B5CF6" />
        </View>
      )}

      {note.title ? (
        <Text style={[styles.cardTitle, { color: isDark ? colors.text.primary : '#1E293B' }]}
          numberOfLines={2}>
          {note.title}
        </Text>
      ) : null}

      <Text style={[styles.cardBody, { color: isDark ? colors.text.secondary : '#475569' }]}
        numberOfLines={7}>
        {note.content}
      </Text>

      {note.tags.length > 0 && (
        <View style={styles.tagRow}>
          {note.tags.slice(0, 3).map(t => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>#{t}</Text>
            </View>
          ))}
          {note.tags.length > 3 && (
            <Text style={[styles.tagMore, { color: colors.text.tertiary }]}>+{note.tags.length - 3}</Text>
          )}
        </View>
      )}

      <View style={styles.cardFoot}>
        <Text style={[styles.cardDate, { color: isDark ? colors.text.tertiary : '#94A3B8' }]}>
          {new Date(note.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </Text>
        <TouchableOpacity onPress={onPin} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon
            name={note.isPinned ? 'pin' : 'pin-outline'}
            size={13}
            color={note.isPinned ? '#8B5CF6' : (isDark ? colors.text.tertiary : '#CBD5E1')}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

type Tab = 'all' | 'pinned' | 'archived';

const NotesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [tab, setTab]                     = useState<Tab>('all');
  const [search, setSearch]               = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [activeTag, setActiveTag]         = useState<string | null>(null);

  const filters = useMemo(() => ({
    isArchived: tab === 'archived' ? true : tab === 'pinned' ? undefined : undefined,
    isPinned:   tab === 'pinned'   ? true : undefined,
    search:     search || undefined,
    tags:       activeTag || undefined,
  }), [tab, search, activeTag]);

  const { data, isLoading, refetch, isRefetching } = useNotes(filters);
  const pinMutation     = useTogglePin();
  const archiveMutation = useToggleArchive();
  const deleteMutation  = useDeleteNote();

  const notes: Note[] = (data as any)?.data?.data ?? [];

  // Collect tags from all loaded notes
  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach(n => n.tags.forEach(t => set.add(t)));
    return Array.from(set);
  }, [notes]);

  // Filter archived locally when tab=all (exclude archived)
  const visibleNotes = useMemo(() => {
    let list = notes;
    if (tab === 'all') list = list.filter(n => !n.isArchived);
    return [...list].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, tab]);

  const pinnedCount = useMemo(() => notes.filter(n => n.isPinned && !n.isArchived).length, [notes]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Notes"
        right={
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => { setSearchVisible(v => !v); if (searchVisible) setSearch(''); }}
            >
              <Icon name={searchVisible ? 'close' : 'search-outline'} size={18} color={colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: '#8B5CF6' }]}
              onPress={() => (navigation as any).navigate('NoteEditor', { mode: 'create' })}
            >
              <Icon name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Search Bar */}
      {searchVisible && (
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Icon name="search-outline" size={17} color={colors.text.tertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder="Search notes..."
            placeholderTextColor={colors.text.tertiary}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close-circle" size={17} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {([
          { key: 'all',      label: 'All',      icon: 'document-text-outline' },
          { key: 'pinned',   label: 'Pinned',   icon: 'pin-outline',     badge: pinnedCount },
          { key: 'archived', label: 'Archived', icon: 'archive-outline' },
        ] as const).map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && { borderBottomColor: '#8B5CF6', borderBottomWidth: 2 }]}
            onPress={() => { setTab(t.key); setActiveTag(null); }}
          >
            <Icon name={t.icon} size={14} color={tab === t.key ? '#8B5CF6' : colors.text.tertiary} />
            <Text style={[styles.tabText, { color: tab === t.key ? '#8B5CF6' : colors.text.secondary },
              tab === t.key && { fontWeight: '700' }]}>
              {t.label}
            </Text>
            {'badge' in t && t.badge > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{t.badge}</Text></View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tag Filter Chips */}
      {allTags.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }} contentContainerStyle={styles.tagFilterRow}>
          <TouchableOpacity
            style={[styles.tagChip, { backgroundColor: !activeTag ? '#8B5CF6' : colors.surface, borderColor: !activeTag ? '#8B5CF6' : colors.border }]}
            onPress={() => setActiveTag(null)}
          >
            <Text style={[styles.tagChipText, { color: !activeTag ? '#FFFFFF' : colors.text.secondary }]}>All</Text>
          </TouchableOpacity>
          {allTags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.tagChip, { backgroundColor: activeTag === tag ? '#8B5CF6' : colors.surface, borderColor: activeTag === tag ? '#8B5CF6' : colors.border }]}
              onPress={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              <Text style={[styles.tagChipText, { color: activeTag === tag ? '#FFFFFF' : colors.text.secondary }]}>
                #{tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Notes Grid */}
      {visibleNotes.length === 0 && !isLoading ? (
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyBg, { backgroundColor: '#8B5CF612' }]}>
            <Icon name="document-text-outline" size={52} color="#8B5CF6" />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
            {search ? 'No matching notes' : tab === 'pinned' ? 'No pinned notes' : tab === 'archived' ? 'No archived notes' : 'No notes yet'}
          </Text>
          <Text style={[styles.emptyHint, { color: colors.text.secondary }]}>
            {tab === 'all' && !search ? 'Tap + to write your first note' : 'Try a different filter'}
          </Text>
          {tab === 'all' && !search && (
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: '#8B5CF6' }]}
              onPress={() => (navigation as any).navigate('NoteEditor', { mode: 'create' })}
            >
              <Icon name="add" size={18} color="#FFFFFF" />
              <Text style={styles.emptyBtnText}>New Note</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={visibleNotes}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              onPress={() => (navigation as any).navigate('NoteEditor', { mode: 'edit', noteId: item._id })}
              onPin={() => pinMutation.mutate(item._id)}
              onArchive={() => archiveMutation.mutate(item._id)}
              onDelete={() => Alert.alert('Delete Note', `Delete "${item.title || 'this note'}"?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(item._id) },
              ])}
              colors={colors}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch}
              colors={['#8B5CF6']} tintColor={'#8B5CF6'} />
          }
        />
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerRight: { flexDirection: 'row', gap: 8 },
  headerBtn:   { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

  searchBar:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchInput: { flex: 1, fontSize: 15 },

  tabBar:      { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 8 },
  tab:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 11, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText:     { fontSize: 13, fontWeight: '600' },
  badge:       { backgroundColor: '#8B5CF6', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  badgeText:   { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },

  tagFilterRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  tagChip:      { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
  tagChipText:  { fontSize: 12, fontWeight: '600' },

  listContent:  { padding: 10, paddingBottom: 40 },
  row:          { gap: 10, marginBottom: 10 },

  card:      { flex: 1, borderRadius: 16, padding: 13, minHeight: 110 },
  pinDot:    { position: 'absolute', top: 10, right: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 5, paddingRight: 16, lineHeight: 19 },
  cardBody:  { fontSize: 12, lineHeight: 18, marginBottom: 8 },
  tagRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  tag:       { backgroundColor: '#8B5CF620', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tagText:   { fontSize: 10, color: '#8B5CF6', fontWeight: '600' },
  tagMore:   { fontSize: 10 },
  cardFoot:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  cardDate:  { fontSize: 10 },

  emptyWrap:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 40 },
  emptyBg:    { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyHint:  { fontSize: 14, textAlign: 'center' },
  emptyBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

export default NotesScreen;
