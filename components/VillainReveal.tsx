import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { getVillainState, addDefeatedVillain, VillainKey } from './villainStorage';

const VILLAIN_INFO: Record<VillainKey, { name: string; image: any }> = {
  doubt: { name: 'The Question', image: require('../assets/monsters/doubt.png') },
  pressure: { name: 'The Weight', image: require('../assets/monsters/pressure.png') },
  comparison: { name: 'The Mirror', image: require('../assets/monsters/comparison.png') },
  failure: { name: 'The Risk', image: require('../assets/monsters/failure.png') },
  negativity: { name: 'The Voice', image: require('../assets/monsters/negativity.png') },
  impatience: { name: 'The Clock', image: require('../assets/monsters/impatience.png') },
};

const MAX_HEALTH = 126;

export default function VillainReveal() {
  const [villain, setVillain] = useState<VillainKey | null>(null);
  const [health, setHealth] = useState(MAX_HEALTH);
  const [defeated, setDefeated] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    getVillainState().then(state => {
      setVillain(state.currentVillain);
      setHealth(state.villainHealth);
      if (state.currentVillain && state.villainHealth === 0) {
        setDefeated(true);
        addDefeatedVillain(state.currentVillain).then(() => setShowPrompt(true));
      }
    });
  }, []);

  if (!villain) {
    return (
      <View style={styles.container}>
        <Text style={styles.info}>No villain selected.</Text>
      </View>
    );
  }

  if (defeated) {
    return (
      <View style={styles.container}>
        <Text style={styles.defeatTitle}>Villain Defeated!</Text>
        <Text style={styles.defeatText}>You’ve conquered this obstacle.</Text>
        {/* Simple defeat animation placeholder */}
        <View style={styles.crumble} />
        {showPrompt && (
          <Text style={styles.prompt}>Ready to take on the next villain? Go to the selection screen.</Text>
        )}
      </View>
    );
  }

  const info = VILLAIN_INFO[villain];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{info.name}</Text>
      <Image source={info.image} style={styles.image} resizeMode="contain" />
      <View style={styles.healthBarContainer}>
        <View style={[styles.healthBar, { width: `${(health / MAX_HEALTH) * 100}%`, backgroundColor: health > MAX_HEALTH * 0.5 ? '#4caf50' : health > MAX_HEALTH * 0.2 ? '#ff9800' : '#f44336' }]} />
      </View>
      <Text style={styles.healthText}>Health: {health} / {MAX_HEALTH}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  image: { width: 160, height: 160, marginBottom: 16 },
  healthBarContainer: { width: 220, height: 24, backgroundColor: '#eee', borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  healthBar: { height: 24, borderRadius: 12 },
  healthText: { fontSize: 16, marginBottom: 16 },
  defeatTitle: { fontSize: 24, fontWeight: 'bold', color: '#e53935', marginBottom: 8 },
  defeatText: { fontSize: 18, marginBottom: 16 },
  crumble: { width: 120, height: 40, backgroundColor: '#ccc', borderRadius: 20, marginBottom: 16 },
  prompt: { fontSize: 16, color: '#4a90e2', marginTop: 8, textAlign: 'center' },
  info: { fontSize: 16, marginBottom: 16 },
}); 