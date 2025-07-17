import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppNavigationProp } from '../../types';
import { Ionicons } from '@expo/vector-icons';

const reviews = [
  {
    quote: "Tim - Pro Swimmer\n⭐️⭐️⭐️⭐️⭐️\nI've tried countless meditation apps, but CTRL/MND is on another level. The AI-powered guided sessions are so personalized that it feels like a coach in my pocket. My stress levels have plummeted, my focus has skyrocketed, and I actually look forward to meditating every day. The whole experience is calming. Highly recommend!",
  },
  {
    quote: "Charlotte - College Athlete\n⭐️⭐️⭐️⭐️⭐️\nAfter just one week with Tim, I fell in love. Ive never felt like this before, I noticed a huge difference in how I handle anxiety. The pre-configured routines are perfect when I'm short on time, and the deeper mindfulness courses have given me tools I never knew I needed. Beautifully designed, and genuinely effective.",
  },
  {
    quote: "Max - Junior Basketball Player\n⭐️⭐️⭐️⭐️⭐️\nAs a competitive athlete, mental toughness is everything. CTRL/MND's tailored meditations have become an essential part of my training. The guided visualizations before game day calm my nerves, and the post-practice reflections help me reset. Five stars for a game-changing app!",
  },
];

const ReviewCard = ({ quote }: { quote: string }) => (
  <View style={styles.reviewCard}>
    <Text style={styles.reviewText}>{quote}</Text>
  </View>
);

const QuizReviewsScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>What others are saying</Text>
        {reviews.map((review, index) => (
          <ReviewCard key={index} quote={review.quote} />
        ))}
      </ScrollView>
      <TouchableOpacity 
        style={styles.continueButton} 
        onPress={() => navigation.navigate('QuizGraph')}
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
        paddingHorizontal: 35,
        paddingBottom: 20,
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 30,
    },
    reviewCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    reviewText: {
        color: 'white',
        fontSize: 16,
        fontStyle: 'italic',
        lineHeight: 24,
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

export default QuizReviewsScreen; 