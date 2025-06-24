import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './useAuth';

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (user) fetchNotes();
    else setNotes([]);
  }, [user]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });
    if (!error) setNotes(data);
  };

  const addNote = async ({ title, content, is_pinned = false }) => {
    const { data, error } = await supabase
      .from('notes')
      .insert({ user_id: user.id, title, content, is_pinned })
      .select()
      .single();
    if (!error) setNotes((prev) => [data, ...prev]);
    return data;
  };

  const updateNote = async (id, { title, content, is_pinned }) => {
    const { data, error } = await supabase
      .from('notes')
      .update({ title, content, is_pinned })
      .eq('id', id)
      .select()
      .single();
    if (!error) setNotes((prev) => prev.map((n) => (n.id === id ? data : n)));
    return data;
  };

  const deleteNote = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (!error) setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return { notes, fetchNotes, addNote, updateNote, deleteNote };
} 