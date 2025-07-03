import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Animated, Dimensions, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import type { AppNavigationProp } from '../types';

const ACCENT = '#ff8800';
const DARK = '#0d0d0d';
const CIRCLE_SIZE = Dimensions.get('window').width * 0.6;

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

// Add type for route params
type MeditateScreenParams = {
  audioUrl?: string;
  noteTitle?: string;
};

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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={ACCENT} style={{ marginTop: 80 }} />
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
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{noteTitle || 'Meditation'}</Text>
        <View style={{ width: 36 }} />
      </View>
      {/* Breathing animation */}
      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.breathingCircle,
            { transform: [{ scale: animation }] },
          ]}
        />
        <Text style={styles.instruction}>Use your breath to find energy</Text>
      </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 8,
    fontFamily: 'DMSans-Bold',
    letterSpacing: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: ACCENT,
    opacity: 0.18,
    marginBottom: 32,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
  },
  instruction: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    opacity: 0.9,
    fontFamily: 'DMSans-Medium',
    marginTop: 8,
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
});

export default MeditateScreen; 