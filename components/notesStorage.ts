import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Note, NoteCategory } from '../types';
import uuid from 'react-native-uuid';

const PLACEHOLDER_NOTES: Note[] = [
  {
    id: 'placeholder-goals',
    category: 'Goals',
    title: 'Future',
    content: 'Add your Goals for your future here\nOr start a new note for more goals',
    date: new Date().toISOString(),
    pinned: true,
  },
  {
    id: 'placeholder-daily',
    category: 'Daily Journals',
    title: 'Todays Notes 06/20',
    content: 'Want to start journaling? Add your thoughts here',
    date: new Date().toISOString(),
    pinned: true,
  },
  {
    id: 'placeholder-gameday',
    category: 'Game Day',
    title: 'Minnesota',
    content: 'Become an NBA All-Star\nWin an NBA Championship\nPlay on Team USA',
    date: new Date().toISOString(),
    pinned: true,
  },
];

function isValidUUID(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

const NOTES_KEY = 'notes';

export const getNotes = async (): Promise<Note[]> => {
  const raw = await AsyncStorage.getItem(NOTES_KEY);
  let notes: Note[] = raw ? JSON.parse(raw) : [];
  // Add placeholders for empty categories
  const categories: NoteCategory[] = ['Goals', 'Daily Journals', 'Game Day'];
  for (const cat of categories) {
    if (!notes.some(n => n.category === cat && !n.deleted)) {
      notes.push(PLACEHOLDER_NOTES.find(p => p.category === cat)!);
    }
  }
  return notes;
};

export const setNotes = async (notes: Note[]) => {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};

export const addOrUpdateNote = async (note: Note): Promise<string | undefined> => {
  let notes = await getNotes();
  let id = note.id;
  if (!id || !isValidUUID(id)) {
    id = uuid.v4() as string;
  }
  const idx = notes.findIndex(n => n.id === id);
  const newNote = { ...note, id, date: new Date().toISOString() };
  if (idx >= 0) {
    notes[idx] = newNote;
  } else {
    notes.unshift(newNote);
  }
  await setNotes(notes);
  return id;
};

export const deleteNote = async (noteId: string) => {
  let notes = await getNotes();
  notes = notes.filter(n => n.id !== noteId);
  await setNotes(notes);
};

export const pinNote = async (noteId: string, pinned: boolean) => {
  let notes = await getNotes();
  notes = notes.map(n => n.id === noteId ? { ...n, pinned } : n);
  await setNotes(notes);
};

export const ensurePlaceholderNotes = async () => {
  // No-op for AsyncStorage, handled in getNotes
}; 