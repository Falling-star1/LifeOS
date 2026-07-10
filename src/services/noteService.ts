import { Note } from '@/types/note';
import { invoke } from '@tauri-apps/api/core';

export async function getNotes(): Promise<Note[]> {
  return invoke('get_notes');
}

export async function createNote(title?: string, content?: string): Promise<Note> {
  return invoke('create_note', { title, content });
}

export async function updateNote(id: string, title?: string, content?: string, pinned?: number): Promise<Note> {
  return invoke('update_note', { id, title, content, pinned });
}

export async function toggleNotePin(id: string): Promise<Note> {
  return invoke('toggle_note_pin', { id });
}

export async function deleteNote(id: string): Promise<void> {
  return invoke('delete_note', { id });
}