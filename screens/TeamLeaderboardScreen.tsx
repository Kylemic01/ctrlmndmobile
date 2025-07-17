import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { fetchLeaderboard } from '../supabaseTeams';
import { useAuth } from '../hooks/useAuth';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type TeamLeaderboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, any>;
};

const getDaysLeftInMonth = () => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return end.getDate() - now.getDate();
};

const TeamLeaderboardScreen: React.FC<TeamLeaderboardScreenProps> = ({ navigation }) => {
  const { teamMembership } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const daysLeft = getDaysLeftInMonth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      try {
        const data = await fetchLeaderboard(month, 50);
        setTeams(data || []);
      } catch (e) {
        setTeams([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isUserTeam = teamMembership?.teams?.id === item.id;
    return (
      <View style={[styles.teamRow, isUserTeam && styles.userTeamRow]}> 
        <Text style={[styles.rank, isUserTeam && styles.userRank]}>{index + 1}</Text>
        <Image
          source={item.image_url ? { uri: item.image_url } : require('../assets/icon.png')}
          style={styles.teamImage}
        />
        <Text style={[styles.teamName, isUserTeam && styles.userTeamName]}>{item.name}</Text>
        <Text style={[styles.points, isUserTeam && styles.userPoints]}>{item.total_points ?? 0} pts</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Team Leaderboard</Text>
        <Text style={styles.timeLeft}>{daysLeft} days left</Text>
      </View>
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
    padding: 4,
    marginTop: 32,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginTop: 32,
    textAlign: 'center',
  },
  timeLeft: {
    color: '#ff8800',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    marginTop: 32,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#232323',
  },
  userTeamRow: {
    backgroundColor: '#232323',
    borderRadius: 8,
  },
  rank: {
    color: '#ff8800',
    width: 32,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  userRank: {
    color: '#fff',
  },
  teamImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: '#333',
  },
  teamName: {
    color: '#fff',
    flex: 1,
    fontSize: 16,
  },
  userTeamName: {
    color: '#ff8800',
    fontWeight: 'bold',
  },
  points: {
    color: '#ff8800',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  userPoints: {
    color: '#fff',
  },
});

export default TeamLeaderboardScreen; 