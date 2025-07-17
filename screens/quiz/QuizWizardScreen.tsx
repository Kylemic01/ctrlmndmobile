import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppNavigationProp } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '../../components/ProgressBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../supabase';
import { ensureProfileRowExists, updateQuizAnswers } from '../../components/userStorage';
import { LinearGradient } from 'expo-linear-gradient';

// Define the structure of a quiz question
interface Question {
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT_INPUT' | 'AGE_AND_SPORT';
  question: string;
  options?: string[];
}

const popularSports = [
  'Soccer', 'Basketball', 'Baseball', 'Football', 'Tennis', 'Golf', 'Running', 'Cycling', 'Swimming', 'Volleyball', 'Hockey', 'Martial Arts', 'Other'
].sort();

// Define all the quiz steps
const quizSteps: Question[] = [
  {
    type: 'SINGLE_CHOICE',
    question: 'What drives you?',
    options: [
      'Proving people wrong',
      'Becoming the best version of myself',
      'Winning and dominating',
      'Pushing past limits',
      'Fear of failure',
      'Making the most of my potential',
    ],
  },
  {
    type: 'SINGLE_CHOICE',
    question: 'How do you respond to failure or a bad performance?',
    options: [
      'Replay it obsessively',
      'Blame myself',
      'Move on quickly',
      'Shut down emotionally',
      'Use it as motivation',
      'Analyze it and learn',
    ],
  },
  {
    type: 'SINGLE_CHOICE',
    question: 'How is your mindset throughout the week?',
    options: [
      'Locked in every day',
      'Mostly consistent with some dips',
      'Good during training, but not under pressure',
      'Up and down depending on how I feel',
      'Inconsistent and unpredictable',
      "I haven't really thought about it",
    ],
  },
  {
    type: 'SINGLE_CHOICE',
    question: 'How do you prepare mentally before a big moment?',
    options: [
      'I follow a mental routine',
      'I try to calm myself but struggle',
      'I get hyped but sometimes overdo it',
      'I visualize success',
      'I try to stay loose and relaxed',
      'I just wing it',
    ],
  },
  {
    type: 'SINGLE_CHOICE',
    question: 'How do you currently handle stress or pressure?',
    options: [
      'I ignore it and push through',
      'I vent or distract myself',
      'I overthink and get stuck in my head',
      'I use breathing or meditation',
      'I reflect and try to learn from it',
      "I don't handle it well at all",
    ],
  },
  {
    type: 'SINGLE_CHOICE',
    question: "What's one thing your best performances have in common?",
    options: [
      'I felt calm and in control',
      'I believed in myself',
      'I stayed focused the entire time',
      'I was loose and confident',
      'I had a strong routine leading up to it',
      "I didn't overthink",
    ],
  },
  {
    type: 'SINGLE_CHOICE',
    question: 'If you could upgrade just one part of your mindset, what would it be?',
    options: [
      'Confidence under pressure',
      'Ability to stay focused',
      'Letting go of mistakes faster',
      'Consistent motivation',
      'Emotional control',
      'Belief in myself',
    ],
  },
  {
    type: 'SINGLE_CHOICE',
    question: 'Are you ready to train your mind and take yourself to the next level?',
    options: [
      "Yes, I'm fully committed",
      "I'm ready to build consistency",
      "I want to see what's possible",
      "I'm curious but unsure",
      "Not yet, improving isn't important",
    ],
  },
  {
    type: 'SINGLE_CHOICE',
    question: 'Are you willing to put in 7 minutes a day to train the one muscle that controls everything else — your mind?',
    options: [
      'Yes, fully committed',
      '7 Minutes is too much',
    ],
  },
];

