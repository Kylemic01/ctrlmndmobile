import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { fetchTeams, joinTeam, requestTeamSwitch } from '../supabaseTeams';
import { useAuth } from '../hooks/useAuth';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import TeamCard from '../components/TeamCard';
import Svg, { Path } from 'react-native-svg';

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

const getNextMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}-01`;
};

type JoinTeamScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, any>;
};

const JoinTeamScreen: React.FC<JoinTeamScreenProps> = ({ navigation }) => {
  const { user, teamMembership, refreshTeamMembership } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchTeams();
        setTeams(data || []);
      } catch (e) {
        setTeams([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleJoin = async (teamId: string) => {
    if (!user) return;
    setJoining(true);
    try {
      await joinTeam(user.id, teamId, getCurrentMonth());
      await refreshTeamMembership();
      Alert.alert('Success', 'You have joined the team!');
      navigation.goBack();
    } catch (e: any) {
      console.error('Join team error:', e);
      Alert.alert('Error', e.message || JSON.stringify(e) || 'Could not join team.');
    }
    setJoining(false);
  };

  const handleSwitch = async (teamId: string) => {
    if (!user) return;
    setJoining(true);
    try {
      await requestTeamSwitch(user.id, teamId, getCurrentMonth());
      await refreshTeamMembership();
      Alert.alert('Switch Requested', 'You will switch teams at the start of next month.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not request switch.');
    }
    setJoining(false);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isCurrent = teamMembership?.teams?.id === item.id;
    const isPending = teamMembership?.switch_pending && teamMembership?.requested_team_id === item.id;
    return (
      <View style={[styles.teamRow, isCurrent && styles.currentTeamRow]}> 
        <Image
          source={item.image_url ? { uri: item.image_url } : require('../assets/icon.png')}
          style={styles.teamImage}
        />
        <Text style={styles.teamName}>{item.name}</Text>
        {isCurrent ? (
          <Text style={styles.currentLabel}>Current Team</Text>
        ) : isPending ? (
          <Text style={styles.pendingLabel}>Switch Pending</Text>
        ) : teamMembership ? (
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => handleSwitch(item.id)}
            disabled={joining}
          >
            <Text style={styles.switchButtonText}>Request Switch</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleJoin(item.id)}
            disabled={joining}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Join a Team</Text>
      </View>
      {/* Show current team card if user is in a team */}
      {teamMembership?.teams && (
        <View style={styles.currentTeamCard}>
          <Image
            source={teamMembership.teams.image_url ? { uri: teamMembership.teams.image_url } : require('../assets/icon.png')}
            style={styles.currentTeamImage}
          />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.currentTeamLabel}>Current Team</Text>
            <Text style={styles.currentTeamName}>{teamMembership.teams.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <ArcProgress percent={(teamMembership.teams.total_points || 0) / 100} />
              <Text style={styles.currentTeamSessions}>{teamMembership.teams.total_points || 0} sessions</Text>
            </View>
          </View>
        </View>
      )}
      {teamMembership && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            You are on <Text style={{ color: '#ff8800', fontWeight: 'bold' }}>{teamMembership.teams?.name}</Text> for this month.
            {teamMembership.switch_pending && teamMembership.requested_team_id ? (
              <> {'\n'}Switch to new team will take effect next month.</>
            ) : (
              <> {'\n'}You can switch teams once per month. Switches take effect at the start of the next month.</>
            )}
          </Text>
        </View>
      )}
      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          style={{ marginTop: 8 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    paddingTop: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backButton: {
    marginRight: 8,
    marginLeft: 8,
    padding: 4,
    marginTop: 28,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginTop: 32,
  },
  infoBox: {
    backgroundColor: '#232323',
    borderRadius: 12,
    margin: 16,
    padding: 12,
  },
  infoText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },
  loading: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#232323',
  },
  currentTeamRow: {
    backgroundColor: '#232323',
    borderRadius: 8,
  },
  teamImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#333',
  },
  teamName: {
    color: '#fff',
    flex: 1,
    fontSize: 16,
  },
  currentLabel: {
    color: '#ff8800',
    fontWeight: 'bold',
    fontSize: 15,
  },
  pendingLabel: {
    color: '#ff8800',
    fontWeight: 'bold',
    fontSize: 15,
    fontStyle: 'italic',
  },
  joinButton: {
    backgroundColor: '#ff8800',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  switchButton: {
    backgroundColor: '#232323',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff8800',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  switchButtonText: {
    color: '#ff8800',
    fontWeight: 'bold',
    fontSize: 15,
  },
  currentTeamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232323',
    borderRadius: 12,
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ff8800',
  },
  currentTeamImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
  },
  currentTeamLabel: {
    color: '#ff8800',
    fontWeight: 'bold',
    fontSize: 16,
  },
  currentTeamName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  currentTeamSessions: {
    color: '#7fff6a',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 4,
  },
});

// ArcProgress reused from TeamCard
const ArcProgress = ({ percent }: { percent: number }) => {
  const r = 24;
  const cx = 26;
  const cy = 26;
  const startAngle = Math.PI;
  const endAngle = Math.PI + Math.PI * percent;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = percent > 0.5 ? 1 : 0;
  const d = `M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2}`;
  return (
    <Svg width={52} height={32} style={{ marginRight: 8 }}>
      <Path d={d} stroke="#7fff6a" strokeWidth={5} fill="none" />
    </Svg>
  );
};

export default JoinTeamScreen; 