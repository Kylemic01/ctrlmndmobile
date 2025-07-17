import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { getVillainState, setCurrentVillain, VillainKey } from './villainStorage';
import VillainHealthBar from './VillainHealthBar';

const VILLAIN_INFO: Record<VillainKey, { name: string; image: any; obstacle: string; description: string }> = {
  doubt: { 
    name: 'The Question', 
    image: require('../assets/monsters/doubt.png'),
    obstacle: 'Doubt',
    description: 'Represents the feeling that you\'re not enough or not ready.'
  },
  pressure: { 
    name: 'Burden of Pressure', 
    image: require('../assets/monsters/pressure.png'),
    obstacle: 'Pressure',
    description: 'The burden of expectations—from yourself or others.'
  },
  comparison: { 
    name: 'Comparison', 
    image: require('../assets/monsters/comparison.png'),
    obstacle: 'Comparison',
    description: 'The habit of measuring your worth against someone else\'s.'
  },
  failure: { 
    name: 'Fear of Failure', 
    image: require('../assets/monsters/failure.png'),
    obstacle: 'Fear of Failure',
    description: 'The fear that taking action might end in embarrassment or regret.'
  },
  negativity: { 
    name: 'Negativity', 
    image: require('../assets/monsters/negativity.png'),
    obstacle: 'Negativity',
    description: 'The inner critic that always points out what\'s wrong.'
  },
  impatience: { 
    name: 'Impatience', 
    image: require('../assets/monsters/impatience.png'),
    obstacle: 'Impatience',
    description: 'The urge to rush results and abandon the process when it feels too slow.'
  },
};

const OBSTACLES = [
  { key: 'doubt', label: 'Doubt' },
  { key: 'pressure', label: 'Pressure' },
  { key: 'comparison', label: 'Comparison' },
  { key: 'failure', label: 'Fear of Failure' },
  { key: 'negativity', label: 'Negativity' },
  { key: 'impatience', label: 'Impatience' },
];

const MAX_HEALTH = 126;

