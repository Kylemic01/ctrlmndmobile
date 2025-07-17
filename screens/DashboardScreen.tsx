import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, Animated, Dimensions, Pressable } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { AppNavigationProp, Note, NoteCategory, User } from '../types';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getUser } from '../components/userStorage';
import { useAuth } from '../hooks/useAuth';
import { getUserNotes } from '../supabaseNotes';
import { BlurView } from 'expo-blur';
import GardenPopupCard from '../components/GardenPopupCard';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORIES: NoteCategory[] = ['Goals', 'Daily Journals'];
const CATEGORY_COLORS = {
  'Goals': '#232323',
  'Daily Journals': '#232323',
};

const CATEGORY_ICONS = {
  'Goals': <Ionicons name="flag-outline" size={22} color="#ff8800" style={{ marginRight: 8 }} />,
  'Daily Journals': <Ionicons name="book-outline" size={22} color="#ff8800" style={{ marginRight: 8 }} />,
};

const FAB_OPTIONS = [
  { category: 'Daily Journals', icon: 'book-outline', label: 'Daily Journals' },
  { category: 'Goals', icon: 'flag-outline', label: 'Goals' },
];

// Standardized meditations data
const STANDARD_MEDITATIONS = [
  {
    key: 'morning-motivation',
    title: 'Morning Motivation',
    color: '#FFA726', // Orange
    color2: '#FFD180',
    icon: <Ionicons name="sunny-outline" size={36} color="#0d0d0d" />,
    audio: 'morning-motivation.mp3',
  },
  {
    key: 'daily-relax',
    title: 'Daily Relax',
    color: '#7ee8fa', // Light Blue
    color2: '#b3e5fc',
    icon: <Ionicons name="leaf-outline" size={36} color="#0d0d0d" />,
    audio: 'daily-relax.mp3',
  },
  {
    key: 'body-scan',
    title: 'Body Scan',
    color: '#E0CDA9', // Bone
    color2: '#f5e6c8',
    icon: <MaterialIcons name="self-improvement" size={36} color="#0d0d0d" />,
    audio: 'body-scan.mp3',
  },
  {
    key: 'daily-affirmations',
    title: 'Daily Affirmations',
    color: '#4CAF50', // Green
    color2: '#A5D6A7',
    icon: <Ionicons name="chatbubble-ellipses-outline" size={36} color="#0d0d0d" />,
    audio: 'daily-affirmations.mp3',
  },
  {
    key: 'gratitude',
    title: 'Daily Gratitude',
    color: '#9C27B0', // Purple
    color2: '#CE93D8',
    icon: <Ionicons name="heart-outline" size={36} color="#0d0d0d" />,
    audio: 'gratitude.mp3',
  },
  {
    key: 'sleep',
    title: 'Sleep',
    color: '#283593', // Dark Blue
    color2: '#5C6BC0',
    icon: <Ionicons name="moon-outline" size={36} color="#0d0d0d" />,
    audio: 'sleep.mp3',
  },
];

const SUPABASE_AUDIO_BASE = 'https://<your-supabase-project>.supabase.co/storage/v1/object/public/standard-meditations/';

const DashboardScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const isFocused = useIsFocused();
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [fabExpanded, setFabExpanded] = useState(false);
  const fabAnimation = useRef(new Animated.Value(0)).current;
  const [gardenStreak, setGardenStreak] = useState(1);
  const [showGardenPopup, setShowGardenPopup] = useState(false);

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

  // Load streak from userStorage (reuse getStreak from userStorage)
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const { getStreak } = await import('../components/userStorage');
        const streak = await getStreak();
        setGardenStreak(streak);
      } catch (e) {
        setGardenStreak(1);
      }
    };
    fetchStreak();
  }, [isFocused]);

  const toggleFAB = () => {
    const toValue = fabExpanded ? 0 : 1;
    Animated.spring(fabAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    setFabExpanded(!fabExpanded);
  };

  const handleAddNote = (category: NoteCategory) => {
    setFabExpanded(false);
    Animated.spring(fabAnimation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    navigation.replace('NoteEdit', { category });
  };

  const handleEditNote = (note: Note) => {
    navigation.replace('NoteEdit', { noteId: note.id, category: note.category });
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleShowStreak = () => {
    setShowGardenPopup(true);
  };

  // Fix for CATEGORY_ICONS type error
  const getCategoryIcon = (cat: NoteCategory) => {
    if (cat in CATEGORY_ICONS) {
      return CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS];
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity onPress={handleShowStreak} style={styles.streakButton} activeOpacity={0.8}>
              <Ionicons name="flame" size={44} color="#ff8800" />
              <Text style={styles.streakCount}>{gardenStreak}</Text>
            </TouchableOpacity>
            <Text style={styles.streakLabel}>Streak</Text>
          </View>
          <Text style={styles.helloText}>
            Hello, {profile?.first_name ? profile.first_name : 'User'}
          </Text>
        </View>
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {getCategoryIcon(cat)}
                  <Text style={[styles.categoryTitle, { marginLeft: 8 }]}>{cat}</Text>
                </View>
              </View>
              <FlatList
                data={sortedNotes}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 8 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.noteCard}
                    activeOpacity={0.85}
                    onPressIn={() => setPressedId(item.id)}
                    onPressOut={() => setPressedId(null)}
                    onPress={() => handleEditNote(item)}
                  >
                    <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
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

      {/* Floating Action Button */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        {/* Overlay to close menu when tapping outside */}
        {fabExpanded && (
          <Pressable style={styles.fabOverlay} onPress={toggleFAB} />
        )}
        {/* FAB Options */}
        {FAB_OPTIONS.map((option, index) => (
          <Animated.View
            key={option.category}
            style={[
              styles.fabOption,
              {
                opacity: fabAnimation,
                transform: [
                  {
                    translateY: fabAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -((index + 1) * 64)],
                    }),
                  },
                  {
                    scale: fabAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.fabOptionButton}
              onPress={() => handleAddNote(option.category as NoteCategory)}
              activeOpacity={0.85}
            >
              <View style={styles.fabOptionLabelBg}>
                <Text style={styles.fabOptionText}>{option.label}</Text>
              </View>
              <View style={styles.fabOptionCircle}>
                <Ionicons name={option.icon as any} size={24} color="#ff8800" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
        {/* Main FAB */}
        <TouchableOpacity style={styles.fab} onPress={toggleFAB} activeOpacity={0.85}>
          <Ionicons name={fabExpanded ? 'close' : 'add'} size={32} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Garden Streak Popup */}
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
    fontWeight: 'bold',
    fontFamily: 'DMSans-Medium',
    marginLeft: 18,
    paddingTop: 20,
    textAlignVertical: 'center',
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
  noteCard: {
    width: 200,
    minHeight: 240,
    maxHeight: 240,
    borderRadius: 24,
    padding: 16,
    marginRight: 16,
    position: 'relative',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ff8800',
    overflow: 'hidden',
  },
  // New style for standard meditation cards
  standardMeditationCard: {
    width: 200,
    minHeight: 120,
    maxHeight: 120,
    borderRadius: 24,
    padding: 16,
    marginRight: 16,
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'hidden',
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
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: '100%',
    height: Dimensions.get('window').height,
    zIndex: 100,
  },
  fabOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
    zIndex: 1,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ff8800',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
  },
  fabOption: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  fabOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 8,
    marginRight: 0,
    paddingRight: 8,
    paddingLeft: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  fabOptionLabelBg: {
    backgroundColor: 'rgba(30,30,30,0.95)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  fabOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
  },
  fabOptionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  streakButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginRight: 16,
    width: 48,
    height: 48,
  },
  streakCount: {
    position: 'absolute',
    top: 8,
    right: 0,
    backgroundColor: '#fff',
    color: '#ff8800',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontWeight: 'bold',
    fontSize: 16,
    overflow: 'hidden',
    zIndex: 2,
  },
  streakLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'center',
  },
});

export default DashboardScreen; 