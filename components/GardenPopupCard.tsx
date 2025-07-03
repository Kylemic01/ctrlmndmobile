import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const gardenImages = [
  require('../assets/gardens/garden1.webp'),
  require('../assets/gardens/garden2.webp'),
  require('../assets/gardens/garden3.webp'),
  require('../assets/gardens/garden4.webp'),
  require('../assets/gardens/garden5.webp'),
  require('../assets/gardens/garden6.webp'),
  require('../assets/gardens/garden7.webp'),
  require('../assets/gardens/garden8.webp'),
  require('../assets/gardens/garden9.webp'),
  require('../assets/gardens/garden10.webp'),
  require('../assets/gardens/garden11.webp'),
  require('../assets/gardens/garden12.webp'),
  require('../assets/gardens/garden13.webp'),
  require('../assets/gardens/garden14.webp'),
  require('../assets/gardens/garden15.webp'),
];

const messages = [
  'Nurture your Meditation Garden.\nEach session is a seed. Skip a day, and your garden may dissapear.\nStay consistent, and watch it bloom.',
  'Every meditation helps your garden grow.\nWater it daily to keep it alive and thriving.\nEven one small session makes a difference.',
  'Your Meditation Garden grows with every session.\nMiss a day? You\'ll have to restart your garden.',
  'Daily practice = daily growth.\nYour streak fuels your garden. Keep going, one day at a time.'
];

const gardenMilestones = [1,2,4,7,11,14,21,28,31,40,50];

function getGardenImage(streak: number) {
  if (streak <= gardenMilestones[gardenMilestones.length-1]) {
    let idx = 0;
    for (let i = 0; i < gardenMilestones.length; i++) {
      if (streak >= gardenMilestones[i]) idx = i;
    }
    return gardenImages[idx];
  } else {
    let extra = Math.min(Math.floor((streak-50)/10), gardenImages.length-11);
    return gardenImages[11 + extra];
  }
}

interface GardenPopupCardProps {
  visible: boolean;
  streak: number;
  onContinue: () => void;
}

const GardenPopupCard: React.FC<GardenPopupCardProps> = ({ visible, streak, onContinue }) => {
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    if (visible) {
      setMessageIdx(Math.floor(Math.random() * messages.length));
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* X Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onContinue}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Image source={getGardenImage(streak)} style={styles.gardenImage} resizeMode="cover" />
          <View style={styles.textRow}>
            <Text style={styles.message}>{messages[messageIdx]}</Text>
            <View style={styles.streakBox}>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 0,
    width: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    padding: 2,
  },
  gardenImage: {
    width: 360,
    height: 250,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  message: {
    flex: 1,
    color: '#181818',
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    marginRight: 8,
    lineHeight: 18,
    paddingVertical: 2,
  },
  streakBox: {
    backgroundColor: '#181818',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
    marginLeft: 6,
  },
  streakNumber: {
    color: '#ff8800',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'DMSans-Bold',
  },
  streakLabel: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
  },
});

export default GardenPopupCard; 