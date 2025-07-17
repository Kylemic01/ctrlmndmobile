import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Team {
  id: string;
  name: string;
  image_url?: string;
  total_points?: number;
}

interface TeamProgressSummaryProps {
  team: Team;
  rank: number;
  maxSessions: number;
}

const TeamProgressSummary: React.FC<TeamProgressSummaryProps> = ({ team, rank, maxSessions }) => {
  const percent = Math.min((team.total_points || 0) / maxSessions, 1);
  return (
    <View style={styles.container}>
      <Text style={styles.rank}>{`#${rank}`}</Text>
      <Image
        source={team.image_url ? { uri: team.image_url } : require('../assets/icon.png')}
        style={styles.avatar}
      />
      <Text style={styles.teamName}>{team.name}</Text>
      <View style={styles.arcContainer}>
        <ArcProgress percent={percent} />
        <Text style={styles.sessionCount}>{team.total_points || 0}</Text>
      </View>
      <Text style={styles.sessionLabel}>Sessions this month</Text>
    </View>
  );
};

const ArcProgress = ({ percent }: { percent: number }) => {
  const r = 48;
  const cx = 50;
  const cy = 50;
  const startAngle = Math.PI;
  const endAngle = Math.PI + Math.PI * percent;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = percent > 0.5 ? 1 : 0;
  const d = `M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2}`;
  return (
    <Svg width={100} height={60} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Path d={d} stroke="#7fff6a" strokeWidth={8} fill="none" />
    </Svg>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    backgroundColor: 'transparent',
    paddingVertical: 12,
  },
  rank: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#333',
    marginBottom: 8,
  },
  teamName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  arcContainer: {
    width: 100,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  sessionCount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    position: 'absolute',
    top: 18,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  sessionLabel: {
    color: '#fff',
    fontSize: 15,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default TeamProgressSummary; 