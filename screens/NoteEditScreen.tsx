import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Modal, Pressable, Platform, ActivityIndicator, ActionSheetIOS } from 'react-native';
import { RouteProp, useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { RootStackParamList, Note, NoteCategory, AppNavigationProp } from '../types';
import { addNote as addSupabaseNote, updateNote as updateSupabaseNote, Note as SupabaseNote, getUserNotes, deleteNote as supabaseDeleteNote } from '../supabaseNotes';
import { useAuth } from '../hooks/useAuth';
import { generateMeditationAudio } from '../api/generateMeditation';
import FireAnimation from '../components/FireAnimation';
import { checkAndMarkFirstNoteOfDay, checkAndMarkGardenPopupShown, getStreak, updateStreak } from '../components/userStorage';
import GardenPopupCard from '../components/GardenPopupCard';
import * as ImagePicker from 'expo-image-picker';
import MLKitOcr from 'expo-mlkit-ocr';
// NOTE: expo-mlkit-ocr will NOT work in Expo Go. You must use a custom dev client or EAS build.

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showFireAnimation, setShowFireAnimation] = useState(false);
  const [showGardenPopup, setShowGardenPopup] = useState(false);
  const [gardenStreak, setGardenStreak] = useState(1);
  const [ocrLoading, setOcrLoading] = useState(false);

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

      // Check if this is the first note opened today
      if (isFocused) {
        const isFirstNoteOfDay = await checkAndMarkFirstNoteOfDay();
        if (isFirstNoteOfDay) {
          // Small delay to ensure the screen is fully loaded
          setTimeout(() => {
            setShowFireAnimation(true);
          }, 500);
        }
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

  // Save note, optionally navigate away (default: true)
  const saveNote = async (shouldNavigateAway = true) => {
    if (saving) return;
    setSaving(true);
    if (title.trim() || content.trim()) {
      if (!profile) {
        console.log('No profile available when saving note');
        setSaving(false);
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
            if (shouldNavigateAway) {
              setTimeout(() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Dashboard' }],
                });
              }, 400);
              return;
            }
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
          if (shouldNavigateAway) {
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Dashboard' }],
              });
            }, 400);
          }
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
    await saveNote(false); // Do not navigate away when saving from play button
    setShowSheet(true);
  };

  // Fire animation complete handler
  const handleFireAnimationComplete = async () => {
    setShowFireAnimation(false);
    // Check if garden popup should be shown today
    const shouldShowGarden = await checkAndMarkGardenPopupShown();
    if (shouldShowGarden) {
      // Update streak and show popup
      const streak = await updateStreak();
      setGardenStreak(streak);
      setShowGardenPopup(true);
    }
  };

  // OCR handler for photo icon
  const handleOcrPhoto = async () => {
    const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        // MediaTypeOptions.Images is deprecated but required for this version
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      return result;
    };
    const takePhoto = async () => {
      const result = await ImagePicker.launchCameraAsync({
        // MediaTypeOptions.Images is deprecated but required for this version
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      return result;
    };
    let result;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Take Photo', 'Choose from Library', 'Cancel'],
          cancelButtonIndex: 2,
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) {
            result = await takePhoto();
          } else if (buttonIndex === 1) {
            result = await pickImage();
          } else {
            return;
          }
          await processOcrResult(result);
        }
      );
    } else {
      // Android: simple prompt
      const choice = window.confirm('Take photo? (Cancel for library)');
      if (choice) {
        result = await takePhoto();
      } else {
        result = await pickImage();
      }
      await processOcrResult(result);
    }
  };

  const processOcrResult = async (result: any) => {
    try {
      if (result.canceled || !result.assets || !result.assets[0].uri) return;
      setOcrLoading(true);
      if (typeof MLKitOcr.recognizeText !== 'function') {
        console.log('MLKitOcr methods:', MLKitOcr);
        throw new Error('No recognizeText method found on MLKitOcr. Please check your expo-mlkit-ocr version.');
      }
      const ocrResult = await MLKitOcr.recognizeText(result.assets[0].uri);
      // ocrResult.blocks is an array of text blocks
      const recognizedText = ocrResult.blocks?.map((block: any) => block.text).join('\n') || '';
      setContent(prev => prev + (prev ? '\n' : '') + recognizedText);
      setOcrLoading(false);
    } catch (err) {
      setOcrLoading(false);
      console.log('OCR error:', err);
      alert('Failed to extract text from image.');
    }
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
          <TouchableOpacity style={styles.iconButton} onPress={handleOcrPhoto}>
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
      
      {/* Fire Animation for first note of the day */}
      <FireAnimation
        visible={showFireAnimation}
        onAnimationComplete={handleFireAnimationComplete}
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
                    onPress={async () => {
                      if (!selectedTime || !selectedWant || selectedWant === 'Meditate') {
                        Alert.alert('Select Session Details', 'Please select a session time and a goal for this session before meditating.');
                        return;
                      }
                      setIsGenerating(true);
                      setGenerationError(null);
                      try {
                        const { audioUrl } = await generateMeditationAudio({
                          goal: selectedWant,
                          duration: selectedTime,
                          noteContent: content,
                        });
                        setShowSheet(false);
                        setIsGenerating(false);
                        navigation.navigate('Meditate', {
                          audioUrl,
                          noteTitle: title,
                          goal: selectedWant,
                        });
                      } catch (err: any) {
                        setIsGenerating(false);
                        setGenerationError(err.message || 'Failed to generate meditation audio.');
                        alert(err.message || 'Failed to generate meditation audio.');
                      }
                    }}
                  >
                    <Text style={[styles.wantOptionText, { color: '#fff', fontWeight: 'bold' }]}>Start</Text>
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
          {isGenerating && (
            <View style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
            }}>
              <Text style={{ color: '#fff', fontSize: 20, marginBottom: 16 }}>Generating your meditation...</Text>
              <ActivityIndicator size="large" color="#ff8800" />
              {generationError && <Text style={{ color: 'red', marginTop: 16 }}>{generationError}</Text>}
            </View>
          )}
        </View>
      </Modal>
      <GardenPopupCard
        visible={showGardenPopup}
        streak={gardenStreak}
        onContinue={() => setShowGardenPopup(false)}
      />
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