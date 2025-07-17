import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface Team {
  id: string;
  name: string;
  image_url?: string;
  total_points?: number;
}

interface LeaderboardSnapshotProps {
  teams: Team[];
  userTeamId: string;
}

const getRankLabel = (rank: number, total: number) => {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  if (rank === total) return 'Last';
  if (rank === 10) return '10th';
  return `${rank}th`;
};

const getAvatarStyle = (rank: number, user: boolean, total: number) => {
  if (user) return [styles.avatar, styles.avatarBlue];
  if (rank === 1) return [styles.avatar, styles.avatarGreen];
  if (rank === 2) return [styles.avatar, styles.avatarGray];
  if (rank === 3) return [styles.avatar, styles.avatarBlue];
  if (rank === 10) return [styles.avatar, styles.avatarNeon];
  if (rank === total) return [styles.avatar, styles.avatarPurple];
  return styles.avatar;
};

const LeaderboardSnapshot: React.FC<LeaderboardSnapshotProps> = ({ teams, userTeamId }) => {
  const total = teams.length;
  // Find indices for 1st, 2nd, user's team, 10th, last
  const userIdx = teams.findIndex(t => t.id === userTeamId);
  const picks = [0, 1];
  if (userIdx > 2 && userIdx !== 9 && userIdx !== total - 1) picks.push(userIdx);
  if (total >= 10) picks.push(9);
  if (total > 1) picks.push(total - 1);
  // Remove duplicates and sort
  const uniquePicks = Array.from(new Set(picks)).sort((a, b) => a - b);
  const displayTeams = uniquePicks.map(idx => teams[idx]).filter(Boolean);

  return (
    <View style={styles.container}>
      {displayTeams.map((team, i) => {
        const rank = teams.findIndex(t => t.id === team.id) + 1;
        const isUser = team.id === userTeamId;
        return (
          <View key={team.id} style={styles.row}>
            <Text style={styles.rank}>{getRankLabel(rank, total)}</Text>
            <Image
              source={team.image_url ? { uri: team.image_url } : require('../assets/icon.png')}
              style={getAvatarStyle(rank, isUser, total)}
            />
            <Text style={[styles.teamName, isUser && styles.userTeamName]}>{team.name}</Text>
            <Text style={[styles.points, isUser && styles.userPoints]}>{team.total_points ?? 0}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    marginLeft: 16,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rank: {
    color: '#fff',
    width: 44,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'right',
    marginRight: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 8,
    backgroundColor: '#333',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarGreen: {
    borderColor: '#3cff6a',
    backgroundColor: '#1a3',
  },
  avatarGray: {
    borderColor: '#bbb',
    backgroundColor: '#444',
    filter: 'grayscale(1)',
  },
  avatarBlue: {
    borderColor: '#3af',
    backgroundColor: '#1a3a4a',
  },
  avatarNeon: {
    borderColor: '#bfff00',
    backgroundColor: '#2a4',
  },
  avatarPurple: {
    borderColor: '#b36aff',
    backgroundColor: '#6a3aff',
  },
  teamName: {
    color: '#fff',
    flex: 1,
    fontSize: 16,
  },
  userTeamName: {
    color: '#7fff6a',
    fontWeight: 'bold',
  },
  points: {
    color: '#ff8800',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  userPoints: {
    color: '#7fff6a',
  },
});

export default LeaderboardSnapshot; 