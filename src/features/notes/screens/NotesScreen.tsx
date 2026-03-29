/**
 * Notes Screen
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, TextInput, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../hooks/useTheme';
import {
  useNotes, useTogglePin, useToggleArchive, useDeleteNote,
} from '../../../hooks/api/useNotes';
import { AppHeader, useGuide } from '../../../components/common';
import { useConfirm } from '../../../components/common/ConfirmModal';
import { NotesSkeleton } from '../../../components/common/Loading/ScreenSkeletons';
import type { Note } from '../../../api/endpoints/notes';

// ─── Note Card ────────────────────────────────────────────────────────────────

const NoteCard = ({
  note, onPress, onPin, onArchive, onDelete, isDark, primary,
}: {
  note: Note; onPress: () => void; onPin: () => void;
  onArchive: () => void; onDelete: () => void; isDark: boolean; primary: string;
}) => {
  const textPri = isDark ? '#F1F5F9' : '#1E293B';
  const textSec = isDark ? '#94A3B8' : '#64748B';
  const textTer = isDark ? '#475569' : '#CBD5E1';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';
  const bgColor = isDark ? surfaceC : (note.color !== '#FFFFFF' ? note.color : surfaceC);
  const { actionSheet } = useConfirm();

  const handleLongPress = async () => {
    const result = await actionSheet({
      title: note.title || 'Note',
      message: 'Choose an action',
      actions: [
        { key: 'pin', label: note.isPinned ? 'Unpin' : 'Pin', icon: note.isPinned ? 'pin' : 'pin-outline' },
        { key: 'archive', label: note.isArchived ? 'Unarchive' : 'Archive', icon: note.isArchived ? 'archive' : 'archive-outline' },
        { key: 'delete', label: 'Delete', icon: 'trash-outline', variant: 'danger' as const },
      ],
    });
    if (result === 'pin') onPin();
    else if (result === 'archive') onArchive();
    else if (result === 'delete') onDelete();
  };

  return (
    <TouchableOpacity
      style={[st.card, {
        backgroundColor: bgColor,
        borderColor: note.isPinned ? primary : borderC,
        borderWidth: note.isPinned ? 1.5 : 1,
      }]}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.78}
    >
      {note.isPinned && (
        <View style={st.pinDot}>
          <Icon name="pin" size={10} color={primary} />
        </View>
      )}

      {note.title ? (
        <Text style={[st.cardTitle, { color: isDark ? textPri : '#1E293B' }]} numberOfLines={2}>
          {note.title}
        </Text>
      ) : null}

      <Text style={[st.cardBody, { color: isDark ? textSec : '#475569' }]} numberOfLines={7}>
        {note.content}
      </Text>

      {note.tags.length > 0 && (
        <View style={st.tagRow}>
          {note.tags.slice(0, 3).map(t => (
            <View key={t} style={[st.tag, { backgroundColor: `${primary}12` }]}>
              <Text style={[st.tagText, { color: primary }]}>#{t}</Text>
            </View>
          ))}
          {note.tags.length > 3 && (
            <Text style={[st.tagMore, { color: textTer }]}>+{note.tags.length - 3}</Text>
          )}
        </View>
      )}

      <View style={st.cardFoot}>
        <Text style={[st.cardDate, { color: isDark ? textTer : '#94A3B8' }]}>
          {new Date(note.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </Text>
        <TouchableOpacity onPress={onPin} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon
            name={note.isPinned ? 'pin' : 'pin-outline'}
            size={12}
            color={note.isPinned ? primary : textTer}
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
  const { colors, isDark } = useTheme();
  const { confirm } = useConfirm();
  const { GuideButton, GuideView } = useGuide('notes');
  const primary = colors.primary;

  const textSec = isDark ? '#94A3B8' : '#64748B';
  const surfaceC = isDark ? '#1E293B' : '#FFFFFF';
  const borderC = isDark ? '#334155' : '#F1F5F9';

  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filters = useMemo(() => ({
    isArchived: tab === 'archived' ? true : undefined,
    isPinned: tab === 'pinned' ? true : undefined,
    search: search || undefined,
    tags: activeTag || undefined,
  }), [tab, search, activeTag]);

  const { data, isLoading, refetch, isRefetching } = useNotes(filters);
  const pinMutation = useTogglePin();
  const archiveMutation = useToggleArchive();
  const deleteMutation = useDeleteNote();

  const notes: Note[] = (data as any)?.data?.data ?? [];

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach(n => n.tags.forEach(t => set.add(t)));
    return Array.from(set);
  }, [notes]);

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

  const handleDelete = async (note: Note) => {
    const ok = await confirm({ title: 'Delete Note', message: `Delete "${note.title || 'this note'}"?`, confirmText: 'Delete', variant: 'danger' });
    if (ok) deleteMutation.mutate(note._id);
  };

  if (isLoading) {
    return (
      <View style={[st.container, { backgroundColor: colors.background }]}>
        <AppHeader
          title="Notes"
          right={
            <TouchableOpacity
              style={[st.searchBtn, { backgroundColor: `${primary}12` }]}
              onPress={() => setSearchVisible(v => !v)}
            >
              <Icon name="search-outline" size={18} color={primary} />
            </TouchableOpacity>
          }
        />
        <NotesSkeleton />
      </View>
    );
  }

  return (
    <View style={[st.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Notes"
        right={
          <TouchableOpacity
            style={[st.searchBtn, { backgroundColor: `${primary}12` }]}
            onPress={() => { setSearchVisible(v => !v); if (searchVisible) setSearch(''); }}
          >
            <Icon name={searchVisible ? 'close' : 'search-outline'} size={18} color={primary} />
          </TouchableOpacity>
        }
      />

      {/* Search Bar */}
      {searchVisible && (
        <View style={[st.searchBar, { backgroundColor: surfaceC, borderBottomColor: borderC }]}>
          <Icon name="search-outline" size={15} color={textSec} />
          <TextInput
            style={[st.searchInput, { color: isDark ? '#F1F5F9' : '#1E293B' }]}
            placeholder="Search notes..."
            placeholderTextColor={isDark ? '#475569' : '#CBD5E1'}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close-circle" size={15} color={textSec} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Tabs */}
      <View style={[st.tabBar, { backgroundColor: surfaceC, borderBottomColor: borderC }]}>
        {([
          { key: 'all', label: 'All', icon: 'document-text-outline' },
          { key: 'pinned', label: 'Pinned', icon: 'pin-outline', badge: pinnedCount },
          { key: 'archived', label: 'Archived', icon: 'archive-outline' },
        ] as const).map(t => (
          <TouchableOpacity
            key={t.key}
            style={[st.tab, tab === t.key && { borderBottomColor: primary, borderBottomWidth: 2 }]}
            onPress={() => { setTab(t.key); setActiveTag(null); }}
          >
            <Icon name={t.icon} size={13} color={tab === t.key ? primary : textSec} />
            <Text style={[st.tabText, { color: tab === t.key ? primary : textSec }, tab === t.key && { fontWeight: '700' }]}>
              {t.label}
            </Text>
            {'badge' in t && (t.badge ?? 0) > 0 && (
              <View style={[st.badge, { backgroundColor: primary }]}><Text style={st.badgeText}>{t.badge}</Text></View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tag Filter Chips */}
      {allTags.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }} contentContainerStyle={st.tagFilterRow}>
          <TouchableOpacity
            style={[st.tagChip, { backgroundColor: !activeTag ? primary : surfaceC, borderColor: !activeTag ? primary : borderC }]}
            onPress={() => setActiveTag(null)}
          >
            <Text style={[st.tagChipText, { color: !activeTag ? '#FFFFFF' : textSec }]}>All</Text>
          </TouchableOpacity>
          {allTags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[st.tagChip, { backgroundColor: activeTag === tag ? primary : surfaceC, borderColor: activeTag === tag ? primary : borderC }]}
              onPress={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              <Text style={[st.tagChipText, { color: activeTag === tag ? '#FFFFFF' : textSec }]}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Notes Grid */}
      {visibleNotes.length === 0 && !isLoading ? (
        <View style={st.emptyWrap}>
          <View style={[st.emptyBg, { backgroundColor: `${primary}10` }]}>
            <Icon name="document-text-outline" size={40} color={primary} />
          </View>
          <Text style={[st.emptyTitle, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>
            {search ? 'No matching notes' : tab === 'pinned' ? 'No pinned notes' : tab === 'archived' ? 'No archived notes' : 'No notes yet'}
          </Text>
          <Text style={[st.emptyHint, { color: textSec }]}>
            {tab === 'all' && !search ? 'Tap + to write your first note' : 'Try a different filter'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleNotes}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={st.row}
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              onPress={() => (navigation as any).navigate('NoteEditor', { mode: 'edit', noteId: item._id })}
              onPin={() => pinMutation.mutate(item._id)}
              onArchive={() => archiveMutation.mutate(item._id)}
              onDelete={() => handleDelete(item)}
              isDark={isDark}
              primary={primary}
            />
          )}
          contentContainerStyle={st.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch}
              colors={[primary]} tintColor={primary} />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[st.fab, { backgroundColor: primary }]}
        onPress={() => (navigation as any).navigate('NoteEditor', { mode: 'create' })}
        activeOpacity={0.8}
      >
        <Icon name="add" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
  container: { flex: 1 },

  searchBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1 },
  searchInput: { flex: 1, fontSize: 13 },

  tabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 12, fontWeight: '600' },
  badge: { borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1 },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },

  tagFilterRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 6 },
  tagChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, borderWidth: 1 },
  tagChipText: { fontSize: 11, fontWeight: '600' },

  listContent: { padding: 10, paddingBottom: 90 },
  row: { gap: 8, marginBottom: 8 },

  card: { flex: 1, borderRadius: 12, padding: 11, minHeight: 100 },
  pinDot: { position: 'absolute', top: 8, right: 8 },
  cardTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4, paddingRight: 14, lineHeight: 18 },
  cardBody: { fontSize: 11, lineHeight: 16, marginBottom: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginBottom: 5 },
  tag: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5 },
  tagText: { fontSize: 9, fontWeight: '600' },
  tagMore: { fontSize: 9 },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  cardDate: { fontSize: 9 },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, paddingHorizontal: 40 },
  emptyBg: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 15, fontWeight: '700' },
  emptyHint: { fontSize: 12, textAlign: 'center' },

  fab: { position: 'absolute', bottom: 90, right: 20, width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
});

export default NotesScreen;
