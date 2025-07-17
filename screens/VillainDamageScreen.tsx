import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Easing, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useVillain } from '../components/VillainProvider';
import { VILLAIN_INFO } from '../components/VillainProfileProgress';
import MonsterSelectionScreen from '../components/MonsterSelectionScreen';

const MAX_HEALTH = 126;
const DAMAGE = 9;

const SCREEN_WIDTH = Dimensions.get('window').width;
const MONSTER_SIZE = Math.min(400, SCREEN_WIDTH * 0.75);
const HEALTH_BAR_HEIGHT = MONSTER_SIZE;
const HEALTH_BAR_WIDTH = 24;

// Helper for animated height interpolation
const interpolateHeight = (anim: Animated.AnimatedInterpolation<number>, maxHeight: number): Animated.AnimatedInterpolation<number> =>
  anim.interpolate({ inputRange: [0, 1], outputRange: [0, maxHeight] });

export default function VillainDamageScreen() {
  const navigation = useNavigation();
  const { currentVillain, villainHealth, damageVillain, refresh } = useVillain();
  const [damaged, setDamaged] = useState(false);
  const [finishEnabled, setFinishEnabled] = useState(false);
  const [localHealth, setLocalHealth] = useState(villainHealth);
  const healthAnim = useRef(new Animated.Value(villainHealth / MAX_HEALTH)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const borderFlashAnim = useRef(new Animated.Value(0)).current;
  const healthBarShakeAnim = useRef(new Animated.Value(0)).current;
  const monsterShakeAnim = useRef(new Animated.Value(0)).current;
  const [healthFlash, setHealthFlash] = useState(false);
  const prevHealth = useRef(localHealth);

  if (!currentVillain) {
    // Show MonsterSelectionScreen and after selection, refresh villain context and re-render
    return <MonsterSelectionScreen onSelected={async () => {
      await refresh();
    }} />;
  }

  const villain = VILLAIN_INFO[currentVillain];

  const handleDamage = async () => {
    if (damaged) return;
    setDamaged(true);
    const newHealth = Math.max(0, localHealth - DAMAGE);
    setLocalHealth(newHealth);
    Animated.timing(healthAnim, {
      toValue: newHealth / MAX_HEALTH,
      duration: 700,
      useNativeDriver: false, // correct for height
    }).start();
    // Red border flash (3 times) - must use useNativeDriver: false
    Animated.sequence([
      Animated.timing(borderFlashAnim, { toValue: 1, duration: 80, useNativeDriver: false }),
      Animated.timing(borderFlashAnim, { toValue: 0, duration: 80, useNativeDriver: false }),
      Animated.timing(borderFlashAnim, { toValue: 1, duration: 80, useNativeDriver: false }),
      Animated.timing(borderFlashAnim, { toValue: 0, duration: 80, useNativeDriver: false }),
      Animated.timing(borderFlashAnim, { toValue: 1, duration: 80, useNativeDriver: false }),
      Animated.timing(borderFlashAnim, { toValue: 0, duration: 120, useNativeDriver: false }),
    ]).start();
    // Health bar and monster shake (left-right) - useNativeDriver: true for transform
    Animated.parallel([
      Animated.sequence([
        Animated.timing(healthBarShakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(healthBarShakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(healthBarShakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(healthBarShakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(healthBarShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(monsterShakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(monsterShakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(monsterShakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(monsterShakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(monsterShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]),
    ]).start();
    await damageVillain(DAMAGE);
    setTimeout(() => setFinishEnabled(true), 2000);
  };

  const handleFinish = () => {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const borderColor = borderFlashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ff8800', '#ff2222'],
  });
  const borderWidth = borderFlashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 8],
  });
  const healthBarShake = healthBarShakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-12, 0, 12], // more vigorous shake
  });
  const monsterShake = monsterShakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-16, 0, 16], // more vigorous shake
  });

  // Detect health decrease for red flash
  React.useEffect(() => {
    if (localHealth < prevHealth.current) {
      setHealthFlash(true);
      setTimeout(() => setHealthFlash(false), 500);
    }
    prevHealth.current = localHealth;
  }, [localHealth]);

  return (
    <View style={styles.container}>
      <Text style={{ color: '#fff', fontSize: 20, textAlign: 'center', marginBottom: 16 }}>You're decreasing your</Text>
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 26, textAlign: 'center', marginBottom: 16 }}>{villain.name}</Text>
      <View style={styles.monsterRow}>
        <Animated.View style={[
          {
            width: MONSTER_SIZE * 0.65,
            height: MONSTER_SIZE * 1, // Rectangle aspect ratio
            borderRadius: 16, // Slightly rounded corners
            backgroundColor: '#181818',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ translateX: monsterShake }],
            borderColor: borderColor as any,
            borderWidth: 2, // fixed thin border
          },
          styles.monsterFrame,
        ]}>
          <Image source={villain.image} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
        </Animated.View>
        <Animated.View style={{
          height: HEALTH_BAR_HEIGHT,
          width: HEALTH_BAR_WIDTH,
          marginLeft: 18,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          transform: [{ translateX: healthBarShake }],
        }}>
          <Animated.View style={{
            height: HEALTH_BAR_HEIGHT,
            width: HEALTH_BAR_WIDTH,
            backgroundColor: '#232323',
            borderRadius: 12,
            overflow: 'hidden',
            borderColor: borderColor as any,
            borderWidth: 2, // fixed thin border
          }}>
            <Animated.View style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: HEALTH_BAR_WIDTH,
              height: interpolateHeight(healthAnim, HEALTH_BAR_HEIGHT),
              backgroundColor: localHealth > MAX_HEALTH * 0.5 ? '#4caf50' : localHealth > MAX_HEALTH * 0.2 ? '#ff9800' : '#f44336',
              borderRadius: 12,
              opacity: healthFlash ? 0.6 : 1,
            }} />
            {healthFlash && (
              <Animated.View style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: HEALTH_BAR_WIDTH,
                height: interpolateHeight(healthAnim, HEALTH_BAR_HEIGHT),
                backgroundColor: 'rgba(255,0,0,0.4)',
                borderRadius: 12,
              }} />
            )}
          </Animated.View>
        </Animated.View>
      </View>
      <Text style={styles.info}>You trained your mind and did damage to your villain</Text>
      <Text style={styles.info}>Keep making progress!</Text>
      <View style={{ flex: 0.4 }} /> {/* Spacer to push content above buttons */}
      <View style={styles.stickyButtonContainer}>
        <TouchableOpacity
          style={[styles.mainButton, damaged && styles.mainButtonDisabled]}
          onPress={handleDamage}
          disabled={damaged}
        >
          <Text style={styles.mainButtonText}>{damaged ? 'Damaged' : 'Damage'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainButton, !finishEnabled && styles.mainButtonDisabled, { marginTop: 12 }]}
          onPress={handleFinish}
          disabled={!finishEnabled}
        >
          <Text style={styles.mainButtonText}>Finish Session</Text>
        </TouchableOpacity>
        {/* Add safe area padding for iOS */}
        {Platform.OS === 'ios' && <View style={{ height: 24 }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  monsterFrame: {
    borderRadius: 24,
    padding: 0,
    marginBottom: 24,
    alignItems: 'center',
    backgroundColor: '#181818',
    justifyContent: 'center',
    overflow: 'hidden',
    borderColor: '#ff8800',
    // width and height removed for dynamic sizing
  },
  // monsterImage style removed for dynamic sizing
  healthBarOuter: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 16,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#232323',
    borderWidth: 2,
    borderColor: '#ff8800',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthBarInner: {
    height: '100%',
    borderRadius: 9,
  },
  info: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '500',
    paddingHorizontal: 24,
  },
  quizButton: {
    backgroundColor: '#ff8800',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    width: '90%',
    maxWidth: 340,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  quizButtonDisabled: {
    backgroundColor: '#b0c4de',
  },
  quizButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'DMSans-Bold',
    letterSpacing: 0.5,
  },
  monsterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 24,
  },
  healthBarVertical: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#232323',
  },
  stickyButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  mainButton: {
    backgroundColor: '#ff8800',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  mainButtonDisabled: {
    backgroundColor: '#0d0d0d',
    borderColor: 'fff',
    borderWidth: 1,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'DMSans-Bold',
    letterSpacing: 0.5,
  },
}); 