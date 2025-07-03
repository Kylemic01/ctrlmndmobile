import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FireAnimationProps {
  visible: boolean;
  onAnimationComplete: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FireAnimation: React.FC<FireAnimationProps> = ({ visible, onAnimationComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fireAnim1 = useRef(new Animated.Value(0)).current;
  const fireAnim2 = useRef(new Animated.Value(0)).current;
  const fireAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Start animation sequence
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Fire flicker animation
      const fireAnimation = () => {
        Animated.parallel([
          Animated.sequence([
            Animated.timing(fireAnim1, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(fireAnim1, {
              toValue: 0.3,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(fireAnim2, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(fireAnim2, {
              toValue: 0.4,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(fireAnim3, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(fireAnim3, {
              toValue: 0.5,
              duration: 250,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          if (visible) {
            fireAnimation();
          }
        });
      };

      fireAnimation();

      // Auto-hide after 2 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onAnimationComplete();
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.animationContainer}>
        {/* Fire emojis with different animations */}
        <Animated.Text
          style={[
            styles.fireEmoji,
            styles.fire1,
            {
              opacity: fireAnim1,
              transform: [{ scale: fireAnim1 }],
            },
          ]}
        >
          🔥
        </Animated.Text>
        <Animated.Text
          style={[
            styles.fireEmoji,
            styles.fire2,
            {
              opacity: fireAnim2,
              transform: [{ scale: fireAnim2 }],
            },
          ]}
        >
          🔥
        </Animated.Text>
        <Animated.Text
          style={[
            styles.fireEmoji,
            styles.fire3,
            {
              opacity: fireAnim3,
              transform: [{ scale: fireAnim3 }],
            },
          ]}
        >
          🔥
        </Animated.Text>
        
        {/* Happy message */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Great job journaling today! 🎉</Text>
          <Text style={styles.subMessageText}>Keep up the amazing work!</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireEmoji: {
    fontSize: 60,
    position: 'absolute',
  },
  fire1: {
    top: -30,
    left: -20,
  },
  fire2: {
    top: -40,
    right: -25,
  },
  fire3: {
    bottom: -30,
    left: 0,
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 136, 0, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 20,
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  messageText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'DMSans-Bold',
  },
  subMessageText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
    fontFamily: 'DMSans-Medium',
  },
});

export default FireAnimation; 