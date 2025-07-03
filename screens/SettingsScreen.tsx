import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Switch, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp, User } from '../types';
import * as ImagePicker from 'expo-image-picker';
import { getUser, setUser, clearUser, getStreak } from '../components/userStorage';
import { useAuth } from '../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GardenPopupCard from '../components/GardenPopupCard';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as MailComposer from 'expo-mail-composer';
import * as Linking from 'expo-linking';

const BACKGROUND_TRACKS = [
  {
    name: 'Relaxing',
    uri: 'https://iciecutonrezzhddnmjv.supabase.co/storage/v1/object/public/meditations/background/relaxing.mp3',
  },
];

const BG_TRACK_KEY = 'selectedBgTrack';
const PROFILE_IMAGE_KEY = 'profile_image';

const SettingsScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { profile } = useAuth();
  const [user, setUserState] = useState<User | null>(null);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [showGardenPopup, setShowGardenPopup] = useState(false);
  const [gardenStreak, setGardenStreak] = useState(1);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);

  useEffect(() => {
    if (profile) {
      setUserState({
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        avatar: profile.avatar,
      });
    }
    (async () => {
      const saved = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      if (saved) setAvatar(saved);
    })();
  }, [profile]);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleAthleteProfile = () => {
    navigation.navigate('AthleteProfile');
  };

  const handleGiveFeedback = async () => {
    await MailComposer.composeAsync({
      recipients: ['kyle@heykrow.com'],
      subject: 'Feedback for CTRL/MND',
      body: '',
    });
  };

  const handleShowStreak = async () => {
    const streak = await getStreak();
    setGardenStreak(streak);
    setShowGardenPopup(true);
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

  const handleSetReminder = async () => {
    // Prompt user for a time (for simplicity, use a fixed time or implement a time picker)
    const hour = 8; // 8 AM default
    const minute = 0;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 min event
    const startISO = startDate.toISOString().replace(/[-:]|\.\d{3}/g, '');
    const endISO = endDate.toISOString().replace(/[-:]|\.\d{3}/g, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=CTRL%2FMND%20time&dates=${startISO}/${endISO}&recur=RRULE:FREQ=DAILY&details=Daily+meditation+reminder`;
    Linking.openURL(url);
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Dashboard')}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handlePickAvatar}>
            {avatar ? (
              <Image source={{ uri: avatar || '' }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder} />
            )}
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Text style={styles.editProfileText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences Group */}
        <View style={styles.groupCard}>
          <View style={styles.groupRow}>
            <Ionicons name="notifications-outline" size={22} color="#fff" style={styles.groupIcon} />
            <Text style={styles.groupLabel}>Notifications and sounds</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              thumbColor={notificationsEnabled ? '#ff8800' : '#fff'}
              trackColor={{ false: '#444', true: '#ff8800' }}
              style={{ marginLeft: 'auto' }}
            />
          </View>
          <TouchableOpacity style={styles.groupRow} onPress={handleShowStreak}>
            <Ionicons name="flame" size={22} color="#ff8800" style={styles.groupIcon} />
            <Text style={styles.groupLabel}>View Streak</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.groupRow} onPress={handleSetReminder}>
            <Ionicons name="time-outline" size={22} color="#fff" style={styles.groupIcon} />
            <Text style={styles.groupLabel}>Set Reminder</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* Account Group */}
        <View style={styles.groupCard}>
          <TouchableOpacity style={styles.groupRow} onPress={handleChangePassword}>
            <Ionicons name="lock-closed-outline" size={22} color="#fff" style={styles.groupIcon} />
            <Text style={styles.groupLabel}>Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <View style={styles.groupRow}>
            <Ionicons name="finger-print-outline" size={22} color="#fff" style={styles.groupIcon} />
            <Text style={styles.groupLabel}>Login with Face ID</Text>
            <Switch
              value={faceIdEnabled}
              onValueChange={setFaceIdEnabled}
              thumbColor={faceIdEnabled ? '#ff8800' : '#fff'}
              trackColor={{ false: '#444', true: '#ff8800' }}
              style={{ marginLeft: 'auto' }}
            />
          </View>
          <TouchableOpacity style={styles.groupRow} onPress={handleGiveFeedback}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" style={styles.groupIcon} />
            <Text style={styles.groupLabel}>Give Feedback</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.groupRow} onPress={handleAthleteProfile}>
            <Ionicons name="person-outline" size={22} color="#fff" style={styles.groupIcon} />
            <Text style={styles.groupLabel}>Your Athlete profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.groupRow}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#fff" style={styles.groupIcon} />
            <Text style={styles.groupLabel}>Terms and Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color="#fff" style={styles.groupIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Streak Popup */}
        <GardenPopupCard
          visible={showGardenPopup}
          streak={gardenStreak}
          onContinue={() => setShowGardenPopup(false)}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#181818',
  },
  container: {
    flex: 1,
    backgroundColor: '#181818',
    padding: 0,
    alignItems: 'stretch',
  },
  backButton: {
    position: 'absolute',
    top: 44,
    left: 18,
    zIndex: 10,
    padding: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232323',
    borderRadius: 18,
    padding: 18,
    marginTop: 100, // increased for more space below back button
    marginHorizontal: 18,
    marginBottom: 18,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#444',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#444',
  },
  profileName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 2,
  },
  editProfileButton: {
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  editProfileText: {
    color: '#ff8800',
    fontSize: 14,
    fontWeight: 'bold',
  },
  groupCard: {
    backgroundColor: '#232323',
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 18,
    paddingVertical: 2,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
  },
  groupIcon: {
    marginRight: 16,
  },
  groupLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    borderRadius: 18,
    marginHorizontal: 18,
    marginTop: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SettingsScreen; 