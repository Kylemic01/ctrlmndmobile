import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

type Props = {
  value: number;
  max: number;
  animated?: boolean;
};

export default function VillainHealthBar({ value, max, animated }: Props) {
  const percent = Math.max(0, Math.min(1, value / max));
  const barAnim = useRef(new Animated.Value(percent)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(barAnim, {
        toValue: percent,
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      barAnim.setValue(percent);
    }
  }, [percent, animated]);

  const barColor = barAnim.interpolate({
    inputRange: [0, 0.2, 0.5, 1],
    outputRange: ['#f44336', '#ff9800', '#4caf50', '#4caf50'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.bar,
          {
            width: barAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: barColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 220, height: 24, backgroundColor: '#eee', borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  bar: { height: 24, borderRadius: 12 },
}); 