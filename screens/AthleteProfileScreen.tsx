import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabase';
// Remove native date picker imports for Expo Go compatibility
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
// Remove native date picker imports for Expo Go compatibility

const AthleteProfileScreen = () => {
  const { profile, refreshProfile } = useAuth();
  const navigation = useNavigation();
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  // Remove date picker modal state
  const [birthdayInput, setBirthdayInput] = useState('');
  const [birthdayError, setBirthdayError] = useState('');
  const [sport, setSport] = useState('');
  const [position, setPosition] = useState('');
  const [level, setLevel] = useState('');
  const [shortTermGoal, setShortTermGoal] = useState('');
  const [saving, setSaving] = useState(false);
  const [birthdayLocked, setBirthdayLocked] = useState(false);

  useEffect(() => {
    if (profile) {
      setAvatar(profile.avatar || undefined);
      setSport(profile.sport ?? '');
      setPosition(profile.position ?? '');
      setLevel(profile.level ?? '');
      setShortTermGoal(profile.short_term_goal ?? '');
      if (profile.birthday) {
        setBirthdayInput(profile.birthday);
        setBirthdayLocked(true);
      }
    }
  }, [profile]);

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const isValidDate = (dateString: string) => {
    // YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const handleSave = async () => {
    setSaving(true);
    setBirthdayError('');
    try {
      const updates: any = {
        sport,
        position,
        level,
        short_term_goal: shortTermGoal,
      };
      if (!birthdayLocked) {
        if (!isValidDate(birthdayInput)) {
          setBirthdayError('Please enter a valid date in YYYY-MM-DD format');
          setSaving(false);
          return;
        }
        updates.birthday = birthdayInput;
      }
      if (avatar) {
        updates.avatar = avatar;
      }
      await supabase.from('profiles').update(updates).eq('id', profile.id);
      await refreshProfile();
      if (!birthdayLocked) setBirthdayLocked(true);
      Alert.alert('Saved', 'Profile updated!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile.');
    }
    setSaving(false);
  };

  // Remove date picker modal handlers
  // const handleDateOpen = () => {
  //   if (!birthdayLocked) {
  //     setTempBirthday(birthday || new Date(2000, 0, 1));
  //     setShowDatePicker(true);
  //   }
  // };
  // const handleDateConfirm = () => {
  //   if (tempBirthday) setBirthday(tempBirthday);
  //   setShowDatePicker(false);
  // };
  // const handleDateCancel = () => {
  //   setShowDatePicker(false);
  // };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      {/* Back Button absolutely positioned in top left */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Profile Picture and Name */}
        <View style={styles.profileHeaderRow}>
          <TouchableOpacity onPress={handlePickAvatar}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarSmall} />
            ) : (
              <View style={styles.avatarPlaceholderSmall} />
            )}
          </TouchableOpacity>
          <View style={styles.nameColumn}>
            <Text style={styles.name}>{profile?.first_name} {profile?.last_name}</Text>
            <TouchableOpacity onPress={handlePickAvatar}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.formRow}>
            <Text style={styles.label}>Birthday</Text>
            <TextInput
              style={[styles.input, birthdayLocked && styles.disabledInput]}
              value={birthdayInput}
              onChangeText={setBirthdayInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#888"
              editable={!birthdayLocked}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
            {birthdayError ? (
              <Text style={{ color: '#ff4d4f', marginTop: 4, fontSize: 14 }}>{birthdayError}</Text>
            ) : null}
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>Sport</Text>
            <TextInput
              style={styles.input}
              value={sport}
              onChangeText={setSport}
              placeholder="e.g. Basketball"
              placeholderTextColor="#888"
              editable={true}
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>Position/Discipline</Text>
            <TextInput
              style={styles.input}
              value={position}
              onChangeText={setPosition}
              placeholder="e.g. Point Guard"
              placeholderTextColor="#888"
              editable={true}
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>Level</Text>
            <TextInput
              style={styles.input}
              value={level}
              onChangeText={setLevel}
              placeholder="e.g. Pro, College, High School"
              placeholderTextColor="#888"
              editable={true}
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.label}>Short Term Goal</Text>
            <TextInput
              style={styles.input}
              value={shortTermGoal}
              onChangeText={setShortTermGoal}
              placeholder="e.g. Make varsity team"
              placeholderTextColor="#888"
              editable={true}
            />
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#0d0d0d',
    padding: 24,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 18,
    zIndex: 10,
    marginTop: 12,
    padding: 8,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 60,
    marginBottom: 8, // Reduce gap below profile header
    width: '100%',
    justifyContent: 'center',
  },
  avatarSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#444',
    marginBottom: 0,
  },
  avatarPlaceholderSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#444',
    marginBottom: 0,
  },
  changePhotoText: {
    color: '#ff8800',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  formRow: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
    display: 'flex',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    alignItems: 'flex-start',
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#292929',
    color: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    width: 300,
    maxWidth: '100%',
    borderWidth: 1.5,
    borderColor: '#444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 2,
    alignSelf: 'center',
  },
  disabledInput: {
    backgroundColor: '#444',
    color: '#aaa',
    borderColor: '#444',
  },
  saveButton: {
    backgroundColor: '#ff8800',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 24,
    alignItems: 'center',
    width: 300,
    maxWidth: '100%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nameColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 16,
  },
});

export default AthleteProfileScreen; 