import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Modal, Pressable, Platform } from 'react-native';
import { RouteProp, useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { RootStackParamList, Note, NoteCategory, AppNavigationProp } from '../types';
import { addNote as addSupabaseNote, updateNote as updateSupabaseNote, Note as SupabaseNote, getUserNotes, deleteNote as supabaseDeleteNote } from '../supabaseNotes';
import { useAuth } from '../hooks/useAuth';

const mockLoadNote = async (noteId: string): Promise<Note | null> => {
  // TODO: Replace with real storage logic
  return null;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

const TIME_OPTIONS = ['6 min', '8 min', '10 min'];
const WANT_OPTIONS = [
  'Confidence', 'Relaxation',
  'Neurotraining', 'Motivation',
  'Reassurance', 'Rehab',
  'Game Time', 'Meditate',
];

const NoteEditScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'NoteEdit'>>();
  const isFocused = useIsFocused();
  const { noteId, category } = route.params || {};

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);
  const [note, setNote] = useState<Note | null>(null);
  const [isNew, setIsNew] = useState(false);
  const initialLoad = useRef(true);
  const [showSheet, setShowSheet] = useState(false);
  const [selectedTime, setSelectedTime] = useState('8 min');
  const [selectedWant, setSelectedWant] = useState('Motivation');
  const [currentNoteId, setCurrentNoteId] = useState(noteId);
  const { profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const saveTriggeredRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      console.log('Loading note, currentNoteId:', currentNoteId);
      if (currentNoteId) {
        // Fetch the note from Supabase by ID
        try {
          const notes = await getUserNotes();
          const found = notes.find((n: any) => n.id === currentNoteId);
          console.log('Loaded note from Supabase:', found);
          if (found) {
            setNote(found);
            setTitle(found.title);
            setContent(found.content);
            setPinned(!!found.pinned);
            setIsNew(false);
          } else {
            setNote(null);
            setTitle('');
            setContent('');
            setPinned(false);
            setIsNew(false);
          }
        } catch (e) {
          console.log('Error loading note from Supabase:', e);
          setNote(null);
          setTitle('');
          setContent('');
          setPinned(false);
          setIsNew(false);
        }
      } else {
        setIsNew(true);
        setNote(null);
        setTitle('');
        setContent('');
        setPinned(false);
      }
    };
    if (isFocused || initialLoad.current) {
      load();
      initialLoad.current = false;
    }
  }, [isFocused, currentNoteId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async (e) => {
      if (saveTriggeredRef.current) return;
      saveTriggeredRef.current = true;
      if (!saving) await saveNote();
    });
    return unsubscribe;
  }, [navigation, title, content, pinned, currentNoteId, category, saving]);

  const saveNote = async () => {
    if (saving) return;
    setSaving(true);
    if (title.trim() || content.trim()) {
      if (!profile) {
        console.log('No profile available when saving note');
        return;
      }
      console.log('saveNote called, currentNoteId:', currentNoteId);
      if (!currentNoteId) {
        // New note
        try {
          const created = await addSupabaseNote({
            user_id: profile.id,
            first_name: profile.first_name,
            email: profile.email,
            title,
            content,
            category: category!,
            pinned,
          });
          console.log('Created note result:', created);
          if (created && created.id) {
            setCurrentNoteId(created.id);
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Dashboard' }],
              });
            }, 400);
            return;
          }
        } catch (e) {
          console.log('Error creating note:', e);
        }
      } else {
        // Update existing note
        try {
          await updateSupabaseNote(currentNoteId, {
            user_id: profile.id,
            first_name: profile.first_name,
            email: profile.email,
            title,
            content,
            category: category!,
            pinned,
          });
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            });
          }, 400);
        } catch (e) {
          console.log('Error updating note:', e);
        }
      }
    }
    setSaving(false);
  };

  // Pin/Unpin note using Supabase
  const handlePin = async () => {
    if (!currentNoteId) return;
    try {
      await updateSupabaseNote(currentNoteId, { pinned: !pinned });
      setPinned(!pinned);
    } catch (e) {
      console.log('Error pinning note:', e);
    }
  };

  // Delete note using Supabase
  const handleDelete = async () => {
    if (!currentNoteId) return;
    try {
      await supabaseDeleteNote(currentNoteId);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (e) {
      console.log('Error deleting note:', e);
    }
  };

  const handleBack = async () => {
    if (saveTriggeredRef.current) return;
    saveTriggeredRef.current = true;
    if (!saving) await saveNote();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  const handlePlay = async () => {
    await saveNote();
    setShowSheet(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Ionicons name="trash" size={26} color="#ff3b30" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePin} style={styles.iconButton}>
            <MaterialIcons name="push-pin" size={26} color={pinned ? "#ff8800" : "#fff"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="camera" size={26} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handlePlay}>
            <Ionicons name="play-circle" size={26} color="#ff8800" />
          </TouchableOpacity>
        </View>
      </View>
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.textarea}
        value={content}
        onChangeText={setContent}
        placeholder="Write your note..."
        placeholderTextColor="#888"
        multiline
        numberOfLines={10}
      />
      <Modal
        visible={showSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSheet(false)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setShowSheet(false)} />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandleContainer}>
            <View style={styles.sheetHandle} />
          </View>
          <Text style={styles.sheetTitle}>Session Time</Text>
          <View style={styles.timeRow}>
            {TIME_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.timeOption, selectedTime === opt ? styles.timeOptionSelected : null]}
                onPress={() => setSelectedTime(opt)}
              >
                <Text style={[styles.timeOptionText, selectedTime === opt ? styles.timeOptionTextSelected : null]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sheetTitle}>Goal for this session</Text>
          <View style={styles.wantGrid}>
            {WANT_OPTIONS.map(opt => {
              if (opt === 'Meditate') {
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.wantOption, { backgroundColor: '#ff8800', alignItems: 'center' }]}
                    onPress={() => {
                      if (!selectedTime || !selectedWant || selectedWant === 'Meditate') {
                        Alert.alert('Select Session Details', 'Please select a session time and a goal for this session before meditating.');
                        return;
                      }
                      setShowSheet(false);
                      navigation.navigate('Meditate');
                    }}
                  >
                    <Text style={[styles.wantOptionText, { color: '#fff', fontWeight: 'bold' }]}>{opt}</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.wantOption, selectedWant === opt ? styles.wantOptionSelected : null, opt === 'Go' ? styles.goButton : null]}
                  onPress={() => setSelectedWant(opt)}
                >
                  <Text style={[styles.wantOptionText, selectedWant === opt ? styles.wantOptionTextSelected : null, opt === 'Go' ? styles.goButtonText : null]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    padding: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    marginBottom: 4,
  },
  iconButton: {
    marginHorizontal: 4,
    paddingVertical: 32,
    padding: 4,
  },
  titleInput: {
    color: '#fff',
    borderRadius: 8,
    padding: 8,
    fontFamily: 'DMSans-Medium',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textarea: {
    color: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    minHeight: 300,
    textAlignVertical: 'top',
  },
  sheetOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10,
  },
  bottomSheet: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.45,
    left: 0,
    right: 0,
    backgroundColor: '#181818',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  sheetHandleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#444',
  },
  sheetTitle: {
    color: '#ff8800',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#ff8800',
    marginBottom: 20,
  },
  timeOption: {
    backgroundColor: '#181818',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 4,
  },
  timeOptionSelected: {
    backgroundColor: '#fff',
  },
  timeOptionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeOptionTextSelected: {
    color: '#181818',
  },
  wantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  wantOption: {
    backgroundColor: '#181818',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    margin: 4,
    minWidth: '40%',
    alignItems: 'flex-start',
  },
  wantOptionSelected: {
    backgroundColor: '#fff',
  },
  wantOptionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  wantOptionTextSelected: {
    color: '#181818',
  },
  goButton: {
    backgroundColor: '#ff8800',
    borderRadius: 16,
    minWidth: '40%',
    alignItems: 'center',
    marginTop: 8,
  },
  goButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NoteEditScreen; 