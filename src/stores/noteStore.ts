import { create } from 'zustand';
import { Note } from '@/types/note';
import { getNotes, createNote, updateNote, deleteNote, toggleNotePin } from '@/services/noteService';

interface NoteStore {
  notes: Note[];
  loading: boolean;
  loadNotes: () => Promise<void>;
  addNote: () => Promise<Note>;
  editNote: (id: string, title?: string, content?: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  loading: false,

  loadNotes: async () => {
    set({ loading: true });
    try {
      const data = await getNotes();
      set({ notes: data });
    } finally {
      set({ loading: false });
    }
  },

  addNote: async () => {
    const note = await createNote();
    set(s => ({ notes: [note, ...s.notes] }));
    return note;
  },

  editNote: async (id, title, content) => {
    await updateNote(id, title, content);
    set(s => ({
      notes: s.notes.map(n => n.id === id ? { ...n, ...(title !== undefined && { title }), ...(content !== undefined && { content }), updated_at: Math.floor(Date.now() / 1000) } : n),
    }));
  },

  togglePin: async (id) => {
    const note = await toggleNotePin(id);
    set(s => ({ notes: s.notes.map(n => n.id === id ? note : n) }));
  },

  removeNote: async (id) => {
    await deleteNote(id);
    set(s => ({ notes: s.notes.filter(n => n.id !== id) }));
  },
}));
