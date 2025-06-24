import React from 'react';
import { View, StyleSheet } from 'react-native';

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.bar, { width: `${progress * 100}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  bar: {
    height: '100%',
    backgroundColor: '#FF6F00',
    borderRadius: 4,
  },
});

export default ProgressBar; 