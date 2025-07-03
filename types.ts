import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type NoteCategory = 'Goals' | 'Daily Journals' | 'Game Day';

export type Note = {
  id: string;
  category: NoteCategory;
  title: string;
  content: string;
  date: string; // ISO string
  pinned?: boolean;
  deleted?: boolean;
};

export type User = {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string; // URI to profile photo
  quiz_answers?: any; // Add this line for quiz answers
};

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Quiz: undefined;
  Dashboard: undefined;
  QuizIntro: undefined;
  QuizStreak: undefined;
  QuizWizard: undefined;
  QuizReviews: undefined;
  QuizGraph: undefined;
  QuizPaywall: undefined;
  NoteEdit: { noteId?: string; category?: NoteCategory };
  Settings: undefined;
  Meditate: { audioUrl: string; noteTitle: string; goal: string };
  EditProfile: undefined;
  AthleteProfile: undefined;
  ChangePassword: undefined;
};

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>; 