import React, { useState } from 'react';
import type { FC } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { setCurrentVillain, VillainKey } from './villainStorage';

const STRUGGLES: { label: string; key: VillainKey }[] = [
  { label: 'Doubt', key: 'doubt' },
  { label: 'Pressure', key: 'pressure' },
  { label: 'Comparison', key: 'comparison' },
  { label: 'Fear of Failure', key: 'failure' },
  { label: 'Negativity', key: 'negativity' },
  { label: 'Impatience', key: 'impatience' },
];

type MonsterSelectionScreenProps = {
  onSelected?: () => void;
};

const MonsterSelectionScreen: FC<MonsterSelectionScreenProps> = ({ onSelected }) => {
  const [selected, setSelected] = useState<VillainKey | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleSelect = (key: VillainKey) => setSelected(key);

  const handleConfirm = async () => {
    if (selected) {
      await setCurrentVillain(selected);
      setConfirmed(true);
      if (onSelected) onSelected();
    }
  };

  if (confirmed && !onSelected) {
    return (
      <View style={styles.container}>
        <Text style={styles.confirmText}>Villain selected! Your journey begins.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What do you struggle with most?</Text>
      {STRUGGLES.map(({ label, key }) => (
        <TouchableOpacity
          key={key}
          style={[styles.option, selected === key && styles.selected]}
          onPress={() => handleSelect(key)}
        >
          <Text style={styles.optionText}>{label}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.confirmBtn, !selected && styles.disabled]}
        onPress={handleConfirm}
        disabled={!selected}
      >
        <Text style={styles.confirmText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MonsterSelectionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  option: { padding: 16, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12, width: 220, alignItems: 'center' },
  selected: { backgroundColor: '#e0e0ff', borderColor: '#888' },
  optionText: { fontSize: 18 },
  confirmBtn: { marginTop: 24, padding: 14, backgroundColor: '#4a90e2', borderRadius: 8, width: 180, alignItems: 'center' },
  disabled: { backgroundColor: '#b0c4de' },
  confirmText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
}); 