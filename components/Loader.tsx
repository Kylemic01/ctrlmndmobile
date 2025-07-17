import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

interface LoaderProps {
  size?: number;
  style?: ViewStyle;
}

const Loader: React.FC<LoaderProps> = ({ size = 120, style }) => (
  <View style={[styles.container, style]}>
    <LottieView
      source={require('../assets/lottie/runload.json')}
      autoPlay
      loop
      style={{ width: size, height: size }}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default Loader; 