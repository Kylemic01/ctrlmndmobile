// Utility to call the Supabase Edge Function for meditation audio generation
// Usage:
//   import { generateMeditationAudio } from './generateMeditation';
//   const { audioUrl } = await generateMeditationAudio({ goal, duration, noteContent });

export async function generateMeditationAudio({ goal, duration, noteContent }: { goal: string; duration: string; noteContent: string; }) {
  // TODO: Replace with your actual Supabase Edge Function URL
  const SUPABASE_FUNCTION_URL = 'https://iciecutonrezzhddnmjv.functions.supabase.co/generateMeditation';

  const res = await fetch(SUPABASE_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, duration, noteContent }),
  });

  if (!res.ok) {
    let errorMsg = 'Failed to generate meditation audio.';
    try {
      const err = await res.json();
      errorMsg = err.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const data = await res.json();
  if (!data.audioUrl) {
    throw new Error('No audio URL returned from server.');
  }
  return { audioUrl: data.audioUrl };
} 