// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { VillainProvider } from './components/VillainProvider';

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
import EditProfileScreen from './screens/EditProfileScreen';
import AthleteProfileScreen from './screens/AthleteProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import { RootStackParamList } from './types';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Text, StatusBar } from 'react-native';
import NoTimeToJournalScreen from './screens/NoTimeToJournalScreen';
import Svg, { Path } from 'react-native-svg';
import CourseProgressScreen from './screens/CourseProgressScreen';
import VillainDamageScreen from './screens/VillainDamageScreen';
import TeamLeaderboardScreen from './screens/TeamLeaderboardScreen';
import JoinTeamScreen from './screens/JoinTeamScreen';
import ProgressScreen from './screens/ProgressScreen';
import Statsig from 'statsig-react-native';
import { useEffect, useState } from 'react';
import Loader from './components/Loader'; // If you have this component
import { StatsigProvider, Statsig } from 'statsig-react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Remove the MentalCourseScreen placeholder

const Tab = createBottomTabNavigator();

// Remove TabBarWaveBackground and use a simple View for extra orange height
function TabBarSolidBackground() {
  return (
    <View style={{ flex: 1, backgroundColor: '#ff6408', height: 80, position: 'absolute', top: -16, left: 0, right: 0 }} />
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: '#ff6408', borderTopWidth: 0, height: 72, alignItems: 'center', justifyContent: 'center' },
        tabBarBackground: () => <TabBarSolidBackground />,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          if (route.name === 'NoTimeToJournal') iconName = focused ? 'musical-notes' : 'musical-notes-outline';
          if (route.name === 'MentalCourse') iconName = focused ? 'school' : 'school-outline';
          if (route.name === 'Progress') iconName = focused ? 'trophy' : 'trophy-outline';
          if (route.name === 'Settings') iconName = focused ? 'person' : 'person-outline';
          return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 56 }}><Ionicons name={iconName} size={24} color={focused ? '#fff' : '#333'} /></View>;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="NoTimeToJournal" component={NoTimeToJournalScreen} />
      <Tab.Screen name="MentalCourse" component={CourseProgressScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Component to determine initial route based on auth and quiz completion
function AppNavigator() {
  const { user, profile } = useAuth();
  
  // Determine initial route
  let initialRouteName: keyof RootStackParamList = 'Login';
  
  if (user) {
    if (!profile) {
      // Profile still loading, show loading screen
      return (
        <View style={{ flex: 1, backgroundColor: '#0d0d0d', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>Loading...</Text>
        </View>
      );
    } else if (!profile.quiz_completed) {
      // User logged in but quiz not completed, redirect to quiz
      initialRouteName = 'QuizIntro';
    } else {
      // User logged in and quiz completed, show main app
      initialRouteName = 'MainTabs';
    }
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="Login"      component={LoginScreen} />
      <Stack.Screen name="Signup"     component={SignupScreen} />
      <Stack.Screen name="MainTabs"   component={MainTabs} />
      <Stack.Screen name="QuizIntro"  component={QuizIntroScreen} />
      <Stack.Screen name="QuizStreak" component={QuizStreakScreen} />
      <Stack.Screen name="Quiz"       component={QuizWizardScreen} />
      <Stack.Screen name="QuizWizard" component={QuizWizardScreen} />
      <Stack.Screen name="QuizReviews"component={QuizReviewsScreen} />
      <Stack.Screen name="QuizGraph"  component={QuizGraphScreen} />
      <Stack.Screen name="QuizPaywall"component={QuizPaywallScreen} />
      <Stack.Screen name="NoteEdit" component={NoteEditScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: true }} />
      <Stack.Screen name="Meditate" component={MeditateScreen} />
      <Stack.Screen name="AthleteProfile" component={AthleteProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="VillainDamage" component={VillainDamageScreen} />
      <Stack.Screen name="TeamLeaderboard" component={TeamLeaderboardScreen} />
      <Stack.Screen name="JoinTeam" component={JoinTeamScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  // Example: log an event anywhere in your app
  // Statsig.logEvent('add_to_cart', 'SKU_12345', { price: '9.99', item_name: 'diet_coke_48_pack' });

  return (
    <StatsigProvider
      sdkKey="client-HhzymGL5khNyxr0zUdoaTrPlKKgwbglvs4WhKdLXf7H"
      user={{ userID: 'a-user' }}
      waitForInitialization={true}
      initializingComponent={<Loader />}
    >
      <AuthProvider>
        <VillainProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#181818" />
            <AppNavigator />
          </NavigationContainer>
        </VillainProvider>
      </AuthProvider>
    </StatsigProvider>
  );
}
