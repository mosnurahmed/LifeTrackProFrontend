/**
 * Notes API Endpoints
 */

import client from '../client';

export interface Note {
  _id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteStats {
  total: number;
  active: number;
  archived: number;
  pinned: number;
  tags: { name: string; count: number }[];
}

export interface CreateNoteData {
  title: string;
  content: string;
  tags?: string[];
  color?: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface NotesFilter {
  search?: string;
  tags?: string;
  color?: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

export const notesApi = {
  getAll:      (filters?: NotesFilter)                  => client.get('/notes', { params: filters }),
  getById:     (id: string)                             => client.get(`/notes/${id}`),
  create:      (data: CreateNoteData)                   => client.post('/notes', data),
  update:      (id: string, data: Partial<CreateNoteData>) => client.put(`/notes/${id}`, data),
  delete:      (id: string)                             => client.delete(`/notes/${id}`),
  togglePin:   (id: string)                             => client.patch(`/notes/${id}/pin`),
  toggleArchive: (id: string)                           => client.patch(`/notes/${id}/archive`),
  getStats:    ()                                       => client.get('/notes/stats'),
  getTags:     ()                                       => client.get('/notes/tags'),
};

export default notesApi;
