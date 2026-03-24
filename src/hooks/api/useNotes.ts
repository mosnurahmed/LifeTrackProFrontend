/**
 * Notes Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi, NotesFilter } from '../../api/endpoints/notes';

const keys = {
  all:    ['notes'] as const,
  list:   (f?: NotesFilter) => ['notes', 'list', f] as const,
  detail: (id: string)      => ['notes', 'detail', id] as const,
  stats:  ()                => ['notes', 'stats'] as const,
  tags:   ()                => ['notes', 'tags'] as const,
};

export const useNotes = (filters?: NotesFilter) =>
  useQuery({ queryKey: keys.list(filters), queryFn: () => notesApi.getAll(filters) });

export const useNote = (id: string) =>
  useQuery({ queryKey: keys.detail(id), queryFn: () => notesApi.getById(id), enabled: !!id });

export const useNoteStats = () =>
  useQuery({ queryKey: keys.stats(), queryFn: () => notesApi.getStats() });

export const useNoteTags = () =>
  useQuery({ queryKey: keys.tags(), queryFn: () => notesApi.getTags() });

export const useCreateNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
};

export const useUpdateNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => notesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
};

export const useDeleteNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
};

export const useTogglePin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesApi.togglePin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
};

export const useToggleArchive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesApi.toggleArchive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
};
