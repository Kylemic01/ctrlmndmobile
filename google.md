## 🧘‍♂️ AI Meditation Audio Flow Setup (Cursor-Ready)

This Markdown doc outlines a step-by-step implementation plan for Cursor to build a flow that:
- Generates a meditation script with Gemini (Google AI)
- Converts it to audio with Google Cloud Text-to-Speech (TTS)
- Uploads the MP3 to Supabase Storage
- Returns an audio URL to the React Native app

---

### ✅ Step 1: Supabase Storage Bucket
- Create a storage bucket in Supabase called `meditations`.
- Make it **public** (for now) to allow access from mobile clients.

---

### ✅ Step 2: Create Edge Function: `generateMeditation`
This function will:
1. Receive a POST request with `{ goal: string, duration: string, noteContent: string }`
2. Prompt Gemini with this input, using the following context:
   - The user's note content
   - The selected session time
   - The selected goal
   - Instructions to output the meditation script in SSML format
3. Receive SSML response from Gemini
4. Send SSML to Google TTS API (REST or client lib)
5. Upload resulting audio to Supabase Storage
6. Return public URL of the audio file

**Function signature:**
```ts
POST /functions/v1/generateMeditation
Body: { goal: string, duration: string, noteContent: string }
Returns: { audioUrl: string }
```

---

### ✅ Step 3: Use Google Cloud Text-to-Speech
- Enable TTS in Google Cloud Console
- Use Node.js/TypeScript or REST API in the Edge Function
- Request must include:
  - `input: { ssml }`
  - `voice: { languageCode, name }`
  - `audioConfig: { audioEncoding: "MP3" }`

---

### ✅ Step 4: Connect to Gemini (Google AI)
- Use REST API from Google AI Studio or `@google-cloud/vertexai` Node.js SDK
- Prompt Template:
```text
Generate a meditation script in SSML for a {duration} session about {goal}, using the following context from the user's note:
"""
{noteContent}
"""
Use a calming tone and long pauses. Output only valid SSML.
```

---

### ✅ Step 5: Upload to Supabase Storage
- Use Supabase SDK to upload `.mp3` audio to `meditations/` folder
- Generate a filename with a UUID or timestamp
- Make sure to get the public URL after upload:
```ts
const { data } = supabase.storage.from('meditations').getPublicUrl('filename.mp3');
```

---

### ✅ Step 6: In React Native App
- When the user taps "Meditate" in the note modal, call the edge function with the note content, selected goal, and duration
- Show a loading animation and message while the audio is being generated
- When the audio URL is returned, navigate to the Meditate screen and pass the audio URL
- On the Meditate screen, display a play/pause button to control playback
- Use a reliable audio player library (recommendation: `expo-av` for Expo projects, or `react-native-track-player` for bare React Native)
- The audio is only needed for the session and does not need to be stored in the note object

---

### ✅ Step 7: Supabase Edge Function Setup Checklist
- [ ] Enable Edge Functions in your Supabase project
- [ ] Set up Google Cloud credentials (for TTS)
- [ ] Set up Gemini (Google AI) API access
- [ ] Store any required API keys/secrets securely in Supabase environment variables
- [ ] Deploy the `generateMeditation` function

---

### ✅ User Experience Summary
- User edits a note and selects time/goal
- User taps "Meditate"
- App sends note content, time, and goal to the edge function
- App shows a loading animation while audio is generated
- When ready, app navigates to Meditate screen with play/pause controls for the generated audio
- Audio is used for the session only (not stored in the note)