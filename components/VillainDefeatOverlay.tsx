import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function VillainDefeatOverlay({ visible, onClose }: Props) {
  // Placeholder for future animation (simple fade-in text for now)
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Villain Defeated!</Text>
          <Text style={styles.subtitle}>The monster crumbles before your inner strength.</Text>
          {/* Placeholder for animation: could add Lottie or Animated.View here */}
          <View style={styles.crumble} />
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  content: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', width: 300 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#e53935', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#333', marginBottom: 16, textAlign: 'center' },
  crumble: { width: 120, height: 40, backgroundColor: '#ccc', borderRadius: 20, marginBottom: 16 },
  closeBtn: { backgroundColor: '#4a90e2', borderRadius: 8, padding: 12, marginTop: 8, width: 140, alignItems: 'center' },
  closeText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
}); 