// Add result generator logic from Quizplan.md
const profileTitleMap: Record<string, string> = {
  "I follow a mental routine": "The Locked-In Leader",
  "I try to calm myself but struggle": "The Wired-But-Wavering",
  "I get hyped but sometimes overdo it": "The High-Intensity Hustler",
  "I visualize success": "The Mental Mapper",
  "I try to stay loose and relaxed": "The Flow-Seeker",
  "I just wing it": "The Freestyle Performer"
};
const driveMap: Record<string, string> = {
  "Proving people wrong": "a hunger to prove others wrong",
  "Becoming the best version of myself": "a drive to grow and evolve",
  "Winning and dominating": "a competitive fire",
  "Pushing past limits": "a desire to test your limits",
  "Fear of failure": "the pressure of not falling short",
  "Making the most of my potential": "a deep sense of untapped potential"
};
const performanceMap: Record<string, string> = {
  "I felt calm and in control": "stay composed and sharp",
  "I believed in myself": "trust yourself more often",
  "I stayed focused the entire time": "build laser focus",
  "I was loose and confident": "stay relaxed under pressure",
  "I had a strong routine leading up to it": "build powerful habits",
  "I didn't overthink": "compete with clarity"
};
const mindsetImprovementMap: Record<string, string> = {
  'Confidence under pressure': 'help you build confidence under pressure',
  'Ability to stay focused': 'help you stay focused',
  'Letting go of mistakes faster': 'help you let go of mistakes faster',
  'Consistent motivation': 'help you stay consistently motivated',
  'Emotional control': 'help you master your emotions',
  'Belief in myself': 'help you believe in yourself',
};
function generateQuizResult(answers: Record<string, string>) {
  const profileTitle = profileTitleMap[answers["How do you prepare mentally before a big moment?"]] || "The Focused Competitor";
  const drivePhrase = driveMap[answers["What drives you?"]] || "a desire to improve";
  const mindsetImprovement = answers["If you could upgrade just one part of your mindset, what would it be?"] || "your mindset";
  const improvementFragment = mindsetImprovementMap[mindsetImprovement] || `get you ${mindsetImprovement.toLowerCase()}`;
  const sentence = `You are driven by ${drivePhrase}, so let's ${improvementFragment}.`;
  const outcomePhrase = performanceMap[answers["What's one thing your best performances have in common?"]] || "reach your next level";
  const stat = "Based on your selections, 27% of athletes have similar responses to you.";
  return {
    title: profileTitle,
    stat,
    sentence,
    outcome: `We want you to ${outcomePhrase} and unlock your best performances.`
  };
}

function generateGeneralResult(answers: Record<string, string>) {
  const benefitMap: Record<string, string> = {
    'To feel less stressed': 'reduce your stress levels',
    'To improve my sleep': 'sleep more soundly',
    'To be more present in life': 'feel more present and grounded',
    'To feel more in control of my emotions': 'regulate your emotions better',
    'To stop overthinking everything': 'quiet your inner noise',
    'To build a better relationship with myself': 'build more self-trust and compassion',
  };

  const struggleMap: Record<string, string> = {
    'Managing stress or anxiety': 'manage stress and anxiety',
    'Staying focused or avoiding distractions': 'improve focus and reduce distractions',
    'Keeping a consistent routine': 'create daily habits that stick',
    'Negative self-talk': 'develop kinder self-talk',
    'Feeling overwhelmed or burnt out': 'feel more balanced and energized',
    'Not prioritizing myself': 'start putting yourself first',
  };

  const focusMap: Record<string, string> = {
    'My ability to stay calm under stress': 'stay calm under stress',
    'Letting go of negative thoughts': 'let go of negative thoughts',
    'Focusing better without distractions': 'focus better without distractions',
    'Building a routine I actually stick to': 'build a routine you actually stick to',
    'Believing I’m enough as I am': 'believe you’re enough as you are',
    'Handling emotions without overreacting': 'handle emotions without overreacting',
  };

  const focusPhraseRaw = answers["If you could change one thing about how your mind works, what would it be?"];
  const focusPhrase = focusMap[focusPhraseRaw] || (focusPhraseRaw ? focusPhraseRaw.toLowerCase() : 'feel better');
  const benefit = benefitMap[answers["What’s your main reason for wanting to improve your mindset?"]] || "feel better";
  const struggle = struggleMap[answers["What’s your biggest challenge day to day?"]] || "improve your well-being";

  const stat = "You're not alone — over 82% of users have similar goals.";
  return {
    title: "The Self-Care Starter",
    stat,
    sentence: `You’re here to ${benefit}, and we’ll help you ${struggle}.`,
    outcome: `Let’s work together to help you ${focusPhrase}.`,
  };
}

