import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ShimmerLoadingBar from '../components/ShimmerLoadingBar';
import { useExperiment } from 'statsig-react-native';

interface Props {
  onSelect: (type: 'athlete' | 'non-athlete', variant?: string) => void;
  loading?: boolean;
  error?: string | null;
}

const UserTypeSelectScreen = ({ onSelect, loading = false, error = null }: Props) => {
  // Use Statsig experiment for onboarding flow
  const { config, isLoading } = useExperiment('onboarding_flow_test');
  const variant = config.get('variant', 'A');

  return (
    <View style={styles.container}>
      {/* Show experiment variant for debugging */}
      <Text style={{ color: '#ff8800', fontSize: 16, marginBottom: 8 }}>Experiment Variant: {variant}</Text>
      <Text style={styles.title}>Which one fits you better?</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.box, loading && styles.disabled]}
          onPress={() => onSelect('athlete', variant)}
          disabled={loading}
        >
          <Ionicons name="fitness-outline" size={36} color="#0d0d0d" style={{ marginBottom: 12 }} />
          <Text style={styles.boxText}>I am an athlete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.box, loading && styles.disabled]}
          onPress={() => onSelect('non-athlete', variant)}
          disabled={loading}
        >
          <MaterialIcons name="self-improvement" size={36} color="#0d0d0d" style={{ marginBottom: 12 }} />
          <Text style={styles.boxText}>I am here for the health benefits</Text>
        </TouchableOpacity>
      </View>
      {(loading || isLoading) && <ShimmerLoadingBar />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  box: {
    flex: 1,
    backgroundColor: '#ff8800',
    borderRadius: 16,
    marginHorizontal: 8,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 12,
    minWidth: 140,
    maxWidth: 200,
  },
  boxText: {
    color: '#0d0d0d',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default UserTypeSelectScreen; 