import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { AppNavigationProp } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '../../components/ProgressBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../supabase';
import { ensureProfileRowExists } from '../../components/userStorage';

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
    { type: 'SINGLE_CHOICE', question: 'Gender', options: ['Male', 'Female','Prefer not to say'] },
    { type: 'SINGLE_CHOICE', question: 'Where did you hear about us?', options: ['Instagram', 'Facebook', 'Youtube', 'Other'] },
    { type: 'SINGLE_CHOICE', question: 'I want to improve my', options: ['Performance', 'Health', 'Other'] },
    { type: 'SINGLE_CHOICE', question: 'Do you ever doubt yourself or feel anxious?', options: ['Often', 'Sometimes', 'Never'] },
    { type: 'SINGLE_CHOICE', question: 'I am a', options: ['Pro Athlete', 'College Athlete', 'Highschool Athlete', 'Amateur Athlete', 'Masters Athlete', 'Younger Athlete', 'Not an athlete'] },
    { type: 'SINGLE_CHOICE', question: 'I can improve my mentality during', options: ['Race/game day', 'Training Sessions', 'After a loss / poor performance', 'Every Day', 'Gym Sessions', 'Other'] },
    { type: 'SINGLE_CHOICE', question: 'How do you currently handle stress', options: ['Ignore it', 'Talk to someone', 'Meditation', 'Breathing', 'I do not handle it well', 'Other'] },
    { type: 'AGE_AND_SPORT', question: 'Age and sport' },
    { type: 'MULTIPLE_CHOICE', question: 'I want to improve - check all that apply', options: ['Health', 'Mood / happiness', 'Stay calm under pressure', 'Increase confidence', 'Motivation', 'Better sleep', 'Sharper Focus', 'Faster Recovery', 'My Routines and Habits', 'Clutch gene'] },
    { type: 'SINGLE_CHOICE', question: 'How serious are you about leveling up?', options: ['Very serious - I will do multiple sessions a day', 'Serious - I will get better every day', 'Average - I do not want to improve that much'] },
    { type: 'SINGLE_CHOICE', question: 'I Am Committing to Becoming a Better Athlete and a Healthier Life', options: ['Yes, ready to go', 'I do not want to get better'] },
];

const QuizWizardScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [age, setAge] = useState(answers['Age'] || '');
  const [sport, setSport] = useState(answers['Sport'] || '');

  const currentQuestion = quizSteps[currentStep];

  const handleNext = () => {
    // Enforce select at least 3 for the 'I want to improve' page
    if (
      currentQuestion.question === 'I want to improve - check all that apply' &&
      (!answers[currentQuestion.question] || answers[currentQuestion.question].length < 3)
    ) {
      return;
    }
    // Save age and sport answers
    if (currentQuestion.type === 'AGE_AND_SPORT') {
      setAnswers({ ...answers, Age: age, Sport: sport });
    }
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // End of quiz, save data and navigate
      handleQuizComplete(answers);
      navigation.navigate('QuizReviews');
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
    // Save quiz answers to user profile in Supabase
    await ensureProfileRowExists({ quiz_answers: answers });
  };

  const handleAnswer = (answer: string | string[]) => {
    setAnswers({ ...answers, [currentQuestion.question]: answer });
  };
  
  const isNextDisabled = () => {
    if (currentQuestion.type === 'SINGLE_CHOICE') {
      return !answers[currentQuestion.question];
    }
    if (currentQuestion.type === 'MULTIPLE_CHOICE') {
      return !answers[currentQuestion.question] || answers[currentQuestion.question].length < 3;
    }
    if (currentQuestion.type === 'TEXT_INPUT') {
      return !answers[currentQuestion.question] || answers[currentQuestion.question].trim() === '';
    }
    if (currentQuestion.type === 'AGE_AND_SPORT') {
      return !age || !sport;
    }
    return false;
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'SINGLE_CHOICE':
        return (
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
        );
      case 'MULTIPLE_CHOICE':
        if (currentQuestion.question === 'I want to improve - check all that apply') {
          const currentAnswers = answers[currentQuestion.question] || [];
          return (
            <View style={styles.multiChoiceContainer}>
              <Text style={[styles.selectThreeText, {marginTop: 20, marginBottom: 10}]}>
                {currentAnswers.length < 3 ? `Select at least 3 options (${currentAnswers.length}/3)` : 'You can proceed'}
              </Text>
              <ScrollView style={{maxHeight: 300}} contentContainerStyle={{paddingBottom: 20, paddingTop: 10}}>
                {currentQuestion.options?.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionButton, currentAnswers.includes(option) ? styles.selectedOption : null]}
                    onPress={() => {
                      let newAnswers;
                      if (currentAnswers.includes(option)) {
                        newAnswers = currentAnswers.filter((a: string) => a !== option);
                      } else if (currentAnswers.length < 3) {
                        newAnswers = [...currentAnswers, option];
                      } else {
                        newAnswers = currentAnswers;
                      }
                      handleAnswer(newAnswers);
                    }}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          );
        }
        return null;
      case 'TEXT_INPUT':
        return (
          <TextInput
            style={styles.textInput}
            placeholder="Type your answer here"
            placeholderTextColor="#8A8A8E"
            value={answers[currentQuestion.question] || ''}
            onChangeText={(text) => handleAnswer(text)}
          />
        );
      case 'AGE_AND_SPORT':
        return (
          <View>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your age"
              placeholderTextColor="#8A8A8E"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              blurOnSubmit={true}
            />
            <View style={styles.sportDropdownContainer}>
              <Text style={styles.sportLabel}>Select your sport:</Text>
              <ScrollView style={{ maxHeight: 4 * 66, width: '100%' }} contentContainerStyle={{ paddingBottom: 10 }}>
                {popularSports.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionButton, sport === option && styles.selectedOption]}
                    onPress={() => setSport(option)}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1, paddingHorizontal: 20 }}>
            <ProgressBar progress={(currentStep + 1) / quizSteps.length} />
          </View>
        </View>
        <View style={styles.content}>
          <Text style={[styles.questionText, currentQuestion.question === 'I want to improve - check all that apply' && {marginTop: 100}]}>{currentQuestion.question}</Text>
          {renderQuestion()}
        </View>
        <TouchableOpacity
          style={[
            styles.continueButton,
            isNextDisabled() ? { opacity: 0.5 } : null,
          ]}
          onPress={handleNext}
          disabled={isNextDisabled()}
        >
          <Text style={styles.continueButtonText}>Next</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    sportDropdownContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    sportLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
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
    sportPicker: {
        color: 'white',
        width: '100%',
        height: 48,
    },
    selectThreeText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
    },
    multiChoiceContainer: {
        flex: 1,
    },
});

export default QuizWizardScreen; 