const athleteStats = [
  { label: 'athletes improved', percent: 96 },
  { label: 'felt they recovered faster', percent: 81 },
  { label: 'increase in confidence', percent: 87 },
  { label: 'performed better under pressure', percent: 74 },
  { label: 'felt more focused', percent: 95 },
  { label: 'felt happier & healthier', percent: 90 },
];
const athleteReviews = [
  {
    quote: "Tim - Pro Swimmer\n⭐️⭐️⭐️⭐️⭐️\nI've tried countless meditation apps, but CTRL/MND is on another level. The AI-powered guided sessions are so personalized that it feels like a coach in my pocket. My stress levels have plummeted, my focus has skyrocketed, and I actually look forward to meditating every day. The whole experience is calming. Highly recommend!",
  },
  {
    quote: "Charlotte - College Athlete\n⭐️⭐️⭐️⭐️⭐️\nAfter just one week with CTRL/MND, I noticed a huge difference in how I handle anxiety. The pre-configured routines are perfect when I'm short on time, and the deeper mindfulness courses have given me tools I never knew I needed. Beautifully designed, and genuinely effective.",
  },
  {
    quote: "Max - Junior Basketball Player\n⭐️⭐️⭐️⭐️⭐️\nAs a competitive athlete, mental toughness is everything. CTRL/MND's tailored meditations have become an essential part of my training. The guided visualizations before game day calm my nerves, and the post-practice reflections help me reset. Five stars for a game-changing app!",
  },
];

// Non-athlete quiz steps (from nonathleteflow.md)
const generalHealthQuizSteps = [
  {
    type: 'SINGLE_CHOICE' as const,
    question: 'What’s your main reason for wanting to improve your mindset?',
    options: [
      'To feel less stressed',
      'To improve my sleep',
      'To be more present in life',
      'To feel more in control of my emotions',
      'To stop overthinking everything',
      'To build a better relationship with myself',
    ],
  },
  {
    type: 'SINGLE_CHOICE' as const,
    question: 'What’s your biggest challenge day to day?',
    options: [
      'Managing stress or anxiety',
      'Staying focused or avoiding distractions',
      'Keeping a consistent routine',
      'Negative self-talk',
      'Feeling overwhelmed or burnt out',
      'Not prioritizing myself',
    ],
  },
  {
    type: 'SINGLE_CHOICE' as const,
    question: 'How would you describe your mental state most days?',
    options: [
      'Anxious or on edge',
      'Foggy or unmotivated',
      'Okay but could be better',
      'Mostly calm with some stress',
      'Overloaded and reactive',
      'I don’t really notice or reflect on it',
    ],
  },
  {
    type: 'SINGLE_CHOICE' as const,
    question: 'When things feel overwhelming, what do you usually do?',
    options: [
      'Push through and ignore it',
      'Scroll or zone out',
      'Talk to someone I trust',
      'Take a break or breathe',
      'Shut down emotionally',
      'Beat myself up about it',
    ],
  },
  {
    type: 'SINGLE_CHOICE' as const,
    question: 'What’s something you want to feel more of in your daily life?',
    options: [
      'Calm and grounded',
      'Clarity and focus',
      'Self-acceptance',
      'Motivation and energy',
      'Joy and lightness',
      'Confidence in who I am',
    ],
  },
  {
    type: 'SINGLE_CHOICE' as const,
    question: 'How do you feel about meditation or mental training right now?',
    options: [
      'Excited to start and stay consistent',
      'Curious but unsure it works',
      'I’ve tried but never stuck with it',
      'Skeptical but open',
      'Overwhelmed by all the options',
      'Not sure it’s for me',
    ],
  },
  {
    type: 'SINGLE_CHOICE' as const,
    question: 'If you could change one thing about how your mind works, what would it be?',
    options: [
      'My ability to stay calm under stress',
      'Letting go of negative thoughts',
      'Focusing better without distractions',
      'Building a routine I actually stick to',
      'Believing I’m enough as I am',
      'Handling emotions without overreacting',
    ],
  },
  {
    type: 'SINGLE_CHOICE' as const,
    question: 'Are you ready to create a few minutes of peace and progress each day?',
    options: [
      "Yes, I'm ready to commit",
      "I want to try it out",
      "I’m curious but hesitant",
      "I’ve struggled to stick with things before",
      "Not really, just exploring for now",
    ],
  },
  {
    type: 'SINGLE_CHOICE' as const,
    question: 'Would you invest 7 minutes a day to feel better, think clearer, and reconnect with yourself?',
    options: [
      'Yes, let’s do this',
      'Maybe, if it’s really simple',
    ],
  },
];

