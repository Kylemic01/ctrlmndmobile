import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const ATHLETE_PROFILE_KEY = 'athlete_profile';

const AthleteProfileScreen = () => {
  const navigation = useNavigation();
  const [age, setAge] = useState('');
  const [sport, setSport] = useState('');
  const [level, setLevel] = useState('');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(ATHLETE_PROFILE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setAge(data.age || '');
        setSport(data.sport || '');
        setLevel(data.level || '');
      }
    })();
  }, []);

  const handleSave = async () => {
    const data = { age, sport, level };
    await AsyncStorage.setItem(ATHLETE_PROFILE_KEY, JSON.stringify(data));
    Alert.alert('Saved', 'Athlete profile updated!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>Athlete Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Age"
        placeholderTextColor="#888"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Sport"
        placeholderTextColor="#888"
        value={sport}
        onChangeText={setSport}
      />
      <TextInput
        style={styles.input}
        placeholder="Level (pro, fitness, etc)"
        placeholderTextColor="#888"
        value={level}
        onChangeText={setLevel}
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 18,
    zIndex: 10,
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#232323',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 16,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: '#444',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#ff8800',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AthleteProfileScreen; 