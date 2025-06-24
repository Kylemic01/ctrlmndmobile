import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppNavigationProp } from '../../types';


const QuizIntroScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>
          Let's find out if you will benefit from CTRL/MND
        </Text>
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={() => navigation.navigate('QuizStreak')}
        >
          <Text style={styles.startButtonText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 35,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'DMSans-Medium',
    textAlign: 'center',
    marginBottom: 50
  },
  startButton: {
    backgroundColor: '#FF6F00',
    borderRadius: 12,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'DMSans-Medium',
    fontWeight: 'bold',
  },
});

export default QuizIntroScreen; 