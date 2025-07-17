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
import { BlurView } from 'expo-blur';
import VillainProfileProgress from '../components/VillainProfileProgress';
import { fetchLeaderboard } from '../supabaseTeams';
import MiniTeamLeaderboard from '../components/MiniTeamLeaderboard';
import TeamLeaderboardScreen from './TeamLeaderboardScreen';
import TeamCard from '../components/TeamCard';

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
  const { profile, teamMembership } = useAuth();
  const [user, setUserState] = useState<User | null>(null);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [showGardenPopup, setShowGardenPopup] = useState(false);
  const [gardenStreak, setGardenStreak] = useState(1);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [topTeams, setTopTeams] = useState<any[]>([]);

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
    // Fetch top 5 teams for mini leaderboard
    const loadLeaderboard = async () => {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      try {
        const teams = await fetchLeaderboard(month, 5);
        setTopTeams(teams || []);
      } catch (e) {
        setTopTeams([]);
      }
    };
    loadLeaderboard();
  }, [profile, teamMembership]);

  const handleEditProfile = () => {
    navigation.navigate('AthleteProfile');
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
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={{ height: 12 }} />
      <View style={styles.container}>
        {/* Profile Card - moved above leaderboard */}
        <View style={styles.profileCard}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarLarge} />
            ) : (
              <View style={styles.avatarLarge} />
            )}
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={styles.profileNameLarge}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.profileEmailLarge}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileButtonLarge} onPress={handleEditProfile}>
            <Text style={styles.editProfileTextLarge}>Edit profile</Text>
          </TouchableOpacity>
        </View>
        {/* Progress features removed: TeamCard, MiniTeamLeaderboard, VillainProfileProgress, GardenPopupCard, streak info */}
        <View style={styles.groupCardModern}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableOpacity style={styles.groupRowModern} onPress={() => navigation.navigate('JoinTeam')}>
            <View style={styles.iconBg}>
              <Ionicons name="people-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.groupLabelModern}>Join or Switch Team</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.groupRowModern} onPress={() => navigation.navigate('TeamLeaderboard')}>
            <View style={styles.iconBg}>
              <Ionicons name="trophy-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.groupLabelModern}>View Full Leaderboard</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.groupCardModern}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          {/* Notifications */}
          <View style={styles.groupRowModern}>
            <View style={styles.iconBg}>
              <Ionicons name="notifications-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.groupLabelModern}>Notifications and sounds</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              thumbColor={notificationsEnabled ? '#ff8800' : '#fff'}
              trackColor={{ false: '#444', true: '#ff8800' }}
              style={{ marginLeft: 'auto' }}
            />
          </View>
          <View style={styles.divider} />
          {/* View Streak */}
          <TouchableOpacity style={styles.groupRowModern} onPress={handleShowStreak}>
            <View style={styles.iconBg}>
              <Ionicons name="flame" size={20} color="#fff" />
            </View>
            <Text style={styles.groupLabelModern}>View Streak</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <View style={styles.divider} />
          {/* Set Reminder */}
          <TouchableOpacity style={styles.groupRowModern} onPress={handleSetReminder}>
            <View style={styles.iconBg}>
              <Ionicons name="time-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.groupLabelModern}>Set Reminder</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.groupCardModern}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          {/* Password */}
          <TouchableOpacity style={styles.groupRowModern} onPress={handleChangePassword}>
            <View style={styles.iconBg}>
              <Ionicons name="lock-closed-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.groupLabelModern}>Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <View style={styles.divider} />
          {/* Face ID */}
          <View style={styles.groupRowModern}>
            <View style={styles.iconBg}>
              <Ionicons name="finger-print-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.groupLabelModern}>Login with Face ID</Text>
            <Switch
              value={faceIdEnabled}
              onValueChange={setFaceIdEnabled}
              thumbColor={faceIdEnabled ? '#ff8800' : '#fff'}
              trackColor={{ false: '#444', true: '#ff8800' }}
              style={{ marginLeft: 'auto' }}
            />
          </View>
          <View style={styles.divider} />
          {/* Give Feedback */}
          <TouchableOpacity style={styles.groupRowModern} onPress={handleGiveFeedback}>
            <View style={styles.iconBg}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.groupLabelModern}>Give Feedback</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <View style={styles.divider} />
          {/* Athlete Profile */}
          <TouchableOpacity style={styles.groupRowModern} onPress={handleAthleteProfile}>
            <View style={styles.iconBg}>
              <Ionicons name="person-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.groupLabelModern}>Your Athlete profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <View style={styles.divider} />
          {/* Terms and Privacy Policy */}
          <TouchableOpacity style={styles.groupRowModern}>
            <View style={styles.iconBg}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.groupLabelModern}>Terms and Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* Mindset Villain Section - moved above logout */}
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutCard} onPress={handleSignOut}>
          <View style={styles.iconBgRed}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          </View>
          <Text style={styles.logoutTextModern}>Logout</Text>
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
  profileCard: {
    backgroundColor: 'rgba(35,35,35,0.85)',
    borderRadius: 24,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    position: 'relative',
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#444',
  },
  profileNameLarge: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmailLarge: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 2,
  },
  editProfileButtonLarge: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  editProfileTextLarge: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 28,
    marginBottom: 6,
    marginTop: 18,
    letterSpacing: 0.5,
  },
  groupCardModern: {
    backgroundColor: 'rgba(35,35,35,0.85)',
    borderRadius: 24,
    marginHorizontal: 18,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  groupRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconBgRed: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  groupLabelModern: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginLeft: 54,
    marginRight: 0,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    borderRadius: 18,
    marginHorizontal: 18,
    marginTop: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutTextModern: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginLeft: 8,
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginRight: 8,
    marginTop: 24,
    marginLeft: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    marginHorizontal: 18,
    marginBottom: 18,
    backgroundColor: 'rgba(35,35,35,0.85)',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
});

export default SettingsScreen; 
