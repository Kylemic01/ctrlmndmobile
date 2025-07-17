import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { getVillainState, updateVillainHealth, VillainKey } from './villainStorage';

const DAMAGE = 9;
const MAX_HEALTH = 126;

type Props = {
  onDamage?: () => void;
  onClose?: () => void;
};

export default function MonsterDamagePopup({ onDamage, onClose }: Props) {
  const [villain, setVillain] = useState<VillainKey | null>(null);
  const [health, setHealth] = useState(MAX_HEALTH);
  const [damaged, setDamaged] = useState(false); // keep for button disable after click
  const [animHealth] = useState(new Animated.Value(1));
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    getVillainState().then(state => {
      setVillain(state.currentVillain);
      setHealth(state.villainHealth);
    });
  }, []);

  const handleDamage = async () => {
    if (damaged || !villain) return;
    const newHealth = Math.max(0, health - DAMAGE);
    setHealth(newHealth);
    setDamaged(true);
    await updateVillainHealth(newHealth);
    Animated.timing(animHealth, {
      toValue: newHealth / MAX_HEALTH,
      duration: 600,
      useNativeDriver: false,
    }).start();
    setFeedback('Nice work!');
    if (onDamage) onDamage();
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  if (!villain) {
    return (
      <View style={styles.container}>
        <Text style={styles.info}>No villain selected.</Text>
        <TouchableOpacity style={styles.damageBtn} onPress={handleClose}>
          <Text style={styles.damageText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Good job!</Text>
      <Text style={styles.info}>You completed a meditation session.</Text>
      <View style={styles.healthBarContainer}>
        <Animated.View
          style={[
            styles.healthBar,
            {
              width: animHealth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: health > MAX_HEALTH * 0.5 ? '#4caf50' : health > MAX_HEALTH * 0.2 ? '#ff9800' : '#f44336',
            },
          ]}
        />
      </View>
      <Text style={styles.healthText}>Health: {health} / {MAX_HEALTH}</Text>
      <TouchableOpacity
        style={[styles.damageBtn, damaged && styles.disabled]}
        onPress={handleDamage}
        disabled={damaged}
      >
        <Text style={styles.damageText}>{damaged ? 'Damaged' : 'Damage Villain'}</Text>
      </TouchableOpacity>
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
      <TouchableOpacity style={styles.damageBtn} onPress={handleClose}>
        <Text style={styles.damageText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  info: { fontSize: 16, marginBottom: 16 },
  healthBarContainer: { width: 220, height: 24, backgroundColor: '#eee', borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  healthBar: { height: 24, borderRadius: 12 },
  healthText: { fontSize: 16, marginBottom: 16 },
  damageBtn: { padding: 14, backgroundColor: '#e53935', borderRadius: 8, width: 180, alignItems: 'center', marginBottom: 12 },
  damageText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  disabled: { backgroundColor: '#b0c4de' },
  feedback: { fontSize: 16, color: '#4caf50', marginTop: 8 },
}); 