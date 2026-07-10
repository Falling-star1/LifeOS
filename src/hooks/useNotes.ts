import { useState, useCallback } from 'react';
import { Note } from '@/types/note';
import { getNotes, createNote, updateNote, toggleNotePin, deleteNote } from '@/services/noteService';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotes();
      setNotes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const addNote = useCallback(async (title?: string, content?: string) => {
    const note = await createNote(title, content);
    setNotes(prev => [note, ...prev]);
    return note;
  }, []);

  const editNote = useCallback(async (id: string, title?: string, content?: string, pinned?: number) => {
    const updated = await updateNote(id, title, content, pinned);
    setNotes(prev => prev.map(n => n.id === id ? updated : n));
    return updated;
  }, []);

  const togglePin = useCallback(async (id: string) => {
    const updated = await toggleNotePin(id);
    setNotes(prev => prev.map(n => n.id === id ? updated : n));
    return updated;
  }, []);

  const removeNote = useCallback(async (id: string) => {
    await deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notes, loading, loadNotes, addNote, editNote, togglePin, removeNote };
}