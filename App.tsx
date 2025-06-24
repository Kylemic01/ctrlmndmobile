// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './hooks/useAuth';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';
import QuizIntroScreen from './screens/quiz/QuizIntroScreen';
import QuizStreakScreen from './screens/quiz/QuizStreakScreen';
import QuizWizardScreen from './screens/quiz/QuizWizardScreen';
import QuizReviewsScreen from './screens/quiz/QuizReviewsScreen';
import QuizGraphScreen from './screens/quiz/QuizGraphScreen';
import QuizPaywallScreen from './screens/quiz/QuizPaywallScreen';
import NoteEditScreen from './screens/NoteEditScreen';
import SettingsScreen from './screens/SettingsScreen';
import MeditateScreen from './screens/MeditateScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login"      component={LoginScreen} />
          <Stack.Screen name="Signup"     component={SignupScreen} />
          <Stack.Screen name="Dashboard"  component={DashboardScreen} />
          <Stack.Screen name="QuizIntro"  component={QuizIntroScreen} />
          <Stack.Screen name="QuizStreak" component={QuizStreakScreen} />
          <Stack.Screen name="Quiz"       component={QuizWizardScreen} />
          <Stack.Screen name="QuizWizard" component={QuizWizardScreen} />
          <Stack.Screen name="QuizReviews"component={QuizReviewsScreen} />
          <Stack.Screen name="QuizGraph"  component={QuizGraphScreen} />
          <Stack.Screen name="QuizPaywall"component={QuizPaywallScreen} />
          <Stack.Screen name="NoteEdit" component={NoteEditScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Meditate" component={MeditateScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
