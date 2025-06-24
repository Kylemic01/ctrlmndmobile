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
import { Ionicons } from '@expo/vector-icons';

const QuizGraphScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>You Are On Your Way to Becoming Better!</Text>
        <Image source={require('../../assets/graph.png')} style={styles.graph} />
      </View>
      <TouchableOpacity 
        style={styles.continueButton} 
        onPress={() => navigation.navigate('QuizPaywall')}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'DMSans-Medium',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  graph: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
  },
  continueButton: {
    backgroundColor: '#FF6F00',
    borderRadius: 12,
    paddingVertical: 18,
    marginHorizontal: 35,
    marginBottom: 20,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default QuizGraphScreen; 