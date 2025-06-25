import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { AppNavigationProp } from '../types';

const MeditateScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Meditation</Text>
        <View style={styles.circleContainer}>
          <View style={styles.orangeCircle}>
            <Ionicons name="leaf-outline" size={64} color="#fff" style={{ opacity: 0.3 }} />
          </View>
        </View>
        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play" size={36} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.subtitle}>Take a deep breath and press play to begin your session.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#ff8800',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    fontFamily: 'DMSans-Bold',
    letterSpacing: 1,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  orangeCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#ff8800',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff8800',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 16,
  },
  playButton: {
    backgroundColor: '#ff8800',
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#ff8800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  subtitle: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
    fontFamily: 'DMSans-Medium',
    marginTop: 8,
  },
});

export default MeditateScreen; 