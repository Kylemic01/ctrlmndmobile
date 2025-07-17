import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BAR_WIDTH = Dimensions.get('window').width * 0.6;
const BAR_HEIGHT = 12;

const ShimmerLoadingBar = () => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-BAR_WIDTH, BAR_WIDTH],
  });

  return (
    <View style={styles.barContainer}>
      <View style={styles.barBg} />
      <Animated.View style={[styles.shimmerWrapper, { transform: [{ translateX }] }] }>
        <LinearGradient
          colors={["#333", "#ff8800", "#333"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.shimmer}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignSelf: 'center',
    marginVertical: 16,
  },
  barBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#232323',
    borderRadius: BAR_HEIGHT / 2,
  },
  shimmerWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmer: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    opacity: 0.8,
  },
});

export default ShimmerLoadingBar; 