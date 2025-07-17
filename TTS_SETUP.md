# TTS Setup Guide

This guide will help you set up the Text-to-Speech functionality with the `en-US-Wavenet-C` voice.

## ✅ What's Been Implemented

The Supabase Edge Function `generateMeditation` has been updated to:
- Use **en-US-Wavenet-C** voice (female, natural-sounding)
- Generate meditation scripts using Google's Gemini AI
- Convert SSML to audio using Google Cloud Text-to-Speech
- Upload audio files to Supabase Storage
- Return public URLs for audio playback

## 🔧 Required Setup

### 1. Google Cloud Setup

1. **Create a Google Cloud Project** (if you don't have one)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable APIs**
   - Enable **Text-to-Speech API**
   - Enable **Vertex AI API** (for Gemini)

3. **Create Service Account**
   - Go to IAM & Admin > Service Accounts
   - Create a new service account
   - Download the JSON key file
   - Note the `project_id`, `private_key`, and `client_email` values

4. **Get Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key

### 2. Supabase Storage Setup

1. **Create Storage Bucket**
   ```sql
   -- Run this in Supabase SQL Editor
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('meditations', 'meditations', true);
   ```

2. **Set Storage Policies** (optional - for public access)
   ```sql
   -- Allow public read access to meditations
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'meditations');
   
   -- Allow authenticated users to upload
   CREATE POLICY "Authenticated users can upload" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'meditations' AND auth.role() = 'authenticated');
   ```

### 3. Environment Variables

Set these environment variables in your Supabase project:

1. Go to Supabase Dashboard > Settings > Edge Functions
2. Add the following secrets:

```bash
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GEMINI_API_KEY=your-gemini-api-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 4. Deploy the Function

```bash
# From your project root
supabase functions deploy generateMeditation
```

## 🎯 Voice Configuration

The TTS is configured to use:
- **Voice**: `en-US-Wavenet-C` (female, natural-sounding)
- **Language**: English (US)
- **Speaking Rate**: 0.8 (slightly slower for meditation)
- **Audio Format**: MP3
- **SSML Support**: Full support for pauses, emphasis, etc.

## 🧪 Testing

You can test the function locally:

```bash
# Start Supabase locally
supabase start

# Test the function
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generateMeditation' \
  --header 'Content-Type: application/json' \
  --data '{
    "goal": "Confidence",
    "duration": "8 min", 
    "noteContent": "I want to feel more confident before my big game tomorrow."
  }'
```

## 📱 App Integration

The React Native app is already configured to:
1. Call the Edge Function when user taps "Meditate"
2. Show loading state while generating audio
3. Navigate to MeditateScreen with the audio URL
4. Play the generated meditation audio

## 🔄 How It Works

1. User selects meditation parameters (goal, duration, note content)
2. App calls `/functions/v1/generateMeditation` with the parameters
3. Edge Function:
   - Generates SSML meditation script using Gemini
   - Converts SSML to audio using Google TTS (en-US-Wavenet-C)
   - Uploads MP3 to Supabase Storage
   - Returns public audio URL
4. App plays the meditation audio

## 🎵 Voice Characteristics

**en-US-Wavenet-C** is a female voice that:
- Sounds natural and calming (perfect for meditation)
- Supports SSML for pacing and emphasis
- Has good pronunciation and intonation
- Works well with longer meditation scripts

## 🚨 Troubleshooting

**Common Issues:**
- **"TTS API error"**: Check Google Cloud credentials and API enablement
- **"Storage upload error"**: Verify Supabase Storage bucket exists and is public
- **"Failed to generate meditation script"**: Check Gemini API key and quota

**Debug Steps:**
1. Check Supabase Edge Function logs
2. Verify all environment variables are set
3. Test Google Cloud APIs separately
4. Check Supabase Storage permissions

## 📈 Next Steps

Once this is working, you can:
- Add more voice options (different languages, male voices)
- Implement voice selection in the app
- Add audio caching for better performance
- Implement meditation history tracking 