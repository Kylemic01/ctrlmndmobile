import { supabase } from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error || !data) return null;
  return {
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    avatar: data.avatar,
    quizAnswers: data.quiz_answers,
  };
};

export const setUser = async (user: any) => {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return;
  await supabase.from('profiles').upsert({
    id: authUser.id,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    avatar: user.avatar,
  });
};

export const clearUser = async () => {
  await supabase.auth.signOut();
};

export const ensureProfileRowExists = async (extraFields: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const mapped: { [key: string]: any } = {
    id: user.id,
    email: user.email,
  };
  if (extraFields) {
    if (extraFields.firstName) mapped.first_name = extraFields.firstName;
    if (extraFields.lastName) mapped.last_name = extraFields.lastName;
    if (extraFields.avatar) mapped.avatar = extraFields.avatar;
    if (extraFields.quiz_answers) mapped.quiz_answers = extraFields.quiz_answers;
  }
  await supabase.from('profiles').upsert(mapped);
};

export const updateQuizAnswers = async (quizAnswers: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No authenticated user found');
    return { error: 'No authenticated user found' };
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ quiz_answers: quizAnswers })
    .eq('id', user.id)
    .select();

  if (error) {
    console.error('Error updating quiz answers:', error);
    return { error };
  }

  return { data };
};

// Daily first note tracking functions
export const checkAndMarkFirstNoteOfDay = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return false;
  }

  const today = new Date().toDateString();
  const key = `firstNote_${user.id}_${today}`;
  
  try {
    const hasOpenedToday = await AsyncStorage.getItem(key);
    
    if (hasOpenedToday === null) {
      // First time opening a note today
      await AsyncStorage.setItem(key, 'true');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking first note of day:', error);
    return false;
  }
};

export const clearFirstNoteOfDay = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const today = new Date().toDateString();
  const key = `firstNote_${user.id}_${today}`;
  
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing first note of day:', error);
  }
};

// Meditation streak tracking
const STREAK_KEY = 'meditation_streak';
const LAST_MEDITATION_KEY = 'last_meditation_date';

export const getStreak = async (): Promise<number> => {
  const streak = await AsyncStorage.getItem(STREAK_KEY);
  return streak ? parseInt(streak, 10) : 0;
};

export const updateStreak = async (): Promise<number> => {
  const today = new Date().toDateString();
  const lastDate = await AsyncStorage.getItem(LAST_MEDITATION_KEY);
  let streak = await getStreak();

  if (lastDate === today) {
    // Already meditated today, don't increment
    return streak;
  }

  if (lastDate) {
    const last = new Date(lastDate);
    const diff = Math.floor((new Date(today).getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak += 1;
    } else if (diff > 1) {
      streak = 1; // Reset streak
    }
  } else {
    streak = 1; // First meditation
  }

  await AsyncStorage.setItem(STREAK_KEY, streak.toString());
  await AsyncStorage.setItem(LAST_MEDITATION_KEY, today);
  return streak;
};

export const resetStreak = async () => {
  await AsyncStorage.setItem(STREAK_KEY, '0');
  await AsyncStorage.removeItem(LAST_MEDITATION_KEY);
};

// Garden streak popup tracking
export const checkAndMarkGardenPopupShown = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const today = new Date().toDateString();
  const key = `gardenPopup_${user.id}_${today}`;
  try {
    const hasShownToday = await AsyncStorage.getItem(key);
    if (hasShownToday === null) {
      await AsyncStorage.setItem(key, 'true');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking garden popup:', error);
    return false;
  }
};

export const clearGardenPopupShown = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const today = new Date().toDateString();
  const key = `gardenPopup_${user.id}_${today}`;
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing garden popup:', error);
  }
}; 