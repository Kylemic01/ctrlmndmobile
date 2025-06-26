import { supabase } from './supabase';

export type Note = {
  id?: string;
  user_id: string;
  first_name: string;
  last_name?: string;
  email: string;
  title: string;
  content: string;
  category: string;
  pinned?: boolean;
  created_at?: string;
  updated_at?: string;
};

export async function addNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('notes').insert({
    user_id: note.user_id,
    first_name: note.first_name,
    last_name: note.last_name,
    email: note.email,
    title: note.title,
    content: note.content,
    category: note.category,
    pinned: note.pinned ?? false,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateNote(noteId: string, updatedFields: Partial<Note>) {
  const { data, error } = await supabase.from('notes').update({
    ...updatedFields,
    pinned: updatedFields.pinned ?? undefined,
  }).eq('id', noteId).select().single();
  if (error) throw error;
  return data;
}

export async function getUserNotes() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase.from('notes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function deleteNote(noteId: string) {
  const { error } = await supabase.from('notes').delete().eq('id', noteId);
  if (error) throw error;
  return true;
} 