export { VILLAIN_INFO };
export default function VillainProfileProgress({ darkBg }: { darkBg?: boolean }) {
  const [defeated, setDefeated] = useState<VillainKey[]>([]);
  const [current, setCurrent] = useState<VillainKey | null>(null);
  const [health, setHealth] = useState(MAX_HEALTH);
  const [modal, setModal] = useState<{ open: boolean; villain: VillainKey | null }>({ open: false, villain: null });
  const [selectModal, setSelectModal] = useState(false);
  const [introModal, setIntroModal] = useState(false);
  const [selectedVillain, setSelectedVillain] = useState<VillainKey | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    const state = await getVillainState();
    setDefeated(state.defeatedVillains);
    setCurrent(state.currentVillain);
    setHealth(state.villainHealth);
  };

  const handleSelectObstacle = (villain: VillainKey) => {
    setSelectedVillain(villain);
    setSelectModal(false);
    setIntroModal(true);
  };

  const handleConfirmVillain = async () => {
    if (selectedVillain) {
      await setCurrentVillain(selectedVillain);
      setIntroModal(false);
      setSelectedVillain(null);
      refresh();
    }
  };

  return (
    <View style={[styles.container, darkBg && styles.darkBg]}>
      <Text style={styles.sectionTitle}>Your Mindset Villain</Text>
      {current ? (
        <View style={styles.currentContainer}>
          <Image source={VILLAIN_INFO[current].image} style={styles.currentImg} />
          <Text style={styles.currentName}>{VILLAIN_INFO[current].name}</Text>
          <VillainHealthBar value={health} max={MAX_HEALTH} animated />
          <Text style={styles.healthText}>Health: {health} / {MAX_HEALTH}</Text>
          {health === 0 && (
            <TouchableOpacity style={styles.changeBtn} onPress={() => setSelectModal(true)}>
              <Text style={styles.changeBtnText}>Change Villain</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity style={styles.selectBtn} onPress={() => setSelectModal(true)}>
          <Text style={styles.changeBtnText}>Choose Your Villain</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.sectionTitle}>Defeated Villains</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        {defeated.length === 0 && <Text style={styles.noBadges}>No badges yet.</Text>}
        {defeated.map(villain => (
          <TouchableOpacity key={villain} onPress={() => setModal({ open: true, villain })} style={styles.badge}>
            <Image source={VILLAIN_INFO[villain].image} style={styles.badgeImg} />
            <Text style={styles.badgeLabel}>{VILLAIN_INFO[villain].name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Badge Modal */}
      <Modal visible={modal.open} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            {modal.villain && (
              <>
                <Image source={VILLAIN_INFO[modal.villain].image} style={styles.modalImg} />
                <Text style={styles.modalTitle}>{VILLAIN_INFO[modal.villain].name}</Text>
                <Text style={styles.modalDesc}>You defeated this villain!</Text>
                <TouchableOpacity onPress={() => setModal({ open: false, villain: null })} style={styles.closeBtn}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      {/* Obstacle Selection Modal */}
      <Modal visible={selectModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { width: 340, minHeight: 420 }]}>
            <Text style={styles.modalTitle}>What is your biggest obstacle?</Text>
            <View style={styles.obstacleContainer}>
              {OBSTACLES.map((obstacle) => (
                <TouchableOpacity
                  key={obstacle.key}
                  style={styles.obstacleOption}
                  onPress={() => handleSelectObstacle(obstacle.key as VillainKey)}
                >
                  <Text style={styles.obstacleText}>{obstacle.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setSelectModal(false)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Villain Introduction Modal */}
      <Modal visible={introModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { width: 340, minHeight: 420 }]}>
            {selectedVillain && (
              <>
                <Image source={VILLAIN_INFO[selectedVillain].image} style={styles.modalImg} />
                <Text style={styles.modalTitle}>{VILLAIN_INFO[selectedVillain].name}</Text>
                <Text style={styles.modalDesc}>{VILLAIN_INFO[selectedVillain].description}</Text>
                <Text style={styles.introText}>
                  Every time you meditate, you'll chip away at its grip on you.
                </Text>
                <TouchableOpacity onPress={handleConfirmVillain} style={styles.confirmBtn}>
                  <Text style={styles.confirmText}>Begin Your Journey</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIntroModal(false)} style={styles.closeBtn}>
                  <Text style={styles.closeText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 24, padding: 20, marginBottom: 18 },
  darkBg: { backgroundColor: 'rgba(35,35,35,0.85)' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#fff' },
  currentContainer: { alignItems: 'center', marginTop: 8, marginBottom: 12 },
  currentImg: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  currentName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#fff' },
  healthText: { fontSize: 16, marginTop: 4, color: '#fff' },
  changeBtn: { marginTop: 10, backgroundColor: '#4a90e2', borderRadius: 8, padding: 10, width: 180, alignItems: 'center' },
  changeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  selectBtn: { backgroundColor: '#4a90e2', borderRadius: 8, padding: 14, alignItems: 'center', marginVertical: 12 },
  badge: { alignItems: 'center', marginRight: 16, marginBottom: 12 },
  badgeImg: { width: 56, height: 56, borderRadius: 28, marginBottom: 4, borderWidth: 2, borderColor: '#4a90e2' },
  badgeLabel: { fontSize: 14, color: '#fff', textAlign: 'center' },
  noBadges: { color: '#aaa', fontSize: 16 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#222', borderRadius: 12, padding: 24, alignItems: 'center', width: 280 },
  modalImg: { width: 72, height: 72, borderRadius: 36, marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4, color: '#fff' },
  modalDesc: { fontSize: 16, marginBottom: 12, color: '#fff', textAlign: 'center' },
  closeBtn: { backgroundColor: '#4a90e2', borderRadius: 8, padding: 10, marginTop: 8, width: 120, alignItems: 'center' },
  closeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  obstacleContainer: {
    marginVertical: 12,
    width: '100%',
  },
  obstacleOption: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  obstacleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  confirmBtn: {
    backgroundColor: '#ff8800',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    width: 200,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  gridItem: {
    width: 140,
    height: 140,
    margin: 8,
    backgroundColor: '#333',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  gridImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  gridName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 2,
  },
  selectVillainRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#333', borderRadius: 8, padding: 8 },
}); 