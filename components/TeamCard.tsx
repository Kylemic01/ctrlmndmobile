import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface Team {
  id: string;
  name: string;
  image_url?: string;
  total_points?: number;
}

interface TeamCardProps {
  userTeam: Team;
  userRank: number;
  userSessions: number;
  topTeams: Team[];
}

const rankSuffix = (rank: number) => {
  if (rank === 1) return 'st';
  if (rank === 2) return 'nd';
  if (rank === 3) return 'rd';
  return 'th';
};

const arcDegrees = (sessions: number, max: number) => {
  // For a simple arc, cap at 100 sessions
  const percent = Math.min(sessions / max, 1);
  return percent * 180;
};

const getRanks = (teams: Team[]) => {
  let rank = 1;
  let prevPoints: number | null = null;
  let ties = 0;
  return teams.map((team, idx) => {
    if (prevPoints !== null && team.total_points === prevPoints) {
      ties++;
    } else {
      rank = idx + 1;
      ties = 0;
    }
    prevPoints = team.total_points ?? 0;
    return { ...team, rank, displayRank: rank + rankSuffix(rank) };
  });
};

const TeamCard: React.FC<TeamCardProps> = ({ userTeam, userRank, userSessions, topTeams }) => {
  // For the arc, use SVG
  const maxSessions = Math.max(100, ...topTeams.map(t => t.total_points || 0));
  const percent = userSessions / maxSessions;
  const rankedTeams = getRanks(topTeams);
  const userRanked = rankedTeams.find(t => t.id === userTeam.id);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image
          source={userTeam.image_url ? { uri: userTeam.image_url } : require('../assets/icon.png')}
          style={styles.teamImage}
        />
        <View style={styles.infoCol}>
          <Text style={styles.rank}>{`#${userRanked ? userRanked.rank : userRank}`}</Text>
          <Text style={styles.teamName}>{userTeam.name}</Text>
        </View>
      </View>
      <View style={styles.arcSection}>
        <View style={styles.arcContainer}>
          <ArcProgress percent={percent} />
          <Text style={styles.sessionCount}>{userSessions}</Text>
        </View>
        <Text style={styles.sessionLabel}>Sessions this month</Text>
      </View>
    </View>
  );
};

// Simple arc progress using SVG
import Svg, { Path } from 'react-native-svg';
const ArcProgress = ({ percent }: { percent: number }) => {
  const r = 70;
  const cx = 80;
  const cy = 80;
  const startAngle = Math.PI;
  const endAngle = Math.PI + Math.PI * percent;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = percent > 0.5 ? 1 : 0;
  const d = `M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2}`;
  return (
    <Svg width={160} height={90} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Path d={d} stroke="#7fff6a" strokeWidth={14} fill="none" />
    </Svg>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#232323',
    borderRadius: 24,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 220,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  teamImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#333',
    marginRight: 24,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  rank: {
    color: '#fff',
    fontSize: 56,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teamName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 0,
  },
  arcSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 0,
  },
  arcContainer: {
    width: 160,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 0,
  },
  sessionCount: {
    color: '#fff',
    fontSize: 44,
    fontWeight: 'bold',
    position: 'absolute',
    top: 28,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  sessionLabel: {
    color: '#fff',
    fontSize: 18,
    marginTop: 0,
    fontWeight: '600',
    textAlign: 'center',
  },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    width: '100%',
  },
  leaderboardItem: {
    alignItems: 'center',
    flex: 1,
  },
  leaderboardImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 4,
    backgroundColor: '#333',
    opacity: 0.7,
  },
  highlightedImage: {
    borderWidth: 2,
    borderColor: '#7fff6a',
    opacity: 1,
  },
  leaderboardRank: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  leaderboardName: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
  },
  leaderboardPoints: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 2,
  },
  highlightedText: {
    color: '#7fff6a',
  },
});

export default TeamCard; 