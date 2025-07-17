import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

interface Team {
  id: string;
  name: string;
  image_url?: string;
  total_points?: number;
}

interface MiniTeamLeaderboardProps {
  userTeam?: Team;
  topTeams: Team[];
  onViewFullLeaderboard: () => void;
}

const getRankLabel = (rank: number, total: number) => {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  if (rank === total) return 'Last';
  if (rank === 10) return '10th';
  return `${rank}th`;
};

const getAvatarColor = (rank: number, total: number) => {
  if (rank === 1) return '#2ecc40'; // green
  if (rank === 2) return '#888'; // gray
  if (rank === 3) return '#3498db'; // blue
  if (rank === 10) return '#e1e600'; // yellow
  if (rank === total) return '#b266ff'; // purple
  return '#444';
};

const MiniTeamLeaderboard: React.FC<MiniTeamLeaderboardProps> = ({ userTeam, topTeams, onViewFullLeaderboard }) => {
  const total = topTeams.length;
  return (
    <View style={styles.container}>
      {topTeams.map((item, index) => {
        const rank = index + 1;
        const isUserTeam = userTeam && item.id === userTeam.id;
        const rankLabel = getRankLabel(rank, total);
        const avatarColor = getAvatarColor(rank, total);
        return (
          <View
            style={[styles.teamRow, isUserTeam && styles.userTeamRow]}
            key={item.id}
          >
            <Text style={[styles.rank, isUserTeam && styles.userRank]}>{rankLabel}</Text>
            <View style={[styles.avatarRing, { backgroundColor: avatarColor }]}> 
              <Image
                source={item.image_url ? { uri: item.image_url } : require('../assets/icon.png')}
                style={styles.teamImageSmall}
              />
            </View>
            <Text style={[styles.teamName, isUserTeam && styles.userTeamName]}>{item.name}</Text>
            <Text style={[styles.points, isUserTeam && styles.userPoints]}>{item.total_points ?? 0}</Text>
          </View>
        );
      })}
      <TouchableOpacity style={styles.button} onPress={onViewFullLeaderboard}>
        <Text style={styles.buttonText}>View Full Leaderboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 16,
    margin: 0,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    minWidth: 260,
    maxWidth: 320,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 2,
    backgroundColor: 'transparent',
  },
  userTeamRow: {
    backgroundColor: 'rgba(44,204,64,0.13)',
  },
  rank: {
    color: '#fff',
    width: 48,
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'right',
    marginRight: 8,
  },
  userRank: {
    color: '#2ecc40',
  },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  teamImageSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
  },
  teamName: {
    color: '#fff',
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  userTeamName: {
    color: '#2ecc40',
  },
  points: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    marginLeft: 8,
    minWidth: 36,
    textAlign: 'right',
  },
  userPoints: {
    color: '#2ecc40',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#2ecc40',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#181818',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MiniTeamLeaderboard; 