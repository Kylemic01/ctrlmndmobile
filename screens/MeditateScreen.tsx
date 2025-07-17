import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Animated, Dimensions, FlatList, Easing } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import type { AppNavigationProp } from '../types';
import { VillainProvider, useVillain } from '../components/VillainProvider';
import MonsterDamagePopup from '../components/MonsterDamagePopup';
import VillainReveal from '../components/VillainReveal';
import VillainDefeatOverlay from '../components/VillainDefeatOverlay';
import Loader from '../components/Loader';
import { recordSession } from '../supabaseTeams';
import { useAuth } from '../hooks/useAuth';
import LottieView from 'lottie-react-native';

const ACCENT = '#ff8800';
const DARK = '#0d0d0d';
const CIRCLE_SIZE = Dimensions.get('window').width * 1;

const BACKGROUND_TRACKS = [
  {
    name: 'Rain',
    uri: 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae5c7.mp3',
  },
  {
    name: 'Ocean',
    uri: 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b7e7b.mp3',
  },
  {
    name: 'Forest',
    uri: 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b7e7b.mp3',
  },
  {
    name: 'Soft Piano',
    uri: 'https://cdn.pixabay.com/audio/2022/10/16/audio_124bfae5c7.mp3',
  },
];

const RELAX_COLORS = ['#6a8cff', '#b388ff', '#7ee8fa', '#eec0c6'];

// Add type for route params
type MeditateScreenParams = {
  audioUrl?: string;
  noteTitle?: string;
  goal?: string;
};

// Lottie animation component for meditation
function MeditationLottie() {
  return (
    <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: CIRCLE_SIZE, height: CIRCLE_SIZE, marginTop: 60, }}>
      <LottieView
        source={require('../assets/lottie/breatheanimation.json')}
        autoPlay
        loop
        style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
      />
    </View>
  );
}

const MeditateScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute() as { params?: MeditateScreenParams };
  const { audioUrl, noteTitle } = route.params || {};
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const mainSoundRef = useRef<Audio.Sound | null>(null);
  const animation = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const [showDamagePopup, setShowDamagePopup] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [showDefeat, setShowDefeat] = useState(false);
  const { currentVillain, villainHealth, damageVillain, defeatVillain } = useVillain();
  const { user } = useAuth();

  // Relaxing animation (color pulse)
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
        }),
      ])
    ).start();
    return () => colorAnim.stopAnimation();
  }, [colorAnim]);

  // Breathing animation
  useEffect(() => {
    const breathe = () => {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1.15,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start(() => breathe());
    };
    breathe();
    return () => animation.stopAnimation();
  }, [animation]);

  // Audio loading and playback (meditation only)
  useEffect(() => {
    let isMounted = true;
    const loadAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
        if (audioUrl) {
          const { sound: mainSound } = await Audio.Sound.createAsync(
            { uri: audioUrl },
            { shouldPlay: false, volume: 1.0 }
          );
          mainSoundRef.current = mainSound;
        }
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (e) {
        console.error('Audio load error:', e);
        setError('Failed to load audio.');
        setIsLoading(false);
      }
    };
    loadAudio();
    return () => {
      isMounted = false;
      if (mainSoundRef.current) mainSoundRef.current.unloadAsync();
    };
  }, [audioUrl]);

  // Timer update
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(async () => {
        if (mainSoundRef.current) {
          const status = await mainSoundRef.current.getStatusAsync();
          if (status.isLoaded) {
            setPosition(status.positionMillis || 0);
            setDuration(status.durationMillis || 0);
            setIsPlaying(status.isPlaying || false);
          }
        }
      }, 500);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const handlePlayPause = async () => {
    if (mainSoundRef.current) {
      const mainStatus = await mainSoundRef.current.getStatusAsync();
      if (mainStatus.isLoaded) {
        if (mainStatus.isPlaying) {
          await mainSoundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await mainSoundRef.current.playAsync();
          setIsPlaying(true);
        }
      }
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Progress bar width
  const progress = duration > 0 ? position / duration : 0;

  // Interpolate color for relaxing animation
  const animatedColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [RELAX_COLORS[0], RELAX_COLORS[1]],
  });

  // Extract meditation selection from noteTitle if possible (fallback to 'session')
  const selectionMap: Record<string, string> = {
    relax: 'relaxation',
    relaxation: 'relaxation',
    motivation: 'motivation',
    neurotraining: 'neurotraining session',
    'game time': 'game day',
    gameday: 'game day',
    reassurance: 'reassurance',
    sleep: 'sleep',
    rehab: 'rehab',
    confidence: 'confidence',
    focus: 'focus',
    daily: 'daily mindset',
    // add more as needed
  };

  let selection = 'session';
  if (noteTitle) {
    const match = noteTitle.match(/(Relax|Relaxation|Motivation|Rehab|Game Time|Gameday|Reassurance|Neurotraining|Sleep|Confidence|Focus|Daily)/i);
    if (match) {
      const key = match[0].toLowerCase();
      selection = selectionMap[key] || key;
    }
  }

  // Handler for End button: navigate to VillainDamageScreen
  const handleEndMeditation = async () => {
    if (mainSoundRef.current) {
      const status = await mainSoundRef.current.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await mainSoundRef.current.pauseAsync();
      }
    }
    // Record session for team points
    if (user && user.id) {
      const today = new Date().toISOString().slice(0, 10);
      await recordSession(user.id, 'meditation', today);
    }
    navigation.navigate('VillainDamage');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loader />
        <Text style={{ color: '#fff', marginTop: 24 }}>Loading meditation audio...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: 'red', marginTop: 80 }}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={{ color: '#fff' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">{noteTitle || 'Meditation'}</Text>
        {/* End button in top right */}
        <TouchableOpacity onPress={handleEndMeditation} style={styles.endButton}>
          <Text style={styles.endButtonText}>End</Text>
        </TouchableOpacity>
      </View>
      {/* Expanding Rings Animation */}
      <View style={styles.centerContent}>
        <MeditationLottie />
      </View>
      <Text style={styles.relaxInstruction}>
        We built this science backed custom meditation for your {selection}
      </Text>
      {/* Audio timer/progress bar */}
      <View style={styles.bottomContent}>
        <View style={styles.progressRow}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={44} color="#fff" />
        </TouchableOpacity>
      </View>
      {showDefeat && (
        <VillainDefeatOverlay visible={showDefeat} onClose={() => setShowDefeat(false)} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 8,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 8,
    marginTop: 8,
  },
  title: {
    color: ACCENT,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8,
    fontFamily: 'DMSans-Medium',
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relaxingCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    marginBottom: 32,
    opacity: 0.5,
    shadowColor: RELAX_COLORS[1],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
  },
  relaxInstruction: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    fontFamily: 'DMSans-Medium',
    marginTop: 8,
    marginBottom: 16,
    marginHorizontal: 16,
    lineHeight: 22,
  },
  bottomContent: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginBottom: 24,
  },
  timeText: {
    color: '#fff',
    fontSize: 16,
    width: 48,
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#222',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    backgroundColor: ACCENT,
    borderRadius: 3,
  },
  playButton: {
    backgroundColor: ACCENT,
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  endButton: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 18,
    marginTop: 8,
  },
  endButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default MeditateScreen; 