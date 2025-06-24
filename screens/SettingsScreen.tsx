import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp, User } from '../types';
import * as ImagePicker from 'expo-image-picker';
import { getUser, setUser, clearUser } from '../components/userStorage';

const SettingsScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [user, setUserState] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    getUser().then(u => {
      if (u) {
        setUserState(u);
        setFirstName(u.firstName);
        setLastName(u.lastName);
        setEmail(u.email);
        setAvatar(u.avatar);
      } else {
        setUserState(null);
        setFirstName('');
        setLastName('');
        setEmail('');
        setAvatar(undefined);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!firstName || !lastName || !email) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    const updated: User = { firstName, lastName, email, avatar };
    await setUser(updated);
    setUserState(updated);
    Alert.alert('Saved', 'Profile updated!');
    navigation.goBack();
  };

  const handleSignOut = async () => {
    await clearUser();
    navigation.reset({ index: 0, routes: [{ name: 'Login' as const }] });
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Settings</Text>
      <TouchableOpacity onPress={handlePickAvatar}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar} />
        )}
        <Text style={styles.avatarText}>Change Photo</Text>
      </TouchableOpacity>
      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First Name" placeholderTextColor="#888" />
      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last Name" placeholderTextColor="#888" />
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#888" autoCapitalize="none" />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 24,
    padding: 8,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#444',
    marginBottom: 8,
    alignSelf: 'center',
  },
  avatarText: {
    color: '#ff8800',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#232323',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 12,
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#ff8800',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    width: '100%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
  },
  signOutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SettingsScreen; 