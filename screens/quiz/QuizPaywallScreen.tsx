import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppNavigationProp } from '../../types';
import { Ionicons } from '@expo/vector-icons';

const QuizPaywallScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Unlock your full potential</Text>
        <Text style={styles.subtitle}>Choose a plan to continue</Text>
        
        {/* Placeholder for subscription options */}
        <View style={styles.planOption}>
            <Text style={styles.planText}>Yearly Subscription</Text>
            <Text style={styles.planPrice}>$59.99 / year</Text>
        </View>
        <View style={styles.planOption}>
            <Text style={styles.planText}>Monthly Subscription</Text>
            <Text style={styles.planPrice}>$9.99 / month</Text>
        </View>

      </View>
      <TouchableOpacity 
        style={styles.continueButton} 
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.continueButtonText}>Subscribe Now</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 35,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#8A8A8E',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
  planOption: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  planText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  planPrice: {
    color: '#FF6F00',
    fontSize: 16,
    marginTop: 5,
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

export default QuizPaywallScreen; 