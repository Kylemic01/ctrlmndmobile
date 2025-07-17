import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { getStreak } from '../components/userStorage';
import type { AppNavigationProp } from '../types';

const SUPABASE_AUDIO_BASE = 'https://your-supabase-url/standard-meditations/'; // Replace with your actual base URL

const STANDARD_MEDITATIONS = [
  {
    key: 'morning',
    title: 'Morning Motivation',
    color: '#FFD700',
    color2: '#FFA500',
    icon: <Ionicons name="sunny" size={32} color="#FFA500" />,
    audio: 'morning.mp3',
  },
  {
    key: 'relax',
    title: 'Daily Relax',
    color: '#00BFFF',
    color2: '#1E90FF',
    icon: <Ionicons name="cloud" size={32} color="#1E90FF" />,
    audio: 'relax.mp3',
  },
  {
    key: 'bodyscan',
    title: 'Body Scan',
    color: '#32CD32',
    color2: '#228B22',
    icon: <Ionicons name="leaf" size={32} color="#228B22" />,
    audio: 'bodyscan.mp3',
  },
  {
    key: 'affirmations',
    title: 'Daily Affirmations',
    color: '#FF69B4',
    color2: '#C71585',
    icon: <Ionicons name="heart" size={32} color="#C71585" />,
    audio: 'affirmations.mp3',
  },
  {
    key: 'gratitude',
    title: 'Daily Gratitude',
    color: '#FFA07A',
    color2: '#FF4500',
    icon: <Ionicons name="happy" size={32} color="#FF4500" />,
    audio: 'gratitude.mp3',
  },
  {
    key: 'sleep',
    title: 'Sleep',
    color: '#8A2BE2',
    color2: '#4B0082',
    icon: <Ionicons name="moon" size={32} color="#4B0082" />,
    audio: 'sleep.mp3',
  },
];

const NTJ_AUDIO_BASE = 'https://iciecutonrezzhddnmjv.supabase.co/storage/v1/object/public/meditations/ntj/'; // Replace with your actual Supabase public URL

const NTJ_MEDITATIONS = [
  { key: 'focus', title: 'Focus', icon: <Ionicons name="ellipse-outline" size={36} color="#fff" />, filename: 'focus1.mp3' },
  { key: 'relax', title: 'Relax', icon: <Ionicons name="cloud" size={36} color="#fff" />, filename: 'relax1.mp3' },
  { key: 'morning', title: 'Morning', icon: <Ionicons name="sunny" size={36} color="#fff" />, filename: 'morning1.mp3' },
  { key: 'sleep', title: 'Sleep', icon: <Ionicons name="moon" size={36} color="#fff" />, filename: 'sleep1.mp3' },
  { key: 'health', title: 'Health', icon: <Ionicons name="leaf" size={36} color="#fff" />, filename: 'health1.mp3' },
  { key: 'affirmations', title: 'Affirmations', icon: <Ionicons name="heart" size={36} color="#fff" />, filename: 'affirmations1.mp3' },
  { key: 'gratitude', title: 'Gratitude', icon: <Ionicons name="happy" size={36} color="#fff" />, filename: 'gratitude1.mp3' },
];

const CARD_MARGIN = 12;
const CARD_WIDTH = (Dimensions.get('window').width - 3 * CARD_MARGIN) / 2;

const NoTimeToJournalScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { profile } = useAuth();
  const [gardenStreak, setGardenStreak] = useState(1);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const streak = await getStreak();
        setGardenStreak(streak);
      } catch (e) {
        setGardenStreak(1);
      }
    };
    fetchStreak();
  }, []);

  return (
    <View style={styles.container}>
      {/* Hello and Streak Header - match DashboardScreen */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity style={styles.streakButton} activeOpacity={0.8}>
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
      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Ionicons name="flash-outline" size={22} color="#FFA726" style={{ marginRight: 8 }} />
        <Text style={styles.title}>No time to journal</Text>
      </View>
      {/* Puzzle Grid Layout */}
      <View style={styles.puzzleGrid}>
        {/* Row 1 */}
        <View style={styles.row}>
          <TouchableOpacity style={[styles.tile, styles.tileFocus]} onPress={() => navigation.navigate('Meditate', { audioUrl: NTJ_AUDIO_BASE + 'focus1.mp3', noteTitle: 'Focus', goal: 'ntj' })}>
            <Ionicons name="ellipse-outline" size={36} color="#fff" style={styles.tileIcon} />
            <Text style={styles.tileText}>Focus</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tile, styles.tileRelax]} onPress={() => navigation.navigate('Meditate', { audioUrl: NTJ_AUDIO_BASE + 'relax1.mp3', noteTitle: 'Relax', goal: 'ntj' })}>
            <Ionicons name="cloud" size={36} color="#fff" style={styles.tileIcon} />
            <Text style={styles.tileText}>Relax</Text>
          </TouchableOpacity>
        </View>
        {/* Row 2 */}
        <View style={styles.row}>
          <TouchableOpacity style={[styles.tile, styles.tileMorning]} onPress={() => navigation.navigate('Meditate', { audioUrl: NTJ_AUDIO_BASE + 'morning1.mp3', noteTitle: 'Morning', goal: 'ntj' })}>
            <Ionicons name="sunny" size={36} color="#fff" style={styles.tileIcon} />
            <Text style={styles.tileText}>Morning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tile, styles.tileSleep]} onPress={() => navigation.navigate('Meditate', { audioUrl: NTJ_AUDIO_BASE + 'sleep1.mp3', noteTitle: 'Sleep', goal: 'ntj' })}>
            <Ionicons name="moon" size={36} color="#fff" style={styles.tileIcon} />
            <Text style={styles.tileText}>Sleep</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tile, styles.tileHealth]} onPress={() => navigation.navigate('Meditate', { audioUrl: NTJ_AUDIO_BASE + 'health1.mp3', noteTitle: 'Health', goal: 'ntj' })}>
            <Ionicons name="leaf" size={36} color="#fff" style={styles.tileIcon} />
            <Text style={styles.tileText}>Health</Text>
          </TouchableOpacity>
        </View>
        {/* Row 3 */}
        <View style={styles.row}>
          <TouchableOpacity style={[styles.tile, styles.tileAffirmations]} onPress={() => navigation.navigate('Meditate', { audioUrl: NTJ_AUDIO_BASE + 'affirmations1.mp3', noteTitle: 'Affirmations', goal: 'ntj' })}>
            <Ionicons name="heart" size={36} color="#fff" style={styles.tileIcon} />
            <Text style={styles.tileText}>Affirmations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tile, styles.tileGratitude]} onPress={() => navigation.navigate('Meditate', { audioUrl: NTJ_AUDIO_BASE + 'gratitude1.mp3', noteTitle: 'Gratitude', goal: 'ntj' })}>
            <Ionicons name="happy" size={36} color="#fff" style={styles.tileIcon} />
            <Text style={styles.tileText}>Gratitude</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  helloText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'DMSans-Medium',
    marginLeft: 18,
    paddingTop: 20,
    textAlignVertical: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 16,
    marginTop: 16,
    fontWeight: 'bold',
    fontFamily: 'DMSans-Bold',
    marginLeft: 8,
  },
  standardMeditationCard: {
    minHeight: 160,
    maxHeight: 180,
    borderRadius: 20,
    padding: 12,
    marginBottom: 0,
    position: 'relative',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  puzzleGrid: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginHorizontal: 8,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tile: {
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
    paddingVertical: 24,
    flex: 1,
    minHeight: 110,
    maxHeight: 160,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
  },
  tileIcon: {
    marginBottom: 8,
    color: '#333',
  },
  tileText: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tileFocus: {
    backgroundColor: '#FF6F61',
    flex: 1.2,
    marginRight: 6,
  },
  tileRelax: {
    backgroundColor: '#4DD0E1',
    flex: 1.8,
    marginLeft: 6,
  },
  tileMorning: {
    backgroundColor: '#FFE082',
    flex: 1.2,
    marginRight: 6,
  },
  tileSleep: {
    backgroundColor: '#BA68C8',
    flex: 1.2,
    marginHorizontal: 6,
  },
  tileHealth: {
    backgroundColor: '#D4E157',
    flex: 1.2,
    marginLeft: 6,
  },
  tileAffirmations: {
    backgroundColor: '#F8BBD0',
    flex: 1.5,
    marginRight: 6,
  },
  tileGratitude: {
    backgroundColor: '#FFAB91',
    flex: 1.5,
    marginLeft: 6,
  },
});

export default NoTimeToJournalScreen; 