const nonAthleteStats = [
  { label: 'users felt less stressed', percent: 89 },
  { label: 'improved their sleep', percent: 76 },
  { label: 'felt more present and mindful', percent: 83 },
  { label: 'felt more in control of emotions', percent: 78 },
  { label: 'reported better self-care', percent: 91 },
  { label: 'felt more balanced and energized', percent: 85 },
];
const nonAthleteReviews = [
  {
    quote: "Sophie - Busy Professional\n⭐️⭐️⭐️⭐️⭐️\nCTRL/MND helped me finally build a meditation habit. I feel less anxious and more focused at work. The sessions are short and easy to fit into my day!",
  },
  {
    quote: "James - New Parent\n⭐️⭐️⭐️⭐️⭐️\nI never thought I'd be able to meditate, but CTRL/MND made it simple. I sleep better and feel more patient with my kids. Highly recommend for anyone who wants to feel calmer!",
  },
  {
    quote: "Priya - Grad Student\n⭐️⭐️⭐️⭐️⭐️\nThe app's gentle reminders and variety of sessions keep me coming back. My stress is way down, and I feel more present in my daily life.",
  },
];

const QuizWizardScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute();
  const { userType, variant } = (route.params || {}) as { userType?: 'athlete' | 'non-athlete', variant?: string };
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [showResult, setShowResult] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [statAnims, setStatAnims] = useState(athleteStats.map(() => 0));
  const [revealAnim, setRevealAnim] = useState(false);
  const [questionSet, setQuestionSet] = useState(userType === 'non-athlete' ? generalHealthQuizSteps : quizSteps);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Remove useEffect that fetches userType from Supabase

  // Always call all hooks before any return!

  const currentQuestion = questionSet[currentStep];

  const handleNext = () => {
    if (currentStep < questionSet.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleQuizComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleQuizComplete = async (answers: any) => {
    setLoading(true);
    setFetchError(null);
    try {
      // First ensure the profile row exists
      await ensureProfileRowExists({});
      // Then update with quiz answers and userType
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ 
          user_type: userType, 
          quiz_answers: answers,
          quiz_completed: false // Will be set to true after paywall
        }).eq('id', user.id);
      }
      setShowResult(true);
      setRevealAnim(true);
      setTimeout(() => setRevealAnim(false), 1200);
    } catch (error) {
      setFetchError('Failed to save your quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Animate stats when stats page is shown
  React.useEffect(() => {
    if (showStats) {
      const isNonAthlete = userType === 'non-athlete';
      const stats = isNonAthlete ? nonAthleteStats : athleteStats;
      let anims = Array(stats.length).fill(0);
      setStatAnims(anims);
      stats.forEach((stat, i) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 2;
          anims = [...anims];
          anims[i] = Math.min(progress, stat.percent);
          setStatAnims([...anims]);
          if (progress >= stat.percent) clearInterval(interval);
        }, 16);
      });
    }
  }, [showStats, userType]);

  const handleAnswer = (answer: string | string[]) => {
    setAnswers({ ...answers, [currentQuestion.question]: answer });
  };

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#0d0d0d', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 20 }}>Loading...</Text></View>;
  }
  if (fetchError) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0d0d0d', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ color: '#ff4d4f', fontSize: 18, marginBottom: 24, textAlign: 'center' }}>{fetchError}</Text>
        <TouchableOpacity style={{ backgroundColor: '#ff8800', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 }} onPress={() => handleQuizComplete(answers)}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showResult) {
    const result = userType === 'non-athlete'
      ? generateGeneralResult(answers)
      : generateQuizResult(answers);
    if (!showStats) {
      // Personalized result page
      return (
        <SafeAreaView style={styles.resultGradientContainer}>
          <LinearGradient
            colors={["#ff8800", "#b85c00"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.resultCard}
          >
            <TouchableOpacity style={styles.resultBackArrow} onPress={handleBack}>
              <Ionicons name="arrow-back" size={32} color="#fff" />
            </TouchableOpacity>
            <View style={styles.resultMedalIconBox}>
              <Text style={styles.resultMedalIcon}>🏅</Text>
            </View>
            <Text style={styles.resultProfileTitleWhite}>{result.title}</Text>
            <View style={styles.resultSentencesSectionWhite}>
              <Text style={styles.resultSentenceWhite}>{result.stat}</Text>
              <Text style={styles.resultSentenceWhite}>{result.sentence}</Text>
              <Text style={styles.resultSentenceWhite}>{result.outcome}</Text>
            </View>
            <View style={styles.resultPlantBox}>
              <Text style={styles.resultPlantIcon}>🌱</Text>
            </View>
            <TouchableOpacity style={styles.resultContinueButton} onPress={() => setShowStats(true)}>
              <Text style={styles.resultContinueButtonText}>Continue</Text>
            </TouchableOpacity>
          </LinearGradient>
        </SafeAreaView>
      );
    }
    if (!showReviews) {
      // Stats page only (x% improved X)
      const isNonAthlete = userType === 'non-athlete';
      const stats = isNonAthlete ? nonAthleteStats : athleteStats;
      const statsHeader = isNonAthlete
        ? 'Users have reported these results:'
        : 'Athletes have reported these results:';
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.statsScrollContent}>
            <Text style={styles.statsHeader}>{statsHeader}</Text>
            <View style={styles.statsListBox}>
              {stats.map((stat, i) => (
                <View key={stat.label} style={styles.statRow}>
                  <View style={styles.statCircleContainer}>
                    <View style={styles.statCircleBg} />
                    <Text style={styles.statCircleText}>{statAnims[i]}%</Text>
                  </View>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.quizButton} onPress={() => setShowReviews(true)}>
              <Text style={styles.quizButtonText}>See Success</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    }
    if (!showPaywall) {
      // Reviews page only
      const isNonAthlete = userType === 'non-athlete';
      const reviews = isNonAthlete ? nonAthleteReviews : athleteReviews;
      const reviewsHeader = isNonAthlete
        ? 'What users are saying about CTRL/MND'
        : 'What athletes are saying about CTRL/MND';
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.statsScrollContent}>
            <View style={styles.reviewsHeaderBox}>
              <Text style={styles.reviewsHeader}>{reviewsHeader}</Text>
            </View>
            <View style={styles.reviewsListBox}>
              {reviews.map((review, i) => (
                <View key={i} style={styles.reviewCard}>
                  <Text style={styles.reviewQuote}>{review.quote}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.quizButton} onPress={() => setShowPaywall(true)}>
              <Text style={styles.quizButtonText}>Continue</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    }
    // Paywall placeholder
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.paywallContainer}>
          <Text style={styles.paywallText}>This is where the paywall will go.</Text>
          <TouchableOpacity style={styles.quizButton} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.quizButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1, paddingHorizontal: 20 }}>
            <ProgressBar progress={(currentStep + 1) / questionSet.length} />
          </View>
        </View>
        <View style={styles.content}>
          <Text style={{ color: '#ff8800', fontSize: 16, marginBottom: 8 }}>Experiment Variant: {variant}</Text>
          <Text style={[styles.questionText, currentQuestion.question === 'I want to improve - check all that apply' && {marginTop: 100}]}>{currentQuestion.question}</Text>
          <View>
            {currentQuestion.options?.map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, answers[currentQuestion.question] === option && styles.selectedOption]}
                onPress={() => handleAnswer(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.quizButton,
            !answers[currentQuestion.question] && { opacity: 0.5 }
          ]}
          onPress={handleNext}
          disabled={!answers[currentQuestion.question]}
        >
          <Text style={styles.quizButtonText}>Next</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#181818',
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        fontFamily: 'DMSans-Medium',
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
        paddingHorizontal: 35,
        justifyContent: 'center',
    },
    questionText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'DMSans-Medium',
        textAlign: 'center',
        marginBottom: 30,
    },
    optionButton: {
        backgroundColor: '#1A1A1A',
        fontFamily: 'DMSans-Medium',
        borderRadius: 12,
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    selectedOption: {
        borderColor: '#FF6F00',
        backgroundColor: 'rgba(255, 111, 0, 0.1)',
    },
    optionText: {
        color: 'white',
        fontSize: 16,
    },
    textInput: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        paddingVertical: 18,
        paddingHorizontal: 20,
        color: 'white',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    quizButton: {
        backgroundColor: '#ff8800',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        width: '90%',
        maxWidth: 340,
        alignSelf: 'center',
        marginTop: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 2,
    },
    quizButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'DMSans-Bold',
        letterSpacing: 0.5,
    },

    sportDropdownPickerWrapper: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2A2A2A',
        marginTop: 10,
        marginBottom: 20,
        overflow: 'hidden',
    },
    multiChoiceContainer: {
        flex: 1,
    },
    resultGradientContainer: {
        flex: 1,
        backgroundColor: '#0d0d0d',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultCard: {
        width: '92%',
        maxWidth: 420,
        borderRadius: 32,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'flex-start',
        alignSelf: 'center',
        marginTop: 24,
        marginBottom: 24,
        flexGrow: 1,
        flexShrink: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 8,
        paddingBottom: 0,
    },
    resultBackArrow: {
        position: 'absolute',
        top: 18,
        left: 18,
        zIndex: 2,
    },
    resultMedalIconBox: {
        marginTop: 48,
        marginBottom: 18,
        alignItems: 'center',
    },
    resultMedalIcon: {
        fontSize: 64,
        textAlign: 'center',
    },
    resultProfileTitleWhite: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: 'DMSans-Bold',
        textAlign: 'center',
        marginBottom: 24,
        marginTop: 0,
    },
    resultSentencesSectionWhite: {
        marginBottom: 32,
        paddingHorizontal: 18,
        width: '100%',
    },
    resultSentenceWhite: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'DMSans-Medium',
        textAlign: 'center',
        marginBottom: 18,
        lineHeight: 26,
    },
    resultPlantBox: {
        marginTop: 12,
        marginBottom: 32,
        alignItems: 'center',
    },
    resultPlantIcon: {
        fontSize: 54,
        textAlign: 'center',
    },
    resultContinueButton: {
        backgroundColor: '#ff8800',
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 32,
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 32,
        marginTop: 'auto',
        width: '85%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 2,
    },
    resultContinueButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'DMSans-Bold',
        letterSpacing: 0.5,
    },
    paywallContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paywallText: {
        color: 'white',
        fontSize: 16,
        marginBottom: 20,
    },
    statsScrollContent: {
        paddingBottom: 32,
        alignItems: 'center',
        paddingHorizontal: 18,
    },
    statsHeader: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 32,
        marginBottom: 32,
        textAlign: 'center',
    },
    statsListBox: {
        width: '100%',
        marginBottom: 36,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        width: '100%',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    statCircleContainer: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#232323',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 2,
        borderColor: '#ff8800',
    },
    statCircleBg: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 27,
        backgroundColor: '#ff8800',
        opacity: 0.12,
    },
    statCircleText: {
        color: '#ff8800',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'DMSans-Bold',
    },
    statLabel: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'DMSans-Medium',
        flex: 1,
        flexWrap: 'wrap',
    },
    reviewsHeaderBox: {
        marginTop: 36,
        marginBottom: 18,
        alignItems: 'center',
    },
    reviewsHeader: {
        color: '#ff8800',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'DMSans-Bold',
        textAlign: 'center',
    },
    reviewsListBox: {
        width: '100%',
        marginBottom: 32,
    },
    reviewCard: {
        backgroundColor: '#232323',
        borderRadius: 14,
        padding: 18,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 2,
    },
    reviewQuote: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'DMSans-Medium',
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default QuizWizardScreen; 