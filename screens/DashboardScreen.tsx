import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { AppNavigationProp, Note, NoteCategory, User } from '../types';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getUser } from '../components/userStorage';
import { getNotes, ensurePlaceholderNotes } from '../components/notesStorage';
import { useAuth } from '../hooks/useAuth';
import { getUserNotes } from '../supabaseNotes';

const CATEGORIES: NoteCategory[] = ['Goals', 'Daily Journals', 'Game Day'];
const CATEGORY_COLORS = {
  'Goals': '#232323',
  'Daily Journals': '#232323',
  'Game Day': '#232323',
};

const DashboardScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const isFocused = useIsFocused();
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const supabaseNotes = await getUserNotes();
        console.log('Fetched notes from Supabase:', supabaseNotes);
        const mappedNotes = (supabaseNotes || []).map(n => ({
          ...n,
          pinned: n.pinned || false,
          deleted: n.deleted || false,
        }));
        setNotes(mappedNotes);
      } catch (e) {
        setNotes([]);
      }
    };
    if (isFocused) load();
  }, [isFocused]);

  const handleAddNote = (category: NoteCategory) => {
    navigation.navigate('NoteEdit', { category });
  };

  const handleEditNote = (note: Note) => {
    navigation.navigate('NoteEdit', { noteId: note.id, category: note.category });
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {profile?.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar} />
          )}
          <Text style={styles.helloText}>Hello, {profile?.first_name ? profile.first_name : 'User'}</Text>
        </View>
        <TouchableOpacity onPress={handleSettings}>
          <Ionicons name="settings-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {CATEGORIES.map((cat) => {
          const catNotes = notes.filter(n => n.category === cat && !n.deleted);
          const pinned = catNotes.filter(n => n.pinned);
          const unpinned = catNotes.filter(n => !n.pinned);
          const sortedNotes = [...pinned, ...unpinned];
          return (
            <View key={cat} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{cat}</Text>
                <TouchableOpacity style={styles.plusButton} onPress={() => handleAddNote(cat)}>
                  <Ionicons name="add" size={24} color="#ff8800" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={sortedNotes}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 8 }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={[styles.noteCard, { backgroundColor: CATEGORY_COLORS[cat] }]}
                    onPress={() => handleEditNote(item)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.noteTitle}>{item.title}</Text>
                      <Text style={styles.noteContent} numberOfLines={20} ellipsizeMode="tail">{item.content}</Text>
                    </View>
                    {item.pinned && <MaterialIcons name="push-pin" size={18} color="#ff8800" style={styles.pinIcon} />}
                  </TouchableOpacity>
                )}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginTop: 20,
    backgroundColor: '#444',
    marginRight: 16,
  },
  helloText: {
    color: '#fff',
    fontSize: 22,
    paddingTop: 20,
    fontWeight: 'bold',
    fontFamily: 'DMSans-Medium',
  },
  categorySection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    fontWeight: 'bold',
    flex: 1,
  },
  plusButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 4,
    marginLeft: 8,
  },
  noteCard: {
    width: 200,
    minHeight: 240,
    maxHeight: 240,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#ff8800',
    position: 'relative',
  },
  noteTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'DMSans-Bold',
    marginBottom: 8,
  },
  noteContent: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: 'normal',
    fontFamily: 'DMSans-Medium',
    marginBottom: 8,
    flex: 1,
    textAlignVertical: 'top',
  },
  pinIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default DashboardScreen; 