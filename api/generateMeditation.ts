// Utility to call the Supabase Edge Function for meditation audio generation
// Usage:
//   import { generateMeditationAudio } from './generateMeditation';
//   const { audioUrl } = await generateMeditationAudio({ goal, duration, noteContent });

import { supabase } from '../supabase';

const goalMap: Record<string, string> = {
  'Rehab': 'rehab',
  'Game Time': 'game-time',
  'Motivation': 'motivation',
  'Sleep': 'sleep',
  'Relaxation': 'relaxation',
  'Reassurance': 'reassurance',
  'Neurotraining': 'neurotraining',
};

export async function generateMeditationAudio({ goal, duration, noteContent }: { goal: string; duration: string; noteContent: string; }) {
  // Map UI goal to backend goal key
  const apiGoal = goalMap[goal] || goal.toLowerCase().replace(/ /g, '-');

  const SUPABASE_FUNCTION_URL = 'https://iciecutonrezzhddnmjv.functions.supabase.co/generateMeditation';

  // Add logging for debugging
  console.log('Calling Supabase Function:', SUPABASE_FUNCTION_URL);
  console.log('Payload:', { goal: apiGoal, duration, noteContent });

  // Get the current user's session/access token
  let accessToken = undefined;
  try {
    const session = await supabase.auth.getSession();
    accessToken = session?.data?.session?.access_token;
    console.log('Supabase access token:', accessToken ? '[REDACTED]' : 'None');
  } catch (e) {
    console.log('Error getting Supabase session:', e);
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res;
  try {
    res = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ goal: apiGoal, duration, noteContent }),
    });
    console.log('Supabase Function response status:', res.status);
  } catch (networkError) {
    let errorMsg = 'Network error';
    if (networkError && typeof networkError === 'object' && 'message' in networkError) {
      errorMsg += ': ' + (networkError as any).message;
    } else {
      errorMsg += ': ' + String(networkError);
    }
    console.log('Network error calling Supabase Function:', errorMsg);
    throw new Error(errorMsg);
  }

  if (!res.ok) {
    let errorMsg = 'Failed to generate meditation audio.';
    try {
      const err = await res.json();
      errorMsg = err.error || errorMsg;
      console.log('Supabase Function error response:', err);
    } catch (e) {
      console.log('Supabase Function non-JSON error:', e);
    }
    throw new Error(errorMsg);
  }

  let data;
  try {
    data = await res.json();
    console.log('Supabase Function success response:', data);
  } catch (parseError) {
    console.log('Error parsing Supabase Function response:', parseError);
    throw new Error('Error parsing response from server.');
  }
  if (!data.audioUrl) {
    console.log('No audioUrl returned from Supabase Function:', data);
    throw new Error('No audio URL returned from server.');
  }
  return { audioUrl: data.audioUrl };
} 