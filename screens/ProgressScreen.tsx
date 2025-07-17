import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import VillainProfileProgress from '../components/VillainProfileProgress';
import GardenPopupCard from '../components/GardenPopupCard';
import TeamCard from '../components/TeamCard';
import MiniTeamLeaderboard from '../components/MiniTeamLeaderboard';
import { useAuth } from '../hooks/useAuth';
import { fetchLeaderboard } from '../supabaseTeams';
import { useEffect } from 'react';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import TeamProgressSummary from '../components/TeamProgressSummary';
import LeaderboardSnapshot from '../components/LeaderboardSnapshot';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const ProgressScreen = ({ navigation }: { navigation: NativeStackNavigationProp<any> }) => {
  const { teamMembership } = useAuth();
  const [gardenStreak, setGardenStreak] = useState(1);
  const [showGardenPopup, setShowGardenPopup] = useState(false);

  useEffect(() => {
    console.log('teamMembership:', teamMembership);
  }, [teamMembership]);

  // For debug: always show a large profile image and rank at the top
  const debugTeam = (teamMembership?.teams && Object.keys(teamMembership.teams).length > 0)
    ? teamMembership.teams
    : (teamMembership && Object.keys(teamMembership).length > 0)
      ? teamMembership
      : { name: 'Team Placeholder', image_url: null, total_points: 0 };
  const debugRank = 1; // Default to 1 or set as needed

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.sectionTitle}>Your Progress</Text>
      {/* Team heading */}
      <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 0 }}>
        <Text style={{ color: '#aaa', fontSize: 18, fontWeight: '600', marginBottom: 2 }}>Your team:</Text>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>{debugTeam.name}</Text>
      </View>
      {/* Debug: Always show large profile image and rank */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 8, marginHorizontal: 24 }}>
        <Image
          source={debugTeam.image_url ? { uri: debugTeam.image_url } : require('../assets/icon.png')}
          style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#333', marginRight: 18 }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ alignItems: 'flex-start', marginRight: 32 }}>
            <Text style={{ color: '#aaa', fontSize: 16, fontWeight: '600', marginBottom: 2 }}>Team Rank</Text>
            <Text style={{ color: '#fff', fontSize: 36, fontWeight: 'bold' }}>{`#${debugRank}`}</Text>
          </View>
          <View style={{ alignItems: 'flex-start' }}>
            <Text style={{ color: '#aaa', fontSize: 16, fontWeight: '600', marginBottom: 2 }}>Team Sessions</Text>
            <Text style={{ color: '#fff', fontSize: 36, fontWeight: 'bold' }}>{debugTeam.total_points}</Text>
          </View>
        </View>
      </View>
      {/* User's team card as a large, separate card */}
      <View style={styles.topRow}>
        <View style={styles.leftCol}>
          {teamMembership?.teams && (
            <TeamCard
              userTeam={teamMembership.teams}
              userRank={debugRank}
              userSessions={teamMembership.teams.total_points || 0}
              topTeams={[]}
            />
          )}
        </View>
      </View>
      {/* Keep the rest of the screen unchanged for now */}
      {/* Join/Switch Team and Full Leaderboard buttons */}
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
      {/* View Streak button styled like in Settings */}
      <View style={styles.groupCardModern}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={styles.groupRowModern} onPress={() => setShowGardenPopup(true)}>
          <View style={styles.iconBg}>
            <Ionicons name="flame" size={20} color="#fff" />
          </View>
          <Text style={styles.groupLabelModern}>View Streak</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>
      <GardenPopupCard
        visible={showGardenPopup}
        streak={gardenStreak}
        onContinue={() => setShowGardenPopup(false)}
      />
      {/* Villain and badges section */}
      <View style={{ marginHorizontal: 18 }}>
        <VillainProfileProgress darkBg />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#181818',
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 28,
    marginBottom: 12,
    marginTop: 60,
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginBottom: 18,
    marginTop: 18,
  },
  userTeamSummaryBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#232323',
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 18,
  },
  userTeamLabel: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userTeamName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userTeamAvatar: {
    width: 50,
    height: 50,
    borderRadius: 35,
    backgroundColor: '#333',
    marginBottom: 8,
  },
  userTeamSessions: {
    color: '#7fff6a',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 4,
  },
  userTeamRank: {
    color: '#ff8800',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 2,
  },
  leaderboardSection: {
    backgroundColor: '#181818',
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 12,
  },
  leaderboardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    marginLeft: 4,
  },
  topRow: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginHorizontal: 8,
    marginBottom: 18,
    marginTop: 8,
  },
  leftCol: {
    width: '100%',
    marginRight: 0,
    marginBottom: 12,
  },
  rightCol: {
    width: '100%',
    marginLeft: 0,
  },
});

export default ProgressScreen; 